"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../states";
import
    {
        ChatMessage,
        addMessageToContact,
        setMessagesForContact,
        updateMessageForContact,
    } from "../states/chatSlice";
import { useMessageEditing, useMessageDeletion } from "./chats";
import { sendMessage, SendMessageResponse } from "../utils/sendMessageApi";
import { editMessage } from "../utils/editMessageApi";

export function useChatPage()
{
    const dispatch = useDispatch();

    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );

    const contactEmail = activeContact?.email || "default";
    const [chatSide, setChatSide] = useState<"kiri" | "kanan">( "kanan" );

    const messages = useSelector(
        ( state: RootState ) => state.chat[contactEmail] || []
    );

    // --- Hook edit pesan ---
    const {
        editingIndex,
        editType,
        editingMessage,
        handleEditTextMessage,
        handleEditFileMessage,
        handleCancelEdit,
        setEditingIndex,
        setEditType,
    } = useMessageEditing( messages, ( newMessages: ChatMessage[] ) =>
    {
        dispatch( setMessagesForContact( { email: contactEmail, messages: newMessages } ) );
    } );

    // --- Hook hapus / soft delete ---
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

    // --- Handle submit edit (text atau file caption) ---
    const handleSubmitEdit = async ( editedText: string ) =>
    {
        if ( !editingMessage || !editingMessage.id ) return;

        try
        {
            // Panggil API edit
            const updated = await editMessage( editingMessage.id, editedText );

            // Update Redux state
            dispatch(
                updateMessageForContact( {
                    email: contactEmail,
                    messageId: updated.message_id,
                    newText: editType === "text" ? updated.message_text : undefined,
                    newCaption: editType === "file" ? updated.message_text : undefined,
                    updatedAt: updated.updated_at,
                } )
            );
        } catch ( err )
        {
            console.error( "DEBUG: Gagal edit pesan:", err );
        }

        handleCancelEdit();
    };

    // --- Handle kirim teks ---
    const handleSendMessage = async ( message: string ) =>
    {
        if ( !activeContact?.contact_id ) return;

        try
        {
            const apiResponse: SendMessageResponse = await sendMessage(
                activeContact.contact_id,
                message
            );

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: apiResponse.message_text || "",
                caption: "", // teks biasa tidak punya caption
                time: new Date( apiResponse.created_at ).toLocaleTimeString( [], {
                    hour: "2-digit",
                    minute: "2-digit",
                } ),
                side: chatSide,
                attachments: apiResponse.attachments || [],
            };

            dispatch( addMessageToContact( { email: contactEmail, message: newMessage } ) );
        } catch ( err: any )
        {
            console.error( "DEBUG: Gagal mengirim pesan:", err.response?.data || err.message );
        }
    };

    // --- Handle kirim file ---
    const handleSendFile = async ( file: File, caption?: string ) =>
    {
        if ( !activeContact?.contact_id ) return;

        try
        {
            const apiResponse: SendMessageResponse = await sendMessage(
                activeContact.contact_id,
                caption || "",
                [file]
            );

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: "", // file tidak pakai text
                caption: caption || apiResponse.message_text || "",
                fileUrl: apiResponse.attachments?.[0]?.media_url || URL.createObjectURL( file ),
                fileName: apiResponse.attachments?.[0]?.media_name || file.name,
                fileType: apiResponse.attachments?.[0]?.media_type || file.type,
                time: new Date( apiResponse.created_at ).toLocaleTimeString( [], {
                    hour: "2-digit",
                    minute: "2-digit",
                } ),
                side: chatSide,
                attachments: apiResponse.attachments || [],
            };

            dispatch( addMessageToContact( { email: contactEmail, message: newMessage } ) );
        } catch ( err )
        {
            console.error( "DEBUG: Gagal mengirim file:", err );
        }
    };

    // --- Handle kirim audio ---
    const handleSendAudio = async ( audioBlob: Blob, caption?: string ) =>
    {
        if ( !activeContact?.contact_id ) return;

        try
        {
            const file = new File( [audioBlob], `audio_${ Date.now() }.webm`, {
                type: "audio/webm",
            } );

            const apiResponse: SendMessageResponse = await sendMessage(
                activeContact.contact_id,
                caption || "",
                [file]
            );

            const audioUrl = URL.createObjectURL( audioBlob );

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: "",
                caption: caption || apiResponse.message_text || "",
                audioUrl,
                time: new Date( apiResponse.created_at ).toLocaleTimeString( [], {
                    hour: "2-digit",
                    minute: "2-digit",
                } ),
                side: chatSide,
                attachments: apiResponse.attachments || [],
            };

            dispatch( addMessageToContact( { email: contactEmail, message: newMessage } ) );
        } catch ( err )
        {
            console.error( "DEBUG: Gagal mengirim audio:", err );
        }
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
