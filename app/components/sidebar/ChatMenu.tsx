"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../states";
import { MoreVertical, User, Trash2 } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { setMessagesForContact } from "../../states/chatSlice";

interface ChatMenuProps
{
    filteredContacts: any[];
    setActiveContact: ( c: any ) => void;
    onMainMenuClick: ( menu: string ) => void;
}

export default function ChatMenu( { filteredContacts, setActiveContact, onMainMenuClick }: ChatMenuProps )
{
    const chatData = useSelector( ( state: RootState ) => state.chat );
    const usersList = useSelector( ( state: RootState ) => state.users.list );
    const dispatch = useDispatch();

    const [selectedContact, setSelectedContact] = useState<any | null>( null );
    const [showConfirm, setShowConfirm] = useState( false );
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>( null );
    const menuRef = useRef<HTMLDivElement | null>( null );

    // Map email → avatar_url
    const avatarMap = usersList.reduce( ( acc, u ) =>
    {
        acc[u.email] = u.avatar_url;
        return acc;
    }, {} as Record<string, string> );

    useEffect( () =>
    {
        function handleClickOutside( e: MouseEvent )
        {
            if ( menuRef.current && !menuRef.current.contains( e.target as Node ) )
            {
                setOpenMenuIndex( null );
            }
        }

        if ( openMenuIndex !== null )
        {
            document.addEventListener( "mousedown", handleClickOutside );
        }

        return () => document.removeEventListener( "mousedown", handleClickOutside );
    }, [openMenuIndex] );

    const handleClearConversation = ( contact: any ) =>
    {
        dispatch( setMessagesForContact( { email: contact.email, messages: [] } ) );
    };

    const recentChats = filteredContacts.filter( c => ( chatData[c.email] || [] ).length > 0 );

    if ( !recentChats.length )
    {
        return <p className="text-gray-500 text-sm ml-6">No recent chats</p>;
    }

    return (
        <div className="space-y-0 -ml-4">
            { recentChats.map( ( c, index ) =>
            {
                const chatMessages = chatData[c.email] || [];
                const lastMessage = chatMessages[chatMessages.length - 1];

                let lastMessageText = "";
                if ( lastMessage?.isSoftDeleted ) lastMessageText = "Pesan telah dihapus";
                else if ( lastMessage?.text ) lastMessageText = lastMessage.text;
                else if ( lastMessage?.fileUrl )
                {
                    const ext = lastMessage.fileName?.split( "." ).pop()?.toLowerCase();
                    const type = lastMessage.fileType || "";
                    if ( ["jpg", "jpeg", "png", "gif"].includes( ext || "" ) || type.startsWith( "image/" ) ) lastMessageText = "[Gambar]";
                    else if ( ["mp4", "mov", "avi"].includes( ext || "" ) || type.startsWith( "video/" ) ) lastMessageText = "[Video]";
                    else lastMessageText = "[Dokumen]";
                } else if ( lastMessage?.audioUrl ) lastMessageText = "[Audio]";

                return (
                    <div
                        key={ `chat-${ c.email }` }
                        className={ `rounded-lg flex flex-col p-2 ${ openMenuIndex === index ? "bg-white" : "hover:bg-gray-100 cursor-pointer" }` }
                        onClick={ () =>
                        {
                            if ( openMenuIndex === index ) return;
                            setActiveContact( c );
                            onMainMenuClick( "chat" );
                        } }
                    >
                        <div className="flex items-center">
                            {/* Avatar */ }
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mr-3 overflow-hidden">
                                { avatarMap[c.email] ? (
                                    <img src={ avatarMap[c.email] } alt={ c.alias || c.name } className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-gray-500" />
                                ) }
                            </div>

                            {/* Konten teks */ }
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-semibold text-sm truncate">{ c.alias || c.name }</span>
                                <div className="flex items-center justify-between mt-0 min-w-0">
                                    <span className="text-sm text-gray-600 truncate min-w-0 flex-1">{ lastMessageText }</span>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2 relative">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{ lastMessage?.time || "" }</span>
                                        <button
                                            className="p-1"
                                            onClick={ ( e ) =>
                                            {
                                                e.stopPropagation();
                                                setOpenMenuIndex( openMenuIndex === index ? null : index );
                                            } }
                                        >
                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                        </button>

                                        { openMenuIndex === index && (
                                            <div ref={ menuRef } className="absolute right-0 top-6 w-44 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-900"
                                                    onClick={ ( e ) =>
                                                    {
                                                        e.stopPropagation();
                                                        setSelectedContact( c );
                                                        setShowConfirm( true );
                                                        setOpenMenuIndex( null );
                                                    } }
                                                >
                                                    <Trash2 size={ 16 } className="shrink-0 text-gray-600" />
                                                    <span className="text-sm">Hapus percakapan</span>
                                                </button>
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } ) }

            <DeleteConfirmModal
                open={ showConfirm }
                onClose={ () => setShowConfirm( false ) }
                onConfirm={ () => selectedContact && handleClearConversation( selectedContact ) }
            />
        </div>
    );
}
