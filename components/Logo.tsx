
import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "", showText = true, variant = 'dark' }) => {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <div className="relative flex items-center justify-center w-10 h-10 bg-brand-primary rounded-lg shadow-sm shrink-0">
                {/* Modern Handshake Icon */}
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 5.5C18.5 5.5 20 7.5 20 9.5V11.5L14.5 17L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 11.5V9.5C4 7.5 5.5 5.5 7.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 14.5L9.5 20L15.5 14L18 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 5.5H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            {showText && (
                <div className="flex flex-col">
                    <span className={`text-xl font-extrabold tracking-tight leading-none ${variant === 'light' ? 'text-white' : 'text-gray-900'}`}>
                        SUB<span className="text-brand-primary">PORTAL</span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
