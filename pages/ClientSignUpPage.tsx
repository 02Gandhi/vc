import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, CompanyProfile } from '../types';
import { COUNTRIES } from '../utils/countries';
import api from '../services/apiService';
import BackButton from '../components/BackButton';

// Regex allowing Western European languages (English, German, French, Dutch)
// Includes: a-z, digits, common punctuation, and accented characters (Latin-1 Supplement)
const WESTERN_EUROPEAN_REGEX = /^[a-zA-Z0-9\s\-\.\,\@\_\!\?\+\(\)\:\"\';\/\u00C0-\u00FF\u0152\u0153\u20AC]*$/;

// Regex for phone numbers (digits, spaces, +, -, parentheses)
const PHONE_REGEX = /^[0-9\s\+\-\(\)]*$/;

// Regex for pure numbers (if strictly needed)
const NUMBER_REGEX = /^[0-9]*$/;

const FormSection: React.FC<{ title: string; number: string; children: React.ReactNode; description?: string }> = ({ title, number, children, description }) => (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
        <h2 className="text-xl font-bold text-brand-text-primary mb-2 flex items-center">
            <span className="bg-brand-primary/10 text-brand-primary rounded-full h-8 w-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">{number}</span> {title}
        </h2>
        {description && <p className="text-brand-text-secondary mb-6 ml-11 text-sm">{description}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, error, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
        <input 
            {...props} 
            className={`w-full bg-brand-background border ${error ? 'border-brand-red focus:border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-primary focus:border-brand-primary'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 transition-colors`} 
        />
        {error && <p className="mt-1 text-xs text-brand-red font-medium">{error}</p>}
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode; error?: string }> = ({ label, children, error, ...props }) => (
     <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
        <select 
            {...props} 
            className={`w-full bg-brand-background border ${error ? 'border-brand-red focus:border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-primary focus:border-brand-primary'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 transition-colors`}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-brand-red font-medium">{error}</p>}
    </div>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }> = ({ label, error, ...props }) => (
    <div className="md:col-span-2">
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
        <textarea 
            {...props} 
            rows={4} 
            className={`w-full bg-brand-background border ${error ? 'border-brand-red focus:border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-primary focus:border-brand-primary'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 transition-colors`}
        ></textarea>
        {error && <p className="mt-1 text-xs text-brand-red font-medium">{error}</p>}
    </div>
);

const LIMITS = {
    companyName: 45,
    tradingName: 80,
    vatIdMax: 12,
    vatIdMin: 8,
    slogan: 100,
    description: 300,
    zip: 10,
    city: 30,
    street: 100,
    fullName: 30,
    role: 30,
    phone: 30,
    email: 50,
    website: 100,
    linkedin: 100
};

const ClientSignUpPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
    
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
        address: { street: '', zip: '', city: '', country: 'Германия' },
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
    
    const validateField = (name: string, value: string, max: number, type: 'text' | 'numeric' | 'phone' | 'email' = 'text') => {
        let errorMessage = '';

        // 1. Check Character Set
        let isValidChar = true;
        if (type === 'numeric') {
            isValidChar = NUMBER_REGEX.test(value); // Strict digits only
        } else if (type === 'phone') {
            isValidChar = PHONE_REGEX.test(value); // Digits, +, spaces
        } else {
            isValidChar = WESTERN_EUROPEAN_REGEX.test(value); // Latin + accents
        }

        if (!isValidChar) {
            errorMessage = 'Недопустимые символы';
        }

        // 2. Check Length
        if (value.length >= max) {
            errorMessage = 'Достигнута максимальная длина';
        }

        // 3. Email Check (Partial, implies '@' requirement)
        if (type === 'email' && value.length > 0 && !value.includes('@') && !errorMessage) {
            // We only show this error on blur or step transition usually, but let's keep it clean here.
            // For now, allow typing, check @ on step transition.
        }

        setFieldErrors(prev => {
            const newErrors = { ...prev };
            if (errorMessage) {
                newErrors[name] = errorMessage;
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'companyName') validateField(name, value, LIMITS.companyName);
        if (name === 'tradingName') validateField(name, value, LIMITS.tradingName);
        if (name === 'slogan') validateField(name, value, LIMITS.slogan);
        if (name === 'description') validateField(name, value, LIMITS.description);
        if (name === 'vatId') validateField(name, value, LIMITS.vatIdMax); // VAT can be alphanumeric
        if (name === 'website') validateField(name, value, LIMITS.website);
        if (name === 'linkedin') validateField(name, value, LIMITS.linkedin);

        setProfileData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNestedChange = (section: 'address' | 'contactPerson', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (section === 'address') {
            if (name === 'zip') validateField(`address.${name}`, value, LIMITS.zip); // Zip is alphanumeric in some EU countries
            if (name === 'city') validateField(`address.${name}`, value, LIMITS.city);
            if (name === 'street') validateField(`address.${name}`, value, LIMITS.street);
        }
        if (section === 'contactPerson') {
            if (name === 'fullName') validateField(`contactPerson.${name}`, value, LIMITS.fullName);
            if (name === 'role') validateField(`contactPerson.${name}`, value, LIMITS.role);
            if (name === 'phone') validateField(`contactPerson.${name}`, value, LIMITS.phone, 'phone');
            if (name === 'email') validateField(`contactPerson.${name}`, value, LIMITS.email, 'email');
        }

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
        
        // Final validations before next step
        const errors: {[key: string]: string} = {};
        
        if (profileData.vatId && profileData.vatId.length < LIMITS.vatIdMin) {
            errors.vatId = `Минимальная длина ${LIMITS.vatIdMin} символов`;
        }
        
        if (profileData.contactPerson.email && !profileData.contactPerson.email.includes('@')) {
            errors['contactPerson.email'] = 'E-mail должен содержать символ @';
        }

        if (Object.keys(errors).length > 0) {
             setFieldErrors(prev => ({...prev, ...errors}));
             return;
        }

        // Check if there are blocking "Invalid char" errors
        const hasBlockingErrors = Object.values(fieldErrors).some(err => err === 'Недопустимые символы');
        if (hasBlockingErrors) {
            // Scroll to first error ideally
            return;
        }

        setAccountData(prev => ({ ...prev, email: profileData.contactPerson.email }));
        setStep(2);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (accountData.password !== accountData.confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Combine Company Name and Type
            const finalProfileData = {
                ...profileData,
                companyName: `${profileData.companyName} ${profileData.companyType}`.trim()
            };

            await signup(UserRole.Client, finalProfileData, { email: accountData.email });
            navigate('/client/dashboard');
        } catch (err: any) {
            setError(err.message || 'Не удалось создать аккаунт. Пожалуйста, попробуйте снова.');
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
                <h1 className="text-3xl font-bold text-center text-brand-text-primary mb-2">Добро пожаловать, Заказчик!</h1>
                <p className="text-center text-brand-text-secondary mb-8">Давайте настроим профиль вашей компании.</p>

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
                         <FormSection number="⭐" title="Брендинг и внешний вид" description="Загрузите логотип и обложку компании.">
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
                            <FormInput 
                                label="Название компании" 
                                id="companyName" 
                                name="companyName" 
                                required 
                                value={profileData.companyName} 
                                onChange={handleInputChange} 
                                maxLength={LIMITS.companyName}
                                error={fieldErrors.companyName}
                            />
                            <FormInput 
                                label="Торговое название (если есть)" 
                                id="tradingName" 
                                name="tradingName" 
                                value={profileData.tradingName} 
                                onChange={handleInputChange} 
                                maxLength={LIMITS.tradingName}
                                error={fieldErrors.tradingName}
                            />
                            <FormSelect label="Тип компании" id="companyType" name="companyType" value={profileData.companyType} onChange={handleInputChange}>
                                <optgroup label="Западная Европа (DACH)">
                                    <option value="GmbH">GmbH</option>
                                    <option value="AG">AG</option>
                                    <option value="Einzelunternehmen">Einzelunternehmen</option>
                                </optgroup>
                                <optgroup label="Восточная Европа">
                                    <option value="Sp. z o.o.">Sp. z o.o. (Польша)</option>
                                    <option value="s.r.o.">s.r.o. (Чехия/Словакия)</option>
                                    <option value="d.o.o.">d.o.o. (Балканы)</option>
                                    <option value="Kft.">Kft. (Венгрия)</option>
                                    <option value="SRL">SRL (Румыния)</option>
                                    <option value="OÜ">OÜ (Эстония)</option>
                                    <option value="SIA">SIA (Латвия)</option>
                                    <option value="UAB">UAB (Литва)</option>
                                </optgroup>
                                <optgroup label="Другие">
                                    <option value="Ltd">Ltd</option>
                                    <option value="Other">Другое</option>
                                </optgroup>
                            </FormSelect>
                            <FormInput 
                                label="ИНН / VAT ID" 
                                id="vatId" 
                                name="vatId" 
                                value={profileData.vatId} 
                                onChange={handleInputChange} 
                                maxLength={LIMITS.vatIdMax}
                                error={fieldErrors.vatId}
                                placeholder="От 8 до 12 символов"
                            />
                            <FormTextarea 
                                label="Слоган" 
                                id="slogan" 
                                name="slogan" 
                                value={profileData.slogan} 
                                onChange={handleInputChange} 
                                maxLength={LIMITS.slogan}
                                error={fieldErrors.slogan}
                            />
                            <FormTextarea 
                                label="Описание компании" 
                                id="description" 
                                name="description" 
                                value={profileData.description} 
                                onChange={handleInputChange} 
                                maxLength={LIMITS.description}
                                error={fieldErrors.description}
                            />
                        </FormSection>

                        <FormSection number="B" title="Адрес">
                            <FormInput 
                                label="Улица" 
                                id="street" 
                                name="street" 
                                required 
                                value={profileData.address.street} 
                                onChange={e => handleNestedChange('address', e)}
                                maxLength={LIMITS.street}
                                error={fieldErrors['address.street']} 
                            />
                            <FormInput 
                                label="Индекс" 
                                id="zip" 
                                name="zip" 
                                required 
                                value={profileData.address.zip} 
                                onChange={e => handleNestedChange('address', e)} 
                                maxLength={LIMITS.zip}
                                error={fieldErrors['address.zip']}
                            />
                            <FormInput 
                                label="Город" 
                                id="city" 
                                name="city" 
                                required 
                                value={profileData.address.city} 
                                onChange={e => handleNestedChange('address', e)} 
                                maxLength={LIMITS.city}
                                error={fieldErrors['address.city']}
                            />
                            <FormSelect label="Страна" id="country" name="country" value={profileData.address.country} onChange={e => handleNestedChange('address', e)} required>
                                {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                            </FormSelect>
                        </FormSection>
                        
                        <FormSection number="C" title="Контактные данные">
                             <FormInput 
                                label="Полное имя" 
                                id="fullName" 
                                name="fullName" 
                                required 
                                value={profileData.contactPerson.fullName} 
                                onChange={e => handleNestedChange('contactPerson', e)} 
                                maxLength={LIMITS.fullName}
                                error={fieldErrors['contactPerson.fullName']}
                            />
                             <FormInput 
                                label="Должность" 
                                id="role" 
                                name="role" 
                                required 
                                value={profileData.contactPerson.role} 
                                onChange={e => handleNestedChange('contactPerson', e)} 
                                maxLength={LIMITS.role}
                                error={fieldErrors['contactPerson.role']}
                            />
                             <FormInput 
                                label="Телефон" 
                                id="phone" 
                                name="phone" 
                                required 
                                value={profileData.contactPerson.phone} 
                                onChange={e => handleNestedChange('contactPerson', e)} 
                                maxLength={LIMITS.phone}
                                error={fieldErrors['contactPerson.phone']}
                                placeholder="+49 123 456 7890"
                            />
                             <FormInput 
                                label="E-mail" 
                                id="email" 
                                name="email" 
                                type="email" 
                                required 
                                value={profileData.contactPerson.email} 
                                onChange={e => handleNestedChange('contactPerson', e)} 
                                maxLength={LIMITS.email}
                                error={fieldErrors['contactPerson.email']}
                             />
                             <FormInput 
                                label="Веб-сайт" 
                                id="website" 
                                name="website" 
                                value={profileData.website} 
                                onChange={handleInputChange}
                                maxLength={LIMITS.website}
                                error={fieldErrors.website} 
                            />
                             <FormInput 
                                label="LinkedIn профиль" 
                                id="linkedin" 
                                name="linkedin" 
                                value={profileData.linkedin} 
                                onChange={handleInputChange}
                                maxLength={LIMITS.linkedin}
                                error={fieldErrors.linkedin} 
                            />
                        </FormSection>
                        
                        <input type="file" ref={logoFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl', setIsUploadingLogo)} />
                        <input type="file" ref={coverFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'coverImageUrl', setIsUploadingCover)} />


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

export default ClientSignUpPage;