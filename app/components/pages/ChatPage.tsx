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
    duration?: number;
    time: string;
};

export default function ChatPage( { isMobile, onBack }: ChatPageProps )
{
    const [messages, setMessages] = useState<ChatMessage[]>( [] );
    const [editingIndex, setEditingIndex] = useState<number | null>( null );

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

    const handleEditTextMessage = ( index: number ) =>
    {
        setEditingIndex( index );
    };

    const handleSubmitEdit = ( newText: string ) =>
    {
        if ( editingIndex !== null )
        {
            setMessages( ( prev ) =>
            {
                const updated = [...prev];
                updated[editingIndex] = {
                    ...updated[editingIndex],
                    text: newText,
                };
                return updated;
            } );
            setEditingIndex( null );
        }
    };

    const handleCancelEdit = () =>
    {
        setEditingIndex( null );
    };

    const editingMessage = editingIndex !== null ? messages[editingIndex] : null;

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader isMobile={ isMobile } onBack={ onBack } />
            <ChatBody messages={ messages } onEditTextMessage={ handleEditTextMessage } />
            <MessageInput
                onSend={ handleSendMessage }
                onSendAudio={ handleSendAudio }
                onSendFile={ handleSendFile }
                isEditing={ editingIndex !== null }
                initialEditValue={ editingMessage?.text || "" }
                onSubmitEdit={ handleSubmitEdit }
                onCancelEdit={ handleCancelEdit }
            />
        </main>
    );
}
