import { useLayoutEffect, useRef, useState } from "react";
import { isSoftDeletedMessage } from "./deletedMessage";
import { MessageMenu } from "./MessageMenu";
import { ChatBubble } from "./ChatBubble";
import { SoftDeletedMessage } from "./SoftDeletedMessage";

interface ChatTextMessageProps
{
    messageId: string; // ✅ untuk API delete
    text: string;
    time: string;
    onEditClick?: () => void;
    onDeleteClick?: ( messageId: string ) => void; // ✅ terima id
    onSoftDeleteClick?: () => void;
    onToggleMenu?: ( isOpen: boolean ) => void;
    align?: "left" | "right";
}

function hasLongWord( text: string, maxLength: number = 20 )
{
    return text.split( /\s+/ ).some( ( word ) => word.length > maxLength );
}

export default function ChatTextMessage( {
    messageId,
    text,
    time,
    onEditClick,
    onDeleteClick,
    onSoftDeleteClick,
    onToggleMenu,
    align = "right",
}: ChatTextMessageProps )
{
    const isSoftDeleted = isSoftDeletedMessage( text );

    const textRef = useRef<HTMLSpanElement | null>( null );
    const [isMultiLine, setIsMultiLine] = useState( false );

    useLayoutEffect( () =>
    {
        if ( !isSoftDeleted && textRef.current )
        {
            const el = textRef.current;
            const style = window.getComputedStyle( el );
            const lineHeight = parseFloat( style.lineHeight );
            setIsMultiLine( el.scrollHeight > lineHeight * 1.5 );
        } else
        {
            setIsMultiLine( false );
        }
    }, [text, isSoftDeleted] );

    const layoutClass = isSoftDeleted
        ? "flex-row items-end gap-2"
        : isMultiLine
            ? "flex-col"
            : "flex-row items-end gap-2";

    const timePositionClass = isSoftDeleted
        ? ""
        : isMultiLine
            ? "justify-end mt-1 self-end"
            : "translate-y-[2px]";

    // Tentukan kelas break word
    const breakClass = hasLongWord( text ) ? "break-all" : "break-words";

    return (
        <ChatBubble fixedWidth={ isSoftDeleted ? "cm" : undefined } align={ align }>
            <div className={ `flex ${ layoutClass }` }>
                {/* Bagian teks */ }
                <div className="flex-1">
                    { isSoftDeleted ? (
                        <div className="min-h-[1.9rem] flex items-center">
                            <SoftDeletedMessage text={ text } />
                        </div>
                    ) : (
                        <span
                            ref={ textRef }
                            className={ `whitespace-pre-wrap ${ breakClass } text-black block` }
                        >
                            { text }
                        </span>
                    ) }
                </div>

                {/* Bagian waktu dan menu */ }
                <div className={ `flex items-center gap-1 ${ timePositionClass }` }>
                    <span className="text-xs text-gray-700 whitespace-nowrap">
                        { time }
                    </span>

                    { ( onEditClick || onSoftDeleteClick || onDeleteClick ) && (
                        <MessageMenu
                            isSoftDeleted={ isSoftDeleted }
                            onEditClick={ onEditClick }
                            onSoftDeleteClick={ onSoftDeleteClick }
                            onDeleteClick={ () =>
                                onDeleteClick?.( messageId ) // ✅ lempar id ke parent
                            }
                            align={ align }
                            onToggle={ onToggleMenu }
                        />
                    ) }
                </div>
            </div>
        </ChatBubble>
    );
}
