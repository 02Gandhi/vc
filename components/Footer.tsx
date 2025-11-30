
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
             <div className="flex items-center text-2xl font-bold text-white mb-6">
                <span className="text-brand-primary mr-1">Sub</span>portal
            </div>
             <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Мы соединяем строительные компании по всей Европе. Строим мосты между западноевропейскими проектами и восточноевропейской экспертизой.
             </p>
             <div className="flex space-x-4">
                 {/* Social Icons Placeholder */}
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
                     <span className="sr-only">LinkedIn</span>
                     <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                 </a>
                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
                     <span className="sr-only">Twitter</span>
                     <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                 </a>
             </div>
          </div>

          {/* Links Section 1 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Платформа</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-base text-gray-400 hover:text-white transition-colors">Найти заказы</Link></li>
              <li><Link to="/signup" className="text-base text-gray-400 hover:text-white transition-colors">Стать подрядчиком</Link></li>
              <li><Link to="/signup" className="text-base text-gray-400 hover:text-white transition-colors">Опубликовать проект</Link></li>
              <li><Link to="/about" className="text-base text-gray-400 hover:text-white transition-colors">О нас</Link></li>
            </ul>
          </div>

          {/* Links Section 2 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Ресурсы</h3>
            <ul className="space-y-4">
              <li><Link to="/blog" className="text-base text-gray-400 hover:text-white transition-colors">Блог</Link></li>
              <li><Link to="/help" className="text-base text-gray-400 hover:text-white transition-colors">Центр помощи</Link></li>
              <li><Link to="/careers" className="text-base text-gray-400 hover:text-white transition-colors">Карьера</Link></li>
              <li><Link to="/contact" className="text-base text-gray-400 hover:text-white transition-colors">Контакты</Link></li>
            </ul>
          </div>

          {/* Links Section 3 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Юридическая информация</h3>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-base text-gray-400 hover:text-white transition-colors">Условия использования</Link></li>
              <li><Link to="/privacy" className="text-base text-gray-400 hover:text-white transition-colors">Конфиденциальность</Link></li>
              <li><Link to="/cookies" className="text-base text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
              <li><Link to="/impressum" className="text-base text-gray-400 hover:text-white transition-colors">Impressum</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="mt-16 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-500">&copy; {currentYear} Subportal. Все права защищены.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
               <span className="text-gray-600 text-sm">Made in Europe 🇪🇺</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
