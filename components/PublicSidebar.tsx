import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicSidebar: React.FC = () => {
    const { openLoginModal } = useAuth();

    return (
        <aside className="w-72 flex-shrink-0 pr-6 py-6 hidden lg:block">
            <div className="bg-brand-surface p-6 rounded-lg border border-brand-border flex flex-col h-full sticky top-[80px]">
                <h3 className="text-xl font-bold text-brand-text-primary mb-2">Присоединиться к Subportal</h3>
                <p className="text-brand-text-secondary text-sm mb-6">Получите доступ к эксклюзивным проектам и проверенным подрядчикам.</p>

                <div className="space-y-4 flex-grow">
                    <Link
                        to="/signup"
                        className="w-full block text-center bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                    >
                        Регистрация
                    </Link>
                     <p className="text-center text-sm text-brand-text-secondary">
                        Уже есть аккаунт?{' '}
                        <button type="button" onClick={openLoginModal} className="font-medium text-brand-primary hover:text-brand-primary-hover">
                            Войти
                        </button>
                    </p>
                </div>

                <div className="mt-auto border-t border-brand-border pt-4 text-xs text-brand-text-secondary">
                    <h4 className="font-semibold mb-2">Почему стоит присоединиться?</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Прямой доступ к проектам</li>
                        <li>Проверенные партнеры</li>
                        <li>Прозрачная система</li>
                    </ul>
                </div>
            </div>
        </aside>
    );
};

export default PublicSidebar;