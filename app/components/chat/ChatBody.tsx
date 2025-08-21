import { useEffect, useRef } from "react";
import ChatTextMessage from "./ChatTextMessage";
import ChatAudioMessage from "./ChatAudioMessage";
import ChatFileMessage from "./ChatFileMessage";
import ChatStaticMessages from "./ChatStaticMessages";
import { useChatMessageActions, ChatMessage } from "../../hooks/useChatMessageActions";
import { isSoftDeletedMessage } from "./deletedMessage";

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
    const prevMessageCount = useRef( messages.length );

    useEffect( () =>
    {
        // Hanya scroll otomatis kalau jumlah pesan bertambah (pesan baru terkirim)
        if ( messages.length > prevMessageCount.current )
        {
            bottomRef.current?.scrollIntoView( { behavior: "smooth" } );

            // Jika pesan baru ada gambar/video, tunggu sampai load selesai lalu scroll lagi
            const mediaElements = document.querySelectorAll( "img, video" );
            mediaElements.forEach( ( el ) =>
            {
                el.addEventListener( "load", () =>
                {
                    bottomRef.current?.scrollIntoView( { behavior: "smooth" } );
                } );
            } );
        }
        prevMessageCount.current = messages.length;
    }, [messages] );

    return (
        <div className="flex-1 py-6 overflow-auto w-full responsive-padding">
            <ChatStaticMessages />

            { messages.map( ( msg, index ) =>
            {
                // TEXT MESSAGE
                if ( msg.text )
                {
                    const isDeleted = isSoftDeletedMessage( msg.text );
                    return (
                        <ChatTextMessage
                            key={ index }
                            text={ msg.text }
                            time={ msg.time }
                            onEditClick={
                                !isDeleted ? () => onEditTextMessage?.( index ) : undefined
                            }
                            onSoftDeleteClick={
                                !isDeleted
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
                if ( msg.audioUrl || isSoftDeletedMessage( msg.text ) )
                {
                    return (
                        <ChatAudioMessage
                            key={ index }
                            audioUrl={ msg.audioUrl }
                            time={ msg.time }
                            duration={ msg.duration }
                            isSoftDeleted={ msg.isSoftDeleted }
                            textStatus={ msg.text }
                            onSoftDeleteClick={
                                !msg.isSoftDeleted
                                    ? () => onSoftDeleteAudioMessage?.( index )
                                    : undefined
                            }
                            onDeleteClick={ () => onDeleteAudioMessage?.( index ) }
                        />
                    );
                }

                // FILE MESSAGE
                if ( msg.fileUrl || msg.caption )
                {
                    const isSoftDeleted = isSoftDeletedMessage( msg.caption );

                    return (
                        <ChatFileMessage
                            key={ index }
                            fileUrl={ msg.fileUrl || "" }
                            fileName={ msg.fileName }
                            caption={ msg.caption || "" }
                            time={ msg.time }
                            onEditClick={
                                !isSoftDeleted ? () => onEditFileMessage?.( index ) : undefined
                            }
                            onSoftDeleteClick={
                                !isSoftDeleted
                                    ? () => onSoftDeleteFileMessage?.( index )
                                    : undefined
                            }
                            // Hard delete tetap bisa dipanggil meski file sudah soft deleted
                            onDeleteClick={ () => onDeleteFileMessage?.( index ) }
                        />
                    );
                }

                return null;
            } ) }
            {/* target untuk scroll otomatis */ }
            <div ref={ bottomRef } />
        </div>
    );
}
