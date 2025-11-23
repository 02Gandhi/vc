import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/dashboard/Sidebar';
import { CreditPackage, Transaction, Contractor } from '../types';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

const CreditPackageCard: React.FC<{ pkg: CreditPackage; onPurchase: (pkg: CreditPackage) => void; isPurchasing: boolean; }> = ({ pkg, onPurchase, isPurchasing }) => {
    return (
        <div className={`bg-brand-surface p-6 rounded-lg flex flex-col relative ${pkg.popular ? 'border-2 border-brand-primary' : 'border border-brand-border'}`}>
            {pkg.popular && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">Popular choice</span>}
            {pkg.economy && <span className="absolute top-4 right-4 bg-yellow-400 text-brand-text-primary text-xs font-bold px-2 py-1 rounded-md">Economy {pkg.economy}</span>}
            
            <h3 className="text-2xl font-bold text-brand-text-primary">{pkg.name}</h3>
            <div className="my-4">
                <span className="text-5xl font-extrabold text-brand-text-primary">€{pkg.price}</span>
                <span className="text-xl text-brand-text-secondary"> for {pkg.credits} credits</span>
            </div>
            <p className="text-brand-text-secondary mb-6">€{pkg.pricePerCredit.toFixed(2)} per credit</p>
            <button
                onClick={() => onPurchase(pkg)}
                disabled={isPurchasing}
                className="mt-auto w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPurchasing ? 'Processing...' : 'Buy Now'}
            </button>
        </div>
    );
};

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isCreditPurchase = tx.amount > 0;
    return (
        <tr className="border-b border-brand-border">
            <td className="py-3 px-4 text-brand-text-primary">{new Date(tx.date).toLocaleDateString()}</td>
            <td className="py-3 px-4 text-brand-text-primary">{tx.description}</td>
            <td className={`py-3 px-4 ${isCreditPurchase ? 'text-brand-green' : 'text-brand-red'}`}>
                {isCreditPurchase ? `€${tx.amount.toFixed(2)}` : `${tx.amount} credits`}
            </td>
            <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tx.status}
                </span>
            </td>
            <td className="py-3 px-4">
                {tx.invoiceUrl ? <a href={tx.invoiceUrl} className="text-brand-primary hover:underline">Download PDF</a> : 
                tx.status === 'Failed' ? <a href="#" className="text-yellow-500 hover:underline">Try again</a> : '-'}
            </td>
        </tr>
    );
};

const CreditStorePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const loadData = async () => {
        if(user) {
            setPackages(await api.fetchCreditPackages());
            setTransactions(await api.fetchTransactions(user.id));
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handlePurchase = async (pkg: CreditPackage) => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            const updatedContractor = await api.purchaseCreditsForContractor(user as Contractor, pkg);
            updateUser(updatedContractor);
            await loadData(); // Refresh all data
        } catch (error) {
            console.error('Purchase failed', error);
            alert('An error occurred during the purchase. Please try again.');
        } finally {
            setIsPurchasing(false);
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
                        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">Credit Store</h1>
                        <p className="text-brand-text-secondary mb-8">Choose a package to top up your balance and start responding to projects.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {packages.map(pkg => 
                                <CreditPackageCard 
                                    key={pkg.id} 
                                    pkg={pkg} 
                                    onPurchase={handlePurchase}
                                    isPurchasing={isPurchasing}
                                />)
                            }
                        </div>

                        <h2 className="text-2xl font-bold text-brand-text-primary mb-4">Transaction History</h2>
                        <div className="bg-brand-surface rounded-lg overflow-hidden border border-brand-border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-brand-background text-brand-text-secondary uppercase text-xs">
                                    <tr>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4">Amount</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? (
                                        transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                                    ) : (
                                         <tr>
                                            <td colSpan={5} className="text-center py-8 text-brand-text-secondary">No transactions yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreditStorePage;