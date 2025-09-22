"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../states";
import { getChatHistory, ChatHistoryItem } from "../utils/getChatHistoryApi";
import { setMessagesForContact, ChatMessage } from "../states/chatSlice";
import { softDeleteMessage } from "../hooks/useSoftDelete";

export function useChatHistory( contactId?: string )
{
    const dispatch = useDispatch();
    const activeContact = useSelector( ( state: RootState ) => state.contacts.activeContact );

    const targetContactId = contactId || activeContact?.contact_id;
    const contactEmail = activeContact?.email || "default";

    const [loading, setLoading] = useState( false );
    const [error, setError] = useState<string | null>( null );

    const formatTime = useCallback( ( dateString: string ) =>
    {
        return new Date( dateString ).toLocaleTimeString( [], {
            hour: "2-digit",
            minute: "2-digit",
        } );
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
        if ( !targetContactId )
        {
            console.warn( "DEBUG: contact_id kosong, tidak ambil chat history" );
            return;
        }

        const userId = localStorage.getItem( "userId" );
        if ( !userId )
        {
            console.error( "DEBUG: userId tidak ditemukan di localStorage" );
            setError( "User ID tidak ditemukan" );
            return;
        }

        setLoading( true );
        setError( null );

        try
        {
            console.log( "DEBUG: Ambil chat history untuk contact_id:", targetContactId );
            const history: ChatHistoryItem[] = await getChatHistory( targetContactId );

            const formattedMessages: ChatMessage[] = history.map( ( msg ) =>
            {
                let fileUrl: string | undefined;
                let fileName: string | undefined;
                let fileType: string | undefined;
                let audioUrl: string | undefined;
                let caption: string | undefined;

                if ( msg.attachments && msg.attachments.length > 0 )
                {
                    const attachment = msg.attachments[0];
                    const attachmentType = determineAttachmentType( attachment );

                    fileUrl = attachment.media_url;
                    fileName = attachment.media_name;
                    fileType = attachment.media_type;
                    caption = attachment.caption || msg.message_text || undefined;

                    switch ( attachmentType )
                    {
                        case "voice_note":
                            audioUrl = fileUrl;
                            fileUrl = undefined;
                            fileName = undefined;
                            fileType = undefined;
                            break;
                        default:
                            if ( !caption && msg.message_text ) caption = msg.message_text;
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

                if ( message.isDeleted )
                {
                    message = softDeleteMessage( message );
                }

                // --- Debug audio message ID dari server ---
                if ( audioUrl )
                {
                    console.log(
                        "DEBUG: Audio message from server (after reload):",
                        message.id,
                        audioUrl
                    );
                }

                return message;
            } );

            dispatch(
                setMessagesForContact( {
                    email: contactEmail,
                    messages: formattedMessages,
                } )
            );
        } catch ( err: any )
        {
            const message =
                err instanceof Error
                    ? err.message
                    : err.response?.data?.message || err.response?.data || "Unknown error";
            console.error( "DEBUG: Gagal load chat history:", message );
            setError( message );
        } finally
        {
            setLoading( false );
        }
    }, [targetContactId, contactEmail, dispatch, formatTime, determineAttachmentType] );

    useEffect( () =>
    {
        fetchChatHistory();
    }, [fetchChatHistory] );

    return { loading, error, refetch: fetchChatHistory };
}
