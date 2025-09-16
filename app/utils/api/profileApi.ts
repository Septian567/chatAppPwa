import { getRequest, putRequest } from './apiClient';
import { UserProfile, ApiResponse } from './types';

export const getProfile = async (): Promise<ApiResponse<UserProfile>> =>
{
    try
    {
        const token = localStorage.getItem( 'token' );
        if ( !token ) throw new Error( 'Token tidak ditemukan. User belum login.' );
        const data = await getRequest<UserProfile>( '/me', token );
        return { success: true, data };
    } catch ( error: any )
    {
        return { success: false, message: error.message };
    }
};

export const updateProfile = async ( data: { username?: string; avatar?: File } ): Promise<ApiResponse<UserProfile>> =>
{
    try
    {
        const token = localStorage.getItem( 'token' );
        if ( !token ) throw new Error( 'Token tidak ditemukan. User belum login.' );

        const formData = new FormData();
        if ( data.username ) formData.append( 'username', data.username );
        if ( data.avatar ) formData.append( 'avatar', data.avatar );

        const updated = await putRequest<UserProfile>( '/me', formData, token );
        return { success: true, data: updated, message: updated.message || 'Profil berhasil diperbarui' };
    } catch ( error: any )
    {
        return { success: false, message: error.message };
    }
};
