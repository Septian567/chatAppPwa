interface ContactsPageProps
{
    isMobile: boolean;
    onBack: () => void;
}

export default function ContactsPage( { isMobile, onBack }: ContactsPageProps )
{
    return (
        <main className="flex-1 p-6 overflow-auto bg-white">
            { isMobile && (
                <button onClick={ onBack } className="mb-4 text-green-600 underline">
                    ← Kembali ke Sidebar
                </button>
            ) }
            <div className="bg-green-100 p-4 rounded mb-4">
                <h2 className="text-xl font-bold text-green-700">Halaman Kontak</h2>
            </div>
            <p className="text-gray-800">Ini adalah halaman kontak.</p>
        </main>
    );
}
