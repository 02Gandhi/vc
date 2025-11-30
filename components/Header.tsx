import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Contractor, UserRole, Client } from '../types';

const LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyMDAgNDAiPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOTczMTYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlN1YnBvcnRhbDwvdGV4dD4KPC9zdmc+";

const Header: React.FC = () => {
    const { user, logout, openLoginModal } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userCredits = user ? (user as Client | Contractor).balance_credits : 0;

    return (
        <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                       <Link to="/" className="flex items-center">
                            <img src={LOGO_URL} alt="Subportal Logo" className="h-10 w-auto" />
                        </Link>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                {user.role === UserRole.Contractor ? (
                                    <Link to="/credits" className="text-sm font-medium text-brand-text-primary bg-brand-background px-3 py-2 rounded-md hover:bg-gray-200 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8.433 7.418c.158-.103.358-.168.567-.168h1.39l-1.157-3.24a.5.5 0 01.14-.543l1.612-1.285a.5.5 0 01.627 0l1.612 1.285a.5.5 0 01.14.543L11.03 7.25h1.39a.64.64 0 01.567.168.63.63 0 01.22.504l-.3 1.637a.5.5 0 01-.5.44H8.756a.5.5 0 01-.5-.44l-.3-1.637a.63.63 0 01.22-.504z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                                        </svg>
                                        {userCredits} Кредитов
                                    </Link>
                                ) : (
                                    <Link to="/client/payments" className="text-sm font-medium text-brand-text-primary bg-brand-background px-3 py-2 rounded-md hover:bg-gray-200 flex items-center">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8.433 7.418c.158-.103.358-.168.567-.168h1.39l-1.157-3.24a.5.5 0 01.14-.543l1.612-1.285a.5.5 0 01.627 0l1.612 1.285a.5.5 0 01.14.543L11.03 7.25h1.39a.64.64 0 01.567.168.63.63 0 01.22.504l-.3 1.637a.5.5 0 01-.5.44H8.756a.5.5 0 01-.5-.44l-.3-1.637a.63.63 0 01.22-.504z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                                        </svg>
                                        {userCredits} Кредитов
                                    </Link>
                                )}
                                <div className="relative">
                                    <button onClick={() => setDropdownOpen(!dropdownOpen)} onBlur={() => setTimeout(() => setDropdownOpen(false), 200)} className="flex items-center space-x-2">
                                        <img className="h-8 w-8 rounded-full" src={user.avatar} alt="User avatar" />
                                        <span className="text-sm font-medium text-brand-text-primary hidden sm:block">{user.companyName}</span>
                                        <svg className="h-5 w-5 text-brand-text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-brand-surface ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-background">Панель управления</Link>
                                            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-background">
                                                Выйти
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <button type="button" onClick={openLoginModal} className="text-sm font-medium text-brand-text-secondary hover:text-brand-primary">
                                    Войти
                                </button>
                                <Link to="/signup" className="bg-brand-primary text-white font-medium py-2 px-4 rounded-md hover:bg-brand-primary-hover transition duration-300 text-sm">
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