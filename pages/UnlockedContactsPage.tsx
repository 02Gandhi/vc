import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { Job, CompanyProfile } from '../types';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

interface UnlockedContact {
    job: Job;
    client: CompanyProfile | null;
}

const UnlockedContactCard: React.FC<{ contact: UnlockedContact }> = ({ contact }) => {
    const { job, client } = contact;
    
    return (
        <div className="bg-brand-surface p-5 rounded-lg border border-brand-border">
            <div className="flex justify-between items-start">
                <div>
                    <Link to={`/jobs/${job.id}`} className="text-lg font-bold text-brand-text-primary hover:text-brand-primary transition-colors">
                        {job.title}
                    </Link>
                    <p className="text-sm text-brand-text-secondary mt-1">
                        Company: <Link to={`/company/${job.posted_by.id}`} className="font-semibold text-brand-primary hover:underline">{job.posted_by.company}</Link>
                    </p>
                </div>
                 <Link to={`/jobs/${job.id}`} className="bg-brand-background hover:bg-gray-100 border border-brand-border text-brand-text-secondary text-sm font-semibold py-2 px-4 rounded-md transition-colors flex-shrink-0">
                    View Job
                </Link>
            </div>
            {client && (
                <div className="mt-4 pt-4 border-t border-brand-border space-y-2 text-sm">
                    <p>
                        <span className="font-semibold text-brand-text-secondary">Contact Person:</span>
                        <span className="ml-2 text-brand-text-primary">{client.contactPerson.fullName} ({client.contactPerson.role})</span>
                    </p>
                     <p>
                        <span className="font-semibold text-brand-text-secondary">Email:</span>
                        <span className="ml-2">
                           {client.contactPerson.showEmailPublicly 
                               ? <a href={`mailto:${client.contactPerson.email}`} className="text-brand-primary hover:underline">{client.contactPerson.email}</a> 
                               : <span className="text-brand-text-secondary italic">Private</span>
                           }
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold text-brand-text-secondary">Phone:</span>
                         <span className="ml-2 text-brand-text-primary">
                           {client.contactPerson.showPhonePublicly 
                               ? client.contactPerson.phone 
                               : <span className="text-brand-text-secondary italic">Private</span>
                           }
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};


const UnlockedContactsPage: React.FC = () => {
    const { user } = useAuth();
    const [unlockedContacts, setUnlockedContacts] = useState<UnlockedContact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContacts = async () => {
            if (user) {
                setLoading(true);
                try {
                    const unlockedJobs = await api.fetchUnlockedJobsForContractor(user.id);
                    const contactsData = await Promise.all(
                        unlockedJobs.map(async (job) => {
                            const client = await api.fetchCompanyProfile(job.posted_by.id);
                            return { job, client: client || null };
                        })
                    );
                    setUnlockedContacts(contactsData);
                } catch (error) {
                    console.error("Failed to load unlocked contacts:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadContacts();
    }, [user]);

    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                    <div className="container mx-auto">
                        <BackButton />
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-brand-text-primary">Unlocked Contacts</h1>
                            <p className="text-brand-text-secondary">Here is a list of all project contacts you have purchased.</p>
                        </div>

                        {loading ? (
                            <p>Loading your unlocked contacts...</p>
                        ) : unlockedContacts.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {unlockedContacts.map(contact => <UnlockedContactCard key={contact.job.id} contact={contact} />)}
                            </div>
                        ) : (
                            <div className="text-center bg-brand-surface p-8 rounded-lg border border-brand-border">
                                <h3 className="text-xl font-semibold text-brand-text-primary">No Unlocked Contacts Yet</h3>
                                <p className="text-brand-text-secondary mt-2">You haven't unlocked any project contacts. Find a project and purchase contact details to get started.</p>
                                <Link to="/contractor/dashboard" className="mt-4 inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg">
                                    Find Projects
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UnlockedContactsPage;