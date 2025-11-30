
import { UserRole, Client, Contractor, Job, CreditPackage, Transaction, Application, CompanyProfile, ContractorProfile, JobDetails } from '../types';
import { COUNTRIES } from '../utils/countries';

// --- MOCK DATA ---

export const MOCK_CLIENT: Client = {
    id: 'client-1',
    name: 'John Doe',
    email: 'client@test.com',
    avatar: 'https://i.pravatar.cc/150?u=client1',
    role: UserRole.Client,
    companyName: 'West EU Construction GmbH',
    balance_credits: 0,
};

export const MOCK_CONTRACTOR: Contractor = {
    id: 'contractor-1',
    name: 'Ivan Petrov',
    email: 'contractor@test.com',
    avatar: 'https://i.pravatar.cc/150?u=contractor1',
    role: UserRole.Contractor,
    companyName: 'Ivan Petrov Construction',
    balance_credits: 0,
    skills: ['Bricklaying', 'Plastering', 'Concrete work'],
    rating: 0,
};

const MOCK_JOBS: Job[] = [
    {
        id: 'job-1',
        title: 'Maurerarbeiten für Wohnkomplex',
        category: 'bricklayer',
        budget: { type: 'range', minAmount: 28, maxAmount: 35 },
        city: 'Berlin',
        country: 'DE',
        start_date: '2023-11-15',
        duration_days: 90,
        created_at: '2023-10-20T10:00:00Z',
        posted_by: { id: 'client-1', company: 'West EU Construction GmbH' },
        status: 'Active',
        views: 124,
        applications: 3,
        details: {
            projectName: 'Wohnpark Berlin-Mitte',
            jobType: 'bricklayer',
            projectDescription: 'Wir suchen ein erfahrenes Team von Maurern (mindestens 6 Personen) für den Rohbau eines neuen Wohnkomplexes in Berlin. Material und Kräne werden gestellt.',
            city: 'Berlin',
            country: 'Deutschland',
            startDate: '2023-11-15',
            endDate: '2024-02-15',
            workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            workHoursPerWeek: '40-50',
            numberOfEmployees: 6,
            communicationLanguage: 'German',
            languageProficientEmployees: 1,
            minLanguageLevel: 'A2',
            toolsProvided: 'no',
            materialsProvided: 'yes',
            accommodationProvided: 'yes',
            invoicingTerms: '14 Tage',
            hourlyRateFrom: '28',
            hourlyRateTo: '35',
            preferredContractorCountry: ['Poland', 'Czech Republic'],
            photos: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1590644365607-1c5a38fc610c?q=80&w=2072&auto=format&fit=crop']
        },
        photos: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop']
    },
    {
        id: 'job-2',
        title: 'Elektroinstallation Industriehalle',
        category: 'electrician',
        budget: { type: 'range', minAmount: 30, maxAmount: 40 },
        city: 'München',
        country: 'DE',
        start_date: '2023-12-01',
        duration_days: 45,
        created_at: '2023-10-22T14:30:00Z',
        posted_by: { id: 'client-1', company: 'West EU Construction GmbH' },
        status: 'Active',
        views: 89,
        applications: 1,
        details: {
            projectName: 'Logistikzentrum München Ost',
            jobType: 'electrician',
            projectDescription: 'Komplette Elektroinstallation für eine neue Lagerhalle. Kabelzug, Trassenbau, Beleuchtung und Anschluss von Verteilerschränken.',
            city: 'München',
            country: 'Deutschland',
            startDate: '2023-12-01',
            endDate: '2024-01-15',
            workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            workHoursPerWeek: '50-60',
            numberOfEmployees: 4,
            communicationLanguage: 'English',
            languageProficientEmployees: 1,
            minLanguageLevel: 'B1',
            toolsProvided: 'unspecified',
            materialsProvided: 'yes',
            accommodationProvided: 'no',
            invoicingTerms: '30 Tage',
            hourlyRateFrom: '30',
            hourlyRateTo: '40',
            preferredContractorCountry: [],
            photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop']
        },
        photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop']
    },
     {
        id: 'job-3',
        title: 'Trockenbau Bürogebäude',
        category: 'drywall_fitter',
        budget: { type: 'fixed', amount: 45000 },
        city: 'Wien',
        country: 'AT',
        start_date: '2024-01-10',
        duration_days: 60,
        created_at: '2023-10-25T09:15:00Z',
        posted_by: { id: 'client-1', company: 'West EU Construction GmbH' },
        status: 'Active',
        views: 210,
        applications: 8,
        details: {
            projectName: 'Office Tower Vienna',
            jobType: 'drywall_fitter',
            projectDescription: 'Trockenbauarbeiten für 5 Etagen Bürofläche. Wände, Decken, Spachtelarbeiten Q3.',
            city: 'Wien',
            country: 'Österreich',
            startDate: '2024-01-10',
            endDate: '2024-03-10',
            workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            workHoursPerWeek: '40',
            numberOfEmployees: 8,
            communicationLanguage: 'German',
            languageProficientEmployees: 2,
            minLanguageLevel: 'B2',
            toolsProvided: 'no',
            materialsProvided: 'yes',
            accommodationProvided: 'yes',
            invoicingTerms: '14 Tage',
            hourlyRateFrom: '0',
            hourlyRateTo: '0',
            preferredContractorCountry: ['Slovakia', 'Hungary', 'Slovenia'],
            photos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop']
        },
        photos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop']
    }
];


