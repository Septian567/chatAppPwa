import { getRequest } from './apiClient';
import { UserProfile, ApiResponse } from './types';

export const getAllUsers = async (): Promise<ApiResponse<UserProfile[]>> =>
{
    try
    {
        const data = await getRequest<UserProfile[]>( '/users' );
        return { success: true, data };
    } catch ( error: any )
    {
        return { success: false, message: error.message };
    }
};
