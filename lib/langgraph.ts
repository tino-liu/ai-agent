
import { AzureChatOpenAI } from '@langchain/openai'
import wxflows from "@wxflows/sdk/langchain";


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
};