const MOCK_APPLICATIONS: Application[] = [];

const MOCK_COMPANY_PROFILES: { [key: string]: CompanyProfile } = {
    'client-1': {
        id: 'client-1', companyName: 'West EU Construction GmbH', companyType: 'GmbH', vatId: 'DE123456789',
        description: 'Führendes Bauunternehmen in Deutschland, spezialisiert auf große Wohn- und Gewerbeprojekte.',
        slogan: 'Wir bauen die Zukunft, heute.',
        contactPerson: { fullName: 'John Doe', role: 'Project Manager', phone: '+49 123 4567890', email: 'j.doe@west-eu.com', showEmailPublicly: true, showPhonePublicly: false },
        address: { street: 'Musterstraße 1', zip: '10115', city: 'Berlin', country: 'Germany' },
        operationalCountries: ['Germany', 'Netherlands', 'Austria'], serviceCategories: ['Residential Construction', 'Commercial Buildings'],
        companySize: 150, portfolio: [], status: 'published',
        logoUrl: 'https://i.pravatar.cc/200?u=client-logo', coverImageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop',
    }
};

const MOCK_CONTRACTOR_PROFILES: { [key: string]: ContractorProfile } = {
    'contractor-1': {
        id: 'contractor-1', companyName: 'Ivan Petrov Construction', companyType: 'Sole Proprietor',
        description: 'Ein Team von hochqualifizierten Bauarbeitern aus Polen, spezialisiert auf Maurerarbeiten und allgemeinen Bau.',
        slogan: 'Qualitätshandwerk, pünktlich geliefert.',
        contactPerson: { fullName: 'Ivan Petrov', role: 'Owner', phone: '+48 987 654 321', email: 'ivan.p@contractor.pl', showEmailPublicly: false, showPhonePublicly: false },
        address: { street: 'Kwiatowa 5', zip: '00-001', city: 'Warsaw', country: 'Poland' },
        team: { companySize: 10 }, serviceCategories: ['Bricklaying', 'Masonry', 'General Construction'], portfolio: [],
        skills: ['bricklayer', 'concrete_worker'], languages: [{language: 'Polish', proficiency: 'Native'}, {language: 'German', proficiency: 'B1'}], experienceYears: 15, rating: 4.8,
        views: 0,
        logoUrl: 'https://i.pravatar.cc/200?u=contractor-logo', coverImageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
    }
};

const MOCK_TRANSACTIONS: Transaction[] = [];

