import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:5000";

export interface SendMessageResponse
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
    attachments: any[];
}

export const sendMessage = async (
    toUserId: string,
    messageText: string,
    attachments: File[] = []
): Promise<SendMessageResponse> =>
{
    try
    {
        const token = localStorage.getItem( "token" );
        console.log( "DEBUG: Token =", token );

        if ( !token ) throw new Error( "Token tidak ditemukan. User belum login." );
        if ( !toUserId ) throw new Error( "toUserId kosong!" );

        const formData = new FormData();
        formData.append( "toUserId", toUserId );
        formData.append( "messageText", messageText );

        attachments.forEach( ( file ) => formData.append( "attachments", file ) );

        console.log( "DEBUG: FormData entries:" );
        for ( const pair of formData.entries() )
        {
            console.log( pair[0], pair[1] );
        }

        const response: AxiosResponse<SendMessageResponse> = await axios.post(
            `${ API_BASE_URL }/messages`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${ token }`,
                    // Jangan set Content-Type, biarkan Axios handle FormData
                },
            }
        );

        console.log( "DEBUG: API response:", response.data );
        return response.data;
    } catch ( error: any )
    {
        console.error( "DEBUG: Error sending message:", error.response?.data || error.message );
        throw error;
    }
};
