
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import Logo from './Logo';

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
            
            // Fix: Contractors use the main page as their dashboard
            const path = role === UserRole.Client ? '/client/dashboard' : '/';
            navigate(path);
        } else {
            setError('Неверные данные. Используйте "client@test.com" или "contractor@test.com".');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 sm:max-w-md w-full transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                     <div className="flex items-center">
                        <Logo />
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">С возвращением</h2>
                <p className="text-center text-sm text-gray-500 mb-8">
                    Нет аккаунта?{' '}
                    <Link to="/signup" onClick={onClose} className="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors">
                        Зарегистрироваться
                    </Link>
                </p>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email-modal" className="block text-sm font-medium text-gray-700 mb-1">Электронная почта</label>
                        <input
                            id="email-modal"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={handleEmailChange}
                            className={`block w-full px-4 py-3 rounded-xl border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary'} shadow-sm text-sm focus:outline-none focus:ring-2 transition-shadow bg-gray-50`}
                            placeholder="name@company.com"
                        />
                        {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password-modal" className="block text-sm font-medium text-gray-700">Пароль</label>
                            <a href="#" className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover">Забыли пароль?</a>
                        </div>
                        <input
                            id="password-modal"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm text-sm focus:border-brand-primary focus:ring-brand-primary focus:outline-none focus:ring-2 transition-shadow bg-gray-50"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!!emailError}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        Войти
                    </button>
                    
                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg inline-block border border-gray-100">
                            Тест: <span className="font-mono">client@test.com</span> или <span className="font-mono">contractor@test.com</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
