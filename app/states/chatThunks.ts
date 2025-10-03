// states/chatThunks.ts
import { AppDispatch } from ".";
import { getLastMessagesPerChat } from "../utils/getLastMessagePerChatApi";
import { setLastMessageForContact } from "./chatSlice";

export const fetchLastMessagesPerChat = () => async ( dispatch: AppDispatch ) =>
{
    try
    {
        const lastMessages = await getLastMessagesPerChat();

        lastMessages.forEach( ( msg ) =>
        {
            dispatch(
                setLastMessageForContact( {
                    contactId: msg.chat_partner_id,
                    message: {
                        id: msg.message_id,
                        text: msg.message_text,
                        time: msg.created_at,
                        side: "kiri", // TODO: bisa dicek apakah pengirim = user login
                        isDeleted: msg.is_deleted,
                        updatedAt: msg.updated_at,
                    },
                } )
            );
        } );
    } catch ( err )
    {
        console.error( "Failed to fetch last messages:", err );
    }
};
