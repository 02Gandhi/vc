import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { Job, Application, Contractor } from '../types';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import ImageLightbox from '../components/ImageLightbox';
import BackButton from '../components/BackButton';

const countryCodeToName: { [key: string]: string } = {
    'DE': 'Германия', 'NL': 'Нидерланды', 'AT': 'Австрия', 'BE': 'Бельгия', 
    'LU': 'Люксембург', 'FR': 'Франция', 'CH': 'Швейцария', 'PL': 'Польша'
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

const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => {
    const { contractor, message } = application;
    return (
        <div className="bg-brand-surface p-5 rounded-lg border border-brand-border">
            <div className="flex items-start space-x-4">
                <img className="h-12 w-12 rounded-full" src={contractor.avatar} alt={`${contractor.name} avatar`} />
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-brand-text-primary">{contractor.name}</p>
                            <div className="flex items-center text-sm text-yellow-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <span>{contractor.rating}</span>
                            </div>
                        </div>
                        <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2 px-4 rounded-md text-sm">
                            Связаться
                        </button>
                    </div>
                    <p className="mt-3 text-brand-text-primary bg-brand-background p-3 rounded-md">{message}</p>
                </div>
            </div>
        </div>
    );
};


const ClientJobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                setLoading(true);
                try {
                    const [fetchedJob, fetchedApplications] = await Promise.all([
                        api.fetchJobById(id),
                        api.fetchJobApplications(id)
                    ]);
                    setJob(fetchedJob || null);
                    setApplications(fetchedApplications);
                } catch (error) {
                    console.error("Failed to load job details:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [id]);
    
    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        setIsLightboxOpen(true);
    };

    const handleDeleteJob = async () => {
        if (!job || !isDeleteConfirmed) return;
        setIsDeleting(true);
        try {
            await api.deleteJob(job.id);
            alert('Заказ успешно удален.');
            navigate('/client/orders');
        } catch (error) {
            console.error("Failed to delete job:", error);
            alert('Не удалось удалить заказ. Пожалуйста, попробуйте снова.');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setIsDeleteConfirmed(false);
        }
    };


    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">Загрузка деталей заказа...</div>;
    }

    if (!job) {
        return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">Заказ не найден.</div>;
    }

    const budgetText = job.budget.type === 'fixed' 
        ? `€${job.budget.amount?.toLocaleString()}` 
        : `€${job.budget.minAmount} - €${job.budget.maxAmount} / час`;

    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                    <div className="container mx-auto">
                        <BackButton to="/client/orders" />
                        <div className="mb-6">
                            <p className="text-sm text-brand-text-secondary">
                                <Link to="/client/orders" className="hover:text-brand-text-primary">Мои заказы</Link> / {job.title}
                            </p>
                            <h1 className="text-4xl font-bold text-brand-text-primary mt-2">{job.title}</h1>
                            <p className="text-brand-text-secondary mt-2">
                                📍 {job.city}, {countryCodeToName[job.country] || job.country} • Статус: <span className="text-brand-primary font-semibold">{job.status}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
                                label="Бюджет" 
                                value={budgetText} 
                            />
                             <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                label="Длительность" 
                                value={`${job.duration_days} дн.`}
                            />
                            <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                label="Просмотры"
                                value={job.views}
                            />
                            <InfoCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                label="Заявки" 
                                value={job.applications}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <DetailSection title="Описание проекта">
                                    <p className="whitespace-pre-line">{job.details.projectDescription}</p>
                                     {job.details.additionalComments && <p className="whitespace-pre-line mt-4 p-4 bg-brand-background rounded-lg border-l-4 border-brand-primary">{job.details.additionalComments}</p>}
                                </DetailSection>
                                
                                <DetailSection title="Требования к персоналу">
                                    <div className="space-y-2">
                                        <DetailListItem label="Количество сотрудников" value={job.details.numberOfEmployees} />
                                        <DetailListItem label="Язык общения" value={job.details.communicationLanguage === 'other' ? job.details.otherLanguage : job.details.communicationLanguage} />
                                        <DetailListItem label="Минимальный уровень языка" value={job.details.minLanguageLevel} />
                                        <DetailListItem label="Сотрудники со знанием языка" value={job.details.languageProficientEmployees} />
                                        <DetailListItem label="Предпочтительные страны" value={job.details.preferredContractorCountry} />
                                    </div>
                                </DetailSection>

                                <DetailSection title="Условия и ресурсы">
                                    <div className="space-y-2">
                                        <DetailListItem label="Рабочие дни" value={job.details.workDays} />
                                        <DetailListItem label="Часов в неделю" value={job.details.workHoursPerWeek} />
                                        <DetailListItem label="Инструменты" value={job.details.toolsProvided} />
                                        <DetailListItem label="Проживание" value={job.details.accommodationProvided} />
                                        <DetailListItem label="Условия оплаты" value={job.details.invoicingTerms} />
                                    </div>
                                </DetailSection>

                                <DetailSection title="Галерея проекта">
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

                                <DetailSection title="Заявки">
                                    {applications.length > 0 ? (
                                        <div className="space-y-4">
                                            {applications.map(app => <ApplicationCard key={app.id} application={app} />)}
                                        </div>
                                    ) : (
                                        <p className="text-brand-text-secondary">Пока нет заявок.</p>
                                    )}
                                </DetailSection>

                                <DetailSection title="Контакты открыты">
                                    {job.unlockedBy && job.unlockedBy.length > 0 ? (
                                        <div className="space-y-4">
                                            {job.unlockedBy.map(unlock => (
                                                <div key={unlock.contractorId} className="bg-brand-background p-4 rounded-lg flex justify-between items-center">
                                                    <div className="flex items-center space-x-4">
                                                        {unlock.contractorCountryCode && (
                                                            <img 
                                                                src={`https://flagcdn.com/w40/${unlock.contractorCountryCode.toLowerCase()}.png`}
                                                                alt={`${unlock.contractorName} country flag`}
                                                                className="h-6 w-auto rounded-sm shadow-md"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-brand-text-primary">{unlock.contractorName}</p>
                                                            <p className="text-sm text-brand-text-secondary">Открыто: {new Date(unlock.unlockedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Link to={`/contractor/profile/${unlock.contractorId}`} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2 px-4 rounded-md text-sm">
                                                        Профиль
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-brand-text-secondary">Ни один подрядчик еще не открыл контактные данные.</p>
                                    )}
                                </DetailSection>

                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-brand-surface p-6 rounded-lg sticky top-24 border border-brand-border">
                                    <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Управление заказом</h3>
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                                        >
                                            Удалить заказ
                                        </button>
                                    </div>
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
                 {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-brand-surface p-8 rounded-lg max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-brand-text-primary">Подтверждение удаления</h3>
                            <p className="mt-4 text-brand-text-secondary">Вы уверены, что хотите удалить этот заказ? Кредиты не возвращаются.</p>
                            <div className="mt-6 flex items-center">
                                <input
                                    type="checkbox"
                                    id="confirm-delete"
                                    checked={isDeleteConfirmed}
                                    onChange={() => setIsDeleteConfirmed(!isDeleteConfirmed)}
                                    className="h-4 w-4 text-brand-primary bg-brand-background border-brand-border rounded focus:ring-brand-primary"
                                />
                                <label htmlFor="confirm-delete" className="ml-2 text-sm text-brand-text-primary">
                                    Я подтверждаю это действие.
                                </label>
                            </div>
                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setIsDeleteConfirmed(false);
                                    }}
                                    className="bg-brand-background hover:bg-gray-100 border border-brand-border text-brand-text-secondary font-bold py-2 px-4 rounded-lg"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleDeleteJob}
                                    disabled={!isDeleteConfirmed || isDeleting}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? 'Удаление...' : 'Подтвердить удаление'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientJobDetailPage;