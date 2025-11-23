import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { Job, Contractor, CompanyProfile } from '../types';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import ImageLightbox from '../components/ImageLightbox';
import BackButton from '../components/BackButton';

const countryCodeToName: { [key: string]: string } = {
    'DE': 'Germany', 'NL': 'Netherlands', 'AT': 'Austria', 'BE': 'Belgium',
    'LU': 'Luxembourg', 'FR': 'France', 'CH': 'Switzerland', 'PL': 'Poland'
};

const InfoCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-brand-surface p-4 rounded-lg flex items-center border border-brand-border">
        <div className="flex-shrink-0 bg-brand-background rounded-full p-3 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-brand-text-secondary">{label}</p>
            <p className="text-lg font-semibold text-brand-text-primary">{value}</p>
        </div>
    </div>
);

const DetailSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-semibold text-brand-text-primary mb-4 pb-2 border-b border-brand-border">{title}</h2>
        <div className="text-brand-text-primary leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

const DetailListItem: React.FC<{ label: string, value?: string | number | boolean | string[]}> = ({ label, value }) => {
    let displayValue;
    if (typeof value === 'boolean') {
        displayValue = value ? 'Да' : 'Нет';
    } else if (value === 'yes') {
        displayValue = 'Да';
    } else if (value === 'no') {
        displayValue = 'Нет';
    } else if (value === 'unspecified') {
        displayValue = 'Не указано';
    } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
    } else {
        displayValue = value || 'Не указано';
    }
    
    return (
        <div className="grid grid-cols-2">
            <p className="font-semibold text-brand-text-secondary">{label}:</p>
            <p>{displayValue}</p>
        </div>
    );
}

