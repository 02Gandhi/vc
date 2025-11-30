import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/dashboard/Sidebar';
import { CreditPackage, Transaction, Client } from '../types';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const CreditPackageCard: React.FC<{ pkg: CreditPackage; onPurchase: (pkg: CreditPackage) => void; isPurchasing: boolean; }> = ({ pkg, onPurchase, isPurchasing }) => {
    return (
        <div className={`bg-brand-surface p-6 rounded-lg flex flex-col relative ${pkg.popular ? 'border-2 border-brand-primary' : 'border border-brand-border'}`}>
            {pkg.popular && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">Популярный выбор</span>}
            {pkg.economy && <span className="absolute top-4 right-4 bg-yellow-400 text-brand-text-primary text-xs font-bold px-2 py-1 rounded-md">Скидка {pkg.economy}</span>}
            
            <h3 className="text-2xl font-bold text-brand-text-primary">{pkg.name}</h3>
            <div className="my-4">
                <span className="text-5xl font-extrabold text-brand-text-primary">€{pkg.price}</span>
                <span className="text-xl text-brand-text-secondary"> за {pkg.credits} кредитов</span>
            </div>
            <p className="text-brand-text-secondary mb-6">€{pkg.pricePerCredit.toFixed(2)} за кредит</p>
            <button 
                onClick={() => onPurchase(pkg)}
                disabled={isPurchasing}
                className="mt-auto w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isPurchasing ? 'Обработка...' : 'Купить сейчас'}
            </button>
        </div>
    );
};

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isCreditPurchase = tx.amount > 0;
    return (
        <tr className="border-b border-brand-border">
            <td className="py-3 px-4 text-brand-text-primary">{tx.date}</td>
            <td className="py-3 px-4 text-brand-text-primary">{tx.description}</td>
            <td className={`py-3 px-4 ${isCreditPurchase ? 'text-brand-green' : 'text-brand-red'}`}>
                {isCreditPurchase ? `€${tx.amount.toFixed(2)}` : `${tx.amount} Кредитов`}
            </td>
            <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tx.status}
                </span>
            </td>
            <td className="py-3 px-4">
                {tx.invoiceUrl ? <a href={tx.invoiceUrl} className="text-brand-primary hover:underline">Скачать PDF</a> : 
                tx.status === 'Failed' ? <a href="#" className="text-yellow-500 hover:underline">Повторить</a> : '-'}
            </td>
        </tr>
    );
};

const ClientPaymentsPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const loadData = async () => {
        if(user) {
            setPackages(await api.fetchClientCreditPackages());
            setTransactions(await api.fetchClientTransactions(user.id));
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);
    
    const handlePurchase = async (pkg: CreditPackage) => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            const updatedClient = await api.purchaseCreditsForClient(user as Client, pkg);
            updateUser(updatedClient);
            // Refresh transactions after purchase
            const updatedTransactions = await api.fetchClientTransactions(user.id);
            setTransactions(updatedTransactions);
        } catch (error) {
            console.error('Purchase failed', error);
            alert('Ошибка при покупке. Пожалуйста, попробуйте снова.');
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
                        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">Платежи</h1>
                        <p className="text-brand-text-secondary mb-8">Покупайте кредиты, чтобы открывать контактные данные подрядчиков.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {packages.map(pkg => (
                                <CreditPackageCard 
                                    key={pkg.id} 
                                    pkg={pkg} 
                                    onPurchase={handlePurchase}
                                    isPurchasing={isPurchasing}
                                />
                            ))}
                        </div>

                        <h2 className="text-2xl font-bold text-brand-text-primary mb-4">История транзакций</h2>
                        <div className="bg-brand-surface rounded-lg overflow-hidden border border-brand-border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-brand-background text-brand-text-secondary uppercase text-xs">
                                    <tr>
                                        <th className="py-3 px-4">Дата</th>
                                        <th className="py-3 px-4">Описание</th>
                                        <th className="py-3 px-4">Сумма</th>
                                        <th className="py-3 px-4">Статус</th>
                                        <th className="py-3 px-4">Счет-фактура</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? (
                                        transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-brand-text-secondary">Нет транзакций.</td>
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

export default ClientPaymentsPage;