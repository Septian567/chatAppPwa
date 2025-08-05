"use client";

import { useState } from "react";
import ChatHeader from "../ChatHeader";
import MessageInput from "../MessageInput";
import ChatBody from "../ChatBody";

interface ChatPageProps
{
    isMobile: boolean;
    onBack: () => void;
    sidebarWidth?: number | string;
}

type ChatMessage = {
    text?: string;
    audioUrl?: string;
    fileUrl?: string;
    fileName?: string;
    time: string;
};

export default function ChatPage( { isMobile, onBack }: ChatPageProps )
{
    const [messages, setMessages] = useState<ChatMessage[]>( [] );

    const getTime = () =>
    {
        const now = new Date();
        const hours = now.getHours().toString().padStart( 2, "0" );
        const minutes = now.getMinutes().toString().padStart( 2, "0" );
        return `${ hours }.${ minutes }`;
    };

    const handleSendMessage = ( message: string ) =>
    {
        const newMessage: ChatMessage = {
            text: message,
            time: getTime(),
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleSendAudio = async ( audioBlob: Blob ) =>
    {
        const audioUrl = URL.createObjectURL( audioBlob );
        const audio = new Audio();
        audio.src = audioUrl;

        await new Promise<void>( ( resolve ) =>
        {
            audio.addEventListener( "loadedmetadata", () =>
            {
                // Debug untuk melihat apakah durasi terdeteksi
                console.log( "Durasi terdeteksi:", audio.duration );
                resolve();
            } );
        } );

        const newMessage: ChatMessage = {
            audioUrl,
            time: getTime(),
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };



    const handleSendFile = ( file: File ) =>
    {
        const fileUrl = URL.createObjectURL( file );
        const newMessage: ChatMessage = {
            fileUrl,
            fileName: file.name,
            time: getTime(),
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader isMobile={ isMobile } onBack={ onBack } />
            <ChatBody messages={ messages } />
            <MessageInput
                onSend={ handleSendMessage }
                onSendAudio={ handleSendAudio }
                onSendFile={ handleSendFile }
            />
        </main>
    );
}
