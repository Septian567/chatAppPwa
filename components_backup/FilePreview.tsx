// FilePreview.tsx
import React from "react";

interface FilePreviewProps
{
    fileUrl: string;
    fileName: string;
    fileExtension: string;
    fileIcon: string;
    onDownload: () => void;
}

export default function FilePreview( {
    fileUrl,
    fileName,
    fileExtension,
    fileIcon,
    onDownload,
}: FilePreviewProps )
{
    return (
        <>
            {/* File Info */ }
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{ fileIcon }</span>
                <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm truncate">{ fileName }</p>
                    <p className="text-xs text-gray-600">{ fileExtension.toUpperCase() } Document</p>
                </div>
            </div>

            {/* Tombol Download */ }
            <div className="flex mb-1">
                <button
                    onClick={ onDownload }
                    className="flex-1 bg-white border border-gray-300 px-3 py-1 rounded text-sm shadow hover:bg-gray-100 text-center"
                >
                    Download
                </button>
            </div>
        </>
    );
}
