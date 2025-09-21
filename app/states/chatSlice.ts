import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage
{
    id?: string; // ⬅️ identifikasi pesan dari API message_id
    text?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    caption?: string; // ⬅️ untuk file caption
    audioUrl?: string;
    time: string;
    side: "kiri" | "kanan";
    isSoftDeleted?: boolean;
    updatedAt?: string; // ⬅️ optional: kapan terakhir diupdate
}

interface ChatState
{
    [email: string]: ChatMessage[];
}

const initialState: ChatState = {};

const chatSlice = createSlice( {
    name: "chat",
    initialState,
    reducers: {
        setMessagesForContact: (
            state,
            action: PayloadAction<{ email: string; messages: ChatMessage[] }>
        ) =>
        {
            state[action.payload.email] = action.payload.messages;
        },
        addMessageToContact: (
            state,
            action: PayloadAction<{ email: string; message: ChatMessage }>
        ) =>
        {
            if ( !state[action.payload.email] ) state[action.payload.email] = [];
            state[action.payload.email].push( action.payload.message );
        },
        deleteMessageForContact: (
            state,
            action: PayloadAction<{ email: string; index: number }>
        ) =>
        {
            state[action.payload.email]?.splice( action.payload.index, 1 );
        },
        clearMessagesForContact: (
            state,
            action: PayloadAction<{ email: string }>
        ) =>
        {
            state[action.payload.email] = [];
        },
        // ⬅️ reducer edit pesan, mendukung text dan caption
        updateMessageForContact: (
            state,
            action: PayloadAction<{
                email: string;
                messageId: string;
                newText?: string;
                newCaption?: string;
                updatedAt?: string;
            }>
        ) =>
        {
            const { email, messageId, newText, newCaption, updatedAt } = action.payload;
            const messages = state[email];
            if ( messages )
            {
                const msg = messages.find( ( m ) => m.id === messageId );
                if ( msg )
                {
                    if ( newText !== undefined ) msg.text = newText;
                    if ( newCaption !== undefined ) msg.caption = newCaption;
                    if ( updatedAt ) msg.updatedAt = updatedAt;
                }
            }
        },


        removeMessageById: (
            state,
            action: PayloadAction<{ email: string; messageId: string }>
        ) =>
        {
            const { email, messageId } = action.payload;
            if ( state[email] )
            {
                state[email] = state[email].filter( ( msg ) => msg.id !== messageId );
            }
        },
    },
} );

export const {
    setMessagesForContact,
    addMessageToContact,
    deleteMessageForContact,
    clearMessagesForContact,
    updateMessageForContact,
    removeMessageById,
} = chatSlice.actions;

export default chatSlice.reducer;
