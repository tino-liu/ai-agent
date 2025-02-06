"use client";

import { Doc, Id } from '@/convex/_generated/dataModel';
import React, { useRef, useState } from 'react'


interface ChatInterfaceProps {
    chatId: Id<"chats">;
    initialMessages: Doc<"messages">[];
}

function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {

    const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamedResponse, setStreamedResponse] = useState("");
    const [currentTool, setCurrentTool] = useState<{
        name: string;
        input: unknown;
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    return (
        <main>
            <section></section>
        </main>
    )
}

export default ChatInterface