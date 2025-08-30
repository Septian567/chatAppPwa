"use client";

import { useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "../messageInput/MessageInput";
import ChatBody from "./ChatBody";
import
{
    useMessageState,
    useMessageEditing,
    useMessageDeletion,
} from "../../hooks/chats";
import { ChatMessage } from "../../hooks/useChatMessageActions";

interface ChatPageProps
{
    isMobile: boolean;
    onBack: () => void;
    sidebarWidth?: number | string;
}

export default function ChatPage( { isMobile, onBack }: ChatPageProps )
{
    const { messages, setMessages } = useMessageState();

    const {
        editingIndex,
        editType,
        editingMessage,
        handleEditTextMessage,
        handleEditFileMessage,
        handleSubmitEdit,
        handleCancelEdit,
    } = useMessageEditing( messages, setMessages );

    const {
        handleDeleteTextMessage,
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteAudioMessage,
    } = useMessageDeletion(
        messages,
        setMessages,
        editingIndex,
        ( i ) => handleEditIndexChange( i ),
        ( t ) => handleEditTypeChange( t )
    );

    // 🔹 state untuk posisi pesan
    const [chatSide, setChatSide] = useState<"kiri" | "kanan">( "kanan" );

    function handleEditIndexChange( i: number | null )
    {
        ( editingIndex as any ) = i;
    }
    function handleEditTypeChange( t: "text" | "file" | null )
    {
        ( editType as any ) = t;
    }

    // 🔹 Fungsi lokal untuk mengirim pesan (tanpa useMessageSending hook)
    const handleSendMessage = ( message: string ) =>
    {
        const newMessage: ChatMessage = {
            text: message,
            time: new Date().toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit" } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleSendAudio = ( audioBlob: Blob ) =>
    {
        const audioUrl = URL.createObjectURL( audioBlob );
        const newMessage: ChatMessage = {
            audioUrl,
            time: new Date().toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit" } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleSendFile = ( file: File, caption?: string ) =>
    {
        const fileUrl = URL.createObjectURL( file );
        const newMessage: ChatMessage = {
            fileUrl,
            fileName: file.name,
            caption: caption?.trim() || undefined,
            time: new Date().toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit" } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader
                isMobile={ isMobile }
                onBack={ onBack }
                onChatKiri={ () => setChatSide( "kiri" ) }
                onChatKanan={ () => setChatSide( "kanan" ) }
            />
            <ChatBody
                messages={ messages }
                setMessages={ setMessages }
                onEditTextMessage={ handleEditTextMessage }
                onDeleteTextMessage={ handleDeleteTextMessage }
                onSoftDeleteTextMessage={ handleSoftDeleteTextMessage }
                onEditFileMessage={ handleEditFileMessage }
                onDeleteFileMessage={ handleDeleteFileMessage }
                onSoftDeleteFileMessage={ handleSoftDeleteFileMessage }
                onDeleteAudioMessage={ handleDeleteAudioMessage }
                onSoftDeleteAudioMessage={ handleSoftDeleteAudioMessage }
            />
            <MessageInput
                onSend={ handleSendMessage }
                onSendAudio={ handleSendAudio }
                onSendFile={ handleSendFile }
                isEditing={ editingIndex !== null }
                initialEditValue={
                    editType === "text"
                        ? editingMessage?.text || ""
                        : editType === "file"
                            ? editingMessage?.caption || ""
                            : ""
                }
                onSubmitEdit={ handleSubmitEdit }
                onCancelEdit={ handleCancelEdit }
            />
        </main>
    );
}