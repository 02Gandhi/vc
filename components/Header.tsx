
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Contractor, UserRole, Client } from '../types';
import Logo from './Logo';

const Header: React.FC = () => {
    const { user, logout, openLoginModal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userCredits = user ? (user as Client | Contractor).balance_credits : 0;
    const creditLink = user?.role === UserRole.Contractor ? "/credits" : "/client/payments";
    
    // Check if we are on a specific page to highlight links
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 transition-all duration-200 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo Section */}
                    <div className="flex items-center flex-shrink-0 mr-8">
                       <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
                            <Logo />
                        </Link>
                    </div>

                    {/* Center Navigation (Visible only for guests or if we want global nav) */}
                    {!user && (
                        <nav className="hidden md:flex items-center space-x-2">
                            <Link 
                                to="/" 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/') ? 'text-brand-primary bg-orange-50' : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'}`}
                            >
                                Найти заказы
                            </Link>
                            <Link 
                                to="/signup/contractor" 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/signup/contractor') ? 'text-brand-primary bg-orange-50' : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'}`}
                            >
                                Подрядчикам
                            </Link>
                            <Link 
                                to="/signup/client" 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/signup/client') ? 'text-brand-primary bg-orange-50' : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'}`}
                            >
                                Заказчикам
                            </Link>
                        </nav>
                    )}

                    {/* Spacer */}
                    <div className="flex-grow"></div>

                    {/* Right Side Navigation */}
                    <div className="flex items-center space-x-3 sm:space-x-6">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <button className="relative p-2.5 text-gray-400 hover:text-brand-primary transition-colors rounded-full hover:bg-gray-50 focus:outline-none">
                                    <span className="absolute top-2.5 right-3 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>

                                {/* Credits Display */}
                                <Link 
                                    to={creditLink} 
                                    className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-white hover:from-orange-50 hover:to-white text-gray-700 hover:text-brand-primary px-3 py-1.5 rounded-full transition-all duration-200 border border-gray-200 hover:border-brand-primary/30 shadow-sm group"
                                >
                                    <div className="bg-yellow-100 text-yellow-600 rounded-full p-1 group-hover:bg-yellow-200 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8.433 7.418c.158-.103.358-.168.567-.168h1.39l-1.157-3.24a.5.5 0 01.14-.543l1.612-1.285a.5.5 0 01.627 0l1.612 1.285a.5.5 0 01.14.543L11.03 7.25h1.39a.64.64 0 01.567.168.63.63 0 01.22.504l-.3 1.637a.5.5 0 01-.5.44H8.756a.5.5 0 01-.5-.44l-.3-1.637a.63.63 0 01.22-.504z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold">{userCredits}</span>
                                </Link>

                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setDropdownOpen(!dropdownOpen)} 
                                        onBlur={() => setTimeout(() => setDropdownOpen(false), 200)} 
                                        className="flex items-center space-x-3 focus:outline-none group"
                                    >
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold text-gray-800 leading-none group-hover:text-brand-primary transition-colors">{user.companyName}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mt-1">{user.role === UserRole.Client ? 'Заказчик' : 'Подрядчик'}</p>
                                        </div>
                                        <div className="h-10 w-10 rounded-full border-2 border-white ring-2 ring-gray-100 overflow-hidden shadow-sm group-hover:ring-brand-primary/30 transition-all">
                                            <img className="h-full w-full object-cover" src={user.avatar} alt="User avatar" />
                                        </div>
                                        <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${dropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-60 rounded-xl shadow-xl py-2 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Аккаунт</p>
                                                <p className="text-sm font-bold text-gray-900 truncate mt-1">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-primary transition-colors">
                                                    <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                    </svg>
                                                    Панель управления
                                                </Link>
                                                <Link to={creditLink} onClick={() => setDropdownOpen(false)} className="group flex sm:hidden items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-primary transition-colors">
                                                    <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Баланс: {userCredits}
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-50 py-2">
                                                <button onClick={handleLogout} className="group w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                    <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Выйти
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <button type="button" onClick={openLoginModal} className="text-sm font-bold text-gray-600 hover:text-brand-primary transition-colors px-3 py-2">
                                    Войти
                                </button>
                                <Link to="/signup" className="bg-brand-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-primary-hover hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm shadow-brand-primary/20 shadow-md">
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
