"use client";

import { useDispatch } from "react-redux";
import { addMessageToContact, ChatMessage } from "../states/chatSlice";
import { sendMessage, SendMessageResponse } from "../utils/sendMessageApi";

function formatTime( date: Date ): string
{
    const h = date.getHours().toString().padStart( 2, "0" );
    const m = date.getMinutes().toString().padStart( 2, "0" );
    return `${ h }.${ m }`;
}

export function useSendAudioMessage( currentUserId: string, contactId?: string )
{
    const dispatch = useDispatch();

    const handleSendAudio = async ( audioBlob: Blob ) =>
    {
        if ( !contactId ) return;

        const file = new File( [audioBlob], `audio_${ Date.now() }.webm`, {
            type: "audio/webm",
        } );

        try
        {
            const apiResponse: SendMessageResponse = await sendMessage( contactId, "", [file] );

            const serverAttachment = apiResponse.attachments?.[0];
            const side = apiResponse.from_user_id === currentUserId ? "kanan" : "kiri";

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: "",
                caption: "",
                audioUrl: serverAttachment?.media_url || URL.createObjectURL( file ),
                fileName: serverAttachment?.media_name || file.name,
                fileType: serverAttachment?.media_type || file.type,
                time: formatTime( new Date( apiResponse.created_at ) ),
                side,
                attachments: apiResponse.attachments || [],
            };

            dispatch( addMessageToContact( { contactId, message: newMessage } ) );
        } catch ( err )
        {
            console.error( "Gagal mengirim audio:", err );
        }
    };

    return { handleSendAudio };
}
