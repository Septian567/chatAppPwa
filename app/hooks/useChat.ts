import { useState } from "react";

interface ChatMessage
{
    id: string;
    text?: string;
    audioUrl?: string;
    fileUrl?: string;
    fileName?: string;
    duration?: number;
    time: string;
    isEditing?: boolean;
}

export function useChat()
{
    const [messages, setMessages] = useState<ChatMessage[]>( [] );

    const getTime = () =>
    {
        const now = new Date();
        const hours = now.getHours().toString().padStart( 2, "0" );
        const minutes = now.getMinutes().toString().padStart( 2, "0" );
        return `${ hours }.${ minutes }`;
    };

    const generateId = () => Date.now().toString(); // simple unique ID

    const handleSendMessage = ( message: string ) =>
    {
        const newMessage: ChatMessage = {
            id: generateId(),
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
            id: generateId(),
            audioUrl,
            duration: audio.duration,
            time: getTime(),
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleSendFile = ( file: File ) =>
    {
        const fileUrl = URL.createObjectURL( file );
        const newMessage: ChatMessage = {
            id: generateId(),
            fileUrl,
            fileName: file.name,
            time: getTime(),
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleEditMessage = ( id: string ) =>
    {
        setMessages( ( prev ) =>
            prev.map( ( msg ) =>
                msg.id === id ? { ...msg, isEditing: true } : msg
            )
        );
    };

    const handleSaveEdit = ( id: string, newText: string ) =>
    {
        setMessages( ( prev ) =>
            prev.map( ( msg ) =>
                msg.id === id ? { ...msg, text: newText, isEditing: false } : msg
            )
        );
    };

    return {
        messages,
        handleSendMessage,
        handleSendAudio,
        handleSendFile,
        handleEditMessage,
        handleSaveEdit,
    };
}
