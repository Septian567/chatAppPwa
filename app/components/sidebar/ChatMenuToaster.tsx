"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../states";
import { MoreVertical, User, Trash2 } from "lucide-react";
import { clearMessagesForContact } from "../../states/chatSlice";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner"; // ✅ import toast

interface ChatMenuProps
{
    filteredContacts: any[];
    setActiveContact: ( c: any ) => void;
    onMainMenuClick: ( menu: string ) => void;
}

export default function ChatMenu( {
    filteredContacts,
    setActiveContact,
    onMainMenuClick,
}: ChatMenuProps )
{
    const chatData = useSelector( ( state: RootState ) => state.chat );
    const dispatch = useDispatch();

    const [openMenu, setOpenMenu] = useState<string | null>( null );
    const menuRef = useRef<HTMLDivElement | null>( null );

    const handleClearConversation = ( email: string ) =>
    {
        dispatch( clearMessagesForContact( { email } ) );

        toast.success( "Percakapan dihapus", {
            description: "Kontak ini tidak memiliki riwayat percakapan lagi.",
        } );

        setOpenMenu( null );
    };

    // ✅ Auto-close saat klik di luar
    useEffect( () =>
    {
        function handleClickOutside( e: MouseEvent )
        {
            if ( menuRef.current && !menuRef.current.contains( e.target as Node ) )
            {
                setOpenMenu( null );
            }
        }
        if ( openMenu )
        {
            document.addEventListener( "mousedown", handleClickOutside );
        }
        return () =>
        {
            document.removeEventListener( "mousedown", handleClickOutside );
        };
    }, [openMenu] );

    return (
        <div className="space-y-0 -ml-4">
            { filteredContacts.some( ( c ) => ( chatData[c.email] || [] ).length > 0 ) ? (
                filteredContacts
                    .filter( ( c ) => ( chatData[c.email] || [] ).length > 0 )
                    .map( ( c ) =>
                    {
                        const chatMessages = chatData[c.email] || [];
                        const lastMessage = chatMessages[chatMessages.length - 1];

                        let lastMessageText = "";

                        if ( lastMessage?.isSoftDeleted )
                        {
                            lastMessageText = "Pesan telah dihapus";
                        } else if ( lastMessage?.text )
                        {
                            lastMessageText = lastMessage.text;
                        } else if ( lastMessage?.fileUrl )
                        {
                            const ext = lastMessage.fileName?.split( "." ).pop()?.toLowerCase();
                            const type = lastMessage.fileType || "";

                            if (
                                ["jpg", "jpeg", "png", "gif"].includes( ext || "" ) ||
                                type.startsWith( "image/" )
                            )
                            {
                                lastMessageText = "[Gambar]";
                            } else if (
                                ["mp4", "mov", "avi"].includes( ext || "" ) ||
                                type.startsWith( "video/" )
                            )
                            {
                                lastMessageText = "[Video]";
                            } else
                            {
                                lastMessageText = "[Dokumen]";
                            }
                        } else if ( lastMessage?.audioUrl )
                        {
                            lastMessageText = "[Audio]";
                        }

                        const isMenuOpen = openMenu === c.email;

                        return (
                            <div
                                key={ `chat-${ c.email }` }
                                className={ `flex items-center p-2 relative rounded-lg ${ isMenuOpen ? "" : "hover:bg-gray-100 cursor-pointer"
                                    }` }
                                onClick={ () =>
                                {
                                    if ( !isMenuOpen )
                                    {
                                        setActiveContact( c );
                                        onMainMenuClick( "chat" );
                                    }
                                } }
                            >
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mr-3">
                                    <User className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-semibold text-sm truncate">
                                        { c.alias || c.name }
                                    </span>
                                    <div className="flex items-center justify-between mt-0.5 min-w-0">
                                        <span className="text-sm text-gray-600 truncate min-w-0 flex-1">
                                            { lastMessageText }
                                        </span>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                { lastMessage?.time || "" }
                                            </span>
                                            <button
                                                className="p-1 relative"
                                                onClick={ ( e ) =>
                                                {
                                                    e.stopPropagation();
                                                    setOpenMenu( isMenuOpen ? null : c.email );
                                                } }
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* dropdown menu */ }
                                { isMenuOpen && (
                                    <div
                                        ref={ menuRef }
                                        className="absolute right-6 top-10 bg-white border rounded shadow-md z-50"
                                    >
                                        <button
                                            className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:bg-gray-100"
                                            onClick={ () => handleClearConversation( c.email ) }
                                        >
                                            <Trash2 className="w-4 h-4" /> Hapus percakapan
                                        </button>
                                    </div>
                                ) }
                            </div>
                        );
                    } )
            ) : (
                <p className="text-gray-500 text-sm ml-6">No recent chats</p>
            ) }
        </div>
    );
}
