import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { Job } from '../types';
import api from '../services/apiService';

const countryCodeToName: { [key: string]: string } = {
    'DE': 'Германия', 'NL': 'Нидерланды', 'AT': 'Австрия', 'BE': 'Бельгия', 
    'LU': 'Люксембург', 'FR': 'Франция', 'CH': 'Швейцария', 'PL': 'Польша'
};

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

const getCategoryLabel = (categoryValue: string): string => {
    for (const group of Object.values(jobCategories)) {
        const found = group.find(cat => cat.value === categoryValue);
        if (found) {
            return found.label;
        }
    }
    return categoryValue.replace(/_/g, ' '); // fallback
};

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
    const budgetText = job.budget.type === 'fixed' 
        ? `€${job.budget.amount?.toLocaleString()}` 
        : `€${job.budget.minAmount?.toLocaleString()} - €${job.budget.maxAmount?.toLocaleString()}`;
    const categoryLabel = getCategoryLabel(job.category);
    
    return (
        <div className="bg-brand-surface rounded-lg border border-brand-border overflow-hidden transition-all duration-300 hover:border-brand-primary hover:shadow-lg">
            <div className="p-5">
                <div className="flex justify-end items-start mb-3">
                    <div className="text-right">
                         <p className="text-xl font-bold text-brand-text-primary">{budgetText}</p>
                         <p className="text-xs text-brand-text-secondary capitalize">{job.budget.type === 'range' ? 'Почасовая ставка' : 'Фиксированная цена'}</p>
                    </div>
                </div>

                <h4 className="text-lg font-bold text-brand-text-primary mb-2 group">
                    <Link to={`/jobs/${job.id}`} className="group-hover:text-brand-primary transition-colors duration-200">{categoryLabel}</Link>
                </h4>
                
                <div className="space-y-2 text-sm text-brand-text-secondary">
                    <div className="flex items-center">
                        <img
                            src={`https://flagcdn.com/w20/${job.country.toLowerCase()}.png`}
                            alt={`${countryCodeToName[job.country] || job.country} flag`}
                            className="h-4 w-auto mr-2 rounded-sm"
                        />
                        {job.city}, {countryCodeToName[job.country] || job.country}
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        Дата начала: {new Date(job.start_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        Длительность: {job.duration_days} дн.
                    </div>
                </div>
            </div>
            <div className="bg-brand-background px-5 py-3 flex justify-between items-center text-sm border-t border-brand-border">
                <span className="text-xs text-brand-text-secondary">Опубликовано: {new Date(job.created_at).toLocaleDateString()}</span>
                <Link to={`/jobs/${job.id}`} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-md text-sm transition-colors duration-200">
                    Посмотреть детали
                </Link>
            </div>
        </div>
    );
};

const countries = [
    { code: '', name: 'Все страны' },
    { code: 'DE', name: 'Германия' },
    { code: 'NL', name: 'Нидерланды' },
    { code: 'AT', name: 'Австрия' },
    { code: 'BE', name: 'Бельгия' },
    { code: 'LU', name: 'Люксембург' },
    { code: 'FR', name: 'Франция' },
    { code: 'CH', name: 'Швейцария' },
    { code: 'PL', name: 'Польша' },
];

const citiesByCountry: { [key: string]: string[] } = {
    'DE': ['Berlin', 'München', 'Hamburg', 'Frankfurt', 'Köln'],
    'NL': ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht'],
    'AT': ['Wien', 'Salzburg', 'Innsbruck'],
    'BE': ['Brüssel', 'Antwerpen', 'Gent'],
    'LU': ['Luxemburg'],
    'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse'],
    'CH': ['Zürich', 'Genf', 'Basel'],
    'PL': ['Warschau', 'Krakau', 'Danzig'],
};

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="flex justify-center mt-8" aria-label="Pagination">
            <ul className="flex items-center space-x-2">
                {pageNumbers.map(number => (
                    <li key={number}>
                        <button
                            onClick={() => onPageChange(number)}
                            aria-current={currentPage === number ? 'page' : undefined}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === number
                                    ? 'bg-brand-primary text-white shadow'
                                    : 'bg-brand-surface text-brand-text-primary hover:bg-brand-background'
                            }`}
                        >
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const ContractorDashboardPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        country: '',
        city: '',
        category: '',
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const JOBS_PER_PAGE = 10;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const allJobs = await api.fetchJobs();
                setJobs(allJobs);
            } catch (error) {
                console.error("Failed to load jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentPage(1);
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'country') {
                newFilters.city = '';
            }
            return newFilters;
        });
    };

    const handleClearFilters = () => {
        setCurrentPage(1);
        setFilters({
            country: '',
            city: '',
            category: '',
        });
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            return (
                (filters.country ? job.country === filters.country : true) &&
                (filters.city ? job.city === filters.city : true) &&
                (filters.category ? job.category === filters.category : true)
            );
        });
    }, [jobs, filters]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

    const jobsToRender = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        const endIndex = startIndex + JOBS_PER_PAGE;
        return filteredJobs.slice(startIndex, endIndex);
    }, [filteredJobs, currentPage]);

    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                    <div className="container mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-brand-text-primary mb-2">Найти заказы</h1>
                            <p className="text-brand-text-secondary">Здесь вы найдете доступные заказы от ведущих западноевропейских компаний.</p>
                        </div>
                        
                        <div className="bg-brand-surface p-4 rounded-lg border border-brand-border mb-8 sticky top-[80px] z-30 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                               <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full bg-brand-background border-brand-border rounded-md px-3 py-2">
                                    <option value="">Все категории</option>
                                    {Object.entries(jobCategories).map(([groupLabel, options]) => (
                                        <optgroup label={groupLabel} key={groupLabel}>
                                            {options.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <select name="country" value={filters.country} onChange={handleFilterChange} className="w-full bg-brand-background border-brand-border rounded-md px-3 py-2">
                                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                                <select name="city" value={filters.city} onChange={handleFilterChange} disabled={!filters.country} className="w-full bg-brand-background border-brand-border rounded-md px-3 py-2 disabled:opacity-50">
                                    <option value="">Все города</option>
                                    {filters.country && citiesByCountry[filters.country]?.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center self-end h-[42px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Сбросить
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <p className="text-center">Загрузка проектов...</p>
                        ) : jobsToRender.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-6">
                                    {jobsToRender.map(job => <JobCard key={job.id} job={job} />)}
                                </div>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        ) : (
                            <div className="text-center bg-brand-surface border border-brand-border p-8 rounded-lg">
                                <h3 className="text-xl font-semibold text-brand-text-primary">Проекты не найдены</h3>
                                <p className="text-brand-text-secondary mt-2">Попробуйте изменить критерии поиска.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ContractorDashboardPage;