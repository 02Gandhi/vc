
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Job, UserRole } from '../types';
import api from '../services/apiService';
import PublicSidebar from '../components/PublicSidebar';
import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, MOCK_CITIES } from '../utils/countries';

const DADATA_API_KEY = "2292624f5ca19ecd149b3ddd2042c89ac055be3f";

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

const JobCard: React.FC<{ job: Job; userRole?: UserRole }> = ({ job, userRole }) => {
    const budgetText = job.budget.type === 'fixed' 
        ? `€${job.budget.amount?.toLocaleString()}` 
        : `€${job.budget.minAmount?.toLocaleString()} - €${job.budget.maxAmount?.toLocaleString()}`;
    const categoryLabel = getCategoryLabel(job.category);
    
    // Contractors go to internal details, Clients/Guests go to public details (or client specific if needed)
    const linkTo = userRole === UserRole.Contractor 
        ? `/jobs/${job.id}` 
        : `/jobs/public/${job.id}`;

    // Safely get country for flag (fallback to DE if missing to prevent crash)
    const countryCode = job.country ? job.country.toLowerCase() : 'de';
    const startDate = job.start_date ? new Date(job.start_date).toLocaleDateString() : 'N/A';
    const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A';
    const city = job.city || 'Unknown';
    const countryName = countryCodeToName[job.country] || job.country || 'Unknown';

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
                    <Link to={linkTo} className="group-hover:text-brand-primary transition-colors duration-200">{categoryLabel}</Link>
                </h4>
                
                <div className="space-y-2 text-sm text-brand-text-secondary">
                    <div className="flex items-center">
                        <img
                            src={`https://flagcdn.com/w20/${countryCode}.png`}
                            alt={`${countryName} flag`}
                            className="h-4 w-auto mr-2 rounded-sm"
                        />
                        {city}, {countryName}
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        Дата начала: {startDate}
                    </div>
                    <div className="flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-brand-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        Длительность: {job.duration_days || 0} дн.
                    </div>
                </div>
            </div>
            <div className="bg-brand-background px-5 py-3 flex justify-between items-center text-sm border-t border-brand-border">
                <span className="text-xs text-brand-text-secondary">Опубликовано: {postedDate}</span>
                <Link to={linkTo} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-md text-sm transition-colors duration-200">
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

const JobListContent: React.FC = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        country: '',
        city: '',
        category: '',
    });
    
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const cityInputRef = useRef<HTMLDivElement>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [showAllOnFirstPage, setShowAllOnFirstPage] = useState(false);
    const JOBS_PER_PAGE = 10;
    const INITIAL_JOBS_ON_FIRST_PAGE = 5;

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                const allJobs = await api.fetchJobs();
                if (isMounted) setJobs(allJobs);
            } catch (error) {
                console.error("Failed to load jobs:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
                setShowCitySuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
             if (!filters.city || filters.city.length < 2) {
                setCitySuggestions([]);
                setShowCitySuggestions(false);
                return;
            }
            
            try {
                const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Token " + DADATA_API_KEY
                    },
                    body: JSON.stringify({
                        query: filters.city,
                        locations: filters.country ? [{ country_iso_code: filters.country }] : [],
                        from_bound: { value: "city" },
                        to_bound: { value: "settlement" },
                        language: "en"
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
                const russianCountryName = COUNTRIES.find(c => c.code === filters.country)?.name;
                const cities = russianCountryName ? MOCK_CITIES[russianCountryName] : MOCK_CITIES['default'];
                if (cities) {
                     const filtered = cities.filter(c => c.toLowerCase().includes(filters.city.toLowerCase()));
                     setCitySuggestions(filtered);
                     setShowCitySuggestions(filtered.length > 0);
                }
            }
        }
        const timeoutId = setTimeout(fetchCities, 500);
        return () => clearTimeout(timeoutId);
    }, [filters.city, filters.country]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentPage(1);
        setShowAllOnFirstPage(false);
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'country') {
                newFilters.city = '';
                setCitySuggestions([]);
            }
            return newFilters;
        });
    };

    const selectCity = (city: string) => {
        setFilters(prev => ({ ...prev, city }));
        setShowCitySuggestions(false);
    };

    const handleClearFilters = () => {
        setCurrentPage(1);
        setShowAllOnFirstPage(false);
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
                (filters.city ? job.city.toLowerCase().includes(filters.city.toLowerCase()) : true) &&
                (filters.category ? job.category === filters.category : true)
            );
        });
    }, [jobs, filters]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

    const jobsToRender = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        const endIndex = startIndex + JOBS_PER_PAGE;
        const jobsForPage = filteredJobs.slice(startIndex, endIndex);

        if (currentPage === 1 && !showAllOnFirstPage && !user) {
            // Only limit initial jobs for public users (landing page style)
            return jobsForPage.slice(0, INITIAL_JOBS_ON_FIRST_PAGE);
        }
        
        return jobsForPage;
    }, [filteredJobs, currentPage, showAllOnFirstPage, user]);

    return (
        <>
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
                    
                    <div ref={cityInputRef} className="relative w-full">
                        <input 
                            type="text"
                            name="city"
                            value={filters.city}
                            onChange={handleFilterChange}
                            placeholder="Город (например, Берлин)"
                            className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2"
                            autoComplete="off"
                        />
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
                        {jobsToRender.map(job => <JobCard key={job.id} job={job} userRole={user?.role} />)}
                    </div>

                    {!user && currentPage === 1 && !showAllOnFirstPage && filteredJobs.length > INITIAL_JOBS_ON_FIRST_PAGE && (
                        <div className="text-center mt-8">
                            <button
                                onClick={() => setShowAllOnFirstPage(true)}
                                className="bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-primary font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Показать больше
                            </button>
                        </div>
                    )}

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
        </>
    );
}

const PublicJobListPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
         return <div className="flex items-center justify-center h-screen bg-brand-background text-brand-text-primary">Загрузка...</div>;
    }

    if (user) {
        // Authenticated View (Contractor or Client on home page)
        // Ensure strictly separate layout to prevent hooks conflicts or re-render issues
        return (
            <div className="flex h-screen bg-brand-background text-brand-text-primary">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                        <div className="container mx-auto">
                            <JobListContent />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // Guest View
    return (
        <div className="flex flex-col min-h-screen bg-brand-background text-brand-text-primary">
            <Header />
            <div className="container mx-auto flex flex-1 px-4 py-6">
                <PublicSidebar />
                <main className="flex-1 lg:pl-6 w-full lg:w-auto">
                    <JobListContent />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PublicJobListPage;
