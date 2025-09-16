import { postRequest } from './apiClient';
import { RegisterUserData, LoginUserData, AuthApiResponse, ApiResponse } from './types';

export const registerUser = async ( userData: RegisterUserData ): Promise<ApiResponse<AuthApiResponse>> =>
{
    try
    {
        const data = await postRequest<AuthApiResponse>( '/auth/register', userData );
        return { success: true, data, message: data.message };
    } catch ( error: any )
    {
        return { success: false, message: error.message };
    }
};

export const loginUser = async ( userData: LoginUserData ): Promise<ApiResponse<AuthApiResponse>> =>
{
    try
    {
        const data = await postRequest<AuthApiResponse>( '/auth/login', userData );
        return { success: true, data, message: data.message };
    } catch ( error: any )
    {
        return { success: false, message: error.message };
    }
};

export const logoutUser = async (): Promise<ApiResponse<{ message: string }>> =>
{
    try
    {
        const token = localStorage.getItem( 'token' );
        const data = await postRequest<{ message: string }>( '/auth/logout', {} );
        localStorage.removeItem( 'token' );
        localStorage.removeItem( 'user' );
        return { success: true, data, message: data.message };
    } catch ( error: any )
    {
        return { success: false, message: error.message };
    }
};
