import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../states";
import { addMessageToContact, ChatMessage } from "../states/chatSlice";
import { sendMessage } from "../utils/sendMessageApi";

// --- Format waktu 24 jam ---
const formatTime24 = ( dateString: string ) =>
{
    const date = new Date( dateString );
    const hours = date.getHours().toString().padStart( 2, "0" );
    const minutes = date.getMinutes().toString().padStart( 2, "0" );
    return `${ hours }:${ minutes }`;
};

// --- Hook untuk mengirim file ---
export function useSendFile()
{
    const dispatch = useDispatch();
    const activeContact = useSelector(
        ( state: RootState ) => state.contacts.activeContact
    );
    const contactId = activeContact?.contact_id || "default";
    const currentUserId = localStorage.getItem( "userId" ) || "";

    const sendFile = async ( file: File, caption?: string ) =>
    {
        if ( !activeContact?.contact_id ) return;

        try
        {
            const apiResponseRaw = await sendMessage(
                activeContact.contact_id,
                caption || "",
                [file]
            );

            const apiResponse = apiResponseRaw;

            const serverAttachment = apiResponse.attachments?.[0];
            const side = apiResponse.from_user_id === currentUserId ? "kanan" : "kiri";

            const newMessage: ChatMessage = {
                id: apiResponse.message_id,
                text: caption || "",
                caption: caption || "",
                fileUrl:
                    serverAttachment?.mediaUrl && serverAttachment.mediaUrl !== ""
                        ? serverAttachment.mediaUrl
                        : file ? URL.createObjectURL( file ) : null,
                fileName: serverAttachment?.mediaName || file?.name || "",
                fileType: serverAttachment?.mediaType || file?.type || "",
                time: formatTime24( apiResponse.created_at ),
                side,
                attachments: apiResponse.attachments || [],
            };

            dispatch( addMessageToContact( { contactId, message: newMessage } ) );
        } catch ( err )
        {
            console.error( "Gagal mengirim file:", err );
        }
    };

    return { sendFile };
}
