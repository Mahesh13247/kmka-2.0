
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import type { Content } from '@google/genai';
import { generateChatResponseStream } from '../services/geminiService';
import { SendIcon, BotIcon, SparklesIcon, CloseIcon } from './IconComponents';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-start gap-3 my-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
            {isModel && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                    <BotIcon className="w-5 h-5" />
                </div>
            )}
            <div className={`p-3 rounded-lg max-w-sm md:max-w-md break-words ${isModel ? 'bg-gray-800 text-white rounded-tl-none' : 'bg-blue-600 text-white rounded-bl-none'}`}>
                <p className="font-mono text-sm leading-relaxed">{message.parts[0].text}</p>
            </div>
             {!isModel && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-600">
                    <span className="text-sm font-semibold">U</span>
                </div>
            )}
        </div>
    );
};


export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkMore, setIsThinkMore] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
    
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            parts: [{ text: input }],
        };
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const history: Content[] = messages.map(msg => ({
            role: msg.role,
            parts: msg.parts,
        }));
    
        // Add user message and a placeholder for the model's response
        setMessages(prev => [
            ...prev,
            userMessage,
            { id: (Date.now() + 1).toString(), role: 'model', parts: [{ text: '' }] }
        ]);
    
        try {
            const stream = generateChatResponseStream(history, currentInput, isThinkMore);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        // Create a new message object immutably instead of mutating state directly
                        const updatedLastMessage: ChatMessage = {
                            ...lastMessage,
                            parts: [{ text: lastMessage.parts[0].text + chunk }]
                        };
                        return [...prev.slice(0, -1), updatedLastMessage];
                    }
                    return prev; 
                });
            }
        } catch (error) {
            console.error("Failed to get response from Gemini", error);
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'model') {
                    const errorResponseMessage: ChatMessage = {
                        ...lastMessage,
                        parts: [{ text: "I'm having trouble connecting right now. Please try again later." }]
                    };
                    return [...prev.slice(0, -1), errorResponseMessage];
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 bg-black border border-gray-800 rounded-lg shadow-2xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-md h-[65vh] flex flex-col z-50 transform-gpu transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <header className="flex items-center justify-between p-3 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-t-lg">
                <h2 className="text-lg font-bold">Gemini Assistant</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full" aria-label="Close chat">
                    <CloseIcon />
                </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-8">
                        <BotIcon className="mx-auto" />
                        <p className="mt-2">Ask me anything!</p>
                    </div>
                )}
                {messages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)}
                {isLoading && messages[messages.length-1]?.parts[0].text === '' && (
                     <div className="flex items-start gap-3 my-4">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                           <BotIcon className="w-5 h-5"/>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-800 rounded-tl-none">
                           <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-subtle-pulse"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-subtle-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-subtle-pulse" style={{animationDelay: '0.4s'}}></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-gray-800">
                <div className="flex items-center justify-center mb-2" title="Use a more powerful model for complex questions, which may be slower.">
                    <label htmlFor="think-more-toggle" className="flex items-center cursor-pointer">
                         <div className="relative">
                            <input 
                                id="think-more-toggle" 
                                type="checkbox" 
                                className="sr-only" 
                                checked={isThinkMore}
                                onChange={() => setIsThinkMore(!isThinkMore)}
                            />
                            <div className="block bg-gray-600 w-12 h-6 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isThinkMore ? 'transform translate-x-6 bg-gemini-purple' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-sm flex items-center">
                           <SparklesIcon className={isThinkMore ? 'text-gemini-purple' : 'text-gray-400'}/> <span className="ml-1">Think More</span>
                        </div>
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isThinkMore ? "Ask a complex question..." : "Ask me anything..."}
                        className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-white text-black p-2 rounded-full disabled:bg-gray-500 transition-colors"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};
