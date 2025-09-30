import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../states";
import { ChatMessage, setMessagesForContact, } from "../states/chatSlice";
import { softDeleteMessage, softDeleteMessageWithApi } from "./useSoftDelete";
import { deleteMessageForUser } from "../utils/deleteMessageForUserApi";

export function useMessageActions(
    contactId: string,
    editingIndex: number | null,
    setEditingIndex: ( index: number | null ) => void,
    setEditType: ( type: "text" | "file" | null ) => void
)
{
    const dispatch = useDispatch();
    const messages = useSelector(
        ( state: RootState ) => state.chat[contactId] || []
    );

    const update = ( newMessages: ChatMessage[] ) =>
        dispatch( setMessagesForContact( { contactId, messages: newMessages } ) );

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

        const updatedMsg = softDeleteMessage( msg );
        const updatedMessages = [...messages];
        updatedMessages[index] = updatedMsg;
        update( updatedMessages );
        resetEditingIfNeeded( index );

        try
        {
            // Hanya panggil API jika ID server ada
            if ( msg.id && !msg.id.startsWith( "temp-" ) )
            {
                await softDeleteMessageWithApi( msg );
            }
        } catch ( err )
        {
            console.error( "DEBUG: gagal soft delete via API:", err );
        }
    };

    const handleSoftDeleteTextMessage = handleSoftDeleteMessage;
    const handleSoftDeleteFileMessage = handleSoftDeleteMessage;
    const handleSoftDeleteAudioMessage = handleSoftDeleteMessage;

    // === Hard delete lokal ===
    const handleDeleteMessage = ( index: number ) =>
    {
        const updated = messages.filter( ( _, i ) => i !== index );
        update( updated );
        resetEditingIfNeeded( index );
    };

    const handleDeleteFileMessage = handleDeleteMessage;
    const handleDeleteAudioMessage = handleDeleteMessage;

    // === Hard delete via API / server ===
    const handleDeleteMessageForUser = async ( index: number ) =>
    {
        const msg = messages[index];
        if ( !msg )
        {
            console.warn( "DEBUG: pesan tidak ditemukan di index", index );
            return;
        }

        console.log( "DEBUG: ID pesan yang akan dihapus:", msg.id );

        // Jika pesan masih menggunakan temporary ID atau isSending, hapus langsung lokal
        if ( !msg.id || msg.id.startsWith( "temp-" ) || msg.isSending )
        {
            console.warn( "DEBUG: pesan belum ada di server, hapus lokal saja", msg );
            handleDeleteMessage( index );
            return;
        }

        try
        {
            const response = await deleteMessageForUser( msg.id );
            console.log( "DEBUG: deleteMessageForUser berhasil", response );

            handleDeleteMessage( index );
        } catch ( err )
        {
            console.error( "DEBUG: Gagal hapus pesan di server:", err );
        }
    };

    const handleDeleteFileMessageForUser = handleDeleteMessageForUser;
    const handleDeleteAudioMessageForUser = handleDeleteMessageForUser;

    return {
        messages,
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteMessage,
        handleDeleteFileMessage,
        handleDeleteAudioMessage,
        handleDeleteFileMessageForUser,
        handleDeleteAudioMessageForUser,
        handleDeleteMessageForUser,
    };
}
