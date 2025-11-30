
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import Logo from '../Logo';

interface SidebarProps {
    isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed: initialIsCollapsed = false }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(initialIsCollapsed);
    const activeClassName = "bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary";
    const inactiveClassName = "text-brand-text-secondary hover:bg-brand-background hover:text-brand-text-primary";

    const contractorLinks = [
        { to: "/", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", text: "Найти заказы" },
        { to: "/contractor/unlocked-contacts", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Открытые контакты" },
        { to: "/credits", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", text: "Магазин кредитов" },
        { to: "/contractor/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", text: "Мой профиль" },
    ];

    const clientLinks = [
        { to: "/client/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", text: "Панель управления" },
        { to: "/", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", text: "Все заказы" },
        { to: "/client/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", text: "Мои заказы" },
        { to: "/client/create-job", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z", text: "Создать заказ" },
        { to: "/client/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", text: "Профиль компании" },
        { to: "/client/payments", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", text: "Платежи" },
    ];
    
    const links = user?.role === UserRole.Client ? clientLinks : contractorLinks;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
         <aside className={`bg-brand-surface border-r border-brand-border flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-center h-20 border-b border-brand-border flex-shrink-0">
                <Logo showText={!isCollapsed} />
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden">
                <ul className="py-4">
                    {links.map(link => (
                        <li key={link.to}>
                             <NavLink
                                to={link.to}
                                end
                                className={({ isActive }) => `flex items-center font-medium px-6 py-3 transition-colors duration-200 ${isActive ? activeClassName : inactiveClassName}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                                </svg>
                                {!isCollapsed && <span className="ml-4 truncate">{link.text}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="px-6 py-4 border-t border-brand-border">
                <button
                    onClick={handleLogout}
                    className={`flex items-center w-full font-medium py-2 rounded-md transition-colors duration-200 ${inactiveClassName} ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!isCollapsed && <span className="ml-4">Выйти</span>}
                </button>
            </div>
             <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full text-brand-text-secondary hover:bg-brand-background h-10 flex items-center justify-center border-t border-brand-border">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            </button>
        </aside>
    );
};

export default Sidebar;
