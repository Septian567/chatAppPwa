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

export interface UserProfile
{
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    alias?: string;
}

export interface ApiResponse<T>
{
    success: boolean;
    data?: T;
    message?: string;
}
