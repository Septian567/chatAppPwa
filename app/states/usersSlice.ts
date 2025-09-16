import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAllUsers } from "../utils/apiUsers";
import { updateContact as updateContactApi } from "../utils/updateContactApi";
import { createContact, ContactCreateBody } from "../utils/createContactApi";
import { RootState } from "./index";

export interface User
{
    email: string;
    username: string;
    alias?: string;
    avatar_url?: string;
    userId: string; // id user dari backend
}

interface UsersState
{
    list: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    list: [],
    loading: false,
    error: null,
};

// 🔹 Fetch semua users dari API
export const fetchUsers = createAsyncThunk( "users/fetchUsers", async () =>
{
    const res = await getAllUsers();
    if ( !res.success || !res.data ) throw new Error( res.message || "Failed to fetch users" );
    return res.data; // diasumsikan API return { id, email, username, avatar_url }
} );

// 🔹 Update alias user → ke API contacts
export const updateUserAlias = createAsyncThunk<
    { email: string; alias: string }, // return
    { email: string; alias: string }, // args
    { state: RootState }
>(
    "users/updateUserAlias",
    async ( { email, alias }, { getState } ) =>
    {
        const state = getState();
        const contacts = state.contacts.list;
        const users = state.users.list;
        const token = localStorage.getItem( "token" ) || "";

        const user = users.find( ( u ) => u.email === email );
        if ( !user ) throw new Error( "User tidak ditemukan" );

        const contact = contacts.find( ( c ) => c.email === email );

        if ( contact && contact.contact_id )
        {
            // kontak sudah ada → update alias
            const result = await updateContactApi( contact.contact_id, { alias } );
            if ( !result.success || !result.data ) throw new Error( result.message || "Gagal update kontak" );
            return { email, alias: result.data.alias };
        } else
        {
            // kontak baru → create
            const body: ContactCreateBody = { contactId: user.userId, alias };
            const newContact = await createContact( body, token );
            return { email, alias: newContact.alias };
        }
    }
);

const usersSlice = createSlice( {
    name: "users",
    initialState,
    reducers: {
        addUser: ( state, action: PayloadAction<User> ) =>
        {
            const exists = state.list.some( ( u ) => u.email === action.payload.email );
            if ( !exists )
            {
                state.list.push( action.payload );
                localStorage.setItem( "users_data", JSON.stringify( state.list ) );
            }
        },
        // ❌ Tidak perlu updateAlias manual lagi
    },
    extraReducers: ( builder ) =>
    {
        builder
            .addCase( fetchUsers.pending, ( state ) =>
            {
                state.loading = true;
                state.error = null;
            } )
            .addCase( fetchUsers.fulfilled, ( state, action ) =>
            {
                state.loading = false;
                state.list = action.payload.map( ( u: any ) => ( {
                    email: u.email,
                    username: u.username || "",
                    alias: u.alias || "",
                    avatar_url: u.avatar_url || "",
                    userId: u.id,
                } ) );
                localStorage.setItem( "users_data", JSON.stringify( state.list ) );
            } )
            .addCase( fetchUsers.rejected, ( state, action ) =>
            {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch users";
            } )
            .addCase( updateUserAlias.fulfilled, ( state, action ) =>
            {
                const { email, alias } = action.payload;
                const user = state.list.find( ( u ) => u.email === email );
                if ( user )
                {
                    user.alias = alias;
                }
                localStorage.setItem( "users_data", JSON.stringify( state.list ) );
            } );
    },
} );

export const { addUser } = usersSlice.actions;
export default usersSlice.reducer;
