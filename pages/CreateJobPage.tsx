import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import { Client, JobDetails } from '../types';
import BackButton from '../components/BackButton';
import { COUNTRIES, EASTERN_EU_COUNTRIES, MOCK_CITIES } from '../utils/countries';

const DADATA_API_KEY = "2292624f5ca19ecd149b3ddd2042c89ac055be3f";
const LATIN_REGEX = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}~€]*$/;

const jobCategories = {
    "🧱 Строительство и ремонт": [
        { value: "bricklayer", label: "Каменщик" },
        { value: "concrete_worker", label: "Бетонщик" },
        { value: "reinforcement_worker", label: "Арматурщик" },
        { value: "plasterer", label: "Штукатур" },
        { value: "painter", label: "Маляр" },
        { value: "finisher_drywall_installer", label: "Отделочник / Гипсокартонщик" },
        { value: "drywall_fitter", label: "Монтажник гипсокартона" },
        { value: "facade_installer", label: "Фасадчик" },
        { value: "insulation_installer", label: "Изолировщик" },
        { value: "roofer", label: "Кровельщик" },
    ],
    "⚡ Электрика и автоматизация": [
        { value: "electrician", label: "Электрик" },
        { value: "electrical_installer", label: "Электромонтажник" },
        { value: "automation_technician", label: "Техник по автоматизации" },
        { value: "cable_installer", label: "Кабельщик" },
        { value: "security_systems_installer", label: "Монтажник систем безопасности" },
        { value: "solar_panel_installer", label: "Монтажник солнечных панелей" },
        { value: "smart_home_technician", label: "Техник умного дома" },
        { value: "industrial_electrician", label: "Промышленный электрик" },
    ],
    "💧 Сантехника, отопление и вентиляция": [
        { value: "plumber", label: "Сантехник" },
        { value: "heating_installer", label: "Монтажник отопления" },
        { value: "ventilation_installer", label: "Монтажник вентиляции" },
        { value: "air_conditioning_technician", label: "Техник по кондиционированию" },
        { value: "hvac_engineer", label: "Инженер ОВК" },
        { value: "water_supply_installer", label: "Монтажник водоснабжения" },
    ],
    "🪚 Столярные и плотницкие работы": [
        { value: "carpenter", label: "Плотник" },
        { value: "joiner_cabinetmaker", label: "Столяр" },
        { value: "window_door_installer", label: "Установщик окон и дверей" },
        { value: "floor_layer", label: "Укладчик полов" },
        { value: "furniture_fitter", label: "Сборщик мебели" },
        { value: "stair_installer", label: "Установщик лестниц" },
    ],
    "🔩 Металлоконструкции и сварка": [
        { value: "welder", label: "Сварщик" },
        { value: "steel_structure_erector", label: "Монтажник металлоконструкций" },
        { value: "metal_fitter", label: "Слесарь-сборщик" },
        { value: "railing_installer", label: "Установщик перил" },
        { value: "lift_installer", label: "Монтажник лифтов" },
    ],
    "🚧 Управление техникой и земляные работы": [
        { value: "excavator_operator", label: "Экскаваторщик" },
        { value: "bulldozer_operator", label: "Бульдозерист" },
        { value: "crane_operator", label: "Крановщик" },
        { value: "lift_operator", label: "Оператор подъемника" },
        { value: "construction_machinery_operator", label: "Оператор строительной техники" },
        { value: "road_worker", label: "Дорожный рабочий" },
    ],
    "🧰 Специалисты и руководство": [
        { value: "site_foreman", label: "Прораб / Бригадир" },
        { value: "safety_technician", label: "Инженер по технике безопасности" },
        { value: "surveyor", label: "Геодезист" },
        { value: "civil_engineer", label: "Инженер-строитель" },
        { value: "architect", label: "Архитектор" },
        { value: "project_coordinator", label: "Координатор проекта" },
        { value: "estimator", label: "Сметчик" },
        { value: "construction_project_manager", label: "Руководитель строительного проекта" },
        { value: "quality_control_inspector", label: "Инспектор контроля качества" },
    ],
};
const languages = ['Немецкий', 'Английский', 'Французский', 'Польский', 'Словацкий'];
const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const workDaysOptions = [{key: 'Mon', label: 'Пн'}, {key: 'Tue', label: 'Вт'}, {key: 'Wed', label: 'Ср'}, {key: 'Thu', label: 'Чт'}, {key: 'Fri', label: 'Пт'}, {key: 'Sat', label: 'Сб'}, {key: 'Sun', label: 'Вс'}];


