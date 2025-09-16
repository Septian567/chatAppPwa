// utils/apiUtils.ts
const BASE_URL = 'http://localhost:5000';

export interface RegisterUserData
{
    email: string;
    username: string;
    password: string;
}

export interface LoginUserData
{
    email: string;
    password: string;
}

// Response API untuk register & login
export interface AuthApiResponse
{
    message: string;
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
        avatar_url: string;
    };
}

export interface ApiResponse<T = any>
{
    success: boolean;
    data?: T;
    message?: string;
}

export const postRequest = async <T>(
    endpoint: string,
    data: object
): Promise<ApiResponse<T>> =>
{
    try
    {
        const response = await fetch( `${ BASE_URL }${ endpoint }`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( data ),
        } );

        const json = await response.json();

        if ( !response.ok )
        {
            throw new Error( json.message || 'API request failed' );
        }

        return {
            success: true,
            data: json,
            message: json.message,
        };
    } catch ( error: any )
    {
        console.error( 'API Error:', error );
        return {
            success: false,
            message: error.message,
        };
    }
};

// Register user
export const registerUser = async (
    userData: RegisterUserData
): Promise<ApiResponse<AuthApiResponse>> =>
{
    return postRequest( '/auth/register', userData );
};

// Login user
export const loginUser = async (
    userData: LoginUserData
): Promise<ApiResponse<AuthApiResponse>> =>
{
    return postRequest( '/auth/login', userData );
};

export interface UserProfile
{
    id: string;
    username: string;
    email: string;
    avatar_url: string;
}

export const getProfile = async (): Promise<ApiResponse<UserProfile>> =>
{
    try
    {
        const token = localStorage.getItem( "token" );

        if ( !token )
        {
            throw new Error( "Token tidak ditemukan. User belum login." );
        }

        const response = await fetch( `${ BASE_URL }/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ token }`,
            },
        } );

        const json = await response.json();

        if ( !response.ok )
        {
            throw new Error( json.message || "Gagal mengambil profile" );
        }

        return {
            success: true,
            data: json,
        };
    } catch ( error: any )
    {
        console.error( "Get Profile Error:", error );
        return {
            success: false,
            message: error.message,
        };
    }
};


// Logout user
export const logoutUser = async (): Promise<ApiResponse<{ message: string }>> =>
{
    try
    {
        const token = localStorage.getItem( "token" );

        const response = await fetch( `${ BASE_URL }/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Jika backend membutuhkan token di header Authorization
                ...( token ? { Authorization: `Bearer ${ token }` } : {} ),
            },
        } );

        const json = await response.json();

        if ( !response.ok )
        {
            throw new Error( json.message || "Logout failed" );
        }

        // Hapus token dan user dari localStorage
        localStorage.removeItem( "token" );
        localStorage.removeItem( "user" );

        return {
            success: true,
            data: json,
            message: json.message,
        };
    } catch ( error: any )
    {
        console.error( "Logout Error:", error );
        return {
            success: false,
            message: error.message,
        };
    }
};

// Update user profile
export const updateProfile = async ( data: {
    username?: string;
    avatar?: File;
} ): Promise<ApiResponse<UserProfile>> =>
{
    try
    {
        const token = localStorage.getItem( "token" );

        if ( !token )
        {
            throw new Error( "Token tidak ditemukan. User belum login." );
        }

        const formData = new FormData();
        if ( data.username ) formData.append( "username", data.username );
        if ( data.avatar ) formData.append( "avatar", data.avatar );

        const response = await fetch( `${ BASE_URL }/me`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${ token }`,
            },
            body: formData,
        } );

        const json = await response.json();

        if ( !response.ok )
        {
            throw new Error( json.message || "Gagal update profil" );
        }

        return {
            success: true,
            data: json,
            message: json.message || "Profil berhasil diperbarui",
        };
    } catch ( error: any )
    {
        console.error( "Update Profile Error:", error );
        return {
            success: false,
            message: error.message,
        };
    }
};





