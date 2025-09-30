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
    side: "kiri" | "kanan"; // posisi balon chat
    isSoftDeleted?: boolean;
    isDeleted?: boolean;
    updatedAt?: string;
    isSending?: boolean;
    isAudio?: boolean;
    attachments?: any[];
}

interface ChatState
{
    [contactId: string]: ChatMessage[];
}

const initialState: ChatState = {};

const chatSlice = createSlice( {
    name: "chat",
    initialState,
    reducers: {
        setMessagesForContact: (
            state,
            action: PayloadAction<{ contactId: string; messages: ChatMessage[] }>
        ) =>
        {
            state[action.payload.contactId] = [...action.payload.messages];
        },

        addMessageToContact: (
            state,
            action: PayloadAction<{ contactId: string; message: ChatMessage }>
        ) =>
        {
            const { contactId, message } = action.payload;

            const exists = ( state[contactId] || [] ).some(
                ( msg ) => msg.id && message.id && msg.id === message.id
            );
            if ( exists ) return;

            state[contactId] = [...( state[contactId] || [] ), message];
        },

        deleteMessageForContact: (
            state,
            action: PayloadAction<{ contactId: string; index: number }>
        ) =>
        {
            const { contactId, index } = action.payload;
            if ( !state[contactId] ) return;
            state[contactId] = state[contactId].filter( ( _, idx ) => idx !== index );
        },

        clearMessagesForContact: (
            state,
            action: PayloadAction<{ contactId: string }>
        ) =>
        {
            state[action.payload.contactId] = [];
        },

        
        updateMessageForContact: (
            state,
            action: PayloadAction<{
                contactId: string;
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
            const { contactId, messageId, ...updates } = action.payload;
            const messages = state[contactId];
            if ( !messages ) return;

            state[contactId] = messages.map( ( msg ) =>
                msg.id === messageId
                    ? {
                        ...msg,
                        text: updates.newText !== undefined ? updates.newText : msg.text,
                        caption: updates.newCaption !== undefined ? updates.newCaption : msg.caption,
                        fileUrl: updates.newFileUrl !== undefined ? updates.newFileUrl : msg.fileUrl,
                        fileName: updates.newFileName !== undefined ? updates.newFileName : msg.fileName,
                        fileType: updates.newFileType !== undefined ? updates.newFileType : msg.fileType,
                        audioUrl: updates.newAudioUrl !== undefined ? updates.newAudioUrl : msg.audioUrl,
                        attachments: updates.attachments !== undefined ? updates.attachments : msg.attachments,
                        isDeleted: updates.isDeleted !== undefined ? updates.isDeleted : msg.isDeleted,
                        isSoftDeleted: updates.isSoftDeleted !== undefined ? updates.isSoftDeleted : msg.isSoftDeleted,
                        isSending: updates.isSending !== undefined ? updates.isSending : msg.isSending,
                        updatedAt: updates.updatedAt !== undefined ? updates.updatedAt : msg.updatedAt,
                    }
                    : msg
            );
        },


        removeMessageById: (
            state,
            action: PayloadAction<{ contactId: string; messageId: string }>
        ) =>
        {
            const { contactId, messageId } = action.payload;
            if ( !state[contactId] ) return;
            state[contactId] = state[contactId].filter( ( msg ) => msg.id !== messageId );
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
