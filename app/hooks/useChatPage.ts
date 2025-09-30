"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, store } from "../states";
import
    {
        ChatMessage,
        addMessageToContact,
        updateMessageForContact,
        setMessagesForContact,
    } from "../states/chatSlice";
import { useMessageEditing } from "./chats";
import { useMessageActions } from "./useChatMessageActions";
import { sendMessage, SendMessageResponse } from "../utils/sendMessageApi";
import { editMessage } from "../utils/editMessageApi";
import { io, Socket } from "socket.io-client";
import { softDeleteMessage } from "./useSoftDelete";
import { getChatHistory, ChatHistoryItem } from "../utils/getChatHistoryApi";

// --- Socket global ---
let socket: Socket | null = null;

// --- Mapping API response ke ChatMessage ---
function mapSendMessageResponse( apiResponse: any ): SendMessageResponse
{
    return {
        message_id: apiResponse.message_id,
        message_text: apiResponse.message_text,
        from_user_id: apiResponse.from_user_id,
        to_user_id: apiResponse.to_user_id,
        created_at: apiResponse.created_at,
        updated_at: apiResponse.updated_at || null,
        attachments: ( apiResponse.attachments || [] ).map( ( a: any ) => ( {
            mediaType: a.mediaType,
            mediaUrl: a.mediaUrl,
            mediaName: a.mediaName,
            mediaSize: a.mediaSize,
        } ) ),
    };
}

// --- Format waktu 24 jam ---
const formatTime24 = ( dateString: string ) =>
{
    const date = new Date( dateString );
    const hours = date.getHours().toString().padStart( 2, "0" );
    const minutes = date.getMinutes().toString().padStart( 2, "0" );
    return `${ hours }:${ minutes }`;
};

// --- Hook untuk chat history ---
export function useChatHistory( contactId?: string )
{
    const dispatch = useDispatch();
    const activeContact = useSelector( ( state: RootState ) => state.contacts.activeContact );
    const targetContactId = contactId || activeContact?.contact_id;

    const [loading, setLoading] = useState( false );
    const [error, setError] = useState<string | null>( null );

    const formatTime = useCallback( ( dateString: string ) =>
    {
        const date = new Date( dateString );
        const hours = date.getHours().toString().padStart( 2, "0" );
        const minutes = date.getMinutes().toString().padStart( 2, "0" );
        return `${ hours }:${ minutes }`;
    }, [] );

    const determineAttachmentType = useCallback( ( attachment: any ) =>
    {
        const fileName = attachment.media_name?.toLowerCase() || "";
        const mediaType = attachment.media_type;
        const isRecording = fileName.endsWith( ".webm" ) && mediaType === "file";
        if ( isRecording ) return "voice_note";
        if ( mediaType === "audio" ) return "audio_file";
        if ( mediaType === "image" ) return "image";
        return "file";
    }, [] );

    const fetchChatHistory = useCallback( async () =>
    {
        if ( !targetContactId ) return;
        const userId = localStorage.getItem( "userId" );
        if ( !userId )
        {
            setError( "User ID tidak ditemukan" );
            return;
        }

        setLoading( true );
        setError( null );

        try
        {
            const history: ChatHistoryItem[] = await getChatHistory( targetContactId );
            const formattedMessages: ChatMessage[] = history.map( ( msg ) =>
            {
                let fileUrl, fileName, fileType, audioUrl, caption;

                if ( msg.attachments && msg.attachments.length > 0 )
                {
                    const attachment = msg.attachments[0];
                    const attachmentType = determineAttachmentType( attachment );
                    fileUrl = attachment.media_url;
                    fileName = attachment.media_name;
                    fileType = attachment.media_type;
                    caption = attachment.caption || msg.message_text || undefined;

                    if ( attachmentType === "voice_note" )
                    {
                        audioUrl = fileUrl;
                        fileUrl = fileName = fileType = undefined;
                    }
                }

                let message: ChatMessage = {
                    id: msg.message_id,
                    text: msg.message_text || "",
                    fileUrl,
                    fileName,
                    fileType,
                    caption,
                    audioUrl,
                    time: formatTime( msg.created_at ),
                    side: msg.from_user_id === userId ? "kanan" : "kiri",
                    isDeleted: !!msg.is_deleted,
                    isSoftDeleted: false,
                    attachments: msg.attachments || [],
                };

                if ( message.isDeleted ) message = softDeleteMessage( message );

                return message;
            } );

            dispatch(
                setMessagesForContact( {
                    contactId: targetContactId,
                    messages: formattedMessages,
                } )
            );
        } catch ( err: any )
        {
            const message =
                err instanceof Error
                    ? err.message
                    : err.response?.data?.message || "Unknown error";
            setError( message );
        } finally
        {
            setLoading( false );
        }
    }, [targetContactId, dispatch, formatTime, determineAttachmentType] );

    useEffect( () =>
    {
        fetchChatHistory();
    }, [fetchChatHistory] );

    return { loading, error, refetch: fetchChatHistory };
}

