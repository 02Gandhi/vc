import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import BackButton from '../components/BackButton';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();

    const handleRoleSelection = (role: UserRole) => {
        const path = role === UserRole.Client ? '/signup/client' : '/signup/contractor';
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-brand-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            <div className="absolute top-6 left-6">
                <BackButton className="" to="/" />
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center">
                <h1 className="text-4xl font-bold text-brand-text-primary">Присоединяйтесь к нашей платформе</h1>
                <p className="mt-4 text-lg text-brand-text-secondary">
                    Выберите свою роль, чтобы мы могли найти для вас лучшие возможности.
                </p>
            </div>

            <div className="mt-10 mx-auto w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Client Card */}
                <div className="bg-brand-surface rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <img className="h-64 w-full object-cover" src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2070&auto=format&fit=crop" alt="Client" />
                    <div className="p-6 flex flex-col flex-grow">
                        <h2 className="text-2xl font-semibold text-brand-text-primary">Я заказчик</h2>
                        <p className="text-brand-text-secondary mt-2">(Западноевропейская компания / Прораб)</p>
                        <p className="text-brand-text-primary mt-4 flex-grow">
                            Публикуйте проекты, находите и нанимайте проверенных подрядчиков из Восточной Европы.
                        </p>
                        <button 
                            onClick={() => handleRoleSelection(UserRole.Client)}
                            className="mt-6 w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                            Начать как заказчик
                        </button>
                    </div>
                </div>

                {/* Contractor Card */}
                 <div className="bg-brand-surface rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <img className="h-64 w-full object-cover" src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" alt="Contractor" />
                    <div className="p-6 flex flex-col flex-grow">
                        <h2 className="text-2xl font-semibold text-brand-text-primary">Я подрядчик</h2>
                        <p className="text-brand-text-secondary mt-2">(Восточноевропейский подрядчик)</p>
                        <p className="text-brand-text-primary mt-4 flex-grow">
                            Получите доступ к заказам от ведущих западноевропейских компаний и развивайте свой бизнес.
                        </p>
                        <button
                            onClick={() => handleRoleSelection(UserRole.Contractor)}
                            className="mt-6 w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                             Начать как подрядчик
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;