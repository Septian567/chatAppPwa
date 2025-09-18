// hooks/useChatHistory.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../states";
import { getChatHistory, ChatHistoryItem } from "../utils/getChatHistoryApi";
import { setMessagesForContact, ChatMessage } from "../states/chatSlice";

export function useChatHistory( contactId?: string )
{
    const dispatch = useDispatch();
    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );

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
        const fileName = attachment.media_name?.toLowerCase() || '';
        const mediaType = attachment.media_type;

        const isRecording = fileName.endsWith( ".webm" ) && mediaType === "file";

        if ( isRecording )
        {
            return "voice_note";
        }

        if ( mediaType === "audio" )
        {
            return "audio_file";
        }

        if ( mediaType === "image" )
        {
            return "image";
        }

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
            console.log(
                "DEBUG: Ambil chat history untuk contact_id:",
                targetContactId
            );

            const history: ChatHistoryItem[] = await getChatHistory( targetContactId );

            const formattedMessages: ChatMessage[] = history.map( ( msg ) =>
            {
                let fileUrl: string | undefined;
                let fileName: string | undefined;
                let fileType: string | undefined;
                let audioUrl: string | undefined;
                let caption: string | undefined;

                // PERBAIKAN: Handle caption dengan benar
                // Prioritaskan caption dari attachment, lalu dari message_text
                if ( msg.attachments && msg.attachments.length > 0 )
                {
                    const attachment = msg.attachments[0];
                    const attachmentType = determineAttachmentType( attachment );

                    fileUrl = attachment.media_url;
                    fileName = attachment.media_name;
                    fileType = attachment.media_type;

                    // ⬇️ PERBAIKAN PENTING: Ambil caption dari attachment
                    caption = attachment.caption || undefined;

                    // Jika tidak ada caption di attachment, gunakan message_text sebagai caption
                    if ( !caption && msg.message_text )
                    {
                        caption = msg.message_text;
                    }

                    switch ( attachmentType )
                    {
                        case "voice_note":
                            audioUrl = fileUrl;
                            fileUrl = undefined;
                            fileName = undefined;
                            fileType = undefined;
                            break;
                        case "audio_file":
                            // Untuk audio file, gunakan message_text sebagai caption jika ada
                            if ( !caption && msg.message_text )
                            {
                                caption = msg.message_text;
                            }
                            break;
                        case "image":
                            // Untuk image, gunakan message_text sebagai caption jika ada
                            if ( !caption && msg.message_text )
                            {
                                caption = msg.message_text;
                            }
                            break;
                        case "file":
                        default:
                            // Untuk file umum, gunakan message_text sebagai caption jika ada
                            if ( !caption && msg.message_text )
                            {
                                caption = msg.message_text;
                            }
                            break;
                    }
                } else
                {
                    // Jika tidak ada attachment, gunakan message_text sebagai text biasa
                    caption = undefined;
                }

                return {
                    id: msg.message_id,
                    text: msg.attachments?.length > 0 ? "" : msg.message_text || "", // ⬅️ untuk file, text dikosongkan
                    fileUrl,
                    fileName,
                    fileType,
                    caption, // ⬅️ caption sekarang berisi nilai yang benar
                    audioUrl,
                    time: formatTime( msg.created_at ),
                    side: msg.from_user_id === userId ? "kanan" : "kiri",
                    isSoftDeleted: msg.is_deleted || false,
                    attachments: msg.attachments || [],
                };
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