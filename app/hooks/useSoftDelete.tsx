import { ChatMessage } from "../states/chatSlice";
import { softDeleteMessage as apiSoftDeleteMessage } from "../utils/softDeleteMessageApi";
import { Ban } from "lucide-react";
import React from "react";

/* ---------------- Default Text ---------------- */
export const SOFT_DELETED_MESSAGES = [
    "Pesan telah dihapus",
    "Pesan telah dihapus"
] as const;

export const DEFAULT_SOFT_DELETED_TEXT = SOFT_DELETED_MESSAGES[0];
export const DEFAULT_FILE_DELETED_TEXT = SOFT_DELETED_MESSAGES[1];

/* ---------------- Utility ---------------- */
export function isSoftDeletedMessage( text?: string | null ): boolean
{
    if ( !text ) return false;
    return SOFT_DELETED_MESSAGES.includes( text as typeof SOFT_DELETED_MESSAGES[number] ) || text.startsWith( "[deleted]" );
}

export function softDeleteMessage( message: ChatMessage ): ChatMessage
{
    if ( message.text )
    {
        // Text message → hapus semua media
        return {
            ...message,
            text: DEFAULT_SOFT_DELETED_TEXT,
            audioUrl: null,
            fileUrl: null,
            caption: "",
            isSoftDeleted: true,
        };
    } else if ( message.caption )
    {
        // File message dengan caption
        return {
            ...message,
            caption: DEFAULT_FILE_DELETED_TEXT,
            audioUrl: null,
            fileUrl: null,
            isSoftDeleted: true,
        };
    } else if ( message.fileUrl && !message.caption )
    {
        // File message tanpa caption
        return {
            ...message,
            caption: DEFAULT_FILE_DELETED_TEXT,
            audioUrl: null,
            fileUrl: null,
            isSoftDeleted: true,
        };
    } else if ( message.audioUrl )
    {
        // Audio message → hapus audioUrl
        return {
            ...message,
            text: DEFAULT_SOFT_DELETED_TEXT,
            audioUrl: null,
            fileUrl: null,
            caption: "",
            isSoftDeleted: true,
        };
    }
    return message;
}

export async function softDeleteMessageWithApi( message: ChatMessage ): Promise<ChatMessage>
{
    if ( !message.id ) return message;

    try
    {
        await apiSoftDeleteMessage( message.id );
        return softDeleteMessage( message );
    } catch ( err )
    {
        console.error( "DEBUG: gagal soft delete API:", err );
        return message;
    }
}

export function undoSoftDeleteMessage( message: ChatMessage ): ChatMessage
{
    if ( message.text === DEFAULT_SOFT_DELETED_TEXT && !message.audioUrl )
    {
        return { ...message, text: "", isSoftDeleted: false };
    } else if ( message.caption === DEFAULT_FILE_DELETED_TEXT )
    {
        return { ...message, caption: "", isSoftDeleted: false };
    } else if ( message.audioUrl === null && message.text === DEFAULT_SOFT_DELETED_TEXT )
    {
        return { ...message, text: "", audioUrl: null, isSoftDeleted: false };
    }
    return message;
}

/* ---------------- Komponen ---------------- */
interface SoftDeletedMessageProps
{
    text: string;
    time: string;
}

export const SoftDeletedMessage: React.FC<SoftDeletedMessageProps> = ( { text, time } ) =>
{
    return (
        <div className="flex items-center gap-2 text-gray-500 text-sm pl-2 min-w-1 flex-wrap">
            <Ban size={ 16 } className="text-gray-500 flex-shrink-0" />
            <span className="italic break-words">{ text }</span>
            <span className="ml-5 text-gray-700 text-xs whitespace-nowrap">{ time }</span>
        </div>
    );
};