// --- Hook utama untuk chat page ---
export function useChatPage()
{
    const dispatch = useDispatch();
    const activeContact = useSelector( ( state: RootState ) => state.contacts.activeContact );
    const contactId = activeContact?.contact_id || "default";
    const messages = useSelector( ( state: RootState ) => state.chat[contactId] || [] );
    const currentUserId = localStorage.getItem( "userId" ) || "";

    const { editingIndex, editType, editingMessage, handleEditTextMessage, handleEditFileMessage, handleCancelEdit, setEditingIndex, setEditType } = useMessageEditing( messages );
    const { handleSoftDeleteTextMessage, handleSoftDeleteFileMessage, handleSoftDeleteAudioMessage, handleDeleteMessageForUser, handleDeleteFileMessageForUser, handleDeleteAudioMessageForUser } = useMessageActions( contactId, editingIndex, setEditingIndex, setEditType, contactId );

    const [isSendingFile, setIsSendingFile] = useState( false );
    const [isSendingAudio, setIsSendingAudio] = useState( false );

    // --- Chat history hook ---
    const { refetch: refetchChatHistory } = useChatHistory( contactId );

    useEffect( () =>
    {
        if ( !socket ) socket = io( "http://localhost:5000" );
        if ( currentUserId )
        {
            console.log( "DEBUG: emitting join for userId", currentUserId );
            socket.emit( "join", currentUserId );
        }

        const handleNewMessage = ( msg: any ) =>
        {
            console.log( "DEBUG: newMessage received from socket", msg );

            // Mapping API response ke frontend
            const mappedMsg = mapSendMessageResponse( msg );
            console.log( "DEBUG: mappedMsg after mapping", mappedMsg );

            const side = mappedMsg.from_user_id === currentUserId ? "kanan" : "kiri";

            const hasAttachment = mappedMsg.attachments && mappedMsg.attachments.length > 0;

            const newMessage: ChatMessage = {
                id: mappedMsg.message_id,
                text: mappedMsg.message_text || "",
                // caption hanya ada jika ada attachment
                caption: hasAttachment ? mappedMsg.message_text || "" : undefined,
                time: formatTime24( mappedMsg.created_at ),
                side,
                attachments: hasAttachment
                    ? mappedMsg.attachments.map( ( a ) => ( {
                        mediaType: a.mediaType,
                        mediaUrl: a.mediaUrl,
                        mediaName: a.mediaName,
                        mediaSize: a.mediaSize,
                    } ) )
                    : [],
                fileUrl: hasAttachment ? mappedMsg.attachments[0]?.mediaUrl : undefined,
                fileName: hasAttachment ? mappedMsg.attachments[0]?.mediaName : undefined,
                fileType: hasAttachment ? mappedMsg.attachments[0]?.mediaType : undefined,
                audioUrl:
                    mappedMsg.attachments?.[0]?.mediaType === "audio"
                        ? mappedMsg.attachments[0].mediaUrl
                        : undefined,
            };

            console.log( "DEBUG: newMessage constructed", newMessage );

            // Dispatch ke redux store
            dispatch( addMessageToContact( { contactId, message: newMessage } ) );
        };

        socket.on( "newMessage", handleNewMessage );

        socket.on( "messageUpdated", ( msg: any ) =>
        {
            console.log( "DEBUG: messageUpdated received", msg );
            const mappedMsg = mapSendMessageResponse( msg );
            dispatch(
                updateMessageForContact( {
                    contactId,
                    messageId: mappedMsg.message_id,
                    newText: mappedMsg.message_text,
                    updatedAt: mappedMsg.updated_at,
                } )
            );
        } );

        socket.on( "messageDeleted", ( { message_id }: { message_id: string } ) =>
        {
            console.log( "DEBUG: messageDeleted received", message_id );
            const state = store.getState();
            const contactMessages = state.chat[contactId] || [];
            const msg = contactMessages.find( ( m ) => m.id === message_id );
            if ( !msg ) return;
            const softDeletedMsg = softDeleteMessage( msg );

            // Hapus attachments dan audioUrl juga
            store.dispatch(
                updateMessageForContact( {
                    contactId,
                    messageId: message_id,
                    newText: softDeletedMsg.text,
                    newCaption: undefined,
                    fileUrl: undefined,
                    fileName: undefined,
                    fileType: undefined,
                    audioUrl: undefined,
                    attachments: [],
                    updatedAt: new Date().toISOString(),
                } )
            );
        } );

        return () =>
        {
            console.log( "DEBUG: cleaning up socket listeners" );
            socket?.off( "newMessage", handleNewMessage );
            socket?.off( "messageUpdated" );
            socket?.off( "messageDeleted" );
        };
    }, [activeContact, contactId, dispatch, currentUserId] );



    // --- Handle submit edit ---
    // --- Handle submit edit (text atau caption) ---
    const handleSubmitEdit = async ( editedText: string ) =>
    {
        if ( !editingMessage?.id ) return;

        try
        {
            const updatedRaw = await editMessage( editingMessage.id, editedText );
            const updated = mapSendMessageResponse( updatedRaw );

            // Tentukan apakah edit text atau caption
            const newText = editType === "text" ? updated.message_text : undefined;
            const newCaption = editType === "file" ? updated.message_text : undefined;

            // Update state lokal
            dispatch(
                updateMessageForContact( {
                    contactId,
                    messageId: updated.message_id,
                    newText,
                    newCaption,
                    updatedAt: updated.updated_at,
                } )
            );

            // Emit realtime update ke server
            if ( socket )
            {
                socket.emit( "editMessage", {
                    messageId: updated.message_id,
                    newText,
                    newCaption,
                } );
            }
        } catch ( err )
        {
            console.error( "Gagal edit pesan:", err );
        }

        handleCancelEdit();
    };

    // --- Socket listener untuk messageUpdated ---
    useEffect( () =>
    {
        if ( !socket ) return;

        const handleMessageUpdated = ( msg: any ) =>
        {
            const mappedMsg = mapSendMessageResponse( msg );

            // Update text & caption secara realtime
            dispatch(
                updateMessageForContact( {
                    contactId,
                    messageId: mappedMsg.message_id,
                    newText: mappedMsg.message_text,
                    newCaption:
                        mappedMsg.attachments && mappedMsg.attachments.length > 0
                            ? mappedMsg.message_text
                            : undefined,
                    updatedAt: mappedMsg.updated_at,
                } )
            );
        };

        socket.on( "messageUpdated", handleMessageUpdated );

        return () =>
        {
            socket.off( "messageUpdated", handleMessageUpdated );
        };
    }, [contactId, dispatch] );


    // --- Send text message ---
    const handleSendMessage = async ( message: string ) =>
    {
        if ( !activeContact?.contact_id ) return;
        try
        {
            const apiResponseRaw = await sendMessage( activeContact.contact_id, message );
            const apiResponse = mapSendMessageResponse( apiResponseRaw );
            const side = apiResponse.from_user_id === currentUserId ? "kanan" : "kiri";
            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: apiResponse.message_text || "",
                caption: "",
                time: formatTime24( apiResponse.created_at ),
                side,
                attachments: apiResponse.attachments || [],
            };
            dispatch( addMessageToContact( { contactId, message: newMessage } ) );
        } catch ( err: any )
        {
            console.error( "Gagal mengirim pesan:", err.response?.data || err.message );
        }
    };

    const handleSendFile = async ( file: File, caption?: string ) =>
    {
        if ( !activeContact?.contact_id ) return;
        setIsSendingFile( true );
        try
        {
            const apiResponseRaw = await sendMessage( activeContact.contact_id, caption || "", [file] );
            console.log( "DEBUG: apiResponseRaw", apiResponseRaw ); // 🔹

            const apiResponse = mapSendMessageResponse( apiResponseRaw );
            console.log( "DEBUG: apiResponse mapped attachments", apiResponse.attachments ); // 🔹

            const serverAttachment = apiResponse.attachments?.[0];
            console.log( "DEBUG: serverAttachment", serverAttachment ); // 🔹

            const side = apiResponse.from_user_id === currentUserId ? "kanan" : "kiri";

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: caption || "",
                caption: caption || "",
                fileUrl: serverAttachment?.mediaUrl || URL.createObjectURL( file ),
                fileName: serverAttachment?.mediaName || file?.name || "",
                fileType: serverAttachment?.mediaType || file?.type || "",
                audioUrl: serverAttachment?.mediaType === "audio" ? serverAttachment?.mediaUrl : undefined,
                time: formatTime24( apiResponse.created_at ),
                side,
                attachments: apiResponse.attachments || [],
            };

            console.log( "DEBUG: newMessage after sendFile", newMessage ); // 🔹

            dispatch( addMessageToContact( { contactId, message: newMessage } ) );
        } catch ( err )
        {
            console.error( "Gagal mengirim file:", err );
        } finally
        {
            setIsSendingFile( false );
        }
    };

    // --- Send audio ---
    const handleSendAudio = async ( audioBlob: Blob ) =>
    {
        if ( !activeContact?.contact_id ) return;
        const file = new File( [audioBlob], `audio_${ Date.now() }.webm`, { type: "audio/webm" } );
        setIsSendingAudio( true );
        try
        {
            const apiResponseRaw = await sendMessage( activeContact.contact_id, "", [file] );
            const apiResponse = mapSendMessageResponse( apiResponseRaw );
            const serverAttachment = apiResponse.attachments?.[0];
            const side = apiResponse.from_user_id === currentUserId ? "kanan" : "kiri";
            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: "",
                caption: "",
                audioUrl: serverAttachment?.mediaUrl || URL.createObjectURL( file ),
                fileName: serverAttachment?.mediaName || file?.name || "",
                fileType: serverAttachment?.mediaType || file?.type || "",
                time: formatTime24( apiResponse.created_at ),
                side,
                attachments: apiResponse.attachments || [],
            };
            dispatch( addMessageToContact( { contactId, message: newMessage } ) );

            // Realtime update chat history
            refetchChatHistory();
        } catch ( err )
        {
            console.error( "Gagal mengirim audio:", err );
        } finally
        {
            setIsSendingAudio( false );
        }
    };

    return {
        messages,
        editingIndex,
        editType,
        editingMessage,
        handleEditTextMessage,
        handleEditFileMessage,
        handleSubmitEdit,
        handleCancelEdit,
        handleDeleteTextMessage: handleDeleteMessageForUser,
        handleSoftDeleteTextMessage,
        handleDeleteFileMessage: handleDeleteFileMessageForUser,
        handleSoftDeleteFileMessage,
        handleDeleteAudioMessage: handleDeleteAudioMessageForUser,
        handleSoftDeleteAudioMessage,
        handleSendMessage,
        handleSendAudio,
        handleSendFile,
        isSendingFile,
        isSendingAudio,
    };
}
