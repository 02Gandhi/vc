import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/Header';
import { Job } from '../types';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

const OrderCard: React.FC<{ job: Job }> = ({ job }) => (
    <Link to={`/client/orders/${job.id}`} className="block bg-brand-surface p-5 rounded-lg hover:bg-brand-background transition-colors duration-200 border border-brand-border hover:border-brand-primary">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="text-lg font-bold text-brand-text-primary group-hover:text-brand-primary">{job.title}</h4>
                <p className="text-sm text-brand-text-secondary">{job.city}, {job.country} • Created: {new Date(job.created_at).toLocaleDateString()}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0">{job.status}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center text-sm text-brand-text-secondary">
            <span>👁️ {job.views} Views</span>
            <span>👥 {job.applications} Applications</span>
            <span className="text-brand-primary font-semibold hover:underline">Manage Order</span>
        </div>
    </Link>
);


const ClientOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                setLoading(true);
                const clientJobs = await api.fetchClientJobs(user.id);
                setJobs(clientJobs);
                setLoading(false);
            };
            loadData();
        }
    }, [user]);

    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-background p-6">
                    <div className="container mx-auto">
                        <BackButton />
                        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">My Orders</h1>
                        
                        {loading ? (
                            <p>Loading orders...</p>
                        ) : jobs.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {jobs.map(job => <OrderCard key={job.id} job={job} />)}
                            </div>
                        ) : (
                            <div className="text-center bg-brand-surface border border-brand-border p-8 rounded-lg">
                                <h3 className="text-xl font-semibold text-brand-text-primary">No projects found</h3>
                                <p className="text-brand-text-secondary mt-2">You haven't posted any projects yet.</p>
                                <Link to="/client/create-job" className="mt-4 inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg">
                                    Post a Project
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientOrdersPage;