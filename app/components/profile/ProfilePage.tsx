interface ProfilePageProps
{
    isMobile: boolean;
    onBack: () => void;
}

export default function ProfilePage( { isMobile, onBack }: ProfilePageProps )
{
    return (
        <main className="flex-1 p-6 overflow-auto bg-white">
            { isMobile && (
                <button onClick={ onBack } className="mb-4 text-yellow-600 underline">
                    ← Kembali ke Sidebar
                </button>
            ) }
            <div className="bg-yellow-100 p-4 rounded mb-4">
                <h2 className="text-xl font-bold text-yellow-700">Halaman Profil</h2>
            </div>
            <p className="text-gray-800">Ini adalah halaman profil.</p>
        </main>
    );
}
