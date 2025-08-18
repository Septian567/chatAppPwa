import { MoreVertical, Edit, Trash2, Slash } from "react-feather";
import { useDropdownMenu } from "../hooks/useDropdownMenu";

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
    const isSoftDeleted = text === "Pesan telah dihapus";
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdownMenu();

    const handleOptionClick = ( action: string ) =>
    {
        setDropdownOpen( false );
        switch ( action )
        {
            case "edit":
                onEditClick?.();
                break;
            case "softDelete":
                onSoftDeleteClick?.();
                break;
            case "delete":
                onDeleteClick?.();
                break;
        }
    };

    return (
        <div className="flex justify-end mb-4">
            <div className="bg-green-200 rounded-lg px-4 py-2 shadow border border-black w-fit max-w-[85%]">
                <div className="flex items-end justify-between gap-3">
                    <span className="text-black whitespace-pre-line">{ text }</span>
                    <div className="flex items-center gap-2 relative">
                        <span className="text-xs text-gray-700 whitespace-nowrap">{ time }</span>

                        { ( onEditClick || onSoftDeleteClick || onDeleteClick ) && (
                            <div className="relative" ref={ dropdownRef }>
                                <button
                                    onClick={ () => setDropdownOpen( ( prev ) => !prev ) }
                                    title="Actions"
                                    className="text-gray-600 hover:text-black text-sm"
                                >
                                    <MoreVertical size={ 16 } />
                                </button>
                                { dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10">
                                        <ul className="text-sm text-left">
                                            { onEditClick && !isSoftDeleted && (
                                                <li
                                                    onClick={ () => handleOptionClick( "edit" ) }
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                                >
                                                    <Edit size={ 16 } /> Edit
                                                </li>
                                            ) }
                                            { onSoftDeleteClick && !isSoftDeleted && (
                                                <li
                                                    onClick={ () => handleOptionClick( "softDelete" ) }
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                                >
                                                    <Slash size={ 16 } /> Hapus pesan
                                                </li>
                                            ) }
                                            { onDeleteClick && (
                                                <li
                                                    onClick={ () => handleOptionClick( "delete" ) }
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                                >
                                                    <Trash2 size={ 16 } /> Hapus untuk saya
                                                </li>
                                            ) }
                                        </ul>
                                    </div>
                                ) }
                            </div>
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
}
