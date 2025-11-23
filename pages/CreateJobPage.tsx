import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import { Client, JobDetails } from '../types';
import BackButton from '../components/BackButton';

const LATIN_REGEX = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}~€]*$/;

const jobCategories = {
    "🧱 Общие строительные работы": [
        { value: "bricklayer", label: "Каменщик (Bricklayer / Mason)" },
        { value: "concrete_worker", label: "Бетонщик (Concrete worker)" },
        { value: "reinforcement_worker", label: "Арматурщик (Reinforcement worker)" },
        { value: "plasterer", label: "Штукатур (Plasterer)" },
        { value: "painter", label: "Маляр (Painter)" },
        { value: "finisher_drywall_installer", label: "Отделочник (Finisher / Drywall installer)" },
        { value: "drywall_fitter", label: "Монтажник гипсокартона (Drywall fitter)" },
        { value: "facade_installer", label: "Монтажник фасадов (Facade installer)" },
        { value: "insulation_installer", label: "Изолировщик (Insulation installer)" },
        { value: "roofer", label: "Кровельщик (Roofer)" },
    ],
    "⚡ Электрика и автоматизация": [
        { value: "electrician", label: "Электрик (Electrician)" },
        { value: "electrical_installer", label: "Электромонтажник (Electrical installer)" },
        { value: "automation_technician", label: "Автоматчик / Инженер по автоматике (Automation technician)" },
        { value: "cable_installer", label: "Кабельщик (Cable installer)" },
        { value: "security_systems_installer", label: "Монтажник систем безопасности (Security systems installer)" },
        { value: "solar_panel_installer", label: "Монтажник солнечных панелей (Solar panel installer)" },
        { value: "smart_home_technician", label: "Монтажник умного дома (Smart home technician)" },
        { value: "industrial_electrician", label: "Электротехник по промышленным системам (Industrial electrician)" },
    ],
    "💧 Сантехника и отопление": [
        { value: "plumber", label: "Сантехник (Plumber)" },
        { value: "heating_installer", label: "Монтажник отопления (Heating installer)" },
        { value: "ventilation_installer", label: "Монтажник вентиляции (Ventilation installer)" },
        { value: "air_conditioning_technician", label: "Монтажник кондиционирования (Air conditioning technician)" },
        { value: "hvac_engineer", label: "Инженер по HVAC (HVAC engineer)" },
        { value: "water_supply_installer", label: "Монтажник водопровода (Water supply installer)" },
    ],
    "🪚 Дерево и интерьер": [
        { value: "carpenter", label: "Плотник (Carpenter)" },
        { value: "joiner_cabinetmaker", label: "Столяр (Joiner / Cabinetmaker)" },
        { value: "window_door_installer", label: "Монтажник окон и дверей (Window & door installer)" },
        { value: "floor_layer", label: "Ламинатчик / Паркетчик (Floor layer)" },
        { value: "furniture_fitter", label: "Монтажник мебели (Furniture fitter)" },
        { value: "stair_installer", label: "Монтажник лестниц (Stair installer)" },
    ],
    "🔩 Металлоконструкции и сварка": [
        { value: "welder", label: "Сварщик (Welder)" },
        { value: "steel_structure_erector", label: "Монтажник металлоконструкций (Steel structure erector)" },
        { value: "metal_fitter", label: "Слесарь-монтажник (Metal fitter)" },
        { value: "railing_installer", label: "Монтажник перил и заборов (Railing installer)" },
        { value: "lift_installer", label: "Монтажник лифтов (Lift installer)" },
    ],
    "🚧 Техника и земляные работы": [
        { value: "excavator_operator", label: "Экскаваторщик (Excavator operator)" },
        { value: "bulldozer_operator", label: "Бульдозерист (Bulldozer operator)" },
        { value: "crane_operator", label: "Крановщик (Crane operator)" },
        { value: "lift_operator", label: "Машинист подъёмников (Lift operator)" },
        { value: "construction_machinery_operator", label: "Оператор строительной техники (Construction machinery operator)" },
        { value: "road_worker", label: "Дорожный рабочий (Road worker)" },
    ],
    "🧰 Специалисты и надзор": [
        { value: "site_foreman", label: "Строительный прораб (Site foreman)" },
        { value: "safety_technician", label: "Техник по безопасности (Safety technician)" },
        { value: "surveyor", label: "Геодезист (Surveyor)" },
        { value: "civil_engineer", label: "Инженер-строитель (Civil engineer)" },
        { value: "architect", label: "Архитектор (Architect)" },
        { value: "project_coordinator", label: "Смежник / Координатор проектов (Project coordinator)" },
        { value: "estimator", label: "Оценщик / Сметчик (Estimator)" },
        { value: "construction_project_manager", label: "Менеджер строительного проекта (Construction project manager)" },
        { value: "quality_control_inspector", label: "Контролёр качества (Quality control inspector)" },
    ],
};
const countries = ['Germany', 'Poland', 'Netherlands', 'Austria', 'Belgium', 'France', 'Switzerland'];
const languages = ['немецкий', 'английский', 'французский', 'польский', 'словацкий'];
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

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, error, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">
            {label} <span className="text-red-500">*</span>
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

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }> = ({ label, error, ...props }) => (
    <div className="md:col-span-2">
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
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
    const [skipInvoicing, setSkipInvoicing] = useState(false);
    const [countryInput, setCountryInput] = useState('');

    const [formData, setFormData] = useState<JobDetails>({
        projectName: '',
        jobType: 'bricklayer',
        projectDescription: '',
        city: '',
        country: countries[0],
        startDate: '',
        endDate: '',
        workDays: [],
        workHoursPerWeek: '40-60',
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (value && !LATIN_REGEX.test(value)) {
            setErrors(prev => ({ ...prev, [name]: 'Недопустимые знаки' }));
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
    };
    
    const handleWorkdayChange = (day: string) => {
        setFormData(prev => {
            const workDays = prev.workDays.includes(day)
                ? prev.workDays.filter(d => d !== day)
                : [...prev.workDays, day];
            return { ...prev, workDays };
        });
    };
    
    const handleAddCountry = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (countryInput.trim() && formData.preferredContractorCountry.length < 3) {
                 // prevent duplicates
                 const newCountry = countryInput.trim();
                 if (!formData.preferredContractorCountry.includes(newCountry)) {
                     setFormData(prev => ({
                        ...prev,
                        preferredContractorCountry: [...prev.preferredContractorCountry, newCountry]
                    }));
                 }
                setCountryInput('');
            }
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
        setIsUploading(true);
        const files = Array.from(e.target.files);
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
            setError("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
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
        if (!formData.workHoursPerWeek) newErrors.workHoursPerWeek = 'Это поле обязательно';
        if (!formData.hourlyRateFrom) newErrors.hourlyRateFrom = 'Это поле обязательно';
        if (!formData.hourlyRateTo) newErrors.hourlyRateTo = 'Это поле обязательно';
        
        if (!skipInvoicing && !formData.invoicingTerms) {
             newErrors.invoicingTerms = 'Это поле обязательно';
        }

        if (formData.languageProficientEmployees > formData.numberOfEmployees) {
             newErrors.languageProficientEmployees = 'Не может быть больше общего числа сотрудников';
        }
        
        if (Number(formData.hourlyRateTo) < Number(formData.hourlyRateFrom)) {
            newErrors.hourlyRateTo = 'Макс. ставка не может быть ниже мин. ставки';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setError('Пожалуйста, исправьте ошибки в форме.');
            window.scrollTo(0,0);
            return;
        }

        if (!user) {
            setError('You must be logged in to post a project.');
            return;
        }

        const JOB_POST_COST = 30;
        if ((user as Client).balance_credits < JOB_POST_COST) {
            setError(`You don't have enough credits to post a project. You need ${JOB_POST_COST} credits, but you have ${(user as Client).balance_credits}.`);
            return;
        }

        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmPublish = async () => {
        if (!user) return;
        
        setIsSubmitting(true);
        try {
            const finalData = {
                ...formData,
                invoicingTerms: skipInvoicing ? 'Не указано' : formData.invoicingTerms
            };
            const { updatedClient } = await api.createJob(finalData, user as Client);
            updateUser(updatedClient);
            setIsConfirmModalOpen(false);
            alert('Project posted successfully! 30 credits have been deducted from your balance.');
            navigate('/client/dashboard');
        } catch (error: any) {
            console.error('Failed to post project:', error);
            setError(error.message || 'An error occurred while posting the project. Please try again.');
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
                        <BackButton />
                        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Создать новый заказ</h1>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            <FormSection title="Общие сведения о заказе" number={1}>
                                <FormInput label="Название проекта / объекта" id="projectName" name="projectName" required value={formData.projectName} onChange={handleInputChange} error={errors.projectName} />
                                <FormSelect label="Вид работ" id="jobType" name="jobType" value={formData.jobType} onChange={handleInputChange}>
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
                                <FormTextarea label="Краткое описание проекта (до 500 символов)" id="projectDescription" name="projectDescription" required maxLength={500} value={formData.projectDescription} onChange={handleInputChange} error={errors.projectDescription}/>
                            </FormSection>

                             <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
                                <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                                    <span className="text-brand-primary">🖼️</span> Фотографии проекта (Опционально)
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
                                                <span className="text-sm mt-2">Добавить фото</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handlePhotoUpload}
                                    className="hidden" 
                                />
                            </div>

                            <FormSection title="Местоположение и сроки" number={2}>
                                <FormInput label="Город" id="city" name="city" type="text" required value={formData.city} onChange={handleInputChange} error={errors.city} />
                                <FormSelect label="Страна" id="country" name="country" value={formData.country} onChange={handleInputChange}>
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </FormSelect>
                                <FormInput label="Начало (от)" id="startDate" name="startDate" type="date" required value={formData.startDate} onChange={handleInputChange} error={errors.startDate}/>
                                <FormInput label="Окончание (до)" id="endDate" name="endDate" type="date" required value={formData.endDate} onChange={handleInputChange} error={errors.endDate}/>
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
                                <FormInput label="Количество рабочих часов в неделю" id="workHoursPerWeek" name="workHoursPerWeek" type="text" required placeholder="например 40–60" value={formData.workHoursPerWeek} onChange={handleInputChange} error={errors.workHoursPerWeek} />
                            </FormSection>
                            
                             <FormSection title="Требования к рабочей силе" number={3}>
                                <FormInput label="Сколько сотрудников требуется" id="numberOfEmployees" name="numberOfEmployees" type="number" min="1" required value={formData.numberOfEmployees} onChange={handleInputChange} />
                                
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormSelect label="Требуемый язык общения" id="communicationLanguage" name="communicationLanguage" value={formData.communicationLanguage} onChange={handleInputChange}>
                                         {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                         <option value="other">другой</option>
                                    </FormSelect>
                                    {formData.communicationLanguage === 'other' && (
                                         <FormInput label="Укажите язык" id="otherLanguage" name="otherLanguage" type="text" required value={formData.otherLanguage} onChange={handleInputChange} error={errors.otherLanguage} />
                                    )}
                                </div>
                                
                                <FormInput label="Сколько сотрудников должны владеть языком" id="languageProficientEmployees" name="languageProficientEmployees" type="number" min="1" required value={formData.languageProficientEmployees} onChange={handleInputChange} error={errors.languageProficientEmployees}/>
                                <FormSelect label="Минимальный уровень языка (CEFR)" id="minLanguageLevel" name="minLanguageLevel" value={formData.minLanguageLevel} onChange={handleInputChange}>
                                     {cefrLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                </FormSelect>
                            </FormSection>

                             <FormSection title="Условия и ресурсы" number={4}>
                                <ModernToggle label="Инструмент предоставляется заказчиком" value={formData.toolsProvided} onChange={(val) => handleToggleChange('toolsProvided', val)} />
                                <ModernToggle label="Материал предоставляется заказчиком" value={formData.materialsProvided} onChange={(val) => handleToggleChange('materialsProvided', val)} />
                                <ModernToggle label="Жильё предоставляется заказчиком" value={formData.accommodationProvided} onChange={(val) => handleToggleChange('accommodationProvided', val)} />
                                
                                <div className="md:col-span-2">
                                    <label htmlFor="invoicingTerms" className="block text-sm font-medium text-brand-text-primary mb-1">
                                        Фактурация (условия оплаты) {!skipInvoicing && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <input 
                                            type="text" 
                                            id="invoicingTerms" 
                                            name="invoicingTerms" 
                                            value={skipInvoicing ? '' : formData.invoicingTerms} 
                                            onChange={handleInputChange} 
                                            disabled={skipInvoicing}
                                            placeholder="например 50/50"
                                            className={`flex-1 bg-brand-background border ${errors.invoicingTerms ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50 disabled:bg-gray-100`} 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setSkipInvoicing(!skipInvoicing);
                                                if (!skipInvoicing) {
                                                    setFormData(prev => ({...prev, invoicingTerms: ''}));
                                                    setErrors(prev => { const n = {...prev}; delete n.invoicingTerms; return n; });
                                                }
                                            }}
                                            className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${skipInvoicing ? 'bg-brand-text-primary text-white border-transparent' : 'bg-brand-surface text-brand-text-secondary border-brand-border hover:bg-gray-50'}`}
                                        >
                                            {skipInvoicing ? 'Не указывать (Выбрано)' : 'Не указывать'}
                                        </button>
                                    </div>
                                    {errors.invoicingTerms && !skipInvoicing && <p className="mt-1 text-sm text-brand-red">{errors.invoicingTerms}</p>}
                                </div>
                            </FormSection>

                            <FormSection title="Оплата и подрядчик" number={5}>
                                <FormInput label="Предлагаемая ставка (€/час) - От" id="hourlyRateFrom" name="hourlyRateFrom" type="number" min="0" required value={formData.hourlyRateFrom} onChange={handleInputChange} error={errors.hourlyRateFrom} />
                                <FormInput label="Предлагаемая ставка (€/час) - До" id="hourlyRateTo" name="hourlyRateTo" type="number" min="0" required value={formData.hourlyRateTo} onChange={handleInputChange} error={errors.hourlyRateTo} />
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-brand-text-primary mb-2">
                                        Предпочитаемая страна подрядчика (до 3-х стран)
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
                                        <input 
                                            type="text" 
                                            value={countryInput}
                                            onChange={(e) => setCountryInput(e.target.value)}
                                            onKeyDown={handleAddCountry}
                                            placeholder="Введите страну и нажмите Enter"
                                            className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary"
                                        />
                                    )}
                                    <p className="text-xs text-brand-text-secondary mt-1">
                                        Напишите название страны и нажмите Enter.
                                    </p>
                                </div>
                            </FormSection>

                            <FormSection title="Дополнительная информация" number={6}>
                                 <FormTextarea label="Дополнительные сведения / комментарии (опционально)" id="additionalComments" name="additionalComments" value={formData.additionalComments} onChange={handleInputChange} error={errors.additionalComments}/>
                            </FormSection>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                                    <strong className="font-bold">Ошибка!</strong>
                                    <span className="block sm:inline ml-2">{error}</span>
                                    {error.includes('Not enough credits') && (
                                        <Link to="/client/payments" className="font-bold underline ml-2 hover:text-red-900">Buy Credits</Link>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => navigate('/client/dashboard')} className="bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-6 rounded-lg">Отмена</button>
                                <button type="submit" disabled={isSubmitting || isUploading} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Публикация...' : 'Опубликовать (30 кредитов)'}
                                </button>
                            </div>
                        </form>

                        {isConfirmModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                                <div className="bg-brand-surface p-8 rounded-lg max-w-md w-full mx-4 shadow-xl">
                                    <h3 className="text-xl font-bold text-brand-text-primary">Подтвердите публикацию</h3>
                                    <p className="mt-4 text-brand-text-secondary">
                                        Убедитесь что данные заказа верны. После публикации заказа будет невозможно его отредактировать.
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