import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage
{
    text?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;        
    caption?: string;
    audioUrl?: string;
    time: string;
    side: "kiri" | "kanan";
    isSoftDeleted?: boolean;
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

    },
} );

export const { setMessagesForContact, addMessageToContact, deleteMessageForContact, clearMessagesForContact } =
    chatSlice.actions;

export default chatSlice.reducer;
