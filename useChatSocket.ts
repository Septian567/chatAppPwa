"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { store, RootState } from "../states";
import
    {
        addMessageToContact,
        updateMessageForContact,
        ChatMessage,
    } from "../states/chatSlice";
import { upsertLastMessage } from "../states/lastMessagesSlice";
import { softDeleteMessage } from "./useSoftDelete";
import { formatTime24 } from "../utils/formatTime";
import { useMapSendMessageResponse } from "./useMapSendMessageResponse";
import { getMessagePreview } from "../utils/messagePreview";

let socket: Socket | null = null;

export function useChatSocket( contactId: string, currentUserId: string )
{
    const dispatch = useDispatch();
    const { mapSendMessageResponse } = useMapSendMessageResponse();

    useEffect( () =>
    {
        if ( !socket ) socket = io( "http://localhost:5000" );

        if ( currentUserId )
        {
            console.log( "DEBUG: emitting join for userId", currentUserId );
            socket.emit( "join", currentUserId );
        }

        // ===========================
        // Listener: New Message
        // ===========================
        const handleNewMessage = ( msg: any ) =>
        {
            console.log( "DEBUG: newMessage received", msg );

            const mappedMsg = mapSendMessageResponse( msg );
            const side = mappedMsg.from_user_id === currentUserId ? "kanan" : "kiri";
            const hasAttachment = mappedMsg.attachments?.length > 0;

            let fileUrl: string | undefined;
            let fileName: string | undefined;
            let fileType: string | undefined;
            let audioUrl: string | undefined;
            let videoUrl: string | undefined;
            let caption: string | undefined;

            if ( hasAttachment )
            {
                const attachment = mappedMsg.attachments[0];
                fileUrl = attachment.mediaUrl;
                fileName = attachment.mediaName;
                fileType = attachment.mediaType;
                caption = mappedMsg.message_text || "";

                // suara & video langsung override url
                const previewType = getMessagePreview( mappedMsg );
                if ( previewType === "[Audio]" )
                {
                    audioUrl = attachment.mediaUrl;
                    fileUrl = undefined;
                    fileName = undefined;
                    fileType = undefined;
                } else if ( previewType === "[Video]" )
                {
                    videoUrl = attachment.mediaUrl;
                    fileUrl = undefined;
                }
            }

            const newMessage: ChatMessage = {
                id: mappedMsg.message_id,
                text: mappedMsg.message_text || "",
                caption,
                time: formatTime24( mappedMsg.created_at ),
                side,
                attachments: hasAttachment ? mappedMsg.attachments : [],
                fileUrl,
                fileName,
                fileType,
                audioUrl,
                videoUrl,
            };

            dispatch( addMessageToContact( { contactId, message: newMessage } ) );

            // 🔹 gunakan getMessagePreview
            dispatch(
                upsertLastMessage( {
                    chat_partner_id:
                        mappedMsg.from_user_id === currentUserId
                            ? mappedMsg.to_user_id
                            : mappedMsg.from_user_id,
                    message_id: mappedMsg.message_id,
                    message_text: getMessagePreview( mappedMsg ),
                    created_at: mappedMsg.created_at,
                    is_deleted: false,
                } )
            );
        };

        // ===========================
        // Listener: Message Updated
        // ===========================
        const handleMessageUpdated = ( msg: any ) =>
        {
            console.log( "DEBUG: messageUpdated received", msg );
            const mappedMsg = mapSendMessageResponse( msg );

            dispatch(
                updateMessageForContact( {
                    contactId,
                    messageId: mappedMsg.message_id,
                    newText: mappedMsg.message_text,
                    newCaption:
                        mappedMsg.attachments?.length > 0 ? mappedMsg.message_text : undefined,
                    updatedAt: mappedMsg.updated_at,
                } )
            );

            // Update lastMessages hanya jika pesan yang diedit adalah pesan terakhir
            const state: RootState = store.getState();
            const contactMessages = state.chat[contactId] || [];
            const lastMessage = contactMessages[contactMessages.length - 1];

            if ( lastMessage?.id === mappedMsg.message_id )
            {
                dispatch(
                    upsertLastMessage( {
                        chat_partner_id:
                            mappedMsg.from_user_id === currentUserId
                                ? mappedMsg.to_user_id
                                : mappedMsg.from_user_id,
                        message_id: mappedMsg.message_id,
                        message_text: getMessagePreview( mappedMsg ),
                        created_at: mappedMsg.updated_at,
                        is_deleted: false,
                    } )
                );
            }
        };

        // ===========================
        // Listener: Message Deleted (for all)
        // ===========================
        const handleMessageDeleted = ( { message_id, contactId: deletedContactId }: { message_id: string; contactId: string } ) =>
        {
            const state: RootState = store.getState();
            const contactMessages = state.chat[deletedContactId] || [];
            const msg = contactMessages.find( ( m ) => m.id === message_id );
            if ( !msg ) return;

            // 1️⃣ Update message di store dulu
            const updatedMsg = {
                ...msg,
                text: "",
                caption: undefined,
                fileUrl: undefined,
                fileName: undefined,
                fileType: undefined,
                audioUrl: undefined,
                videoUrl: undefined,
                attachments: ( msg.attachments || [] ).map( a => ( { ...a, isSoftDeleted: true } ) ),
                isDeleted: true,
                updatedAt: new Date().toISOString(),
            };

            store.dispatch(
                updateMessageForContact( {
                    contactId: deletedContactId,
                    messageId: message_id,
                    newText: updatedMsg.text,
                    newCaption: updatedMsg.caption,
                    fileUrl: updatedMsg.fileUrl,
                    fileName: updatedMsg.fileName,
                    fileType: updatedMsg.fileType,
                    audioUrl: updatedMsg.audioUrl,
                    videoUrl: updatedMsg.videoUrl,
                    attachments: updatedMsg.attachments,
                    updatedAt: updatedMsg.updatedAt,
                } )
            );

            // 2️⃣ Update lastMessage menggunakan message yang sudah diupdate
            store.dispatch(
                upsertLastMessage( {
                    chat_partner_id: deletedContactId,
                    message_id: updatedMsg.id,
                    message_text: getMessagePreview( updatedMsg ),
                    created_at: updatedMsg.updatedAt,
                    is_deleted: true,
                } )
            );
        };




        // ===========================
        // Listener: Message Deleted For Me (user-specific)
        // ===========================
        const handleMessageDeletedForMe = ( {
            message_id,
            contactId: deletedContactId,
        }: {
            message_id: string;
            contactId: string;
        } ) =>
        {
            // 1️⃣ Soft-delete pesan
            store.dispatch(
                updateMessageForContact( {
                    contactId: deletedContactId,
                    messageId: message_id,
                    newText: "",
                    newCaption: undefined,
                    fileUrl: undefined,
                    fileName: undefined,
                    fileType: undefined,
                    audioUrl: undefined,
                    attachments: [],
                    isSoftDeleted: true,
                    updatedAt: new Date().toISOString(),
                } )
            );

            // 2️⃣ Ambil state terbaru dari store
            const updatedState: RootState = store.getState();
            const updatedMessages = updatedState.chat[deletedContactId] || [];

            // 3️⃣ Cari pesan terakhir yang tidak dihapus untuk diri sendiri
            let lastVisibleMessage = null;
            for ( let i = updatedMessages.length - 1; i >= 0; i-- )
            {
                const message = updatedMessages[i];

                // Skip pesan yang dihapus untuk diri sendiri
                if ( message.isSoftDeleted ) continue;

                if ( message.isDeleted )
                {
                    lastVisibleMessage = {
                        id: message.id,
                        text: "Pesan telah dihapus",
                        isDeleted: true,
                        updatedAt: message.updatedAt || new Date().toISOString(),
                    };
                    break;
                }

                lastVisibleMessage = {
                    id: message.id,
                    text: getMessagePreview( message ),
                    isDeleted: false,
                    updatedAt: message.updatedAt || new Date().toISOString(),
                };
                break;
            }

            // 4️⃣ Update lastMessages
            if ( lastVisibleMessage )
            {
                store.dispatch(
                    upsertLastMessage( {
                        chat_partner_id: deletedContactId,
                        message_id: lastVisibleMessage.id,
                        message_text: lastVisibleMessage.text,
                        created_at: lastVisibleMessage.updatedAt,
                        is_deleted: lastVisibleMessage.isDeleted,
                    } )
                );
            } else
            {
                store.dispatch(
                    upsertLastMessage( {
                        chat_partner_id: deletedContactId,
                        message_id: Date.now().toString(),
                        message_text: "Pesan telah dihapus",
                        created_at: new Date().toISOString(),
                        is_deleted: false,
                    } )
                );
            }
        };

        socket.on( "newMessage", handleNewMessage );
        socket.on( "messageUpdated", handleMessageUpdated );
        socket.on( "messageDeleted", handleMessageDeleted );
        socket.on( "messageDeletedForMe", handleMessageDeletedForMe );

        return () =>
        {
            console.log( "DEBUG: cleaning up socket listeners" );
            socket?.off( "newMessage", handleNewMessage );
            socket?.off( "messageUpdated", handleMessageUpdated );
            socket?.off( "messageDeleted", handleMessageDeleted );
            socket?.off( "messageDeletedForMe", handleMessageDeletedForMe );
        };
    }, [contactId, currentUserId, dispatch, mapSendMessageResponse] );

    return socket;
}
