import { Dispatch, SetStateAction } from "react";

export interface ChatMessage
{
    text?: string;
    audioUrl?: string;
    fileUrl?: string | null;
    fileName?: string;
    caption?: string | null;
    duration?: number;
    time: string;
}

export function useChatMessageActions(
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>
)
{
    // Soft delete file (hapus untuk saya)
    const handleSoftDeleteFileMessage = ( index: number ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated.splice( index, 1 ); // Hilang dari chat user
            return updated;
        } );
    };

    // Soft delete text
    const handleSoftDeleteTextMessage = ( index: number ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                text: "Pesan telah dihapus",
            };
            return updated;
        } );
    };

    // Delete permanen file (ubah jadi placeholder)
    const handleDeleteFileMessage = ( index: number ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                fileUrl: null,
                caption: "Pesan ini sudah dihapus",
            };
            return updated;
        } );
    };

    return {
        handleSoftDeleteFileMessage,
        handleSoftDeleteTextMessage,
        handleDeleteFileMessage,
    };
}
