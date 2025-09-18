import { useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../states";

import ChatTextMessage from "./ChatTextMessage";
import ChatAudioMessage from "./ChatAudioMessage";
import ChatFileMessage from "./ChatFileMessage";
import { ChatMessage } from "../../hooks/useChatMessageActions";
import { isSoftDeletedMessage } from "./deletedMessage";
import { useChatBody } from "../../hooks/chatBody/useChatBody";

interface ChatBodyProps
{
    messages: ChatMessage[];

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
    onEditTextMessage,
    onDeleteTextMessage,
    onSoftDeleteTextMessage,
    onEditFileMessage,
    onDeleteFileMessage,
    onSoftDeleteFileMessage,
    onDeleteAudioMessage,
    onSoftDeleteAudioMessage,
}: ChatBodyProps )
{
    const { bottomRef, chatBodyRef, setIsMenuOpen } = useChatBody( messages );

    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );

    const firstRender = useRef( true );

    // scroll ke bawah saat ganti kontak
    useLayoutEffect( () =>
    {
        if ( bottomRef.current )
        {
            bottomRef.current.scrollIntoView( { behavior: "auto" } );
        }
        firstRender.current = false;
    }, [activeContact] );

    return (
        <div
            ref={ chatBodyRef }
            className="flex-1 py-6 w-full responsive-padding overflow-y-auto"
        >
            { messages.map( ( msg, index ) =>
            {
                const align: "left" | "right" =
                    msg.side === "kiri" ? "left" : "right";

                // 1️⃣ File dengan caption
                if ( msg.fileUrl || msg.caption )
                {
                    const isSoftDeleted = isSoftDeletedMessage( msg.caption );
                    return (
                        <ChatFileMessage
                            key={ msg.id || index }
                            fileUrl={ msg.fileUrl || "" }
                            fileName={ msg.fileName }
                            caption={ msg.caption } // ⬅️ caption dipastikan dikirim
                            time={ msg.time }
                            align={ align }
                            isActive={ true }
                            onEditClick={
                                !isSoftDeleted
                                    ? () => onEditFileMessage?.( index )
                                    : undefined
                            }
                            onSoftDeleteClick={
                                !isSoftDeleted
                                    ? () => onSoftDeleteFileMessage?.( index )
                                    : undefined
                            }
                            onDeleteClick={ () => onDeleteFileMessage?.( index ) }
                            onToggleMenu={ setIsMenuOpen }
                        />
                    );
                }

                // 2️⃣ Audio
                if ( msg.audioUrl || isSoftDeletedMessage( msg.text ) )
                {
                    return (
                        <ChatAudioMessage
                            key={ msg.id || index }
                            audioUrl={ msg.audioUrl }
                            time={ msg.time }
                            duration={ msg.duration }
                            isSoftDeleted={ msg.isSoftDeleted }
                            textStatus={ msg.text }
                            align={ align }
                            onSoftDeleteClick={
                                !msg.isSoftDeleted
                                    ? () => onSoftDeleteAudioMessage?.( index )
                                    : undefined
                            }
                            onDeleteClick={ () => onDeleteAudioMessage?.( index ) }
                            onToggleMenu={ setIsMenuOpen }
                        />
                    );
                }

                // 3️⃣ Text
                if ( msg.text )
                {
                    const isDeleted = isSoftDeletedMessage( msg.text );
                    return (
                        <ChatTextMessage
                            key={ msg.id || index }
                            text={ msg.text }
                            time={ msg.time }
                            align={ align }
                            onEditClick={
                                !isDeleted
                                    ? () => onEditTextMessage?.( index )
                                    : undefined
                            }
                            onSoftDeleteClick={
                                !isDeleted
                                    ? () => onSoftDeleteTextMessage?.( index )
                                    : undefined
                            }
                            onDeleteClick={ () => onDeleteTextMessage?.( index ) }
                            onToggleMenu={ setIsMenuOpen }
                        />
                    );
                }

                return null;
            } ) }

            <div ref={ bottomRef } />
        </div>
    );
}
