import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import { CompanyProfile } from '../types';
import { COUNTRIES } from '../utils/countries';

const LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyMDAgNDAiPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOTczMTYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlN1YnBvcnRhbDwvdGV4dD4KPC9zdmc+";

const LATIN_REGEX = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}~€]*$/;

const FormSection: React.FC<{ title: string; number: string; children: React.ReactNode; description?: string }> = ({ title, number, children, description }) => (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
        <h2 className="text-xl font-bold text-brand-text-primary mb-2 flex items-center">
            <span className="bg-brand-primary/10 text-brand-primary rounded-full h-8 w-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">{number}</span> {title}
        </h2>
        {description && <p className="text-brand-text-secondary mb-6 ml-11 text-sm">{description}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, error, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
        <input {...props} className={`w-full bg-brand-background border ${error ? 'border-brand-red' : 'border-brand-border'} rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary`} />
        {error && <p className="mt-1 text-sm text-brand-red">{error}</p>}
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }> = ({ label, children, ...props }) => (
     <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-brand-text-primary mb-1">{label}</label>
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


const CompanyProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                setLoading(true);
                const fetchedProfile = await api.fetchCompanyProfile(user.id);
                setProfile(fetchedProfile);
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    const validateAndSetError = (name: string, value: string) => {
        if (value && !LATIN_REGEX.test(value)) {
            setErrors(prev => ({ ...prev, [name]: 'Invalid characters' }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
     const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        imageType: 'logoUrl' | 'coverImageUrl',
        setUploading: (isUploading: boolean) => void
    ) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        try {
            const uploadedUrl = await api.mockUploadImage(file);
            setProfile(prev => prev ? { ...prev, [imageType]: uploadedUrl } : null);
        } catch (err) {
            console.error(`Upload failed for ${imageType}`, err);
        } finally {
            setUploading(false);
            if (e.target) {
                e.target.value = '';
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        validateAndSetError(name, value);
        setProfile(prev => prev ? { ...prev, [name]: value } : null);
    };
    
    const handleNestedInputChange = (section: keyof CompanyProfile, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = `${section}.${name}`;
        validateAndSetError(fieldName, value);
    
        setProfile(prev => {
            if (!prev) return null;
            const sectionData = prev[section];
            if (typeof sectionData === 'object' && sectionData !== null) {
                return {
                    ...prev,
                    [section]: {
                        ...sectionData,
                        [name]: value
                    }
                };
            }
            return prev;
        });
    };

    const handleSaveProfile = async () => {
        if (!profile || !user || Object.keys(errors).length > 0) return;
        setSaveStatus('saving');
        try {
            const savedProfile = await api.updateCompanyProfile(user.id, profile);
            setProfile(savedProfile);
            updateUser({ ...user, companyName: savedProfile.companyName, avatar: savedProfile.logoUrl || user.avatar });
            setSaveStatus('success');
        } catch (error) {
            console.error('Failed to save profile', error);
            setSaveStatus('error');
        } finally {
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const handleViewProfile = () => {
        if (user) {
            navigate(`/company/${user.id}`);
        }
    };

    if (loading) {
        return (
             <div className="flex h-screen bg-brand-background text-brand-text-primary">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6 flex items-center justify-center">
                        <p>Loading your company profile...</p>
                    </main>
                </div>
            </div>
        )
    }

    if (!profile) {
        return <div>Could not load profile.</div>
    }

    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                    <div className="container mx-auto">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-brand-text-primary">Company Profile</h1>
                                    <p className="text-brand-text-secondary">This is how contractors will see you. Keep it up-to-date.</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                     <button 
                                        type="button" 
                                        onClick={handleViewProfile}
                                        className="bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-6 rounded-lg">
                                        View Public Profile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={saveStatus === 'saving' || Object.keys(errors).length > 0}
                                        className={`font-bold py-2 px-6 rounded-lg disabled:opacity-50 transition-colors duration-300 ${
                                            saveStatus === 'success' ? 'bg-brand-green' : 'bg-brand-primary hover:bg-brand-primary-hover'
                                        } text-white`}
                                    >
                                        {saveStatus === 'saving' && 'Saving...'}
                                        {saveStatus === 'success' && 'Saved!'}
                                        {saveStatus === 'idle' && 'Save Changes'}
                                        {saveStatus === 'error' && 'Error!'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-8">
                                <FormSection number="⭐" title="Branding & Appearance" description="Upload your company logo and a cover photo for your profile.">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex-shrink-0">
                                            <label className="block text-sm font-medium text-brand-text-primary mb-1">Company Logo</label>
                                            <div className="relative h-24 w-24 rounded-full bg-brand-background border border-brand-border flex items-center justify-center overflow-hidden">
                                                {isUploadingLogo ? (
                                                    <svg className="animate-spin h-8 w-8 text-brand-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                ) : profile.logoUrl ? (
                                                    <img src={profile.logoUrl} alt="Company Profile" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-brand-text-secondary text-xs text-center">No Logo</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <button type="button" onClick={() => logoFileInputRef.current?.click()} disabled={isUploadingLogo} className="bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-4 rounded-lg">
                                                {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                            </button>
                                            <p className="text-xs text-brand-text-secondary mt-2">Recommended: 200x200px</p>
                                        </div>
                                    </div>
                                     <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-brand-text-primary mb-1">Cover Photo</label>
                                        <div className="relative group w-full h-40 bg-brand-background rounded-lg border border-brand-border flex items-center justify-center overflow-hidden">
                                            {isUploadingCover ? (
                                                <svg className="animate-spin h-8 w-8 text-brand-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : profile.coverImageUrl ? (
                                                <img src={profile.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                                            ) : (
                                                <img src={LOGO_URL} alt="Subportal Logo" className="w-48 opacity-10" />
                                            )}
                                        </div>
                                         <button type="button" onClick={() => coverFileInputRef.current?.click()} className="mt-2 bg-brand-surface border border-brand-border hover:bg-brand-background text-brand-text-secondary font-bold py-2 px-4 rounded-lg">
                                            {isUploadingCover ? 'Uploading...' : 'Upload Cover'}
                                        </button>
                                        <p className="text-xs text-brand-text-secondary mt-2">Recommended: 1200x300px</p>
                                    </div>
                                </FormSection>
                                <FormSection number="A" title="Basic Information">
                                    <FormInput label="Company Name" id="companyName" name="companyName" value={profile.companyName} onChange={handleInputChange} required error={errors.companyName} />
                                    <FormInput label="Trading Name (optional)" id="tradingName" name="tradingName" value={profile.tradingName || ''} onChange={handleInputChange} error={errors.tradingName} />
                                     <FormSelect label="Company Type" id="companyType" name="companyType" value={profile.companyType} onChange={handleInputChange}>
                                        <option>GmbH</option>
                                        <option>AG</option>
                                        <option>Sole Proprietorship</option>
                                        <option>Other</option>
                                    </FormSelect>
                                    <FormInput label="VAT ID" id="vatId" name="vatId" value={profile.vatId || ''} onChange={handleInputChange} error={errors.vatId}/>
                                    <FormTextarea label="Slogan (one-liner)" id="slogan" name="slogan" value={profile.slogan || ''} onChange={handleInputChange} maxLength={100} error={errors.slogan} />
                                    <FormTextarea label="Company Description" id="description" name="description" value={profile.description || ''} onChange={handleInputChange} maxLength={1000} error={errors.description} />
                                </FormSection>
                                 <FormSection number="B" title="Location & Address">
                                    <FormInput label="Street Address" id="street" name="street" value={profile.address.street} onChange={e => handleNestedInputChange('address', e)} required error={errors['address.street']} />
                                    <FormInput label="ZIP / Postal Code" id="zip" name="zip" value={profile.address.zip} onChange={e => handleNestedInputChange('address', e)} required error={errors['address.zip']} />
                                    <FormInput label="City" id="city" name="city" value={profile.address.city} onChange={e => handleNestedInputChange('address', e)} required error={errors['address.city']} />
                                    <FormSelect label="Country" id="country" name="country" value={profile.address.country} onChange={e => handleNestedInputChange('address', e)} required>
                                        <option value="" disabled>Select your country</option>
                                        {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                    </FormSelect>
                                </FormSection>

                                <FormSection number="C" title="Contact Details" description="Control what contact information is visible on your public profile.">
                                     <FormInput label="Contact Person Full Name" id="fullName" name="fullName" value={profile.contactPerson.fullName} onChange={e => handleNestedInputChange('contactPerson', e)} required error={errors['contactPerson.fullName']} />
                                     <FormInput label="Role" id="role" name="role" value={profile.contactPerson.role} onChange={e => handleNestedInputChange('contactPerson', e)} error={errors['contactPerson.role']}/>
                                     <FormInput label="Phone" id="phone" name="phone" value={profile.contactPerson.phone} onChange={e => handleNestedInputChange('contactPerson', e)} required error={errors['contactPerson.phone']}/>
                                     <FormInput label="Email" id="email" name="email" value={profile.contactPerson.email} onChange={e => handleNestedInputChange('contactPerson', e)} required type="email" error={errors['contactPerson.email']}/>
                                     <FormToggle label="Show Email Publicly" enabled={profile.contactPerson.showEmailPublicly} onChange={() => setProfile({...profile, contactPerson: {...profile.contactPerson, showEmailPublicly: !profile.contactPerson.showEmailPublicly}})} description="Allows contractors to see your email address before they unlock it." />
                                     <FormToggle label="Show Phone Publicly" enabled={profile.contactPerson.showPhonePublicly} onChange={() => setProfile({...profile, contactPerson: {...profile.contactPerson, showPhonePublicly: !profile.contactPerson.showPhonePublicly}})} description="Allows contractors to see your phone number before they unlock it." />
                                     <FormInput label="Website URL" id="website" name="website" value={profile.website || ''} onChange={handleInputChange} type="url" error={errors.website} />
                                     <FormInput label="LinkedIn Profile URL" id="linkedin" name="linkedin" value={profile.linkedin || ''} onChange={handleInputChange} type="url" error={errors.linkedin}/>
                                </FormSection>

                                <input type="file" ref={logoFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl', setIsUploadingLogo)} />
                                <input type="file" ref={coverFileInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'coverImageUrl', setIsUploadingCover)} />
                            </div>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CompanyProfilePage;
