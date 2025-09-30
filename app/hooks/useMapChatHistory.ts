// hooks/useMapChatHistory.ts
import { ChatMessage } from "../states/chatSlice";
import { ChatHistoryItem } from "../utils/getChatHistoryApi";
import { formatTime } from "../utils/formatTime";
import { softDeleteMessage } from "./useSoftDelete";

// helper untuk menentukan jenis attachment
function determineAttachmentType( attachment: any )
{
    const fileName = attachment.media_name?.toLowerCase() || "";
    const mediaType = attachment.media_type;
    const isRecording = fileName.endsWith( ".webm" ) && mediaType === "file";
    if ( isRecording ) return "voice_note";
    if ( mediaType === "audio" ) return "audio_file";
    if ( mediaType === "image" ) return "image";
    return "file";
}

export function useMapChatHistory()
{
    function mapChatHistoryToMessages(
        history: ChatHistoryItem[],
        currentUserId: string
    ): ChatMessage[]
    {
        return history.map( ( msg ) =>
        {
            let fileUrl, fileName, fileType, audioUrl, caption;

            if ( msg.attachments && msg.attachments.length > 0 )
            {
                const attachment = msg.attachments[0];
                const attachmentType = determineAttachmentType( attachment );
                fileUrl = attachment.media_url;
                fileName = attachment.media_name;
                fileType = attachment.media_type;
                caption = attachment.caption || msg.message_text || undefined;

                if ( attachmentType === "voice_note" )
                {
                    audioUrl = fileUrl;
                    fileUrl = fileName = fileType = undefined;
                }
            }

            let message: ChatMessage = {
                id: msg.message_id,
                text: msg.message_text || "",
                fileUrl,
                fileName,
                fileType,
                caption,
                audioUrl,
                time: formatTime( msg.created_at ),
                side: msg.from_user_id === currentUserId ? "kanan" : "kiri",
                isDeleted: !!msg.is_deleted,
                isSoftDeleted: false,
                attachments: msg.attachments || [],
            };

            if ( message.isDeleted ) message = softDeleteMessage( message );

            return message;
        } );
    }

    return { mapChatHistoryToMessages };
}