const FormSection: React.FC<{ title: string; number: number; children: React.ReactNode }> = ({ title, number, children }) => (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
        <h2 className="text-xl font-bold text-brand-text-primary mb-4">
            <span className="text-brand-primary">{number}️⃣</span> {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; required?: boolean }> = ({ label, error, required, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input {...props} className={`w-full bg-brand-background border ${error ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary`} />
        {error && <p className="mt-1 text-sm text-brand-red">{error}</p>}
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }> = ({ label, children, ...props }) => (
     <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">
            {label} <span className="text-red-500">*</span>
        </label>
        <select {...props} className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary">
            {children}
        </select>
    </div>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; required?: boolean }> = ({ label, error, required, ...props }) => (
    <div className="md:col-span-2">
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea {...props} rows={4} className={`w-full bg-brand-background border ${error ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary`}></textarea>
        {error && <p className="mt-1 text-sm text-brand-red">{error}</p>}
    </div>
);

const ModernToggle: React.FC<{ 
    label: string; 
    value: 'yes' | 'no' | 'unspecified'; 
    onChange: (val: 'yes' | 'no' | 'unspecified') => void; 
}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-brand-text-primary mb-2">
            {label}
        </label>
        <div className="flex bg-gray-100 p-1 rounded-lg w-fit border border-gray-200">
            <button
                type="button"
                onClick={() => onChange('yes')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${value === 'yes' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Да
            </button>
            <button
                type="button"
                onClick={() => onChange('no')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${value === 'no' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Нет
            </button>
            <button
                type="button"
                onClick={() => onChange('unspecified')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${value === 'unspecified' ? 'bg-white text-brand-text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Не указано
            </button>
        </div>
    </div>
);


const CreateJobPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Range states for Work Hours and Payment Terms
    const [workHoursFrom, setWorkHoursFrom] = useState('');
    const [workHoursTo, setWorkHoursTo] = useState('');
    const [paymentDaysFrom, setPaymentDaysFrom] = useState('');
    const [paymentDaysTo, setPaymentDaysTo] = useState('');

    // City Autocomplete state
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const cityInputRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<JobDetails>({
        projectName: '',
        jobType: 'bricklayer',
        projectDescription: '',
        city: '',
        country: 'Германия',
        startDate: '',
        endDate: '',
        workDays: [],
        workHoursPerWeek: '',
        numberOfEmployees: 1,
        communicationLanguage: languages[0],
        otherLanguage: '',
        languageProficientEmployees: 1,
        minLanguageLevel: cefrLevels[2],
        toolsProvided: 'unspecified',
        materialsProvided: 'unspecified',
        accommodationProvided: 'unspecified',
        invoicingTerms: '',
        hourlyRateFrom: '',
        hourlyRateTo: '',
        preferredContractorCountry: [],
        otherPreferredContractorCountry: '',
        additionalComments: '',
        photos: [],
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
                setShowCitySuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // City Autocomplete with DaData API
    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.city || formData.city.length < 2) {
                setCitySuggestions([]);
                setShowCitySuggestions(false);
                return;
            }

            try {
                // Determine ISO code from the country name for DaData filter
                const countryCode = COUNTRIES.find(c => c.name === formData.country)?.code || "*";
                
                const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Token " + DADATA_API_KEY
                    },
                    body: JSON.stringify({
                        query: formData.city,
                        locations: [{ country_iso_code: countryCode }],
                        from_bound: { value: "city" },
                        to_bound: { value: "settlement" },
                        language: "en" // Request English/International output for Latin names
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const suggestions = data.suggestions
                        .map((s: any) => s.data.city || s.data.settlement || s.value)
                        .filter((c: any) => c);
                    
                    const unique = Array.from(new Set(suggestions)) as string[];
                    setCitySuggestions(unique);
                    setShowCitySuggestions(unique.length > 0);
                }
            } catch (error) {
                console.error("Error fetching cities from DaData:", error);
                // Fallback to mock data if API fails
                const cities = MOCK_CITIES[formData.country] || MOCK_CITIES['default'];
                const filtered = cities.filter(c => c.toLowerCase().includes(formData.city.toLowerCase()));
                setCitySuggestions(filtered);
                setShowCitySuggestions(filtered.length > 0);
            }
        };

        const timeoutId = setTimeout(fetchCities, 500); // Debounce 500ms
        return () => clearTimeout(timeoutId);
    }, [formData.city, formData.country]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (value && !LATIN_REGEX.test(value)) {
            setErrors(prev => ({ ...prev, [name]: 'Недопустимые символы' }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        const key = name as keyof JobDetails;

        if (key === 'numberOfEmployees' || key === 'languageProficientEmployees') {
            setFormData(prev => ({ ...prev, [key]: parseInt(value, 10) || 1 }));
        } else {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
        
        // Reset city if country changes
        if (name === 'country') {
            setFormData(prev => ({ ...prev, city: '' }));
            setCitySuggestions([]);
        }
    };
    
    const selectCity = (city: string) => {
        setFormData(prev => ({ ...prev, city }));
        setShowCitySuggestions(false);
    };

    const handleWorkdayChange = (day: string) => {
        setFormData(prev => {
            const workDays = prev.workDays.includes(day)
                ? prev.workDays.filter(d => d !== day)
                : [...prev.workDays, day];
            return { ...prev, workDays };
        });
    };
    
    const handleAddPreferredCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value && !formData.preferredContractorCountry.includes(value) && formData.preferredContractorCountry.length < 3) {
             setFormData(prev => ({
                ...prev,
                preferredContractorCountry: [...prev.preferredContractorCountry, value]
            }));
            e.target.value = ''; // Reset select
        }
    };

    const removeCountry = (countryToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            preferredContractorCountry: prev.preferredContractorCountry.filter(c => c !== countryToRemove)
        }));
    };
    
    const handleToggleChange = (key: 'toolsProvided' | 'materialsProvided' | 'accommodationProvided', val: 'yes' | 'no' | 'unspecified') => {
         setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        const files = Array.from(e.target.files);
        // Strict check: Max 5 photos total
        if (formData.photos.length + files.length > 5) {
            alert('Максимум 5 фотографий.');
            return;
        }

        setIsUploading(true);
        try {
            const uploadedUrls = await Promise.all(
                files.map((file: File) => api.mockUploadImage(file))
            );
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...uploadedUrls]
            }));
        } catch (err) {
            console.error("Upload failed", err);
            setError("Ошибка загрузки фото. Пожалуйста, попробуйте снова.");
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removePhoto = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const newErrors: {[key: string]: string} = {};

        // Validation
        if (!formData.projectName) newErrors.projectName = 'Это поле обязательно';
        if (!formData.projectDescription) newErrors.projectDescription = 'Это поле обязательно';
        if (!formData.city) newErrors.city = 'Это поле обязательно';
        if (!formData.startDate) newErrors.startDate = 'Это поле обязательно';
        if (!formData.endDate) newErrors.endDate = 'Это поле обязательно';
        if (formData.workDays.length === 0) newErrors.workDays = 'Выберите хотя бы один рабочий день';
        
        // Work Hours Validation (Range)
        if (!workHoursFrom || !workHoursTo) newErrors.workHoursPerWeek = 'Оба поля (От/До) обязательны';
        else if (Number(workHoursFrom) > Number(workHoursTo)) newErrors.workHoursPerWeek = 'Значение "От" не может быть больше "До"';
        
        // Rates Validation
        if (!formData.hourlyRateFrom) newErrors.hourlyRateFrom = 'Это поле обязательно';
        if (!formData.hourlyRateTo) newErrors.hourlyRateTo = 'Это поле обязательно';
        if (Number(formData.hourlyRateTo) < Number(formData.hourlyRateFrom)) {
            newErrors.hourlyRateTo = 'Максимальная ставка не может быть ниже минимальной';
        }

        // Payment Terms Validation (Range)
        if (!paymentDaysFrom || !paymentDaysTo) newErrors.invoicingTerms = 'Оба поля (От/До) обязательны';
        else if (Number(paymentDaysFrom) > Number(paymentDaysTo)) newErrors.invoicingTerms = 'Значение "От" не может быть больше "До"';

        if (formData.languageProficientEmployees > formData.numberOfEmployees) {
             newErrors.languageProficientEmployees = 'Не может быть больше общего количества сотрудников';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setError('Пожалуйста, исправьте ошибки в форме.');
            window.scrollTo(0,0);
            return;
        }

        if (!user) {
            setError('Вы должны войти в систему, чтобы опубликовать проект.');
            return;
        }

        const JOB_POST_COST = 30;
        if ((user as Client).balance_credits < JOB_POST_COST) {
            setError(`У вас недостаточно кредитов для публикации проекта. Вам нужно ${JOB_POST_COST} кредитов, а у вас только ${(user as Client).balance_credits}.`);
            return;
        }

        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmPublish = async () => {
        if (!user) return;
        
        setIsSubmitting(true);
        try {
            const finalData: JobDetails = {
                ...formData,
                // Combine ranges into string format expected by types
                workHoursPerWeek: `${workHoursFrom}-${workHoursTo}`,
                invoicingTerms: `${paymentDaysFrom}-${paymentDaysTo} дней`
            };
            
            const { updatedClient } = await api.createJob(finalData, user as Client);
            updateUser(updatedClient);
            setIsConfirmModalOpen(false);
            alert('Проект успешно опубликован! 30 кредитов списано с вашего баланса.');
            navigate('/client/dashboard');
        } catch (error: any) {
            console.error('Failed to post project:', error);
            setError(error.message || 'Ошибка публикации проекта. Пожалуйста, попробуйте снова.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                    <div className="container mx-auto">
                        <BackButton to="/client/dashboard" />
                        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Создать новый заказ</h1>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            <FormSection title="Общая информация" number={1}>
                                <FormInput label="Название проекта / Объект" id="projectName" name="projectName" required value={formData.projectName} onChange={handleInputChange} error={errors.projectName} />
                                <FormSelect label="Тип работ" id="jobType" name="jobType" value={formData.jobType} onChange={handleInputChange}>
                                     {Object.entries(jobCategories).map(([groupLabel, options]) => (
                                        <optgroup label={groupLabel} key={groupLabel}>
                                            {options.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </FormSelect>
                                <FormTextarea label="Краткое описание проекта (обязательно)" id="projectDescription" name="projectDescription" required value={formData.projectDescription} onChange={handleInputChange} error={errors.projectDescription}/>
                            </FormSection>

                             <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                                <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                                    <span className="text-brand-primary">🖼️</span> Фото проекта (Макс. 5)
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {formData.photos.map((photo, index) => (
                                        <div key={index} className="relative group">
                                            <img src={photo} alt={`Project photo ${index + 1}`} className="rounded-lg object-cover aspect-video" />
                                            <button 
                                                type="button" 
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                &#x2715;
                                            </button>
                                        </div>
                                    ))}
                                    {/* Hide button if 5 photos reached */}
                                    {formData.photos.length < 5 && (
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="border-2 border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center aspect-video text-brand-text-secondary hover:bg-brand-background hover:border-brand-primary disabled:opacity-50">
                                            {isUploading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-brand-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-sm mt-2">Загрузка...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-sm mt-2">Добавить фото ({formData.photos.length}/5)</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handlePhotoUpload}
                                    className="hidden" 
                                />
                                {formData.photos.length >= 5 && <p className="text-sm text-brand-text-secondary mt-2 text-brand-red">Достигнут лимит в 5 фотографий.</p>}
                            </div>

                            <FormSection title="Местоположение и Сроки" number={2}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                                    <FormSelect label="Страна" id="country" name="country" value={formData.country} onChange={handleInputChange}>
                                        {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                    </FormSelect>
                                    
                                    <div ref={cityInputRef} className="relative">
                                        <FormInput label="Город" id="city" name="city" type="text" required value={formData.city} onChange={handleInputChange} error={errors.city} autoComplete="off" />
                                        {showCitySuggestions && citySuggestions.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-brand-surface border border-brand-border rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                                {citySuggestions.map((city) => (
                                                    <li 
                                                        key={city} 
                                                        onClick={() => selectCity(city)}
                                                        className="px-4 py-2 hover:bg-brand-background cursor-pointer text-sm"
                                                    >
                                                        {city}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <FormInput label="Дата начала" id="startDate" name="startDate" type="date" required value={formData.startDate} onChange={handleInputChange} error={errors.startDate}/>
                                <FormInput label="Дата окончания" id="endDate" name="endDate" type="date" required value={formData.endDate} onChange={handleInputChange} error={errors.endDate}/>
                                <div className="md:col-span-2">
                                     <label className="block text-sm font-medium text-brand-text-primary mb-2">
                                         Рабочие дни недели <span className="text-red-500">*</span>
                                     </label>
                                     <div className="flex space-x-2">
                                        {workDaysOptions.map(day => (
                                            <button type="button" key={day.key} onClick={() => handleWorkdayChange(day.key)} className={`px-4 py-2 rounded-md ${formData.workDays.includes(day.key) ? 'bg-brand-primary text-white' : 'bg-brand-background border border-brand-border'}`}>
                                                {day.label}
                                            </button>
                                        ))}
                                     </div>
                                     {errors.workDays && <p className="mt-1 text-sm text-brand-red">{errors.workDays}</p>}
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-brand-text-primary mb-1">
                                        Часов в неделю (Диапазон) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <input 
                                                type="number" 
                                                placeholder="От"
                                                min="0"
                                                value={workHoursFrom}
                                                onChange={(e) => setWorkHoursFrom(e.target.value)}
                                                className={`w-full bg-brand-background border ${errors.workHoursPerWeek ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2`}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                type="number" 
                                                placeholder="До"
                                                min="0"
                                                value={workHoursTo}
                                                onChange={(e) => setWorkHoursTo(e.target.value)}
                                                className={`w-full bg-brand-background border ${errors.workHoursPerWeek ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2`}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {errors.workHoursPerWeek && <p className="mt-1 text-sm text-brand-red">{errors.workHoursPerWeek}</p>}
                                </div>
                            </FormSection>
                            
                             <FormSection title="Требования к персоналу" number={3}>
                                <FormInput label="Сколько сотрудников требуется" id="numberOfEmployees" name="numberOfEmployees" type="number" min="1" required value={formData.numberOfEmployees} onChange={handleInputChange} />
                                
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormSelect label="Язык общения" id="communicationLanguage" name="communicationLanguage" value={formData.communicationLanguage} onChange={handleInputChange}>
                                         {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                         <option value="other">другой</option>
                                    </FormSelect>
                                    {formData.communicationLanguage === 'other' && (
                                         <FormInput label="Укажите язык" id="otherLanguage" name="otherLanguage" type="text" required value={formData.otherLanguage} onChange={handleInputChange} error={errors.otherLanguage} />
                                    )}
                                </div>
                                
                                <FormInput label="Сколько сотрудников должны знать язык" id="languageProficientEmployees" name="languageProficientEmployees" type="number" min="1" required value={formData.languageProficientEmployees} onChange={handleInputChange} error={errors.languageProficientEmployees}/>
                                <FormSelect label="Минимальный уровень языка (CEFR)" id="minLanguageLevel" name="minLanguageLevel" value={formData.minLanguageLevel} onChange={handleInputChange}>
                                     {cefrLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                </FormSelect>
                            </FormSection>

                             <FormSection title="Условия и ресурсы" number={4}>
                                <ModernToggle label="Инструменты от заказчика" value={formData.toolsProvided} onChange={(val) => handleToggleChange('toolsProvided', val)} />
                                <ModernToggle label="Материалы от заказчика" value={formData.materialsProvided} onChange={(val) => handleToggleChange('materialsProvided', val)} />
                                <ModernToggle label="Проживание от заказчика" value={formData.accommodationProvided} onChange={(val) => handleToggleChange('accommodationProvided', val)} />
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-brand-text-primary mb-1">
                                        Условия оплаты (Дней на оплату счета) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <input 
                                                type="number" 
                                                placeholder="От (дней)"
                                                min="0"
                                                value={paymentDaysFrom}
                                                onChange={(e) => setPaymentDaysFrom(e.target.value)}
                                                className={`w-full bg-brand-background border ${errors.invoicingTerms ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2`}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                type="number" 
                                                placeholder="До (дней)"
                                                min="0"
                                                value={paymentDaysTo}
                                                onChange={(e) => setPaymentDaysTo(e.target.value)}
                                                className={`w-full bg-brand-background border ${errors.invoicingTerms ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2`}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {errors.invoicingTerms && <p className="mt-1 text-sm text-brand-red">{errors.invoicingTerms}</p>}
                                </div>
                            </FormSection>

                            <FormSection title="Оплата и Подрядчик" number={5}>
                                <FormInput label="Почасовая ставка (€/час) - От" id="hourlyRateFrom" name="hourlyRateFrom" type="number" min="0" required value={formData.hourlyRateFrom} onChange={handleInputChange} error={errors.hourlyRateFrom} />
                                <FormInput label="Почасовая ставка (€/час) - До" id="hourlyRateTo" name="hourlyRateTo" type="number" min="0" required value={formData.hourlyRateTo} onChange={handleInputChange} error={errors.hourlyRateTo} />
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-brand-text-primary mb-2">
                                        Предпочтительная страна подрядчика (до 3, опционально)
                                    </label>
                                    
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.preferredContractorCountry.map(country => (
                                            <span key={country} className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm flex items-center">
                                                {country}
                                                <button type="button" onClick={() => removeCountry(country)} className="ml-2 hover:text-brand-primary-hover font-bold">×</button>
                                            </span>
                                        ))}
                                    </div>

                                    {formData.preferredContractorCountry.length < 3 && (
                                         <select 
                                            onChange={handleAddPreferredCountry} 
                                            className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary"
                                        >
                                            <option value="">Выберите страну (Восточная Европа)</option>
                                            {EASTERN_EU_COUNTRIES.map(c => (
                                                <option key={c} value={c} disabled={formData.preferredContractorCountry.includes(c)}>{c}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </FormSection>

                            <FormSection title="Дополнительная информация" number={6}>
                                 <FormTextarea label="Дополнительные детали / Комментарии (опционально)" id="additionalComments" name="additionalComments" value={formData.additionalComments} onChange={handleInputChange} error={errors.additionalComments}/>
                            </FormSection>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                                    <strong className="font-bold">Ошибка!</strong>
                                    <span className="block sm:inline ml-2">{error}</span>
                                    {error.includes('недостаточно кредитов') && (
                                        <Link to="/client/payments" className="font-bold underline ml-2 hover:text-red-900">Купить кредиты</Link>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => navigate('/client/dashboard')} className="bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-6 rounded-lg">Отмена</button>
                                <button type="submit" disabled={isSubmitting || isUploading} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Публикация...' : 'Опубликовать (30 Кредитов)'}
                                </button>
                            </div>
                        </form>

                        {isConfirmModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                                <div className="bg-brand-surface p-8 rounded-lg max-w-md w-full mx-4 shadow-xl">
                                    <h3 className="text-xl font-bold text-brand-text-primary">Подтвердить публикацию</h3>
                                    <p className="mt-4 text-brand-text-secondary">
                                        Пожалуйста, убедитесь, что все данные верны. После публикации заказ нельзя будет изменить.
                                    </p>
                                    <div className="mt-6 flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsConfirmModalOpen(false)}
                                            className="bg-brand-background hover:bg-gray-100 border border-brand-border text-brand-text-secondary font-bold py-2 px-4 rounded-lg"
                                            disabled={isSubmitting}
                                        >
                                            Вернуться к редактированию
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmPublish}
                                            disabled={isSubmitting}
                                            className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Публикация...' : 'Опубликовать'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateJobPage;