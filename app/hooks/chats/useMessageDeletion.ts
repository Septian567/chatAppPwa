import { ChatMessage } from "./useMessageState";

export function useMessageDeletion(
    messages: ChatMessage[],
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    editingIndex: number | null,
    setEditingIndex: ( index: number | null ) => void,
    setEditType: ( type: "text" | "file" | null ) => void
)
{
    const handleDeleteTextMessage = ( index: number ) =>
    {
        setMessages( ( prev ) => prev.filter( ( _, i ) => i !== index ) );
        if ( editingIndex === index )
        {
            setEditingIndex( null );
            setEditType( null );
        } else if ( editingIndex !== null && index < editingIndex )
        {
            setEditingIndex( editingIndex - 1 );
        }
    };

    const handleSoftDeleteTextMessage = ( index: number ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                text: "Pesan telah dihapus",
                isSoftDeleted: true,
            };
            return updated;
        } );
        if ( editingIndex === index )
        {
            setEditingIndex( null );
            setEditType( null );
        }
    };

    const handleSoftDeleteFileMessage = ( index: number ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                fileUrl: null,
                caption: null,
                isSoftDeleted: true,
            };
            return updated;
        } );
    };

    const handleDeleteFileMessage = ( index: number ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                fileUrl: null,
                caption: "Pesan ini sudah dihapus",
                isSoftDeleted: true,
            };
            return updated;
        } );
    };

    const handleSoftDeleteAudioMessage = ( index: number ) =>
    {
        setMessages( ( prev ) =>
        {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                audioUrl: "",
                isSoftDeleted: true,
                text: "Pesan telah dihapus",
            };
            return updated;
        } );
    };

    const handleDeleteAudioMessage = ( index: number ) =>
    {
        setMessages( ( prev ) => prev.filter( ( _, i ) => i !== index ) );
    };

    return {
        handleDeleteTextMessage,
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteAudioMessage,
    };
}
