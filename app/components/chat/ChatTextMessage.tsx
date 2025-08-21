import { isSoftDeletedMessage } from "./deletedMessage";
import { MessageMenu } from "./MessageMenu";
import { ChatBubble } from "./ChatBubble";
import { SoftDeletedMessage } from "./SoftDeletedMessage";

interface ChatTextMessageProps
{
    text: string;
    time: string;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
    onSoftDeleteClick?: () => void;
}

export default function ChatTextMessage( {
    text,
    time,
    onEditClick,
    onDeleteClick,
    onSoftDeleteClick,
}: ChatTextMessageProps )
{
    const isSoftDeleted = isSoftDeletedMessage( text );

    return (
        <ChatBubble fixedWidth={ isSoftDeleted ? "cm" : undefined }>
            <div className="flex items-end gap-3">
                {/* Bagian teks */ }
                <div className="flex-1">
                    { isSoftDeleted ? (
                        <div className="flex items-left justify-left w-full min-h-[1.9rem] gap-2">
                            <SoftDeletedMessage text={ text } />
                        </div>
                    ) : (
                        <span className="whitespace-pre-line text-black">{ text }</span>
                    ) }
                </div>

                {/* Bagian waktu dan menu sejajar baris terakhir */ }
                <div className="flex items-center gap-1 self-end translate-y-[2px]">
                    <span className="text-xs text-gray-700 whitespace-nowrap">
                        { time }
                    </span>

                    { ( onEditClick || onSoftDeleteClick || onDeleteClick ) && (
                        <MessageMenu
                            isSoftDeleted={ isSoftDeleted }
                            onEditClick={ onEditClick }
                            onSoftDeleteClick={ onSoftDeleteClick }
                            onDeleteClick={ onDeleteClick }
                        />
                    ) }
                </div>
            </div>
        </ChatBubble>
    );
}

