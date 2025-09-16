// hooks/contacts/useContactsPage.ts
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../states";
import
    {
        setContacts,
        updateContactAlias,
        deleteContact as deleteContactRedux,
    } from "../../states/contactsSlice";
import { getContacts } from "../../utils/contactApiUtils";
import
    {
        createContact,
    } from "../../utils/createContactApi";
import { updateContact as updateContactApi } from "../../utils/updateContactApi";
import { deleteContact as deleteContactApi } from "../../utils/deleteContactApi"; 

interface User
{
    email: string;
    username?: string;
    alias?: string;
    avatar_url?: string;
    userId: string;
}

interface Contact
{
    email: string;
    alias: string;
    avatar_url?: string;
    contact_id?: string;
}

export function useContactsPage( token?: string )
{
    const dispatch = useDispatch();
    const contacts = useSelector( ( state: RootState ) => state.contacts.list as Contact[] );

    const [activeMenu, setActiveMenu] = useState<"user" | "contact">( "contact" );
    const [users, setUsers] = useState<User[]>( [] );
    const [loading, setLoading] = useState( true );
    const [error, setError] = useState<string | null>( null );

    const currentUserToken = token || localStorage.getItem( "token" ) || "";

    // Fetch users dari localStorage / default
    useEffect( () =>
    {
        const savedUsers = localStorage.getItem( "users_data" );
        if ( savedUsers )
        {
            const parsed: User[] = JSON.parse( savedUsers ).map( ( u ) => ( {
                ...u,
                userId: u.userId || crypto.randomUUID(),
            } ) );
            setUsers( parsed );
        } else
        {
            const defaultUsers: User[] = [
                { email: "steven@gmail.com", userId: "1" },
                { email: "septian@gmail.com", userId: "2" },
            ];
            setUsers( defaultUsers );
        }
    }, [] );

    // Fetch contacts dari backend
    useEffect( () =>
    {
        const fetchContacts = async () =>
        {
            setLoading( true );
            try
            {
                const data = await getContacts( currentUserToken );
                const mapped = data.map( ( c: any ) => ( {
                    email: c.email,
                    alias: c.alias?.trim() || "",
                    avatar_url: c.avatar_url || "",
                    contact_id: c.contact_id || c.contactId || c.id,
                } ) );
                dispatch( setContacts( mapped ) );
            } catch ( err: any )
            {
                setError( err.message || "Failed to fetch contacts" );
            } finally
            {
                setLoading( false );
            }
        };
        fetchContacts();
    }, [dispatch, currentUserToken] );

    // ================================
    // Fungsi update alias kontak/user
    // ================================
    const handleUpdateContact = async ( email: string, alias: string ) =>
    {
        if ( !email ) return alert( "Email tidak valid" );

        const normalizedEmail = email.toLowerCase();

        // Cari user
        let user = users.find( u => u.email.toLowerCase() === normalizedEmail );

        // Jika user tidak ada, fallback ke contact
        if ( !user )
        {
            const contact = contacts.find( c => c.email.toLowerCase() === normalizedEmail );
            if ( !contact ) return alert( "User tidak ditemukan" );

            user = {
                email: contact.email,
                userId: contact.contact_id || crypto.randomUUID(),
                username: contact.alias || "",
                alias: contact.alias || "",
                avatar_url: contact.avatar_url,
            };
            setUsers( prev => [...prev, user] );
        }

        // Cari kontak
        let contact = contacts.find( c => c.email.toLowerCase() === normalizedEmail );

        try
        {
            if ( contact && contact.contact_id )
            {
                // Update alias ke backend
                const result = await updateContactApi( contact.contact_id, { alias } );
                if ( !result.success || !result.data )
                    throw new Error( result.message || "Gagal update kontak" );

                // 🔹 Update contacts slice langsung agar ContactList re-render
                dispatch( updateContactAlias( { email: contact.email, alias: result.data.alias } ) );

                // 🔹 Update users state
                setUsers( prev =>
                    prev.map( u => u.email.toLowerCase() === normalizedEmail
                        ? { ...u, alias: result.data.alias }
                        : u
                    )
                );

            } else
            {
                // Buat kontak baru
                const newContact = await createContact( { contactId: user.userId, alias }, currentUserToken );

                contact = {
                    email: user.email,
                    alias: newContact.alias,
                    avatar_url: user.avatar_url,
                    contact_id: newContact.contact_id || newContact.contactId || newContact.id,
                };

                // 🔹 Tambahkan ke contacts slice
                dispatch( setContacts( [...contacts.filter( c => c.email.toLowerCase() !== normalizedEmail ), contact] ) );

                // 🔹 Update users state
                setUsers( prev =>
                    prev.map( u => u.email.toLowerCase() === normalizedEmail
                        ? { ...u, alias: newContact.alias }
                        : u
                    )
                );
            }
        } catch ( err: any )
        {
            console.error( "Update contact error:", err.message || err );
            alert( `Gagal update kontak: ${ err.message || "Unknown error" }` );
        }
    };


    // 🔹 Fungsi tunggal untuk UserItem
    const handleUpdateAliasFromUser = async ( username: string, email: string, alias: string ) =>
    {
        await handleUpdateContact( email, alias );
    };

    // ================================
    // Hapus kontak
    // ================================
    const handleDeleteContact = async ( email: string ) =>
    {
        const contact = contacts.find( ( c ) => c.email === email );
        if ( !contact?.contact_id ) return alert( "contact_id tidak ditemukan." );

        try
        {
            // 1️⃣ Panggil API deleteContact
            const result = await deleteContactApi( contact.contact_id );

            if ( !result.success )
            {
                throw new Error( result.message || "Gagal menghapus kontak" );
            }

            // 2️⃣ Update Redux slice
            dispatch( deleteContactRedux( email ) );

            // 3️⃣ Update users state (kosongkan alias)
            setUsers( ( prev ) =>
                prev.map( ( u ) => ( u.email === email ? { ...u, alias: "" } : u ) )
            );

            // Optional: tampilkan notifikasi sukses
            console.log( "Kontak berhasil dihapus:", email );

        } catch ( err: any )
        {
            console.error( "Delete contact API error:", err.message || err );
            alert( `Gagal menghapus kontak: ${ err.message || "Unknown error" }` );
        }
    };

    // ================================
    // usersWithAlias untuk UserList
    // ================================
    const usersWithAlias = users.map( ( u ) =>
    {
        const contact = contacts.find( ( c ) => c.email === u.email );
        return {
            ...u,
            alias: contact?.alias || u.alias || "",
            contact_id: contact?.contact_id,
        };
    } );

    return {
        activeMenu,
        setActiveMenu,
        users: usersWithAlias,
        contacts,
        handleUpdateContact,
        handleUpdateAliasFromUser, // tunggal, aman dipanggil dari UserItem
        handleDeleteContact,
        loading,
        error,
    };
}
