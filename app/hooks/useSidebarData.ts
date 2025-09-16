import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../states";
import { fetchUsers, updateUserAlias } from "../states/usersSlice";
import
    {
        setContacts,
        updateContactAlias,
        setActiveContact,
    } from "../states/contactsSlice";

export function useSidebarData()
{
    const dispatch = useDispatch();
    const users = useSelector( ( state: RootState ) => state.users.list );
    const contacts = useSelector( ( state: RootState ) => state.contacts.list );

    const [searchQuery, setSearchQuery] = useState( "" );

    // 🔹 Ambil data user dari API saat pertama kali
    useEffect( () =>
    {
        dispatch( fetchUsers() as any );
    }, [dispatch] );

    // (opsional) jika contacts masih disimpan lokal, load sekali dari localStorage
    useEffect( () =>
    {
        const savedContacts = JSON.parse( localStorage.getItem( "contacts" ) || "[]" );
        if ( savedContacts.length > 0 ) dispatch( setContacts( savedContacts ) );
    }, [dispatch] );

    // 🔹 Update alias user/contact
    const handleAliasSave = ( name: string, email: string, alias: string ) =>
    {
        // update alias user → ke API + Redux
        dispatch( updateUserAlias( { email, alias } ) as any );

        // update alias contact (lokal)
        dispatch( updateContactAlias( { email, alias } ) );

        // simpan alias untuk kontak di localStorage
        const updatedContacts = contacts.map( ( c ) =>
            c.email === email ? { ...c, alias } : c
        );
        localStorage.setItem( "contacts", JSON.stringify( updatedContacts ) );
    };

    // 🔎 Filter user
    const filteredUsers = useMemo( () =>
    {
        if ( !searchQuery.trim() ) return users;

        return users.filter( ( u ) =>
        {
            const contact = contacts.find( ( c ) => c.email === u.email );
            const aliasToCheck = contact?.alias || u.alias || "";
            return (
                ( u.username || "" ).toLowerCase().includes( searchQuery.toLowerCase() ) ||
                ( u.email || "" ).toLowerCase().includes( searchQuery.toLowerCase() ) ||
                aliasToCheck.toLowerCase().includes( searchQuery.toLowerCase() )
            );
        } );
    }, [users, contacts, searchQuery] );

    // 🔎 Filter contacts
    const filteredContacts = useMemo( () =>
    {
        if ( !searchQuery.trim() ) return contacts;
        return contacts.filter( ( c ) =>
            ( ( c.alias || c.name || "" ) || "" )
                .toLowerCase()
                .includes( searchQuery.toLowerCase() )
        );
    }, [contacts, searchQuery] );

    return {
        users,
        contacts,
        searchQuery,
        setSearchQuery,
        handleAliasSave,
        filteredUsers,
        filteredContacts,
        setActiveContact: ( contact: any ) => dispatch( setActiveContact( contact ) ),
    };
}
