import { MoreVertical, Trash2, Slash } from "react-feather";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { useDropdownMenu } from "../hooks/useDropdownMenu";

interface ChatAudioMessageProps
{
    audioUrl: string;
    time: string;
    duration?: number;
    isSoftDeleted?: boolean;
    textStatus?: string;
    onSoftDeleteClick?: () => void;
    onDeleteClick?: () => void;
}

export default function ChatAudioMessage( {
    audioUrl,
    time,
    duration,
    isSoftDeleted,
    textStatus,
    onSoftDeleteClick,
    onDeleteClick,
}: ChatAudioMessageProps )
{
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdownMenu();

    const handleOptionClick = ( action: string ) =>
    {
        setDropdownOpen( false );
        if ( action === "softDelete" ) onSoftDeleteClick?.();
        if ( action === "delete" ) onDeleteClick?.();
    };

    return (
        <div className="flex justify-end mb-4">
            <div className="bg-green-100 rounded-lg px-3 py-3 shadow border border-green-300 max-w-xs sm:max-w-sm w-fit">
                <div className="flex items-end justify-between gap-3">
                    { isSoftDeleted ? (
                        <span className="text-sm text-gray-500 italic">
                            { textStatus || "Pesan telah dihapus" }
                        </span>
                    ) : (
                        <CustomAudioPlayer src={ audioUrl } manualDuration={ duration } />
                    ) }
                    <div className="flex items-center gap-2 relative">
                        <span className="text-xs text-gray-700 whitespace-nowrap">{ time }</span>
                        { ( onSoftDeleteClick || onDeleteClick ) && (
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
                                            { !isSoftDeleted && onSoftDeleteClick && (
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
