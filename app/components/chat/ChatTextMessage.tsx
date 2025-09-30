import { useLayoutEffect, useRef, useState } from "react";
import { MessageMenu } from "./MessageMenu";
import { ChatBubble } from "./ChatBubble";
import { SoftDeletedMessage } from "../../hooks/useSoftDelete";

interface ChatTextMessageProps
{
    messageId: string;
    text: string;
    time: string;
    isSoftDeleted?: boolean;
    onEditClick?: () => void;
    onDeleteClick?: ( messageId: string ) => void;
    onSoftDeleteClick?: () => void;
    onToggleMenu?: ( isOpen: boolean ) => void;
    align?: "left" | "right"; // kiri = kontak, kanan = user sendiri
}

function hasLongWord( text: string, maxLength: number = 20 )
{
    return text.split( /\s+/ ).some( ( word ) => word.length > maxLength );
}

export default function ChatTextMessage( {
    messageId,
    text,
    time,
    isSoftDeleted = false,
    onEditClick,
    onDeleteClick,
    onSoftDeleteClick,
    onToggleMenu,
    align = "right",
}: ChatTextMessageProps )
{
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

    // Layout utama
    const layoutClass = isSoftDeleted
        ? "flex-row items-end gap-2"
        : isMultiLine
            ? "flex-col"
            : "flex-row items-end gap-2";

    // Posisi waktu
    const timePositionClass = isSoftDeleted
        ? "translate-y-[2px]"
        : isMultiLine
            ? "justify-end mt-1 self-end"
            : "translate-y-[2px]";

    const breakClass = hasLongWord( text ) ? "break-all" : "break-words";

    return (
        <ChatBubble fixedWidth={ isSoftDeleted ? "cm" : undefined } align={ align }>
            <div className={ `flex ${ layoutClass }` }>
                {/* Bagian teks */ }
                <div className="flex-1">
                    { isSoftDeleted ? (
                        <SoftDeletedMessage text={ text } />
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
                        { time || "—" }
                    </span>

                    { ( onEditClick || onSoftDeleteClick || onDeleteClick ) && (
                        <MessageMenu
                            isOwnMessage={ align === "right" } // 🔹 penting
                            isSoftDeleted={ isSoftDeleted }
                            onEditClick={ onEditClick }
                            onSoftDeleteClick={ onSoftDeleteClick }
                            onDeleteClick={ () => onDeleteClick?.( messageId ) }
                            align={ align }
                            onToggle={ onToggleMenu }
                        />
                    ) }
                </div>
            </div>
        </ChatBubble>
    );
}
