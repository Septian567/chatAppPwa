"use client";

import { useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../states";
import ChatHeader from "./ChatHeader";
import MessageInput from "../messageInput/MessageInput";
import ChatBody from "./ChatBody";
import { useChatPage } from "../../hooks/useChatPage";
import { useChatHistory } from "../../hooks/useChatHistory";

interface ChatPageProps
{
    isMobile: boolean;
    onBack: () => void;
    sidebarWidth?: number | string;
}

export default function ChatPage( { isMobile, onBack }: ChatPageProps )
{
    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );

    // Tampilkan pesan jika tidak ada kontak aktif
    if ( !activeContact )
    {
        return (
            <main className="flex-1 flex items-center justify-center text-gray-500">
                silahkan pilih kontak untuk memulai chat
            </main>
        );
    }

    const contactId = activeContact.contact_id;
    const contactName = activeContact.alias || activeContact.email || "Bento";

    // Auto fetch chat history setiap kali kontak aktif berubah
    useChatHistory( contactId );

    const {
        messages,
        chatSide,
        setChatSide,
        editingIndex,
        editType,
        editingMessage,
        handleEditTextMessage,
        handleEditFileMessage,
        handleSubmitEdit,
        handleCancelEdit,
        handleDeleteTextMessage,
        handleSoftDeleteTextMessage,
        handleDeleteFileMessage,
        handleSoftDeleteFileMessage,
        handleDeleteAudioMessage,
        handleSoftDeleteAudioMessage,
        handleSendMessage,
        handleSendAudio,
        handleSendFile,
    } = useChatPage();

    useLayoutEffect( () =>
    {
        const el = document.getElementById( "chat-bottom" );
        if ( el ) el.scrollIntoView( { behavior: "auto" } );
    }, [activeContact, messages] );

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader
                isMobile={ isMobile }
                onBack={ onBack }
                contactName={ contactName }
                contactId={ contactId }
                onChatKiri={ () => setChatSide( "kiri" ) }
                onChatKanan={ () => setChatSide( "kanan" ) }
            />

            <ChatBody
                messages={ messages }
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
