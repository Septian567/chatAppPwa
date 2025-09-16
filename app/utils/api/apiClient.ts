const BASE_URL = "http://localhost:5000";

// 🔹 Ambil token otomatis dari localStorage
const getAuthHeaders = () =>
{
    const token = localStorage.getItem( "auth_token" );
    return token ? { Authorization: `Bearer ${ token }` } : {};
};

export const postRequest = async <T>( endpoint: string, data: object ): Promise<T> =>
{
    const response = await fetch( `${ BASE_URL }${ endpoint }`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify( data ),
    } );

    const json = await response.json();

    if ( !response.ok )
    {
        console.error( "❌ POST Request failed:", {
            url: `${ BASE_URL }${ endpoint }`,
            status: response.status,
            statusText: response.statusText,
            body: json,
        } );
        throw new Error( json.message || `API request failed (${ response.status })` );
    }

    return json;
};

export const getRequest = async <T>( endpoint: string ): Promise<T> =>
{
    const response = await fetch( `${ BASE_URL }${ endpoint }`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    } );

    const json = await response.json();

    if ( !response.ok )
    {
        console.error( "❌ GET Request failed:", {
            url: `${ BASE_URL }${ endpoint }`,
            status: response.status,
            statusText: response.statusText,
            body: json,
        } );
        throw new Error( json.message || `API request failed (${ response.status })` );
    }

    return json;
};

export const putRequest = async <T>( endpoint: string, body: FormData ): Promise<T> =>
{
    const response = await fetch( `${ BASE_URL }${ endpoint }`, {
        method: "PUT",
        headers: {
            ...getAuthHeaders(),
        },
        body,
    } );

    const json = await response.json();

    if ( !response.ok )
    {
        console.error( "❌ PUT Request failed:", {
            url: `${ BASE_URL }${ endpoint }`,
            status: response.status,
            statusText: response.statusText,
            body: json,
        } );
        throw new Error( json.message || `API request failed (${ response.status })` );
    }

    return json;
};
