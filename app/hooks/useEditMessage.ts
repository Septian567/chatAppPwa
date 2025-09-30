import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateMessageForContact } from "../states/chatSlice";
import { editMessage } from "../utils/editMessageApi";
import { ChatMessage } from "../states/chatSlice";

interface UseEditMessageProps
{
    contactId: string;
}

export function useEditMessage( { contactId }: UseEditMessageProps )
{
    const dispatch = useDispatch();

    const [editingIndex, setEditingIndex] = useState<number | null>( null );
    const [editType, setEditType] = useState<"text" | "file" | null>( null );
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>( null );

    const handleEditTextMessage = ( message: ChatMessage, index: number ) =>
    {
        setEditingMessage( message );
        setEditingIndex( index );
        setEditType( "text" );
    };

    const handleEditFileMessage = ( message: ChatMessage, index: number ) =>
    {
        setEditingMessage( message );
        setEditingIndex( index );
        setEditType( "file" );
    };

    const handleCancelEdit = () =>
    {
        setEditingMessage( null );
        setEditingIndex( null );
        setEditType( null );
    };

    const handleSubmitEdit = async ( editedText: string ) =>
    {
        if ( !editingMessage?.id ) return;

        try
        {
            // Panggil API edit
            const updatedRaw = await editMessage( editingMessage.id, editedText );

            // Mapping response agar sesuai ChatMessage
            const updated = {
                message_id: updatedRaw.message_id,
                message_text: updatedRaw.message_text || "",
                updated_at: updatedRaw.updated_at || new Date().toISOString(),
            };

            // Dispatch ke Redux sesuai editType
            dispatch(
                updateMessageForContact( {
                    contactId,
                    messageId: updated.message_id,
                    newText: editType === "text" ? updated.message_text : undefined,
                    newCaption: editType === "file" ? updated.message_text : undefined,
                    updatedAt: updated.updated_at,
                } )
            );
        } catch ( err )
        {
            console.error( "Gagal edit pesan:", err );
        }

        // Reset state edit
        handleCancelEdit();
    };

    return {
        editingIndex,
        editType,
        editingMessage,
        setEditingIndex,
        setEditType,
        handleEditTextMessage,
        handleEditFileMessage,
        handleCancelEdit,
        handleSubmitEdit,
    };
}
