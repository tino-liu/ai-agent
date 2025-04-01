
import { AzureChatOpenAI } from '@langchain/openai'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import wxflows from "@wxflows/sdk/langchain";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import SYSTEM_MESSAGE from '@/constants/systemMessage';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, trimMessages } from '@langchain/core/messages';

const trimmer = trimMessages({
    maxTokens: 10,
    tokenCounter: (msgs) => msgs.length,
    includeSystem: true,
    allowPartial: false,
    startOn: "human",
    strategy: "last"
});

const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT || "",
    apikey: process.env.WXFLOWS_API_KEY,
})

const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

const initializeModel = () => {
    const model = new AzureChatOpenAI({
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
        temperature: 0.7,
        maxTokens: 8000,
        streaming: true,
        callbacks: [
            {
                handleLLMStart: async () => {
                    console.log("LLM call started")
                },
                handleLLMEnd: async (output) => {
                    console.log("LLM call ended: ", output);
                    const usage = output.llmOutput?.usage;
                    if (usage) {
                        console.log("Usage: ", usage)
                    }
                }
            }
        ]
    }).bindTools(tools);
    return model;
};

function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // If LLM makes a tool call, continue to tools node
    if (lastMessage.tool_calls?.length) {
        return "tools"
    }
    // If the last message is a tool message, route back to agent
    if (lastMessage.content && lastMessage._getType() === "tool") {
        return "agent"
    }

    // Otherwise, we stop replying to the user
    return END;
}

const createWorkflow = () => {
    const model = initializeModel();

    const stateGraph = new StateGraph(MessagesAnnotation).addNode(
        "agent",
        async (state) => {
            const systemContent = SYSTEM_MESSAGE;

            const promptTemplate = ChatPromptTemplate.fromMessages(
                [
                    // set a cache breakpoint (max number of breakpoints is 4)
                    new SystemMessage(systemContent, { cache_control: { type: "ephemeral" } }),
                    new MessagesPlaceholder("messages")
                ]
            )

            // Trim messages to manage conversation history
            const trimmedMessages = await trimmer.invoke(state.messages)
            // Format the prompt with the current messages
            const prompt = await promptTemplate.invoke({ messages: trimmedMessages })

            const response = await model.invoke(prompt)

            return { messages: [response] }
        })
        .addEdge(START, "agent")
        .addNode('tools', toolNode)
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "agent")

    return stateGraph;
}

function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
    // Rules of caching headers for turn by turn conversation
    // 1. Cache the first System message
    // 2. Cache last message
    // 3. Cache second to last messages

    if (!messages.length) return messages
    const cachedMessages = [...messages]
    const addCache = (message: BaseMessage) => {
        message.content = [
            {
                type: "text",
                text: message.content as string,
                cache_control: { type: "ephemeral" }
            }
        ]
    }

    addCache(cachedMessages.at(-1)!)

    let humanCount = 0
    for (let i = cachedMessages.length - 1; i >= 0; i--) {
        if (cachedMessages[i] instanceof HumanMessage) {
            humanCount++
            if (humanCount === 2) {
                addCache(cachedMessages[i])
                break
            }
        }
    }

    return cachedMessages
}

export async function submitQuestion(messages: BaseMessage[], chatId: string) {
    const cachedMessages = addCachingHeaders(messages)
    console.log("Messages: ", cachedMessages)
    const workflow = createWorkflow()
    const checkpointer = new MemorySaver()

    const app = workflow.compile({ checkpointer })

    const stream = await app.streamEvents(
        {
            messages: cachedMessages
        },
        {
            version: 'v2',
            configurable: {
                threadId: chatId
            },
            streamMode: 'messages',
            runId: chatId
        }
    )
    return stream
}