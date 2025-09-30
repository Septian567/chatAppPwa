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

        const handleNewMessage = ( msg: any ) =>
        {
            console.log( "DEBUG: newMessage received", msg );

            const mappedMsg = mapSendMessageResponse( msg );
            const side = mappedMsg.from_user_id === currentUserId ? "kanan" : "kiri";

            const hasAttachment = mappedMsg.attachments?.length > 0;

            // Init fields
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

                // Default assignment
                fileUrl = attachment.mediaUrl;
                fileName = attachment.mediaName;
                fileType = attachment.mediaType;
                caption = mappedMsg.message_text || "";

                if ( attachmentType === "voice_note" )
                {
                    // Audio message
                    audioUrl = attachment.mediaUrl;
                    fileUrl = undefined;
                    fileName = undefined;
                    fileType = undefined;
                } else if ( attachmentType === "video" )
                {
                    // Video message
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
        };

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
                        mappedMsg.attachments?.length > 0
                            ? mappedMsg.message_text
                            : undefined,
                    updatedAt: mappedMsg.updated_at,
                } )
            );
        };

        const handleMessageDeleted = ( { message_id, contactId: deletedContactId }: { message_id: string, contactId: string } ) =>
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
        };




        socket.on( "newMessage", handleNewMessage );
        socket.on( "messageUpdated", handleMessageUpdated );
        socket.on( "messageDeleted", handleMessageDeleted );

        return () =>
        {
            console.log( "DEBUG: cleaning up socket listeners" );
            socket?.off( "newMessage", handleNewMessage );
            socket?.off( "messageUpdated", handleMessageUpdated );
            socket?.off( "messageDeleted", handleMessageDeleted );
        };
    }, [contactId, currentUserId, dispatch, mapSendMessageResponse] );

    return socket;
}
