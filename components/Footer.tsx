import React from 'react';
import { Link } from 'react-router-dom';

const LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyMDAgNDAiPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOTczMTYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlN1YnBvcnRhbDwvdGV4dD4KPC9zdmc+";

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-surface border-t border-brand-border mt-16">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-brand-text-secondary tracking-wider uppercase">Быстрые ссылки</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-base text-brand-text-secondary hover:text-brand-primary">О нас</Link></li>
              <li><Link to="/blog" className="text-base text-brand-text-secondary hover:text-brand-primary">Блог</Link></li>
              <li><Link to="/careers" className="text-base text-brand-text-secondary hover:text-brand-primary">Карьера</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-text-secondary tracking-wider uppercase">Правовая информация</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/terms" className="text-base text-brand-text-secondary hover:text-brand-primary">Условия использования</Link></li>
              <li><Link to="/privacy" className="text-base text-brand-text-secondary hover:text-brand-primary">Политика конфиденциальности</Link></li>
              <li><Link to="/cookies" className="text-base text-brand-text-secondary hover:text-brand-primary">Политика Cookie</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2">
             <div className="flex items-center">
                <img src={LOGO_URL} alt="Subportal Logo" className="h-10 w-auto" />
            </div>
             <p className="mt-4 text-brand-text-secondary max-w-sm">
                Соединяем строительное мастерство по всей Европе. Мы устраняем разрыв между проектами в Западной Европе и мастерством в Восточной Европе.
             </p>
          </div>
        </div>
        <div className="mt-8 border-t border-brand-border pt-8 text-center text-brand-text-secondary">
          <p>&copy; {new Date().getFullYear()} Subportal. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;