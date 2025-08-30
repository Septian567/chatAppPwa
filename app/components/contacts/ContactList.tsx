import ContactItem from "./ContactItem";

interface Contact
{
    name: string;
    email: string;
    alias?: string;
}

interface ContactListProps
{
    contacts: Contact[];
    onDelete: ( email: string ) => void;
    onUpdate: ( email: string, alias: string ) => void;
}

export default function ContactList( {
    contacts,
    onDelete,
    onUpdate,
}: ContactListProps )
{
    return (
        <div className="space-y-4 pb-20">
            { contacts.length === 0 && (
                <p className="text-sm text-gray-500">Belum ada kontak.</p>
            ) }
            { contacts.map( ( c ) => (
                <ContactItem
                    key={ c.email }
                    name={ c.name }
                    email={ c.email }
                    alias={ c.alias }
                    onDelete={ onDelete }
                    onUpdate={ onUpdate }
                />
            ) ) }
        </div>
    );
}
