// utils/getAllUsers.ts
import { ApiResponse, UserProfile } from "./apiUtils";

const BASE_URL = "http://localhost:5000";

export const getAllUsers = async (): Promise<ApiResponse<UserProfile[]>> =>
{
    try
    {
        const token = localStorage.getItem( "token" );

        if ( !token )
        {
            throw new Error( "Token tidak ditemukan. User belum login." );
        }

        const response = await fetch( `${ BASE_URL }/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ token }`, // 🔹 Tambahkan token
            },
        } );

        const json = await response.json();

        if ( !response.ok )
        {
            throw new Error( json.message || "Failed to fetch users" );
        }

        return {
            success: true,
            data: json, // response sudah array user
        };
    } catch ( error: any )
    {
        console.error( "API Error:", error );
        return {
            success: false,
            message: error.message,
        };
    }
};
