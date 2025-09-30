"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState, store } from "../states";
import { addMessageToContact, updateMessageForContact } from "../states/chatSlice";
import { softDeleteMessage } from "./useSoftDelete";

let socket: Socket | null = null;

export function useChatSocket( contactId?: string )
{
    const activeContact = useSelector( ( state: RootState ) => state.contacts.activeContact );
    const targetContactId = contactId || activeContact?.contact_id;
    const currentUserId = localStorage.getItem( "userId" ) || "";

    useEffect( () =>
    {
        if ( !targetContactId || !currentUserId ) return;

        if ( !socket ) socket = io( "http://localhost:5000" );

        // Join room untuk user
        socket.emit( "join", currentUserId );

        const handleNewMessage = ( msg: any ) =>
        {
            const side = msg.from_user_id === currentUserId ? "kanan" : "kiri";
            const newMessage = {
                id: msg.message_id,
                text: msg.message_text || "",
                caption: msg.attachments?.length ? msg.message_text : undefined,
                time: new Date( msg.created_at ).toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit" } ),
                side,
                attachments: msg.attachments || [],
                fileUrl: msg.attachments?.[0]?.mediaUrl,
                fileName: msg.attachments?.[0]?.mediaName,
                fileType: msg.attachments?.[0]?.mediaType,
                audioUrl: msg.attachments?.[0]?.mediaType === "audio" ? msg.attachments[0].mediaUrl : undefined,
            };
            store.dispatch( addMessageToContact( { contactId: targetContactId!, message: newMessage } ) );
        };

        const handleMessageUpdated = ( msg: any ) =>
        {
            store.dispatch(
                updateMessageForContact( {
                    contactId: targetContactId!,
                    messageId: msg.message_id,
                    newText: msg.message_text,
                    newCaption: msg.attachments?.length ? msg.message_text : undefined,
                    updatedAt: msg.updated_at,
                } )
            );
        };

        const handleMessageDeleted = ( { message_id }: { message_id: string } ) =>
        {
            const state = store.getState();
            const contactMessages = state.chat[targetContactId!] || [];
            const msg = contactMessages.find( ( m ) => m.id === message_id );
            if ( !msg ) return;

            const softDeletedMsg = softDeleteMessage( msg );
            store.dispatch(
                updateMessageForContact( {
                    contactId: targetContactId!,
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
        };

        socket.on( "newMessage", handleNewMessage );
        socket.on( "messageUpdated", handleMessageUpdated );
        socket.on( "messageDeleted", handleMessageDeleted );

        return () =>
        {
            socket?.off( "newMessage", handleNewMessage );
            socket?.off( "messageUpdated", handleMessageUpdated );
            socket?.off( "messageDeleted", handleMessageDeleted );
        };
    }, [targetContactId, currentUserId] );

    return socket;
}
