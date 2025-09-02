"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../states";
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

export default function ChatPage( {
    isMobile,
    onBack,
    sidebarWidth,
}: ChatPageProps )
{
    // 🔹 Ambil kontak aktif dari Redux
    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );

    // Gunakan alias jika ada, jika tidak gunakan name, jika keduanya tidak ada fallback ke "Bento"
    const contactName =
        activeContact?.alias || activeContact?.name || "Bento";

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

    const [chatSide, setChatSide] = useState<"kiri" | "kanan">( "kanan" );

    function handleEditIndexChange( i: number | null )
    {
        ( editingIndex as any ) = i;
    }
    function handleEditTypeChange( t: "text" | "file" | null )
    {
        ( editType as any ) = t;
    }

    const handleSendMessage = ( message: string ) =>
    {
        const newMessage: ChatMessage = {
            text: message,
            time: new Date().toLocaleTimeString( [], {
                hour: "2-digit",
                minute: "2-digit",
            } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleSendAudio = ( audioBlob: Blob ) =>
    {
        const audioUrl = URL.createObjectURL( audioBlob );
        const newMessage: ChatMessage = {
            audioUrl,
            time: new Date().toLocaleTimeString( [], {
                hour: "2-digit",
                minute: "2-digit",
            } ),
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
            time: new Date().toLocaleTimeString( [], {
                hour: "2-digit",
                minute: "2-digit",
            } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader
                isMobile={ isMobile }
                onBack={ onBack }
                contactName={ contactName } // 🔹 Alias atau nama kontak sekarang dinamis
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
