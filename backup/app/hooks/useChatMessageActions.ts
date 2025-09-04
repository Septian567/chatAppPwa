import { Dispatch, SetStateAction } from "react";
import
    {
        DEFAULT_SOFT_DELETED_TEXT,
        DEFAULT_FILE_DELETED_TEXT,
    } from "../components/chat/deletedMessage";
import { ChatSide, useChatSide } from "./useChatSide";

export interface ChatMessage
{
    text?: string;
    audioUrl?: string;
    fileUrl?: string | null;
    fileName?: string;
    caption?: string | null;
    duration?: number;
    time: string;
    isSoftDeleted?: boolean;
    side: ChatSide;
}

export function useChatMessageActions(
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>
)
{
    const { chatSide, getAlign } = useChatSide( "kanan" );

    /** helper untuk membuat pesan baru sesuai side aktif */
    const addMessage = ( message: Omit<ChatMessage, "time" | "side"> ) =>
    {
        const newMessage: ChatMessage = {
            ...message,
            time: new Date().toLocaleTimeString( [], {
                hour: "2-digit",
                minute: "2-digit",
            } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    /** soft delete helper */
    const softDelete = (
        index: number,
        updates: Partial<ChatMessage> & { isSoftDeleted?: boolean } = {}
    ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                isSoftDeleted: true,
                ...updates,
            };
            return updated;
        } );
    };

    /** 🔹 Soft delete */
    const handleSoftDeleteText = ( index: number ) =>
        softDelete( index, { text: DEFAULT_SOFT_DELETED_TEXT } );

    const handleSoftDeleteFile = ( index: number ) =>
        softDelete( index, {
            fileUrl: null,
            caption: DEFAULT_FILE_DELETED_TEXT, // ✅ pakai placeholder khusus file
        } );

    const handleSoftDeleteAudio = ( index: number ) =>
        softDelete( index, {
            audioUrl: null,
            text: DEFAULT_SOFT_DELETED_TEXT,
        } );

    /** 🔹 Hard delete */
    const handleDeleteMessage = ( index: number ) =>
        setMessages( ( prev ) => prev.filter( ( _, i ) => i !== index ) );

    const handleDeleteFile = ( index: number ) =>
        setMessages( ( prev ) => prev.filter( ( _, i ) => i !== index ) );

    const handleDeleteAudio = ( index: number ) =>
        setMessages( ( prev ) => prev.filter( ( _, i ) => i !== index ) );

    return {
        chatSide,
        getAlign, // ✅ bisa dipakai di ChatBody untuk alignment bubble
        addMessage, // ✅ helper bikin pesan baru sesuai side

        // Soft delete
        handleSoftDeleteText,
        handleSoftDeleteFile,
        handleSoftDeleteAudio,

        // Hard delete
        handleDeleteMessage,
        handleDeleteFile,
        handleDeleteAudio,
    };
}
