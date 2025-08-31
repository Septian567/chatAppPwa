import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Contact
{
    name: string;
    email: string;
    alias?: string;
}

interface ContactsState
{
    list: Contact[];
}

const CONTACTS_KEY = "contacts_data";

// Langsung ambil data dari localStorage saat inisialisasi Redux
const initialContacts: Contact[] = ( () =>
{
    try
    {
        const saved = localStorage.getItem( CONTACTS_KEY );
        return saved ? JSON.parse( saved ) : [];
    } catch
    {
        return [];
    }
} )();

const initialState: ContactsState = {
    list: initialContacts,
};

const contactsSlice = createSlice( {
    name: "contacts",
    initialState,
    reducers: {
        setContacts: ( state, action: PayloadAction<Contact[]> ) =>
        {
            state.list = action.payload;
            localStorage.setItem( CONTACTS_KEY, JSON.stringify( state.list ) );
        },
        addContact: ( state, action: PayloadAction<Contact> ) =>
        {
            const exists = state.list.some( c => c.email === action.payload.email );
            if ( !exists )
            {
                state.list.push( action.payload );
                localStorage.setItem( CONTACTS_KEY, JSON.stringify( state.list ) );
            }
        },
        updateContactAlias: (
            state,
            action: PayloadAction<{ email: string; alias: string }>
        ) =>
        {
            const contact = state.list.find( c => c.email === action.payload.email );
            if ( contact )
            {
                contact.alias = action.payload.alias;
            } else
            {
                state.list.push( {
                    name: action.payload.alias,
                    email: action.payload.email,
                    alias: action.payload.alias,
                } );
            }
            localStorage.setItem( CONTACTS_KEY, JSON.stringify( state.list ) );
        },
        deleteContact: ( state, action: PayloadAction<string> ) =>
        {
            state.list = state.list.filter( c => c.email !== action.payload );
            localStorage.setItem( CONTACTS_KEY, JSON.stringify( state.list ) );
        },
    },
} );

export const { setContacts, addContact, updateContactAlias, deleteContact } =
    contactsSlice.actions;
export default contactsSlice.reducer;
