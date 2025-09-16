import axios, { AxiosResponse } from "axios";

// Contact dari API
export interface Contact
{
    id: string;
    username: string;
    avatar_url: string;
    email: string;
    alias?: string;
    created_at: string;
}

const API_BASE_URL = "http://localhost:5000";

/**
 * Ambil daftar contacts user saat ini
 * Token diambil langsung dari localStorage
 * @returns Array of Contact
 */
export const getContacts = async (): Promise<Contact[]> =>
{
    try
    {
        const token = localStorage.getItem( "token" );
        if ( !token )
        {
            throw new Error( "Token tidak ditemukan. User belum login." );
        }

        const response: AxiosResponse<Contact[]> = await axios.get(
            `${ API_BASE_URL }/me/contacts`,
            {
                headers: {
                    Authorization: `Bearer ${ token }`,
                },
            }
        );

        // pastikan alias selalu ada walau kosong
        return response.data.map( ( c ) => ( {
            ...c,
            alias: c.alias || "",
        } ) );
    } catch ( error: any )
    {
        console.error( "Error fetching contacts:", error.message );
        throw error;
    }
};
