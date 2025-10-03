// utils/getLastMessagesApi.ts
import axios from "axios";

export interface LastMessageItem
{
    message_id: string;
    from_user_id: string;
    to_user_id: string;
    message_text: string;
    created_at: string;
    read_at: string | null;
    updated_at: string;
    is_deleted: boolean;
    deleted_at: string | null;
    chat_partner_id: string;
}

export async function getLastMessagesPerChat(): Promise<LastMessageItem[]>
{
    try
    {
        const token = localStorage.getItem( "token" );

        if ( !token )
        {
            throw new Error( "Token tidak ditemukan. Pastikan user sudah login." );
        }

        const response = await axios.get<LastMessageItem[]>(
            "http://localhost:5000/messages/chat",
            {
                headers: {
                    Authorization: `Bearer ${ token }`,
                },
            }
        );

        console.log( "DEBUG: getLastMessagesPerChat response:", response.data );
        return response.data;
    } catch ( err: any )
    {
        let message = "Unknown error";
        if ( err instanceof Error )
        {
            message = err.message;
        } else if ( err?.response?.data?.message )
        {
            message = err.response.data.message;
        } else if ( err?.response?.statusText )
        {
            message = `HTTP ${ err.response.status }: ${ err.response.statusText }`;
        }

        console.warn( "Failed to fetch last messages:", message );
        return [];
    }
}
