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
import { determineAttachmentType } from "../utils/attachmentUtils";

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
                const attachmentType = determineAttachmentType( attachment );

                fileUrl = attachment.mediaUrl;
                fileName = attachment.mediaName;
                fileType = attachment.mediaType;
                caption = mappedMsg.message_text || "";

                if ( attachmentType === "voice_note" )
                {
                    audioUrl = attachment.mediaUrl;
                    fileUrl = undefined;
                    fileName = undefined;
                    fileType = undefined;
                } else if ( attachmentType === "video" )
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

            dispatch(
                upsertLastMessage( {
                    chat_partner_id:
                        mappedMsg.from_user_id === currentUserId
                            ? mappedMsg.to_user_id
                            : mappedMsg.from_user_id,
                    message_id: mappedMsg.message_id,
                    message_text: mappedMsg.message_text,
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
                        message_text: mappedMsg.message_text,
                        created_at: mappedMsg.updated_at,
                        is_deleted: false,
                    } )
                );
            }
        };

        // ===========================
        // Listener: Message Deleted (for all)
        // ===========================
        const handleMessageDeleted = ( {
            message_id,
            contactId: deletedContactId,
        }: {
            message_id: string;
            contactId: string;
        } ) =>
        {
            console.log( "DEBUG: messageDeleted received", message_id );
            const state: RootState = store.getState();
            const contactMessages = state.chat[deletedContactId] || [];
            const msg = contactMessages.find( ( m ) => m.id === message_id );
            if ( !msg ) return;

            const softDeletedMsg = softDeleteMessage( msg );

            store.dispatch(
                updateMessageForContact( {
                    contactId: deletedContactId,
                    messageId: message_id,
                    newText: softDeletedMsg.text,
                    newCaption: softDeletedMsg.caption,
                    fileUrl: softDeletedMsg.fileUrl,
                    fileName: softDeletedMsg.fileName,
                    fileType: softDeletedMsg.fileType,
                    audioUrl: softDeletedMsg.audioUrl,
                    attachments: softDeletedMsg.attachments,
                    updatedAt: new Date().toISOString(),
                } )
            );

            // Cari pesan terakhir yang valid (tidak dihapus)
            const validMessages = contactMessages.filter( ( m ) => !m.isDeleted && !m.isSoftDeleted );
            const lastValidMessage = validMessages[validMessages.length - 1];

            if ( lastValidMessage )
            {
                // Jika pesan yang dihapus adalah pesan terakhir, update dengan "Pesan telah dihapus"
                const lastMessage = contactMessages[contactMessages.length - 1];
                if ( lastMessage?.id === message_id )
                {
                    store.dispatch(
                        upsertLastMessage( {
                            chat_partner_id: deletedContactId,
                            message_id,
                            message_text: "Pesan telah dihapus",
                            created_at: new Date().toISOString(),
                            is_deleted: true,
                        } )
                    );
                }
                // Jika bukan pesan terakhir, tetap tampilkan pesan terakhir yang valid
                else if ( lastValidMessage.id === lastMessage?.id )
                {
                    store.dispatch(
                        upsertLastMessage( {
                            chat_partner_id: deletedContactId,
                            message_id: lastValidMessage.id,
                            message_text: lastValidMessage.text || "[Pesan Kosong]",
                            created_at: lastValidMessage.updatedAt || new Date().toISOString(),
                            is_deleted: false,
                        } )
                    );
                }
            }
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
            // 1️⃣ Soft-delete pesan untuk user ini
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

            // 2️⃣ Ambil semua pesan terbaru
            const updatedState: RootState = store.getState();
            const messages = updatedState.chat[deletedContactId] || [];

            // 3️⃣ Cari pesan terakhir yang TAMPIL untuk user
            let lastVisibleMessage: ChatMessage | null = null;

            for ( let i = messages.length - 1; i >= 0; i-- )
            {
                const msg = messages[i];

                if ( msg.isSoftDeleted ) continue; // skip pesan yang dihapus hanya untuk saya

                if ( msg.isDeleted )
                {
                    // Jika pesan dihapus untuk semua, tampilkan "Pesan telah dihapus"
                    lastVisibleMessage = {
                        id: msg.id,
                        text: "Pesan telah dihapus",
                        isDeleted: true,
                        updatedAt: msg.updatedAt || new Date().toISOString(),
                    } as any;
                    break;
                }

                // Pesan normal yang masih terlihat
                lastVisibleMessage = {
                    id: msg.id,
                    text: msg.text || "[Pesan Kosong]",
                    isDeleted: false,
                    updatedAt: msg.updatedAt || new Date().toISOString(),
                } as any;
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
                // fallback jika tidak ada pesan sama sekali
                store.dispatch(
                    upsertLastMessage( {
                        chat_partner_id: deletedContactId,
                        message_id: Date.now().toString(),
                        message_text: "[Pesan Kosong]",
                        created_at: new Date().toISOString(),
                        is_deleted: false,
                    } )
                );
            }
        };


        // ===========================
        // Register all listeners
        // ===========================
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