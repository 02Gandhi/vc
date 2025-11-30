import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import BackButton from '../components/BackButton';

const LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyMDAgNDAiPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOTczMTYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlN1YnBvcnRhbDwvdGV4dD4KPC9zdmc+";

const LATIN_REGEX = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}~€]*$/;

const LoginPage: React.FC = () => {
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

        if (email.includes('contractor')) {
            login(UserRole.Contractor);
            navigate('/');
        } else if (email.includes('client')) {
            login(UserRole.Client);
            navigate('/client/dashboard');
        } else {
            setError('Неверные данные. Используйте "client@test.com" или "contractor@test.com".');
        }
    };

    return (
        <div className="min-h-screen bg-brand-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            <div className="absolute top-6 left-6">
                <BackButton className="" to="/" />
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                 <div className="flex items-center justify-center">
                    <img src={LOGO_URL} alt="Subportal Logo" className="h-12 w-auto" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-text-primary">
                    Войти в аккаунт
                </h2>
                <p className="mt-2 text-center text-sm text-brand-text-secondary">
                    Или{' '}
                    <Link to="/signup" className="font-medium text-brand-primary hover:text-brand-primary-hover">
                        создать новый аккаунт
                    </Link>
                </p>
                 <p className="mt-2 text-center text-xs text-brand-text-secondary">
                    (Примечание: используйте `client@test.com` или `contractor@test.com`)
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-brand-surface py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-brand-text-primary">
                                Электронная почта
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
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
                            <label htmlFor="password" className="block text-sm font-medium text-brand-text-primary">
                                Пароль
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
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
        </div>
    );
};

export default LoginPage;