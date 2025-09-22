import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../states";
import { ChatMessage, setMessagesForContact } from "../states/chatSlice";
import { softDeleteMessage, softDeleteMessageWithApi } from "./useSoftDelete";

export function useMessageActions(
    contactEmail: string,
    editingIndex: number | null,
    setEditingIndex: ( index: number | null ) => void,
    setEditType: ( type: "text" | "file" | null ) => void
)
{
    const dispatch = useDispatch();
    const messages = useSelector( ( state: RootState ) => state.chat[contactEmail] || [] );

    const update = ( newMessages: ChatMessage[] ) =>
        dispatch( setMessagesForContact( { email: contactEmail, messages: newMessages } ) );

    const resetEditingIfNeeded = ( index: number ) =>
    {
        if ( editingIndex === index )
        {
            setEditingIndex( null );
            setEditType( null );
        } else if ( editingIndex !== null && index < editingIndex )
        {
            setEditingIndex( editingIndex - 1 );
        }
    };

    // === Soft delete handlers ===
    const handleSoftDeleteMessage = async ( index: number ) =>
    {
        const msg = messages[index];
        if ( !msg ) return;

        // 1️⃣ Update lokal dulu supaya tampilan langsung berubah
        const updatedMsg = softDeleteMessage( msg );
        const updatedMessages = [...messages];
        updatedMessages[index] = updatedMsg;
        update( updatedMessages );
        resetEditingIfNeeded( index );

        // 2️⃣ Kirim ke API untuk sinkronisasi server
        try
        {
            await softDeleteMessageWithApi( msg );
        } catch ( err )
        {
            console.error( "DEBUG: gagal soft delete via API:", err );
        }
    };

    const handleSoftDeleteTextMessage = handleSoftDeleteMessage;
    const handleSoftDeleteFileMessage = handleSoftDeleteMessage;
    const handleSoftDeleteAudioMessage = handleSoftDeleteMessage;

    // === Hard delete (tetap lokal) ===
    const handleDeleteMessage = ( index: number ) =>
    {
        const updated = messages.filter( ( _, i ) => i !== index );
        update( updated );
        resetEditingIfNeeded( index );
    };

    const handleDeleteFileMessage = handleDeleteMessage;
    const handleDeleteAudioMessage = handleDeleteMessage;

    return {
        messages,
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteMessage,
        handleDeleteFileMessage,
        handleDeleteAudioMessage,
    };
}
