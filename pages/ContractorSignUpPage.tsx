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
        address: { street: '', zip: '', city: '', country: 'Польша' },
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
            const urls = await Promise.all(files.map((file: File) => api.mockUploadImage(file)));
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
            setError('Пароли не совпадают.'); return;
        }
        setIsSubmitting(true);
        try {
            await signup(UserRole.Contractor, profileData, { email: accountData.email });
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Не удалось создать аккаунт.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            <div className="absolute top-6 left-6">
                <BackButton className="" to="/signup" />
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
                         <FormSection number="⭐" title="Брендинг и внешний вид" description="Загрузите логотип и обложку.">
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-brand-text-primary mb-1">Логотип</label>
                                    <div className="relative h-24 w-24 rounded-full bg-brand-background border border-brand-border flex items-center justify-center overflow-hidden">
                                        {isUploadingLogo ? <p>...</p> : profileData.logoUrl ? <img src={profileData.logoUrl} alt="Logo" className="h-full w-full object-cover" /> : <span className="text-xs">Нет логотипа</span>}
                                    </div>
                                </div>
                                <div>
                                    <button type="button" onClick={() => logoFileInputRef.current?.click()} disabled={isUploadingLogo} className="bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-4 rounded-lg">
                                        {isUploadingLogo ? 'Загрузка...' : 'Загрузить логотип'}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-brand-text-primary mb-1">Обложка</label>
                                <div className="relative group w-full h-40 bg-brand-background rounded-lg border border-brand-border flex items-center justify-center overflow-hidden">
                                    {isUploadingCover ? <p>...</p> : profileData.coverImageUrl ? <img src={profileData.coverImageUrl} alt="Cover" className="h-full w-full object-cover" /> : <span className="text-xs">Нет обложки</span>}
                                </div>
                                <button type="button" onClick={() => coverFileInputRef.current?.click()} className="mt-2 bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-4 rounded-lg">
                                    {isUploadingCover ? 'Загрузка...' : 'Загрузить обложку'}
                                </button>
                            </div>
                        </FormSection>
                        
                        <FormSection number="A" title="Основная информация">
                            <FormInput label="Название компании" id="companyName" name="companyName" required value={profileData.companyName} onChange={handleInputChange} />
                            <FormInput label="Торговое название (если есть)" id="tradingName" name="tradingName" value={profileData.tradingName} onChange={handleInputChange} />
                            <FormSelect label="Тип компании" id="companyType" name="companyType" value={profileData.companyType} onChange={handleInputChange}>
                                <option>ИП</option><option>Партнерство</option><option>ООО</option><option>Другое</option>
                            </FormSelect>
                            <FormInput label="ИНН / VAT ID" id="vatId" name="vatId" value={profileData.vatId} onChange={handleInputChange} />
                            <FormTextarea label="Слоган" id="slogan" name="slogan" value={profileData.slogan} onChange={handleInputChange} />
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
                             <FormInput label="Полное имя" id="fullName" name="fullName" required value={profileData.contactPerson.fullName} onChange={e => handleNestedChange('contactPerson', e)} />
                             <FormInput label="Должность" id="role" name="role" required value={profileData.contactPerson.role} onChange={e => handleNestedChange('contactPerson', e)} />
                             <FormInput label="Телефон" id="phone" name="phone" required value={profileData.contactPerson.phone} onChange={e => handleNestedChange('contactPerson', e)} />
                             <FormInput label="E-mail" id="email" name="email" type="email" required value={profileData.contactPerson.email} onChange={e => handleNestedChange('contactPerson', e)} />
                             <FormInput label="Веб-сайт" id="website" name="website" value={profileData.website} onChange={handleInputChange} />
                             <FormInput label="LinkedIn профиль" id="linkedin" name="linkedin" value={profileData.socials?.linkedin} onChange={handleInputChange} />
                        </FormSection>

                        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                            <h2 className="text-xl font-bold text-brand-text-primary mb-4">G. Портфолио</h2>
                            <div className="space-y-6">
                                {profileData.portfolio.map((item, index) => (
                                    <div key={item.id} className="bg-brand-background p-4 rounded-lg border border-brand-border relative">
                                        <button type="button" onClick={() => removePortfolioItem(index)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput label="Название проекта" value={item.title} onChange={e => handlePortfolioChange(index, 'title', e.target.value)} id={`p-title-${index}`}/>
                                            <FormInput label="Местоположение" value={item.location} onChange={e => handlePortfolioChange(index, 'location', e.target.value)} id={`p-loc-${index}`}/>
                                            <div className="md:col-span-2">
                                                 <label className="block text-sm font-medium text-brand-text-primary mb-1">Описание</label>
                                                 <textarea value={item.description} onChange={e => handlePortfolioChange(index, 'description', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-md px-3 py-2"></textarea>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-brand-text-primary mb-2">Фото (макс 5)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.images.map((img, imgIdx) => (
                                                        <div key={imgIdx} className="relative h-20 w-32">
                                                            <img src={img} alt="Project" className="h-full w-full object-cover rounded-md" />
                                                            <button type="button" onClick={() => removePortfolioPhoto(index, imgIdx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs">x</button>
                                                        </div>
                                                    ))}
                                                    {item.images.length < 5 && (
                                                        <button type="button" onClick={() => { if(portfolioFileInputRef.current) { portfolioFileInputRef.current.onchange = (e) => handlePortfolioPhotoUpload(e as any, index); portfolioFileInputRef.current.click(); } }} disabled={uploadingPortfolioIndex === index} className="h-20 w-32 border-2 border-dashed border-brand-border rounded-md flex items-center justify-center text-sm text-brand-text-secondary">
                                                            {uploadingPortfolioIndex === index ? '...' : '+ Добавить'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {profileData.portfolio.length < 3 && (
                                    <button type="button" onClick={addPortfolioItem} className="w-full py-2 border border-brand-border rounded-lg text-brand-text-secondary hover:bg-brand-background font-bold">+ Добавить проект в портфолио</button>
                                )}
                            </div>
                        </div>
                        
                        <input type="file" ref={logoFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl', setIsUploadingLogo)} />
                        <input type="file" ref={coverFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'coverImageUrl', setIsUploadingCover)} />
                        <input type="file" ref={portfolioFileInputRef} accept="image/*" className="hidden" />

                        <div className="flex justify-end">
                            <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-6 rounded-lg">Далее</button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleFinalSubmit}>
                         <div className="bg-brand-surface p-8 rounded-lg border border-brand-border space-y-6">
                            <h2 className="text-xl font-bold text-brand-text-primary text-center">Создать аккаунт</h2>
                            <FormInput label="E-mail" id="email" name="email" type="email" required value={accountData.email} onChange={handleAccountChange} />
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