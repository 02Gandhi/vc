import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, CompanyProfile } from '../types';
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
const FormToggle: React.FC<{ label: string; enabled: boolean; onChange: () => void; description: string; }> = ({ label, enabled, onChange, description }) => (
    <div>
        <div className="flex items-center">
             <label className="block text-sm font-medium text-brand-text-primary mr-4">{label}</label>
            <button
                type="button"
                className={`${enabled ? 'bg-brand-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
                onClick={onChange}
            >
                <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
            </button>
        </div>
         <p className="text-xs text-brand-text-secondary mt-1">{description}</p>
    </div>
);


const ClientSignUpPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    const [profileData, setProfileData] = useState<CompanyProfile>({
        id: '',
        companyName: '',
        tradingName: '',
        companyType: 'GmbH',
        vatId: '',
        description: '',
        slogan: '',
        contactPerson: { fullName: '', role: '', phone: '', email: '', showEmailPublicly: true, showPhonePublicly: false },
        website: '',
        linkedin: '',
        address: { street: '', zip: '', city: '', country: 'Germany' },
        operationalCountries: [],
        serviceCategories: [],
        companySize: 50,
        portfolio: [],
        status: 'draft',
        coverImageUrl: '',
        logoUrl: '',
    });
    const [accountData, setAccountData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNestedChange = (section: 'address' | 'contactPerson', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value
            }
        }));
    };

     const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'logoUrl' | 'coverImageUrl', setUploading: (isUploading: boolean) => void) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        try {
            const uploadedUrl = await api.mockUploadImage(file);
            setProfileData(prev => ({ ...prev, [imageType]: uploadedUrl }));
        } catch (err) {
            console.error(`Upload failed for ${imageType}`, err);
        } finally {
            setUploading(false);
        }
    };


    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAccountData(prev => ({...prev, [name]: value}));
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
            setError('Passwords do not match.');
            return;
        }
        setIsSubmitting(true);
        try {
            await signup(UserRole.Client, profileData, { email: accountData.email });
            navigate('/client/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
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
                <h1 className="text-3xl font-bold text-center text-brand-text-primary mb-2">Добро пожаловать, Заказчик!</h1>
                <p className="text-center text-brand-text-secondary mb-8">Давайте настроим ваш профиль компании.</p>

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
                         <FormSection number="⭐" title="Брендинг и внешний вид" description="Загрузите логотип вашей компании и фото обложки для вашего профиля.">
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-brand-text-primary mb-1">Логотип</label>
                                    <div className="relative h-24 w-24 rounded-full bg-brand-background border border-brand-border flex items-center justify-center overflow-hidden">
                                        {isUploadingLogo ? <p>...</p> : profileData.logoUrl ? <img src={profileData.logoUrl} alt="Logo" className="h-full w-full object-cover" /> : <span className="text-xs">Нет лого</span>}
                                    </div>
                                </div>
                                <div>
                                    <button type="button" onClick={() => logoFileInputRef.current?.click()} disabled={isUploadingLogo} className="bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-4 rounded-lg">
                                        {isUploadingLogo ? 'Загрузка...' : 'Загрузить лого'}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-brand-text-primary mb-1">Фото обложки</label>
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
                                <option>GmbH</option><option>AG</option><option>Sole Proprietorship</option><option>Other</option>
                            </FormSelect>
                            <FormInput label="VAT ID" id="vatId" name="vatId" value={profileData.vatId} onChange={handleInputChange} />
                            <FormTextarea label="Слоган" id="slogan" name="slogan" value={profileData.slogan} onChange={handleInputChange} />
                            <FormTextarea label="Описание компании" id="description" name="description" value={profileData.description} onChange={handleInputChange} />
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
                             <FormInput label="Веб-сайт" id="website" name="website" value={profileData.website} onChange={handleInputChange} />
                             <FormInput label="Профиль LinkedIn" id="linkedin" name="linkedin" value={profileData.linkedin} onChange={handleInputChange} />
                        </FormSection>
                        
                        <input type="file" ref={logoFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl', setIsUploadingLogo)} />
                        <input type="file" ref={coverFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'coverImageUrl', setIsUploadingCover)} />


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

export default ClientSignUpPage;