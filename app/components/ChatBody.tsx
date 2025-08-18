import { useEffect, useRef } from "react";
import ChatTextMessage from "./ChatTextMessage";
import ChatAudioMessage from "./ChatAudioMessage";
import ChatFileMessage from "./ChatFileMessage";
import ChatStaticMessages from "./ChatStaticMessages";
import { useChatMessageActions, ChatMessage } from "../hooks/useChatMessageActions";

interface ChatBodyProps
{
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

    onEditTextMessage?: ( index: number ) => void;
    onDeleteTextMessage?: ( index: number ) => void;
    onSoftDeleteTextMessage?: ( index: number ) => void;

    onEditFileMessage?: ( index: number ) => void;
    onDeleteFileMessage?: ( index: number ) => void;
    onSoftDeleteFileMessage?: ( index: number ) => void;

    onDeleteAudioMessage?: ( index: number ) => void;
    onSoftDeleteAudioMessage?: ( index: number ) => void;
}

export default function ChatBody( {
    messages,
    setMessages,
    onEditTextMessage,
    onDeleteTextMessage,
    onSoftDeleteTextMessage,
    onEditFileMessage,
    onDeleteFileMessage,
    onSoftDeleteFileMessage,
    onDeleteAudioMessage,
    onSoftDeleteAudioMessage
}: ChatBodyProps )
{
    const {
        handleSoftDeleteFileMessage,
        handleSoftDeleteTextMessage,
    } = useChatMessageActions( setMessages );

    const bottomRef = useRef<HTMLDivElement | null>( null );

    useEffect( () =>
    {
        bottomRef.current?.scrollIntoView( { behavior: "smooth" } );
    }, [messages] );

    return (
        <div className="flex-1 py-6 overflow-auto w-full responsive-padding">
            <ChatStaticMessages />

            { messages.map( ( msg, index ) =>
            {
                // TEXT MESSAGE
                if ( msg.text )
                {
                    const isSoftDeleted = msg.text === "Pesan telah dihapus";
                    return (
                        <ChatTextMessage
                            key={ index }
                            text={ msg.text }
                            time={ msg.time }
                            onEditClick={
                                !isSoftDeleted
                                    ? () => onEditTextMessage?.( index )
                                    : undefined
                            }
                            onSoftDeleteClick={
                                !isSoftDeleted
                                    ? () =>
                                        onSoftDeleteTextMessage
                                            ? onSoftDeleteTextMessage( index )
                                            : handleSoftDeleteTextMessage( index )
                                    : undefined
                            }
                            onDeleteClick={ () => onDeleteTextMessage?.( index ) }
                        />
                    );
                }

                // AUDIO MESSAGE
                if ( msg.audioUrl || msg.text === "Pesan telah dihapus" )
                {
                    return (
                        <ChatAudioMessage
                            key={ index }
                            audioUrl={ msg.audioUrl }
                            time={ msg.time }
                            duration={ msg.duration }
                            isSoftDeleted={ msg.isSoftDeleted }
                            textStatus={ msg.text }
                            onSoftDeleteClick={ !msg.isSoftDeleted ? () => onSoftDeleteAudioMessage?.( index ) : undefined }
                            onDeleteClick={ () => onDeleteAudioMessage?.( index ) }
                        />
                    );
                }
                // FILE MESSAGE
                if ( msg.fileUrl || msg.caption )
                {
                    const isDeleted =
                        msg.caption === "Pesan telah dihapus" ||
                        msg.caption === "Pesan ini sudah dihapus" ||
                        !msg.fileUrl;

                    return (
                        <ChatFileMessage
                            key={ index }
                            fileUrl={ msg.fileUrl || "" }
                            fileName={ msg.fileName }
                            caption={ msg.caption || "" }
                            time={ msg.time }
                            onEditClick={
                                !isDeleted
                                    ? () => onEditFileMessage?.( index )
                                    : undefined
                            }
                            onSoftDeleteClick={ () =>
                                onSoftDeleteFileMessage
                                    ? onSoftDeleteFileMessage( index )
                                    : handleSoftDeleteFileMessage( index )
                            }
                            onDeleteClick={
                                !isDeleted
                                    ? () => onDeleteFileMessage?.( index )
                                    : undefined
                            }
                        />
                    );
                }

                return null;
            } ) }
            {/* target untuk scroll otomatis */ }
            <div ref={bottomRef} />
        </div>
    );
}
