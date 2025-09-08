import { useSelector } from "react-redux";
import { RootState } from "../../states";

import ChatTextMessage from "./ChatTextMessage";
import ChatAudioMessage from "./ChatAudioMessage";
import ChatFileMessage from "./ChatFileMessage";
import { ChatMessage } from "../../hooks/useChatMessageActions";
import { isSoftDeletedMessage } from "./deletedMessage";
import { useChatBody } from "../../hooks/useChatBody";

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

    editingIndex?: number | null; // index pesan yang sedang diedit
    deletingForMe?: boolean;      // flag hapus untuk diri sendiri
}

export default function ChatBody( {
    messages,
    editingIndex,
    deletingForMe,
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

    // ✅ Hitung isBlockingScroll secara dinamis
    const isBlockingScroll = editingIndex !== null || deletingForMe === true;

    // Gunakan hook useChatBody
    const { bottomRef, chatBodyRef, isMenuOpen, setIsMenuOpen } = useChatBody( messages, {
        disableAutoScroll: isBlockingScroll, // nonaktifkan auto scroll saat edit/hapus
        isBlockingScroll,                     // blok scroll saat edit/hapus
    } );

    const activeContact = useSelector( ( state: RootState ) => state.contacts.activeContact );

    return (
        <div
            ref={ chatBodyRef }
            className="flex-1 py-6 w-full responsive-padding overflow-y-auto" // overflow-y auto sejak awal
        >
            { messages.map( ( msg, index ) =>
            {
                const align: "left" | "right" = msg.side === "kiri" ? "left" : "right";

                // Text message
                if ( msg.text )
                {
                    const isDeleted = isSoftDeletedMessage( msg.text );
                    return (
                        <ChatTextMessage
                            key={ index }
                            text={ msg.text }
                            time={ msg.time }
                            align={ align }
                            onEditClick={ !isDeleted ? () => onEditTextMessage?.( index ) : undefined }
                            onSoftDeleteClick={ !isDeleted ? () => onSoftDeleteTextMessage?.( index ) : undefined }
                            onDeleteClick={ () => onDeleteTextMessage?.( index ) }
                            onToggleMenu={ setIsMenuOpen }
                        />
                    );
                }

                // Audio message
                if ( msg.audioUrl || msg.isSoftDeleted )
                {
                    return (
                        <ChatAudioMessage
                            key={ index }
                            audioUrl={ msg.audioUrl }
                            time={ msg.time }
                            duration={ msg.duration }
                            isSoftDeleted={ msg.isSoftDeleted }
                            textStatus={ msg.text }
                            align={ align }
                            onSoftDeleteClick={ !msg.isSoftDeleted ? () => onSoftDeleteAudioMessage?.( index ) : undefined }
                            onDeleteClick={ () => onDeleteAudioMessage?.( index ) }
                            onToggleMenu={ setIsMenuOpen }
                        />
                    );
                }

                // File message
                if ( msg.fileUrl || msg.caption )
                {
                    const isDeleted = isSoftDeletedMessage( msg.caption );
                    return (
                        <ChatFileMessage
                            key={ index }
                            fileUrl={ msg.fileUrl || "" }
                            fileName={ msg.fileName }
                            caption={ msg.caption || "" }
                            time={ msg.time }
                            align={ align }
                            onEditClick={ !isDeleted ? () => onEditFileMessage?.( index ) : undefined }
                            onSoftDeleteClick={ !isDeleted ? () => onSoftDeleteFileMessage?.( index ) : undefined }
                            onDeleteClick={ () => onDeleteFileMessage?.( index ) }
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
