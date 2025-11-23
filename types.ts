
export enum UserRole {
  Client = 'client',
  Contractor = 'contractor',
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Client extends BaseUser {
  role: UserRole.Client;
  companyName: string;
  balance_credits: number;
}

export interface Contractor extends BaseUser {
  role: UserRole.Contractor;
  companyName: string;
  balance_credits: number;
  skills: string[];
  rating: number;
}

export type User = Client | Contractor;

export interface JobBudget {
  type: 'fixed' | 'range';
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface JobDetails {
    projectName: string;
    jobType: string;
    projectDescription: string;
    city: string;
    country: string;
    startDate: string;
    endDate: string;
    workDays: string[];
    workHoursPerWeek: string;
    numberOfEmployees: number;
    communicationLanguage: string;
    otherLanguage?: string;
    languageProficientEmployees: number;
    minLanguageLevel: string;
    toolsProvided: 'yes' | 'no' | 'unspecified';
    materialsProvided: 'yes' | 'no' | 'unspecified';
    accommodationProvided: 'yes' | 'no' | 'unspecified';
    invoicingTerms?: string;
    hourlyRateFrom: string;
    hourlyRateTo: string;
    preferredContractorCountry: string[];
    otherPreferredContractorCountry?: string;
    additionalComments?: string;
    photos: string[];
}

export interface UnlockedBy {
    contractorId: string;
    contractorName: string;
    contractorCountryCode: string;
    unlockedAt: string;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  budget: JobBudget;
  city: string;
  country: string;
  start_date: string;
  duration_days: number;
  created_at: string;
  posted_by: {
    id: string;
    company: string;
  };
  status: 'Active' | 'Completed' | 'Closed';
  views: number;
  applications: number;
  details: JobDetails;
  photos: string[];
  unlockedBy?: UnlockedBy[];
  appliedBy?: string[];
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular: boolean;
  economy?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Completed' | 'Failed';
  invoiceUrl?: string;
}

export interface Application {
  id: string;
  jobId: string;
  contractor: Contractor;
  message: string;
  date_applied: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  location: string;
  dateCompleted: string;
  projectSize: string;
  images: string[];
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  tradingName?: string;
  companyType: string;
  vatId?: string;
  description?: string;
  slogan?: string;
  contactPerson: {
    fullName: string;
    role: string;
    phone: string;
    email: string;
    showEmailPublicly: boolean;
    showPhonePublicly: boolean;
  };
  website?: string;
  linkedin?: string;
  address: {
    street: string;
    zip: string;
    city: string;
    country: string;
  };
  operationalCountries: string[];
  serviceCategories: string[];
  companySize: number;
  portfolio: PortfolioItem[];
  status: 'published' | 'draft';
  coverImageUrl?: string;
  logoUrl?: string;
}


export interface ContractorPortfolioProject {
    id: string;
    title: string;
    description: string;
    location: string;
    dateStart: string;
    dateEnd: string;
    projectValue: number;
    currency: string;
    images: string[];
}

export interface ContractorProfile {
    id: string;
    companyName: string;
    tradingName?: string;
    companyType: string;
    vatId?: string;
    slogan?: string;
    description?: string;
    address: {
        street: string;
        zip: string;
        city: string;
        country: string;
    };
    contactPerson: {
        fullName: string;
        role: string;
        phone: string;
        email: string;
        showEmailPublicly: boolean;
        showPhonePublicly: boolean;
    };
    website?: string;
    socials?: {
        linkedin?: string;
    };
    portfolio: ContractorPortfolioProject[];
    coverImageUrl?: string;
    logoUrl?: string;
    serviceCategories: string[];
    team: {
        companySize: number;
    };
    skills: string[];
    languages: { language: string, proficiency: string }[];
    experienceYears: number;
    rating: number;
    views: number;
}
