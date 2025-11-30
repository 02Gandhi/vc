import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/apiService';
import { ContractorProfile, UserRole } from '../types';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyMDAgNDAiPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOTczMTYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlN1YnBvcnRhbDwvdGV4dD4KPC9zdmc+";

const DetailItem: React.FC<{ icon: React.ReactNode, label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 h-6 w-6 text-brand-text-secondary">{icon}</div>
        <div className="ml-3 w-full overflow-hidden">
            <p className="text-sm text-brand-text-secondary">{label}</p>
            <div className="text-brand-text-primary font-medium break-words whitespace-normal">{children}</div>
        </div>
    </div>
);

const PublicContractorProfilePage: React.FC = () => {
    const { contractorId } = useParams<{ contractorId: string }>();
    const { user } = useAuth();
    const [profile, setProfile] = useState<ContractorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            if (contractorId) {
                setLoading(true);
                const fetchedProfile = await api.fetchContractorProfile(contractorId);
                setProfile(fetchedProfile);
                setLoading(false);
            }
        };
        loadProfile();
    }, [contractorId]);
    
    // Explicit back link logic: If owner is viewing their own profile, back goes to edit page.
    const backPath = user?.role === UserRole.Contractor && user?.id === contractorId ? '/contractor/profile' : undefined;

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">Lade Profil...</div>;
    }

    if (!profile) {
        return (
            <div className="bg-brand-background min-h-screen text-brand-text-primary">
                <Header />
                <main className="container mx-auto p-8 text-center">
                    <h1 className="text-3xl font-bold">Profil nicht gefunden</h1>
                    <p className="text-brand-text-secondary mt-4">Das gesuchte Auftragnehmerprofil existiert nicht.</p>
                    <Link to="/" className="mt-6 inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg">
                        Zurück zur Startseite
                    </Link>
                </main>
            </div>
        );
    }
    
    return (
        <div className="bg-brand-background min-h-screen text-brand-text-primary">
            <Header />
            <main className="container mx-auto px-4 py-8">
                 <BackButton to={backPath} />

                {/* Hero Section */}
                <div className="relative h-48 md:h-64 bg-brand-surface rounded-lg mb-20 shadow-lg">
                    {profile.coverImageUrl ? (
                        <img src={profile.coverImageUrl} alt={`${profile.companyName} cover`} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                         <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center">
                            <img src={LOGO_URL} alt="Subportal Logo" className="w-48 opacity-20" />
                        </div>
                    )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                    <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end space-x-6 w-[calc(100%-4rem)]">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-brand-surface border-4 border-brand-background overflow-hidden flex-shrink-0">
                            {profile.logoUrl ? (
                                <img src={profile.logoUrl} alt={`${profile.companyName} logo`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-brand-text-secondary text-5xl font-bold">
                                    {profile.companyName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="pb-4 min-w-0 flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-white break-words" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{profile.companyName}</h1>
                            {profile.slogan && <p className="text-gray-200 text-lg mt-1 break-words" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{profile.slogan}</p>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                            <h2 className="text-2xl font-semibold mb-4 text-brand-text-primary">Über {profile.companyName}</h2>
                            <p className="text-brand-text-primary whitespace-pre-line leading-relaxed break-words">{profile.description || 'Keine Beschreibung verfügbar.'}</p>
                        </div>

                        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                            <h2 className="text-2xl font-semibold mb-4 text-brand-text-primary">Portfolio</h2>
                            <div className="space-y-6">
                                {profile.portfolio.length > 0 ? profile.portfolio.map(item => (
                                    <div key={item.id} className="border-b border-brand-border pb-6 last:border-b-0">
                                        <h3 className="text-xl font-bold text-brand-primary break-words">{item.title}</h3>
                                        <p className="text-sm text-brand-text-secondary mb-2 break-words">{item.location} • {item.dateStart ? `${new Date(item.dateStart).getFullYear()} - ${new Date(item.dateEnd).getFullYear()}` : ''}</p>
                                        <p className="text-brand-text-primary mb-4 break-words">{item.description}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {item.images.map((img, idx) => (
                                                <img key={idx} src={img} alt={`${item.title} image ${idx+1}`} className="rounded-md object-cover aspect-video" />
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-brand-text-secondary">Es wurden noch keine Portfolio-Projekte hinzugefügt.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                            <h3 className="text-xl font-semibold mb-4 text-brand-text-primary">Auftragnehmer-Details</h3>
                            <div className="space-y-4">
                                <DetailItem label="Standort" icon={
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                 }>
                                    {profile.address.city}, {profile.address.country}
                                </DetailItem>
                                <DetailItem label="Teamgröße" icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.226A3 3 0 0118 15.75M12 20.25a9.094 9.094 0 01-3.741-.479 3 3 0 01-4.682-2.72m7.5-2.226V20.25m0-2.25a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 01-3-3m0 0a3 3 0 013-3m0 0a3 3 0 013-3m0 0a3 3 0 00-3-3m-3 9A3 3 0 007.5 4.5m0 9a3 3 0 01-3-3M15 4.5A3 3 0 0012 1.5m0 9a3 3 0 00-3-3" /></svg>
                                }>
                                    {profile.team.companySize}+ Mitarbeiter
                                </DetailItem>
                                <DetailItem label="Spezialisierungen" icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.125-1.5M12 16.5v5.25m0 0l-1.125-1.5m1.125 1.5l1.125-1.5" /></svg>
                                }>
                                    {profile.serviceCategories.join(', ')}
                                </DetailItem>
                            </div>
                        </div>
                        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                             <h3 className="text-xl font-semibold mb-4 text-brand-text-primary">Kontaktinformationen</h3>
                             <div className="space-y-4">
                                <p className="text-sm text-brand-text-secondary">Kontaktdaten sind nach Kauf für Auftraggeber sichtbar.</p>
                                <DetailItem label="Ansprechpartner" icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                }>
                                    {profile.contactPerson.fullName} ({profile.contactPerson.role})
                                </DetailItem>
                                <DetailItem label="E-Mail" icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25-2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.625a2.25 2.25 0 01-2.36 0l-7.5-4.625A2.25 2.25 0 013.25 6.993V6.75" /></svg>
                                }>
                                    {profile.contactPerson.showEmailPublicly ? <a href={`mailto:${profile.contactPerson.email}`} className="text-brand-primary hover:underline break-all">{profile.contactPerson.email}</a> : 'Versteckt'}
                                </DetailItem>
                                 <DetailItem label="Telefon" icon={
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                 }>
                                     {profile.contactPerson.showPhonePublicly ? profile.contactPerson.phone : 'Versteckt'}
                                </DetailItem>
                             </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublicContractorProfilePage;