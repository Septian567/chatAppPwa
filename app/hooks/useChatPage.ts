"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../states";
import
    {
        ChatMessage,
        addMessageToContact,
        setMessagesForContact,
    } from "../states/chatSlice";
import { useMessageEditing, useMessageDeletion } from "./chats";

export function useChatPage()
{
    const dispatch = useDispatch();

    // Ambil kontak aktif
    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );
    const contactEmail = activeContact?.email || "default"; // default jika null
    const [chatSide, setChatSide] = useState<"kiri" | "kanan">( "kanan" );

    // Ambil pesan berdasarkan email
    const messages = useSelector(
        ( state: RootState ) => state.chat[contactEmail] || []
    );

    // --- Hook untuk edit pesan ---
    const {
        editingIndex,
        editType,
        editingMessage,
        handleEditTextMessage,
        handleEditFileMessage,
        handleSubmitEdit,
        handleCancelEdit,
        setEditingIndex,
        setEditType,
    } = useMessageEditing( messages, ( newMessages: ChatMessage[] ) =>
    {
        dispatch( setMessagesForContact( { email: contactEmail, messages: newMessages } ) );
    } );

    // --- Hook untuk hapus / soft delete ---
    const {
        handleDeleteTextMessage,
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteAudioMessage,
    } = useMessageDeletion(
        messages,
        ( newMessages: ChatMessage[] ) =>
        {
            dispatch( setMessagesForContact( { email: contactEmail, messages: newMessages } ) );
        },
        editingIndex,
        setEditingIndex,
        setEditType
    );

    // --- Fungsi kirim pesan ---
    const handleSendMessage = ( message: string ) =>
    {
        const newMessage: ChatMessage = {
            text: message,
            time: new Date().toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit" } ),
            side: chatSide,
        };
        dispatch( addMessageToContact( { email: contactEmail, message: newMessage } ) );
    };

    const handleSendAudio = ( audioBlob: Blob ) =>
    {
        const audioUrl = URL.createObjectURL( audioBlob );
        const newMessage: ChatMessage = {
            audioUrl,
            time: new Date().toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit" } ),
            side: chatSide,
        };
        dispatch( addMessageToContact( { email: contactEmail, message: newMessage } ) );
    };

    const handleSendFile = ( file: File, caption?: string ) =>
    {
        const fileUrl = URL.createObjectURL( file );
        const newMessage: ChatMessage = {
            fileUrl,
            fileName: file.name,
            fileType: file.type,
            caption: caption?.trim() || undefined,
            time: new Date().toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit" } ),
            side: chatSide,
        };
        dispatch( addMessageToContact( { email: contactEmail, message: newMessage } ) );
    };

    return {
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
    };
}
