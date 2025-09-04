"use client";

import { useSelector } from "react-redux";
import { RootState } from "../../states";
import ChatHeader from "./ChatHeader";
import MessageInput from "../messageInput/MessageInput";
import ChatBody from "./ChatBody";
import
    {
        useMessageState,
        useMessageEditing,
        useMessageDeletion,
    } from "../../hooks/chats";
import { ChatMessage } from "../../hooks/useChatMessageActions";
import { useChatSide } from "../../hooks/useChatSide";

interface ChatPageProps
{
    isMobile: boolean;
    onBack: () => void;
    sidebarWidth?: number | string;
}

export default function ChatPage( { isMobile, onBack }: ChatPageProps )
{
    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );

    const contactName = activeContact?.alias || activeContact?.name || "Bento";

    const { messages, setMessages } = useMessageState();
    const {
        editingIndex,
        editType,
        editingMessage,
        handleEditTextMessage,
        handleEditFileMessage,
        handleSubmitEdit,
        handleCancelEdit,
    } = useMessageEditing( messages, setMessages );

    const {
        handleDeleteTextMessage,
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteAudioMessage,
    } = useMessageDeletion( messages, setMessages, editingIndex );

    // ✅ gunakan hook reusable
    const { chatSide, selectKiri, selectKanan } = useChatSide( "kanan" );

    const handleSendMessage = ( message: string ) =>
    {
        const newMessage: ChatMessage = {
            text: message,
            time: new Date().toLocaleTimeString( [], {
                hour: "2-digit",
                minute: "2-digit",
            } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleSendAudio = ( audioBlob: Blob ) =>
    {
        const audioUrl = URL.createObjectURL( audioBlob );
        const newMessage: ChatMessage = {
            audioUrl,
            time: new Date().toLocaleTimeString( [], {
                hour: "2-digit",
                minute: "2-digit",
            } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    const handleSendFile = ( file: File, caption?: string ) =>
    {
        const fileUrl = URL.createObjectURL( file );
        const newMessage: ChatMessage = {
            fileUrl,
            fileName: file.name,
            caption: caption?.trim() || undefined,
            time: new Date().toLocaleTimeString( [], {
                hour: "2-digit",
                minute: "2-digit",
            } ),
            side: chatSide,
        };
        setMessages( ( prev ) => [...prev, newMessage] );
    };

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader
                isMobile={ isMobile }
                onBack={ onBack }
                contactName={ contactName }
                onChatKiri={ selectKiri }
                onChatKanan={ selectKanan }
            />
            <ChatBody
                messages={ messages }
                setMessages={ setMessages }
                onEditTextMessage={ handleEditTextMessage }
                onDeleteTextMessage={ handleDeleteTextMessage }
                onSoftDeleteTextMessage={ handleSoftDeleteTextMessage }
                onEditFileMessage={ handleEditFileMessage }
                onDeleteFileMessage={ handleDeleteFileMessage }
                onSoftDeleteFileMessage={ handleSoftDeleteFileMessage }
                onDeleteAudioMessage={ handleDeleteAudioMessage }
                onSoftDeleteAudioMessage={ handleSoftDeleteAudioMessage }
            />
            <MessageInput
                onSend={ handleSendMessage }
                onSendAudio={ handleSendAudio }
                onSendFile={ handleSendFile }
                isEditing={ editingIndex !== null }
                initialEditValue={
                    editType === "text"
                        ? editingMessage?.text || ""
                        : editType === "file"
                            ? editingMessage?.caption || ""
                            : ""
                }
                onSubmitEdit={ handleSubmitEdit }
                onCancelEdit={ handleCancelEdit }
            />
        </main>
    );
}