let MOCK_USERS_DB: (Client | Contractor)[] = [MOCK_CLIENT, MOCK_CONTRACTOR];


// --- API SIMULATION ---

const UNLOCK_COST = 10;
const JOB_POST_COST = 30;

const api = {
    fetchJobs: (): Promise<Job[]> => new Promise(resolve => setTimeout(() => resolve([...MOCK_JOBS]), 500)),
    fetchClientJobs: (clientId: string): Promise<Job[]> => new Promise(resolve => setTimeout(() => resolve(MOCK_JOBS.filter(j => j.posted_by.id === clientId)), 500)),
    fetchJobById: (id: string): Promise<Job | undefined> => new Promise(resolve => setTimeout(() => resolve(MOCK_JOBS.find(j => j.id === id)), 500)),
    fetchJobApplications: (jobId: string): Promise<Application[]> => new Promise(resolve => setTimeout(() => resolve(MOCK_APPLICATIONS.filter(a => a.jobId === jobId)), 500)),
    deleteJob: (jobId: string): Promise<void> => new Promise(resolve => {
        const index = MOCK_JOBS.findIndex(j => j.id === jobId);
        if (index > -1) MOCK_JOBS.splice(index, 1);
        setTimeout(() => resolve(), 500);
    }),
    createJob: (formData: JobDetails, client: Client): Promise<{ updatedClient: Client }> => new Promise(resolve => {
        const newJob: Job = {
            id: `job-${Date.now()}`,
            title: formData.projectName,
            category: formData.jobType,
            budget: { type: 'range', minAmount: Number(formData.hourlyRateFrom), maxAmount: Number(formData.hourlyRateTo) },
            city: formData.city,
            country: 'DE', // Simplified for mock
            start_date: formData.startDate,
            duration_days: (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24),
            created_at: new Date().toISOString(),
            posted_by: { id: client.id, company: client.companyName },
            status: 'Active',
            views: 0,
            applications: 0,
            details: formData,
            photos: formData.photos,
            appliedBy: [],
            unlockedBy: [],
        };
        MOCK_JOBS.unshift(newJob);

        const newTransaction: Transaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Job Posting: ${newJob.title.substring(0, 20)}...`,
            amount: -JOB_POST_COST,
            status: 'Completed'
        };
        MOCK_TRANSACTIONS.unshift(newTransaction);
        
        const updatedClient = { ...client, balance_credits: client.balance_credits - JOB_POST_COST };
        setTimeout(() => resolve({ updatedClient }), 1000);
    }),
    mockUploadImage: (file: File): Promise<string> => new Promise(resolve => {
        setTimeout(() => resolve(URL.createObjectURL(file)), 1000);
    }),
    fetchCreditPackages: (): Promise<CreditPackage[]> => new Promise(resolve => setTimeout(() => resolve([
        { id: 'pkg1', name: 'Starter', credits: 50, price: 45, pricePerCredit: 0.90, popular: false },
        { id: 'pkg2', name: 'Business', credits: 100, price: 80, pricePerCredit: 0.80, popular: true, economy: '20% OFF' },
        { id: 'pkg3', name: 'Enterprise', credits: 250, price: 175, pricePerCredit: 0.70, popular: false, economy: '30% OFF' },
    ]), 500)),
    fetchTransactions: (userId: string): Promise<Transaction[]> => new Promise(resolve => setTimeout(() => resolve(MOCK_TRANSACTIONS), 500)),
    fetchClientCreditPackages: (): Promise<CreditPackage[]> => api.fetchCreditPackages(),
    fetchClientTransactions: (clientId: string): Promise<Transaction[]> => api.fetchTransactions(clientId),
    purchaseCreditsForClient: (client: Client, pkg: CreditPackage): Promise<Client> => new Promise(resolve => {
        const updatedClient = { ...client, balance_credits: client.balance_credits + pkg.credits };
         const newTransaction: Transaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Purchase ${pkg.name} Package`,
            amount: pkg.price,
            status: 'Completed',
            invoiceUrl: '#'
        };
        MOCK_TRANSACTIONS.unshift(newTransaction);
        setTimeout(() => resolve(updatedClient), 1000);
    }),
    purchaseCreditsForContractor: (contractor: Contractor, pkg: CreditPackage): Promise<Contractor> => new Promise(resolve => {
        const updatedContractor = { ...contractor, balance_credits: contractor.balance_credits + pkg.credits };
         const newTransaction: Transaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Purchase ${pkg.name} Package`,
            amount: pkg.price,
            status: 'Completed',
            invoiceUrl: '#'
        };
        MOCK_TRANSACTIONS.unshift(newTransaction);
        
        if (MOCK_CONTRACTOR.id === contractor.id) {
            MOCK_CONTRACTOR.balance_credits = updatedContractor.balance_credits;
        }

        setTimeout(() => resolve(updatedContractor), 1000);
    }),
    fetchCompanyProfile: (clientId: string): Promise<CompanyProfile | undefined> => new Promise(resolve => setTimeout(() => resolve(MOCK_COMPANY_PROFILES[clientId]), 500)),
    updateCompanyProfile: (clientId: string, profile: CompanyProfile): Promise<CompanyProfile> => new Promise(resolve => {
        MOCK_COMPANY_PROFILES[clientId] = profile;
        setTimeout(() => resolve(profile), 1000);
    }),
    fetchContractorProfile: (contractorId: string): Promise<ContractorProfile | undefined> => new Promise(resolve => setTimeout(() => resolve(MOCK_CONTRACTOR_PROFILES[contractorId]), 500)),
    updateContractorProfile: (contractorId: string, profile: ContractorProfile): Promise<ContractorProfile> => new Promise(resolve => {
        MOCK_CONTRACTOR_PROFILES[contractorId] = profile;
        setTimeout(() => resolve(profile), 1000);
    }),
    fetchUnlockedJobsForContractor: (contractorId: string): Promise<Job[]> => new Promise(resolve => {
        setTimeout(() => {
            const unlocked = MOCK_JOBS.filter(job => 
                job.unlockedBy?.some(u => u.contractorId === contractorId)
            );
            resolve(unlocked);
        }, 500);
    }),
    unlockJobContact: (jobId: string, contractor: Contractor): Promise<{ updatedJob: Job, updatedContractor: Contractor }> => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (contractor.balance_credits < UNLOCK_COST) {
                return reject(new Error('Nicht genügend Credits.'));
            }

            const job = MOCK_JOBS.find(j => j.id === jobId);
            if (!job) {
                return reject(new Error('Auftrag nicht gefunden.'));
            }

            if (!job.unlockedBy) {
                job.unlockedBy = [];
            }

            if (job.unlockedBy.some(u => u.contractorId === contractor.id)) {
                return resolve({ updatedJob: job, updatedContractor: contractor });
            }
            
            const contractorProfile = MOCK_CONTRACTOR_PROFILES[contractor.id];
            const countryCode = COUNTRIES.find(c => c.name === contractorProfile?.address.country)?.code.toLowerCase() || 'pl';

            job.unlockedBy.push({
                contractorId: contractor.id,
                contractorName: contractorProfile?.companyName || contractor.name,
                contractorCountryCode: countryCode,
                unlockedAt: new Date().toISOString()
            });

            const newTransaction: Transaction = {
                id: `tx-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                description: `Kontaktfreischaltung: ${job.title.substring(0,20)}...`,
                amount: -UNLOCK_COST,
                status: 'Completed'
            };
            MOCK_TRANSACTIONS.unshift(newTransaction);
            
            const updatedContractor = { ...contractor, balance_credits: contractor.balance_credits - UNLOCK_COST };

            if (MOCK_CONTRACTOR.id === contractor.id) {
                MOCK_CONTRACTOR.balance_credits = updatedContractor.balance_credits;
            }
            
            resolve({ updatedJob: job, updatedContractor });
        }, 500);
    }),

    submitApplication: (jobId: string, contractorId: string, message: string): Promise<Application> => new Promise((resolve, reject) => {
        setTimeout(() => {
            const job = MOCK_JOBS.find(j => j.id === jobId);
            if (!job) {
                return reject(new Error('Auftrag nicht gefunden.'));
            }

            if (!job.appliedBy) {
                job.appliedBy = [];
            }

            if (job.appliedBy.includes(contractorId)) {
                return reject(new Error('Sie haben sich bereits für diesen Auftrag beworben.'));
            }

            job.appliedBy.push(contractorId);
            job.applications += 1;

            const newApplication: Application = {
                id: `app-${Date.now()}`,
                jobId,
                contractor: MOCK_CONTRACTOR,
                message,
                date_applied: new Date().toISOString(),
            };

            MOCK_APPLICATIONS.unshift(newApplication);

            resolve(newApplication);
        }, 500);
    }),

    fetchContractorApplicationsCount: (contractorId: string): Promise<number> => new Promise(resolve => {
        setTimeout(() => {
            const count = MOCK_JOBS.filter(job => job.appliedBy?.includes(contractorId)).length;
            resolve(count);
        }, 300);
    }),

    incrementContractorProfileView: (contractorId: string): Promise<void> => new Promise(resolve => {
        if (MOCK_CONTRACTOR_PROFILES[contractorId]) {
            MOCK_CONTRACTOR_PROFILES[contractorId].views += 1;
        }
        setTimeout(() => resolve(), 100);
    }),

    incrementJobView: (jobId: string): Promise<void> => new Promise(resolve => {
        const job = MOCK_JOBS.find(j => j.id === jobId);
        if (job) {
            job.views += 1;
        }
        setTimeout(() => resolve(), 100);
    }),

    signUpClient: (profileData: CompanyProfile, accountData: {email: string}): Promise<Client> => new Promise((resolve, reject) => {
        if (MOCK_USERS_DB.some(u => u.email === accountData.email)) {
            return reject(new Error('Benutzer mit dieser E-Mail existiert bereits.'));
        }
        
        const newClientId = `client-${Date.now()}`;
        const newClient: Client = {
            id: newClientId,
            name: profileData.contactPerson.fullName,
            email: accountData.email,
            avatar: profileData.logoUrl || `https://i.pravatar.cc/150?u=${newClientId}`,
            role: UserRole.Client,
            companyName: profileData.companyName,
            balance_credits: 0, // New users start with 0 credits
        };

        const newCompanyProfile: CompanyProfile = {
            ...profileData,
            id: newClientId,
        };

        MOCK_USERS_DB.push(newClient);
        MOCK_COMPANY_PROFILES[newClientId] = newCompanyProfile;

        setTimeout(() => resolve(newClient), 1000);
    }),

    signUpContractor: (profileData: ContractorProfile, accountData: {email: string}): Promise<Contractor> => new Promise((resolve, reject) => {
         if (MOCK_USERS_DB.some(u => u.email === accountData.email)) {
            return reject(new Error('Benutzer mit dieser E-Mail existiert bereits.'));
        }

        const newContractorId = `contractor-${Date.now()}`;
        const newContractor: Contractor = {
            id: newContractorId,
            name: profileData.contactPerson.fullName,
            email: accountData.email,
            avatar: profileData.logoUrl || `https://i.pravatar.cc/150?u=${newContractorId}`,
            role: UserRole.Contractor,
            companyName: profileData.companyName,
            balance_credits: 0,
            skills: profileData.skills || [],
            rating: 0,
        };
        
        const newContractorProfile: ContractorProfile = {
            ...profileData,
            id: newContractorId,
        };

        MOCK_USERS_DB.push(newContractor);
        MOCK_CONTRACTOR_PROFILES[newContractorId] = newContractorProfile;

        setTimeout(() => resolve(newContractor), 1000);
    }),
};

export default api;
