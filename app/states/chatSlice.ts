import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage
{
    id?: string;
    text?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    caption?: string;
    audioUrl?: string;
    time: string;
    side: "kiri" | "kanan";
    isSoftDeleted?: boolean;
    isDeleted?: boolean;
    updatedAt?: string;
    isSending?: boolean;
    isAudio?: boolean;
    attachments?: any[];
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
            // Array baru → trigger re-render
            state[action.payload.email] = [...action.payload.messages];
        },

        addMessageToContact: (
            state,
            action: PayloadAction<{ email: string; message: ChatMessage }>
        ) =>
        {
            const email = action.payload.email;
            const newMessage = action.payload.message;
            // Buat array baru → re-render
            state[email] = [...( state[email] || [] ), newMessage];
        },

        deleteMessageForContact: (
            state,
            action: PayloadAction<{ email: string; index: number }>
        ) =>
        {
            const email = action.payload.email;
            if ( !state[email] ) return;
            // Buat array baru
            state[email] = state[email].filter( ( _, idx ) => idx !== action.payload.index );
        },

        clearMessagesForContact: (
            state,
            action: PayloadAction<{ email: string }>
        ) =>
        {
            state[action.payload.email] = [];
        },

        updateMessageForContact: (
            state,
            action: PayloadAction<{
                email: string;
                messageId: string;
                newText?: string;
                newCaption?: string;
                newFileUrl?: string;
                newFileName?: string;
                newFileType?: string;
                newAudioUrl?: string;
                attachments?: any[];
                isDeleted?: boolean;
                isSoftDeleted?: boolean;
                isSending?: boolean;
                updatedAt?: string;
            }>
        ) =>
        {
            const { email, messageId, ...updates } = action.payload;
            const messages = state[email];
            if ( !messages ) return;

            // Map baru → trigger re-render
            state[email] = messages.map( msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        text: updates.newText ?? msg.text,
                        caption: updates.newCaption ?? msg.caption,
                        fileUrl: updates.newFileUrl ?? msg.fileUrl,
                        fileName: updates.newFileName ?? msg.fileName,
                        fileType: updates.newFileType ?? msg.fileType,
                        audioUrl: updates.newAudioUrl ?? msg.audioUrl,
                        attachments: updates.attachments ?? msg.attachments,
                        isDeleted: updates.isDeleted ?? msg.isDeleted,
                        isSoftDeleted: updates.isSoftDeleted ?? msg.isSoftDeleted,
                        isSending: updates.isSending ?? msg.isSending,
                        updatedAt: updates.updatedAt ?? msg.updatedAt,
                    }
                    : msg
            );
        },

        removeMessageById: (
            state,
            action: PayloadAction<{ email: string; messageId: string }>
        ) =>
        {
            const { email, messageId } = action.payload;
            if ( !state[email] ) return;
            state[email] = state[email].filter( msg => msg.id !== messageId );
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
