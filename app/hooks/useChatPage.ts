"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../states";
import
{
    ChatMessage,
    addMessageToContact,
    updateMessageForContact,
} from "../states/chatSlice";
import { useMessageEditing } from "./chats";
import { useMessageActions } from "./useChatMessageActions";
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

    const {
        editingIndex,
        editType,
        editingMessage,
        handleEditTextMessage,
        handleEditFileMessage,
        handleCancelEdit,
        setEditingIndex,
        setEditType,
    } = useMessageEditing( messages );

    const {
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteMessage,
        handleDeleteFileMessage,
        handleDeleteAudioMessage,
    } = useMessageActions( contactEmail, editingIndex, setEditingIndex, setEditType );

    // --- Handle submit edit ---
    const handleSubmitEdit = async ( editedText: string ) =>
    {
        if ( !editingMessage || !editingMessage.id ) return;

        try
        {
            const updated = await editMessage( editingMessage.id, editedText );

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
                caption: "",
                time: new Date( apiResponse.created_at ).toLocaleTimeString( [], {
                    hour: "2-digit",
                    minute: "2-digit",
                } ),
                side: chatSide,
                attachments: apiResponse.attachments || [],
            };

            dispatch(
                addMessageToContact( { email: contactEmail, message: newMessage } )
            );
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
                "", // teks kosong
                [file]
            );

            const serverAttachment = apiResponse.attachments?.[0];

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: "",
                caption: caption || "",
                fileUrl: serverAttachment?.media_url || URL.createObjectURL( file ),
                fileName: serverAttachment?.media_name || file.name,
                fileType: serverAttachment?.media_type || file.type,
                time: new Date( apiResponse.created_at ).toLocaleTimeString( [], {
                    hour: "2-digit",
                    minute: "2-digit",
                } ),
                side: chatSide,
                attachments: apiResponse.attachments || [],
            };

            dispatch(
                addMessageToContact( { email: contactEmail, message: newMessage } )
            );
        } catch ( err )
        {
            console.error( "DEBUG: Gagal mengirim file:", err );
        }
    };

    // --- Handle kirim audio (sama seperti file) ---
    const handleSendAudio = async ( audioBlob: Blob ) =>
    {
        if ( !activeContact?.contact_id ) return;

        const file = new File( [audioBlob], `audio_${ Date.now() }.webm`, {
            type: "audio/webm",
        } );

        try
        {
            const apiResponse: SendMessageResponse = await sendMessage(
                activeContact.contact_id,
                "", // teks kosong
                [file]
            );

            const serverAttachment = apiResponse.attachments?.[0];

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: "",
                caption: "",
                audioUrl: serverAttachment?.media_url || URL.createObjectURL( file ),
                fileName: serverAttachment?.media_name || file.name,
                fileType: serverAttachment?.media_type || file.type,
                time: new Date( apiResponse.created_at ).toLocaleTimeString( [], {
                    hour: "2-digit",
                    minute: "2-digit",
                } ),
                side: chatSide,
                attachments: apiResponse.attachments || [],
            };

            dispatch(
                addMessageToContact( { email: contactEmail, message: newMessage } )
            );
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
        handleDeleteTextMessage: handleDeleteMessage,
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
