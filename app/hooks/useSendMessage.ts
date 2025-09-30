import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../states";
import { addMessageToContact, ChatMessage } from "../states/chatSlice";
import { sendMessage, SendMessageResponse } from "../utils/sendMessageApi";

// --- Map API response ke format ChatMessage ---
function mapSendMessageResponse( apiResponse: any ): SendMessageResponse
{
    return {
        message_id: apiResponse.message_id,
        message_text: apiResponse.message_text,
        from_user_id: apiResponse.from_user_id,
        to_user_id: apiResponse.to_user_id,
        created_at: apiResponse.created_at,
        updated_at: apiResponse.updated_at || null,
        attachments: ( apiResponse.attachments || [] ).map( ( a: any ) => ( {
            mediaType: a.media_type,
            mediaUrl: a.media_url,
            mediaName: a.media_name,
            mediaSize: a.media_size,
        } ) ),
    };
}

// --- Format waktu 24 jam ---
const formatTime24 = ( dateString: string ) =>
{
    const date = new Date( dateString );
    const hours = date.getHours().toString().padStart( 2, "0" );
    const minutes = date.getMinutes().toString().padStart( 2, "0" );
    return `${ hours }:${ minutes }`;
};

export function useSendMessage()
{
    const dispatch = useDispatch();
    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );
    const contactId = activeContact?.contact_id || "default";
    const currentUserId = localStorage.getItem( "userId" ) || "";

    const sendTextMessage = async ( message: string ) =>
    {
        if ( !activeContact?.contact_id ) return;

        try
        {
            const apiResponseRaw = await sendMessage( activeContact.contact_id, message );
            const apiResponse = mapSendMessageResponse( apiResponseRaw );

            const side = apiResponse.from_user_id === currentUserId ? "kanan" : "kiri";

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: apiResponse.message_text || "",
                caption: "",
                time: formatTime24( apiResponse.created_at ),
                side,
                attachments: apiResponse.attachments || [],
            };

            dispatch( addMessageToContact( { contactId, message: newMessage } ) );
        } catch ( err: any )
        {
            console.error( "Gagal mengirim pesan:", err.response?.data || err.message );
        }
    };

    return { sendTextMessage };
}
