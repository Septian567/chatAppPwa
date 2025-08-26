import Header from "./ContactHeader";
import SearchBar from "./SearchBar";
import UserItem from "./UserItem";
import ContactItem from "./ContactItem";
import { Plus, Check, X } from "lucide-react";
import { useContactsPage } from "../../hooks/useContactsPage";
import { useRef, useEffect, useState } from "react";

interface ContactsPageProps
{
    isMobile: boolean;
    onBack: () => void;
}

export default function ContactsPage( { isMobile, onBack }: ContactsPageProps )
{
    const {
        activeMenu,
        setActiveMenu,
        users,
        contacts,
        addingUser,
        setAddingUser,
        newUserName,
        setNewUserName,
        newUserEmail,
        setNewUserEmail,
        handleAddUser,
        handleCancelUser,
        handleAliasSave,
        handleDeleteContact,
        handleUpdateContact,
    } = useContactsPage();

    // 🔹 scroll refs & posisi
    const scrollRef = useRef<HTMLDivElement>( null );
    const tipTimeoutRef = useRef<NodeJS.Timeout>();
    const [showScrollTip, setShowScrollTip] = useState( false );
    const [scrollPositions, setScrollPositions] = useState( { user: 0, contact: 0 } );

    const handleScroll = () =>
    {
        if ( !scrollRef.current ) return;

        setScrollPositions( prev => ( { ...prev, [activeMenu]: scrollRef.current!.scrollTop } ) );

        // tampilkan tip scroll
        if ( !showScrollTip ) setShowScrollTip( true );

        if ( tipTimeoutRef.current ) clearTimeout( tipTimeoutRef.current );
        tipTimeoutRef.current = setTimeout( () => setShowScrollTip( false ), 1000 );
    };

    useEffect( () =>
    {
        if ( scrollRef.current )
        {
            scrollRef.current.scrollTop = scrollPositions[activeMenu];
        }
    }, [activeMenu] );

    // 🔹 pencarian
    const [searchQuery, setSearchQuery] = useState( "" );
    const filteredUsers = users.filter( u =>
        u.name.toLowerCase().includes( searchQuery.toLowerCase() ) ||
        u.email.toLowerCase().includes( searchQuery.toLowerCase() )
    );

    const filteredContacts = contacts.filter( c =>
        ( c.alias || c.name ).toLowerCase().includes( searchQuery.toLowerCase() ) ||
        c.email.toLowerCase().includes( searchQuery.toLowerCase() )
    );

    return (
        <main className="flex-1 flex flex-col bg-white h-screen">
            <Header title="Kontak Saya" isMobile={ isMobile } onBack={ onBack } />

            {/* Menu Tab */ }
            <div className="flex gap-8 mt-6 px-6">
                <button
                    onClick={ () => setActiveMenu( "user" ) }
                    className={ `pb-1 ${ activeMenu === "user"
                        ? "border-b-2 border-black font-semibold"
                        : "text-gray-600"
                        }` }
                >
                    User
                </button>
                <button
                    onClick={ () => setActiveMenu( "contact" ) }
                    className={ `pb-1 ${ activeMenu === "contact"
                        ? "border-b-2 border-black font-semibold"
                        : "text-gray-600"
                        }` }
                >
                    Kontak
                </button>
            </div>

            {/* Search Bar */ }
            <SearchBar
                placeholder={ activeMenu === "user" ? "Cari user ....." : "Cari kontak ....." }
                value={ searchQuery }
                onChange={ setSearchQuery }
            />

            {/* Konten scrollable */ }
            <div
                ref={ scrollRef }
                onScroll={ handleScroll }
                className="p-6 text-left flex-1 overflow-y-auto mt-3"
            >
                { activeMenu === "user" && (
                    <div className="space-y-4 pb-10">
                        { filteredUsers.map( ( u ) => (
                            <UserItem
                                key={ u.email }
                                name={ u.name }
                                email={ u.email }
                                onAliasSave={ handleAliasSave }
                            />
                        ) ) }

                        { addingUser ? (
                            <div className="flex items-center gap-2 border p-3 rounded-lg">
                                <input
                                    type="text"
                                    value={ newUserName }
                                    onChange={ ( e ) => setNewUserName( e.target.value ) }
                                    placeholder="Username..."
                                    className="border rounded px-2 py-1 text-sm flex-1"
                                />
                                <input
                                    type="email"
                                    value={ newUserEmail }
                                    onChange={ ( e ) => setNewUserEmail( e.target.value ) }
                                    placeholder="Email..."
                                    className="border rounded px-2 py-1 text-sm flex-1"
                                />
                                <button
                                    onClick={ handleAddUser }
                                    className="p-2 rounded hover:bg-gray-200"
                                >
                                    <Check className="w-4 h-4 text-black" />
                                </button>
                                <button
                                    onClick={ handleCancelUser }
                                    className="p-2 rounded hover:bg-gray-200"
                                >
                                    <X className="w-4 h-4 text-black" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={ () => setAddingUser( true ) }
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah User
                            </button>
                        ) }
                    </div>
                ) }

                { activeMenu === "contact" && (
                    <div className="space-y-4 pb-20">
                        { filteredContacts.length === 0 && (
                            <p className="text-sm text-gray-500">Belum ada kontak.</p>
                        ) }
                        { filteredContacts.map( ( c ) => (
                            <ContactItem
                                key={ c.email }
                                name={ c.name }
                                email={ c.email }
                                onDelete={ handleDeleteContact }
                                onUpdate={ handleUpdateContact }
                                alias={ c.alias }
                            />
                        ) ) }
                    </div>
                ) }
            </div>
        </main>
    );
}