const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [clientProfile, setClientProfile] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState('');

    const contractor = user as Contractor;
    const isUnlocked = job?.unlockedBy?.some(u => u.contractorId === contractor?.id) ?? false;
    const hasApplied = job?.appliedBy?.includes(contractor?.id) ?? false;
    
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                setLoading(true);
                try {
                    const fetchedJob = await api.fetchJobById(id);
                    if (fetchedJob) {
                        setJob(fetchedJob);
                        if (fetchedJob.unlockedBy?.some(u => u.contractorId === user?.id)) {
                             const client = await api.fetchCompanyProfile(fetchedJob.posted_by.id);
                             setClientProfile(client || null);
                        }
                    } else {
                        setError("Job not found.");
                    }
                } catch (err) {
                    console.error("Failed to load job", err);
                    setError("Failed to load job details.");
                } finally {
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [id, user]);

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        setIsLightboxOpen(true);
    };
    
    const handleUnlockContact = async () => {
        if (!job || !contractor) return;
        setIsUnlocking(true);
        setError('');
        try {
            const { updatedJob, updatedContractor } = await api.unlockJobContact(job.id, contractor);
            setJob(updatedJob);
            updateUser(updatedContractor);
            const client = await api.fetchCompanyProfile(updatedJob.posted_by.id);
            setClientProfile(client || null);
        } catch (err: any) {
            setError(err.message || 'Failed to unlock contact.');
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!job || !contractor) return;
        setIsApplying(true);
        setError('');
        try {
            await api.submitApplication(job.id, contractor.id, applicationMessage);
            setJob(prev => prev ? ({ ...prev, appliedBy: [...(prev.appliedBy || []), contractor.id], applications: prev.applications + 1 }) : null);
            setIsApplyModalOpen(false);
            setApplicationMessage('');
        } catch (err: any) {
            setError(err.message || 'Failed to submit application.');
        } finally {
            setIsApplying(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">Loading job details...</div>;
    }

    if (error && !job) {
        return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">{error}</div>;
    }
    
    if (!job) {
        return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">Job not found.</div>;
    }

    const budgetText = job.budget.type === 'fixed' 
        ? `€${job.budget.amount?.toLocaleString()}` 
        : `€${job.budget.minAmount} - €${job.budget.maxAmount} / hour`;
        
    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                    <div className="container mx-auto">
                        <BackButton />
                        <div className="mb-6">
                             <p className="text-sm text-brand-text-secondary">
                                <Link to="/contractor/dashboard" className="hover:text-brand-text-primary">All Jobs</Link> / {job.title}
                            </p>
                            <h1 className="text-4xl font-bold text-brand-text-primary mt-2">{job.title}</h1>
                             <p className="text-brand-text-secondary mt-2">
                                📍 {job.city}, {countryCodeToName[job.country] || job.country} • Posted by: <Link to={`/company/${job.posted_by.id}`} className="font-semibold text-brand-primary hover:underline">{job.posted_by.company}</Link>
                            </p>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                           <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
                                label="Budget" 
                                value={budgetText} 
                            />
                             <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                label="Duration" 
                                value={`${job.duration_days} days`}
                            />
                             <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                label="Views"
                                value={job.views}
                            />
                             <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                label="Applications" 
                                value={job.applications}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="lg:col-span-2">
                                <DetailSection title="Project Description">
                                    <p className="whitespace-pre-line">{job.details.projectDescription}</p>
                                     {job.details.additionalComments && <p className="whitespace-pre-line mt-4 p-4 bg-brand-background rounded-lg border-l-4 border-brand-primary">{job.details.additionalComments}</p>}
                                </DetailSection>

                                 <DetailSection title="Workforce Requirements">
                                    <div className="space-y-2">
                                        <DetailListItem label="Количество сотрудников" value={job.details.numberOfEmployees} />
                                        <DetailListItem label="Язык общения" value={job.details.communicationLanguage === 'other' ? job.details.otherLanguage : job.details.communicationLanguage} />
                                        <DetailListItem label="Минимальный уровень языка" value={job.details.minLanguageLevel} />
                                        <DetailListItem label="Сотрудников со знанием языка" value={job.details.languageProficientEmployees} />
                                        <DetailListItem label="Предпочитаемая страна подрядчика" value={job.details.preferredContractorCountry} />
                                    </div>
                                </DetailSection>

                                <DetailSection title="Conditions & Terms">
                                    <div className="space-y-2">
                                        <DetailListItem label="Рабочие дни" value={job.details.workDays} />
                                        <DetailListItem label="Часов в неделю" value={job.details.workHoursPerWeek} />
                                        <DetailListItem label="Инструмент" value={job.details.toolsProvided} />
                                        <DetailListItem label="Материалы" value={job.details.materialsProvided} />
                                        <DetailListItem label="Жильё" value={job.details.accommodationProvided} />
                                        <DetailListItem label="Условия оплаты" value={job.details.invoicingTerms} />
                                    </div>
                                </DetailSection>

                                 <DetailSection title="Project Gallery">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {job.photos.map((photo, index) => (
                                             <div key={index} className="cursor-pointer group overflow-hidden rounded-lg" onClick={() => openLightbox(index)}>
                                                <img 
                                                    src={photo} 
                                                    alt={`Project photo ${index + 1}`} 
                                                    className="rounded-lg object-cover aspect-video w-full h-full group-hover:scale-105 transition-transform duration-300" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </DetailSection>
                            </div>
                            <div className="lg:col-span-1">
                                <div className="bg-brand-surface p-6 rounded-lg sticky top-24 border border-brand-border">
                                    <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Actions</h3>
                                     {isUnlocked ? (
                                        <div className="bg-brand-background p-4 rounded-lg border border-brand-border mb-4">
                                            <h4 className="font-bold text-brand-text-primary">Contact Information Unlocked</h4>
                                             {clientProfile ? (
                                                <div className="text-sm mt-2 space-y-1">
                                                    <p><span className="font-semibold">Name:</span> {clientProfile.contactPerson.fullName}</p>
                                                    <p><span className="font-semibold">Role:</span> {clientProfile.contactPerson.role}</p>
                                                    <p><span className="font-semibold">Email:</span> <a href={`mailto:${clientProfile.contactPerson.email}`} className="text-brand-primary hover:underline">{clientProfile.contactPerson.email}</a></p>
                                                    <p><span className="font-semibold">Phone:</span> {clientProfile.contactPerson.phone}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm mt-2">Loading contact details...</p>
                                            )}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={handleUnlockContact} 
                                            disabled={isUnlocking}
                                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50">
                                            {isUnlocking ? 'Unlocking...' : 'Unlock Contact (10 credits)'}
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => setIsApplyModalOpen(true)}
                                        disabled={!isUnlocked || hasApplied}
                                        className="w-full mt-4 bg-brand-green hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                        {hasApplied ? 'Already Applied' : 'Apply for this Job'}
                                    </button>
                                    {!isUnlocked && <p className="text-xs text-brand-text-secondary mt-2 text-center">You must unlock contact details before applying.</p>}
                                    {error && <p className="text-brand-red text-sm mt-4">{error}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                     {isLightboxOpen && (
                        <ImageLightbox
                            images={job.photos}
                            initialIndex={selectedImageIndex}
                            onClose={() => setIsLightboxOpen(false)}
                        />
                    )}
                </main>
                
                {isApplyModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-brand-surface p-8 rounded-lg max-w-lg w-full mx-4">
                            <h3 className="text-xl font-bold text-brand-text-primary">Submit Application</h3>
                            <p className="mt-2 text-brand-text-secondary">Write a short message to the client.</p>
                            <form onSubmit={handleApply} className="mt-6">
                                <textarea
                                    value={applicationMessage}
                                    onChange={(e) => setApplicationMessage(e.target.value)}
                                    placeholder="Introduce yourself and your team..."
                                    rows={5}
                                    required
                                    className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary"
                                ></textarea>
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsApplyModalOpen(false)}
                                        className="bg-brand-background hover:bg-gray-100 border border-brand-border text-brand-text-secondary font-bold py-2 px-4 rounded-lg"
                                        disabled={isApplying}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isApplying}
                                        className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isApplying ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetailPage;