"use client";

import { useLayoutEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../states";
import ChatHeader from "./ChatHeader";
import MessageInput from "../messageInput/MessageInput";
import ChatBody from "./ChatBody";
import { useChatPage } from "../../hooks/useChatPage";

interface ChatPageProps
{
    isMobile: boolean;
    onBack: () => void;
    sidebarWidth?: number | string;
}

export default function ChatPage( { isMobile, onBack }: ChatPageProps )
{
    const activeContact = useSelector( ( state: RootState ) => state.contacts.activeContact );
    const contactName = activeContact?.alias || activeContact?.name || "Bento";

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

    // Flag tambahan untuk hapus pesan untuk diri sendiri
    const [deletingForMe, setDeletingForMe] = useState( false );

    // scroll pertama saat ganti kontak, sebelum paint
    useLayoutEffect( () =>
    {
        const el = document.getElementById( "chat-bottom" );
        if ( el )
        {
            el.scrollIntoView( { behavior: "auto" } );
        }
    }, [activeContact] );

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader
                isMobile={ isMobile }
                onBack={ onBack }
                contactName={ contactName }
                onChatKiri={ () => setChatSide( "kiri" ) }
                onChatKanan={ () => setChatSide( "kanan" ) }
            />

            <ChatBody
                messages={ messages }
                editingIndex={ editingIndex }
                deletingForMe={ deletingForMe } // ❌ disable auto scroll saat delete
                onEditTextMessage={ handleEditTextMessage }
                onDeleteTextMessage={ ( index ) =>
                {
                    setDeletingForMe( true );
                    handleDeleteTextMessage( index );
                    setTimeout( () => setDeletingForMe( false ), 100 ); // reset flag setelah delete
                } }
                onSoftDeleteTextMessage={ handleSoftDeleteTextMessage }
                onEditFileMessage={ handleEditFileMessage }
                onDeleteFileMessage={ ( index ) =>
                {
                    setDeletingForMe( true );
                    handleDeleteFileMessage( index );
                    setTimeout( () => setDeletingForMe( false ), 100 );
                } }
                onSoftDeleteFileMessage={ handleSoftDeleteFileMessage }
                onDeleteAudioMessage={ ( index ) =>
                {
                    setDeletingForMe( true );
                    handleDeleteAudioMessage( index );
                    setTimeout( () => setDeletingForMe( false ), 100 );
                } }
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
