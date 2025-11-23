import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import { Job, Transaction } from '../types';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BackButton from '../components/BackButton';

const OrderCard: React.FC<{ job: Job }> = ({ job }) => (
    <Link to={`/client/orders/${job.id}`} className="block bg-brand-surface p-5 rounded-lg hover:bg-brand-background border border-brand-border transition-colors duration-200">
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

const ClientDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0);
    const creditsSpent = transactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const [clientJobs, clientTransactions] = await Promise.all([
                        api.fetchClientJobs(user.id),
                        api.fetchClientTransactions(user.id)
                    ]);
                    setJobs(clientJobs);
                    setTransactions(clientTransactions);
                } catch (error) {
                    console.error("Failed to load dashboard data:", error);
                } finally {
                    setLoading(false);
                }
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
                        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">Dashboard</h1>
                        <p className="text-brand-text-secondary mb-6">Welcome back, manage your projects and applications here.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard title="Active Orders" value={jobs.filter(j => j.status === 'Active').length} />
                            <StatCard title="Total Views" value={totalViews} />
                            <StatCard title="Total Applications" value={totalApplications} />
                            <StatCard title="Credits Spent" value={creditsSpent} />
                        </div>

                        <div className="mb-8">
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-brand-text-primary">My Recent Orders</h2>
                                <Link to="/client/create-job" className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>Post a New Project</span>
                                </Link>
                            </div>
                            {loading ? (
                                <p>Loading orders...</p>
                            ) : jobs.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {jobs.map(job => <OrderCard key={job.id} job={job} />)}
                                </div>
                            ) : (
                                <div className="text-center bg-brand-surface border border-brand-border p-8 rounded-lg">
                                    <h3 className="text-xl font-semibold text-brand-text-primary">No projects found</h3>
                                    <p className="text-brand-text-secondary mt-2">You haven't posted any projects yet. Get started now!</p>
                                    <Link to="/client/create-job" className="mt-4 inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-lg">
                                        Post a Project
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientDashboardPage;