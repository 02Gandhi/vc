import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/apiService';
import { CompanyProfile, Job, UserRole } from '../types';
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

const JobCard: React.FC<{ job: Job }> = ({ job }) => (
    <div className="bg-brand-background p-4 rounded-lg border border-brand-border hover:shadow-md transition-shadow">
        <Link to={`/jobs/public/${job.id}`} className="font-bold text-brand-primary hover:underline">{job.title}</Link>
        <p className="text-sm text-brand-text-secondary mt-1">{job.city}, {job.country}</p>
        <div className="mt-2 text-xs text-brand-text-secondary">
             {job.category.replace(/_/g, ' ')}
        </div>
    </div>
);

const PublicCompanyProfilePage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const { user } = useAuth();
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (clientId) {
                setLoading(true);
                try {
                    const [fetchedProfile, clientJobs] = await Promise.all([
                        api.fetchCompanyProfile(clientId),
                        api.fetchClientJobs(clientId),
                    ]);
                    setProfile(fetchedProfile || null);
                    setJobs(clientJobs.filter(j => j.status === 'Active'));
                } catch (error) {
                    console.error("Failed to load company profile", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [clientId]);
    
    // Explicit back link logic: If owner is viewing their own profile, back goes to edit page.
    const backPath = user?.role === UserRole.Client && user?.id === clientId ? '/client/profile' : undefined;

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">Загрузка профиля...</div>;
    }

    if (!profile) {
        return (
            <div className="bg-brand-background min-h-screen text-brand-text-primary">
                <Header />
                <main className="container mx-auto p-8 text-center">
                    <h1 className="text-3xl font-bold">Профиль не найден</h1>
                    <p className="text-brand-text-secondary mt-4">Запрашиваемый профиль компании не существует.</p>
                    <Link to="/" className="mt-6 inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg">
                        Вернуться на главную
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-brand-background min-h-screen text-brand-text-primary flex flex-col">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
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
                            <h2 className="text-2xl font-semibold mb-4 text-brand-text-primary">О компании {profile.companyName}</h2>
                            <p className="text-brand-text-primary whitespace-pre-line leading-relaxed break-words">{profile.description || 'Описание отсутствует.'}</p>
                        </div>

                         <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                            <h2 className="text-2xl font-semibold mb-4 text-brand-text-primary">Текущие вакансии ({jobs.length})</h2>
                            {jobs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {jobs.map(job => <JobCard key={job.id} job={job} />)}
                                </div>
                            ) : (
                                <p className="text-brand-text-secondary">Нет активных вакансий.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                            <h3 className="text-xl font-semibold mb-4 text-brand-text-primary">Детали компании</h3>
                            <div className="space-y-4">
                                <DetailItem label="Штаб-квартира" icon={
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                 }>
                                    {profile.address.city}, {profile.address.country}
                                </DetailItem>
                                <DetailItem label="Размер компании" icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.226A3 3 0 0118 15.75M12 20.25a9.094 9.094 0 01-3.741-.479 3 3 0 01-4.682-2.72m7.5-2.226V20.25m0-2.25a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 01-3-3m0 0a3 3 0 013-3m0 0a3 3 0 013-3m0 0a3 3 0 00-3-3m-3 9A3 3 0 007.5 4.5m0 9a3 3 0 01-3-3M15 4.5A3 3 0 0012 1.5m0 9a3 3 0 00-3-3" /></svg>
                                }>
                                    {profile.companySize} сотрудников
                                </DetailItem>
                                <DetailItem label="Отрасли" icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.125-1.5M12 16.5v5.25m0 0l-1.125-1.5m1.125 1.5l1.125-1.5" /></svg>
                                }>
                                    {profile.serviceCategories.join(', ')}
                                </DetailItem>
                                {profile.website && (
                                    <DetailItem label="Веб-сайт" icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                                    }>
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline break-all block">
                                            {profile.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </DetailItem>
                                )}
                            </div>
                        </div>

                         <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                             <h3 className="text-xl font-semibold mb-4 text-brand-text-primary">Контакт</h3>
                             <p className="text-sm text-brand-text-secondary mb-4">Хотите сотрудничать с этой компанией? Подайте заявку на их вакансии.</p>
                             {profile.contactPerson.showEmailPublicly && (
                                <p className="mb-2"><strong>E-mail:</strong> <a href={`mailto:${profile.contactPerson.email}`} className="text-brand-primary hover:underline break-all">{profile.contactPerson.email}</a></p>
                             )}
                             {profile.contactPerson.showPhonePublicly && (
                                <p className="mb-2"><strong>Телефон:</strong> {profile.contactPerson.phone}</p>
                             )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublicCompanyProfilePage;