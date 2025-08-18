import { MoreVertical, Edit3, Slash, Trash2 } from "react-feather";
import { useMenu } from "../hooks/useMenu";

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

    return (
        <div className="absolute top-0 right-0" ref={ menuRef }>
            <button
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={ () => setIsOpen( ( prev ) => !prev ) }
            >
                <MoreVertical size={ 16 } />
            </button>
            { isOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border rounded shadow text-sm z-10">
                    { !isSoftDeleted && (
                        <>
                            { onEditClick && (
                                <button
                                    className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                                    onClick={ () =>
                                    {
                                        onEditClick();
                                        setIsOpen( false );
                                    } }
                                >
                                    <Edit3 size={ 14 } /> Edit caption
                                </button>
                            ) }
                            { onSoftDeleteClick && (
                                <button
                                    className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                                    onClick={ () =>
                                    {
                                        onSoftDeleteClick();
                                        setIsOpen( false );
                                    } }
                                >
                                    <Slash size={ 14 } /> Hapus untuk saya
                                </button>
                            ) }
                            { onDeleteClick && (
                                <button
                                    className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                                    onClick={ () =>
                                    {
                                        onDeleteClick();
                                        setIsOpen( false );
                                    } }
                                >
                                    <Trash2 size={ 14 } /> Hapus pesan
                                </button>
                            ) }
                        </>
                    ) }
                    { isSoftDeleted && onSoftDeleteClick && (
                        <button
                            className="flex items-center gap-2 w-full text-left px-3 py-1 hover:bg-gray-100"
                            onClick={ () =>
                            {
                                onSoftDeleteClick();
                                setIsOpen( false );
                            } }
                        >
                            <Slash size={ 14 } /> Hapus untuk saya
                        </button>
                    ) }
                </div>
            ) }
        </div>
    );
}
