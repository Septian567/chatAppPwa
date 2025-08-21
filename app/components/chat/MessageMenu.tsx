import { MoreVertical, Edit3, Slash, Trash2 } from "react-feather";
import { useMenu } from "../../hooks/useMenu";
import { createPortal } from "react-dom";
import { useRef, useEffect, useState } from "react";

interface MessageMenuProps
{
    isSoftDeleted: boolean;
    onEditClick?: () => void;
    onSoftDeleteClick?: () => void;
    onDeleteClick?: () => void;
}

export function MessageMenu( {
    isSoftDeleted,
    onEditClick,
    onSoftDeleteClick,
    onDeleteClick,
}: MessageMenuProps )
{
    const { isOpen, setIsOpen, menuRef } = useMenu();
    const buttonRef = useRef<HTMLButtonElement>( null );
    const [position, setPosition] = useState<{ top: number; left: number }>( { top: 0, left: 0 } );

    const handleClick = ( callback?: () => void ) =>
    {
        if ( callback ) callback();
        setIsOpen( false );
    };

    // Hitung posisi tombol untuk taruh menu di body
    useEffect( () =>
    {
        if ( isOpen && buttonRef.current )
        {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition( {
                top: rect.bottom + window.scrollY + 4, // 4px offset
                left: rect.right + window.scrollX - 176, // 176 = width 44 * 4 (w-44)
            } );
        }
    }, [isOpen] );

    const menu = (
        <div
            ref={ menuRef }
            className="absolute w-44 bg-white border rounded shadow text-sm z-[9999]"
            style={ { top: position.top, left: position.left, position: "absolute" } }
        >
            { !isSoftDeleted ? (
                <>
                    { onEditClick && (
                        <button
                            className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                            onClick={ () => handleClick( onEditClick ) }
                        >
                            <Edit3 size={ 14 } /> Edit
                        </button>
                    ) }
                    { onSoftDeleteClick && (
                        <button
                            className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                            onClick={ () => handleClick( onSoftDeleteClick ) }
                        >
                            <Slash size={ 14 } /> Hapus pesan
                        </button>
                    ) }
                    <button
                        className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                        onClick={ () => handleClick( onDeleteClick ) }
                    >
                        <Trash2 size={ 14 } /> Hapus untuk saya
                    </button>
                </>
            ) : (
                <button
                    className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                    onClick={ () => handleClick( onDeleteClick ) }
                >
                    <Trash2 size={ 14 } /> Hapus untuk saya
                </button>
            ) }
        </div>
    );

    return (
        <div className="relative">
            {/* Tombol MoreVertical */ }
            <button
                ref={ buttonRef }
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={ () => setIsOpen( prev => !prev ) }
            >
                <MoreVertical size={ 16 } />
            </button>

            {/* Menu pakai portal ke body */ }
            { isOpen && createPortal( menu, document.body ) }
        </div>
    );
}
