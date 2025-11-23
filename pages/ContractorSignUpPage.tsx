import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, ContractorProfile, ContractorPortfolioProject } from '../types';
import { COUNTRIES } from '../utils/countries';
import api from '../services/apiService';
import BackButton from '../components/BackButton';

const FormSection: React.FC<{ title: string; number: string; children: React.ReactNode; description?: string }> = ({ title, number, children, description }) => (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
        <h2 className="text-xl font-bold text-brand-text-primary mb-2 flex items-center">
            <span className="bg-brand-primary/10 text-brand-primary rounded-full h-8 w-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">{number}</span> {title}
        </h2>
        {description && <p className="text-brand-text-secondary mb-6 ml-11 text-sm">{description}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
);
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
        <input {...props} className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary" />
    </div>
);
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }> = ({ label, children, ...props }) => (
     <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
        <select {...props} className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary">{children}</select>
    </div>
);
const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div className="md:col-span-2">
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
        <textarea {...props} rows={4} className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary"></textarea>
    </div>
);

const ContractorSignUpPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRef = useRef<HTMLInputElement>(null);
    const portfolioFileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [uploadingPortfolioIndex, setUploadingPortfolioIndex] = useState<number | null>(null);

    const [profileData, setProfileData] = useState<ContractorProfile>({
        id: '', companyName: '', tradingName: '', companyType: 'Sole Proprietor', vatId: '', slogan: '', description: '',
        address: { street: '', zip: '', city: '', country: 'Poland' },
        contactPerson: { fullName: '', role: 'Owner', phone: '', email: '', showEmailPublicly: false, showPhonePublicly: false },
        website: '', socials: { linkedin: '' }, portfolio: [], coverImageUrl: '', logoUrl: '', serviceCategories: [],
        team: { companySize: 1 }, skills: [], languages: [], experienceYears: 0, rating: 0, views: 0,
    });
    const [accountData, setAccountData] = useState({ email: '', password: '', confirmPassword: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (section: 'address' | 'contactPerson' | 'team' | 'socials', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    };

    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAccountData(prev => ({...prev, [name]: value}));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'logoUrl' | 'coverImageUrl', setUploading: (isUploading: boolean) => void) => {
        if (!e.target.files) return;
        setUploading(true);
        const file = e.target.files[0];
        try {
            const url = await api.mockUploadImage(file);
            setProfileData(p => ({ ...p, [imageType]: url }));
        } catch (err) { console.error(err); } finally { setUploading(false); }
    };
    
    const handlePortfolioChange = (index: number, field: keyof ContractorPortfolioProject, value: string | number) => {
        const updatedPortfolio = [...profileData.portfolio];
        // @ts-ignore
        updatedPortfolio[index][field] = value;
        setProfileData(p => ({ ...p, portfolio: updatedPortfolio }));
    };

    const addPortfolioItem = () => {
        if (profileData.portfolio.length >= 3) return;
        const newItem: ContractorPortfolioProject = { id: `new-${Date.now()}`, title: '', description: '', location: '', dateStart: '', dateEnd: '', projectValue: 0, currency: 'EUR', images: [] };
        setProfileData(p => ({ ...p, portfolio: [...p.portfolio, newItem] }));
    };

    const removePortfolioItem = (index: number) => {
        setProfileData(p => ({ ...p, portfolio: p.portfolio.filter((_, i) => i !== index) }));
    };

     const handlePortfolioPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
        if (!e.target.files) return;
        setUploadingPortfolioIndex(itemIndex);
        const files = Array.from(e.target.files);
        try {
            const urls = await Promise.all(files.map(file => api.mockUploadImage(file)));
            const updatedPortfolio = [...profileData.portfolio];
            updatedPortfolio[itemIndex].images.push(...urls);
            setProfileData(p => ({ ...p, portfolio: updatedPortfolio }));
        } catch (err) { console.error(err); } finally { setUploadingPortfolioIndex(null); }
    };
    
    const removePortfolioPhoto = (itemIndex: number, imageIndex: number) => {
        const updatedPortfolio = [...profileData.portfolio];
        updatedPortfolio[itemIndex].images.splice(imageIndex, 1);
        setProfileData(p => ({ ...p, portfolio: updatedPortfolio }));
    };

    const goToNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setAccountData(prev => ({ ...prev, email: profileData.contactPerson.email }));
        setStep(2);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (accountData.password !== accountData.confirmPassword) {
            setError('Passwords do not match.'); return;
        }
        setIsSubmitting(true);
        try {
            await signup(UserRole.Contractor, profileData, { email: accountData.email });
            navigate('/contractor/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            <div className="absolute top-6 left-6">
                <BackButton className="" />
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
                <h1 className="text-3xl font-bold text-center text-brand-text-primary mb-2">Добро пожаловать, Подрядчик!</h1>
                <p className="text-center text-brand-text-secondary mb-8">Давайте создадим ваш профиль, чтобы клиенты могли вас найти.</p>
                
                <div className="w-full max-w-xs mx-auto mb-8">
                    <ol className="flex items-center w-full">
                        <li className={`flex w-full items-center ${step === 2 ? 'text-brand-primary after:border-brand-primary' : 'text-gray-500 after:border-gray-200'} after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block`}>
                            <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 shrink-0">1</span>
                        </li>
                        <li className="flex items-center">
                            <span className={`flex items-center justify-center w-10 h-10 ${step === 2 ? 'bg-brand-primary text-white' : 'bg-gray-100'} rounded-full lg:h-12 lg:w-12 shrink-0`}>2</span>
                        </li>
                    </ol>
                </div>

                {step === 1 && (
                    <form onSubmit={goToNextStep} className="space-y-8">
                        <FormSection number="A" title="Основная информация">
                            <FormInput label="Название компании / ФИО" id="companyName" name="companyName" required value={profileData.companyName} onChange={handleInputChange} />
                            <FormSelect label="Тип компании" id="companyType" name="companyType" value={profileData.companyType} onChange={handleInputChange}>
                                <option>Sole Proprietor</option><option>Partnership</option><option>LLC</option><option>Other</option>
                            </FormSelect>
                            <FormTextarea label="Описание" id="description" name="description" value={profileData.description} onChange={handleInputChange} />
                        </FormSection>

                        <FormSection number="B" title="Адрес">
                            <FormInput label="Улица" id="street" name="street" required value={profileData.address.street} onChange={e => handleNestedChange('address', e)} />
                            <FormInput label="Индекс" id="zip" name="zip" required value={profileData.address.zip} onChange={e => handleNestedChange('address', e)} />
                            <FormInput label="Город" id="city" name="city" required value={profileData.address.city} onChange={e => handleNestedChange('address', e)} />
                            <FormSelect label="Страна" id="country" name="country" value={profileData.address.country} onChange={e => handleNestedChange('address', e)} required>
                                {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                            </FormSelect>
                        </FormSection>
                        
                        <FormSection number="C" title="Контактные данные">
                             <FormInput label="Полное имя контактного лица" id="fullName" name="fullName" required value={profileData.contactPerson.fullName} onChange={e => handleNestedChange('contactPerson', e)} />
                             <FormInput label="Должность" id="role" name="role" required value={profileData.contactPerson.role} onChange={e => handleNestedChange('contactPerson', e)} />
                             <FormInput label="Телефон" id="phone" name="phone" required value={profileData.contactPerson.phone} onChange={e => handleNestedChange('contactPerson', e)} />
                             <FormInput label="Email" id="email" name="email" type="email" required value={profileData.contactPerson.email} onChange={e => handleNestedChange('contactPerson', e)} />
                        </FormSection>
                         <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                            <h2 className="text-xl font-bold text-brand-text-primary mb-4">Портфолио</h2>
                            <div className="space-y-6">
                                {profileData.portfolio.map((item, index) => (
                                    <div key={item.id} className="bg-brand-background p-4 rounded-lg border border-brand-border relative">
                                        <button type="button" onClick={() => removePortfolioItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 font-bold text-2xl leading-none">&times;</button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput label="Название проекта" value={item.title} onChange={e => handlePortfolioChange(index, 'title', e.target.value)} />
                                            <FormInput label="Местоположение" value={item.location} onChange={e => handlePortfolioChange(index, 'location', e.target.value)} />
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-brand-text-primary mb-1">Описание</label>
                                                <textarea value={item.description} onChange={e => handlePortfolioChange(index, 'description', e.target.value)} rows={3} className="w-full bg-brand-surface border border-brand-border rounded-md px-3 py-2"></textarea>
                                            </div>
                                             <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-brand-text-primary mb-2">Фото (до 5)</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                                    {item.images.map((img, imgIndex) => (
                                                        <div key={imgIndex} className="relative group">
                                                            <img src={img} alt={`Portfolio ${imgIndex + 1}`} className="rounded-lg object-cover aspect-video" />
                                                            <button type="button" onClick={() => removePortfolioPhoto(index, imgIndex)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100">&#x2715;</button>
                                                        </div>
                                                    ))}
                                                    {item.images.length < 5 && (
                                                        <button type="button" onClick={() => { if (portfolioFileInputRef.current) { portfolioFileInputRef.current.onchange = (e) => handlePortfolioPhotoUpload(e as any, index); portfolioFileInputRef.current.click(); } }} disabled={uploadingPortfolioIndex === index} className="border-2 border-dashed ...">
                                                            {uploadingPortfolioIndex === index ? 'Загрузка...' : '+'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addPortfolioItem} disabled={profileData.portfolio.length >= 3} className="mt-4 bg-brand-background hover:bg-gray-100 border ...">
                                + Добавить проект в портфолио ({profileData.portfolio.length}/3)
                            </button>
                        </div>
                        <input type="file" ref={portfolioFileInputRef} multiple accept="image/*" className="hidden" />

                        <div className="flex justify-end">
                            <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-6 rounded-lg">Продолжить</button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleFinalSubmit}>
                         <div className="bg-brand-surface p-8 rounded-lg border border-brand-border space-y-6">
                            <h2 className="text-xl font-bold text-brand-text-primary text-center">Создайте свой аккаунт</h2>
                            <FormInput label="Email" id="email" name="email" type="email" required value={accountData.email} onChange={handleAccountChange} />
                            <FormInput label="Пароль" id="password" name="password" type="password" required value={accountData.password} onChange={handleAccountChange} />
                            <FormInput label="Подтвердите пароль" id="confirmPassword" name="confirmPassword" type="password" required value={accountData.confirmPassword} onChange={handleAccountChange} />
                             {error && <p className="text-brand-red text-sm text-center">{error}</p>}
                            <div className="flex items-center justify-between pt-4">
                                <button type="button" onClick={() => setStep(1)} className="text-brand-text-secondary font-bold py-2 px-6 rounded-lg hover:bg-brand-background">Назад</button>
                                <button type="submit" disabled={isSubmitting} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Создание...' : 'Создать аккаунт'}
                                </button>
                            </div>
                         </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContractorSignUpPage;