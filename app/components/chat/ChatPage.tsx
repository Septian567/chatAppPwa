import ChatHeader from "./ChatHeader";
import MessageInput from "../messageInput/MessageInput";
import ChatBody from "./ChatBody";
import
    {
        useMessageState,
        useMessageSending,
        useMessageEditing,
        useMessageDeletion,
    } from "../../hooks/chats";

interface ChatPageProps
{
    isMobile: boolean;
    onBack: () => void;
    sidebarWidth?: number | string;
}

export default function ChatPage( { isMobile, onBack }: ChatPageProps )
{
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

    const { handleSendMessage, handleSendAudio, handleSendFile } =
        useMessageSending( setMessages );

    const {
        handleDeleteTextMessage,
        handleSoftDeleteTextMessage,
        handleSoftDeleteFileMessage,
        handleDeleteFileMessage,
        handleSoftDeleteAudioMessage,
        handleDeleteAudioMessage,
    } = useMessageDeletion(
        messages,
        setMessages,
        editingIndex,
        ( i ) => handleEditIndexChange( i ),
        ( t ) => handleEditTypeChange( t )
    );

    function handleEditIndexChange( i: number | null )
    {
        // agar deletion bisa ubah editingIndex
        ( editingIndex as any ) = i;
    }
    function handleEditTypeChange( t: "text" | "file" | null )
    {
        // agar deletion bisa ubah editType
        ( editType as any ) = t;
    }

    return (
        <main className="flex-1 flex flex-col bg-transparent text-black overflow-hidden">
            <ChatHeader isMobile={ isMobile } onBack={ onBack } />
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
