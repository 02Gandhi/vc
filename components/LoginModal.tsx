import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyMDAgNDAiPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOTczMTYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlN1YnBvcnRhbDwvdGV4dD4KPC9zdmc+";

interface LoginModalProps {
    onClose: () => void;
}

const LATIN_REGEX = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}~€]*$/;

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value && !LATIN_REGEX.test(value)) {
            setEmailError('Недопустимые символы');
        } else {
            setEmailError('');
        }
        setEmail(value);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (emailError) return;

        let role: UserRole | null = null;
        if (email.toLowerCase().includes('contractor')) {
            role = UserRole.Contractor;
        } else if (email.toLowerCase().includes('client')) {
            role = UserRole.Client;
        }

        if (role) {
            login(role);
            onClose(); // Close the modal on successful login
            const path = role === UserRole.Client ? '/client/dashboard' : '/contractor/dashboard';
            navigate(path);
        } else {
            setError('Неверные данные. Используйте "client@test.com" или "contractor@test.com".');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-surface rounded-lg shadow-xl p-8 sm:max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center">
                        <img src={LOGO_URL} alt="Subportal Logo" className="h-10 w-auto" />
                    </div>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-brand-text-primary mb-2">Войти в аккаунт</h2>
                <p className="text-center text-sm text-brand-text-secondary mb-4">
                    Или{' '}
                    <Link to="/signup" onClick={onClose} className="font-medium text-brand-primary hover:text-brand-primary-hover">
                        создать новый аккаунт
                    </Link>
                </p>
                 <p className="text-center text-xs text-brand-text-secondary mb-6">
                    (Примечание: используйте `client@test.com` или `contractor@test.com`)
                </p>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email-modal" className="block text-sm font-medium text-brand-text-primary">Электронная почта</label>
                        <div className="mt-1">
                            <input
                                id="email-modal"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-brand-text-secondary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-background ${emailError ? 'border-brand-red' : 'border-brand-border'}`}
                            />
                        </div>
                        {emailError && <p className="mt-1 text-sm text-brand-red">{emailError}</p>}
                    </div>

                    <div>
                        <label htmlFor="password-modal" className="block text-sm font-medium text-brand-text-primary">Пароль</label>
                        <div className="mt-1">
                            <input
                                id="password-modal"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm placeholder-brand-text-secondary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-background"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-brand-red text-sm">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={!!emailError}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                        >
                            Войти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;