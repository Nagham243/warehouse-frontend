import { useTranslation } from 'react-i18next';

const LanguageSelectionPage = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">{t('language.select_language')}</h1>
          <p className="text-gray-600">{t('language.choose_preferred_language')}</p>
        </div>
        
        <div className="space-y-4">
          <LanguageOption 
            language="en" 
            flag="🇬🇧" 
            label="English" 
            description={t('language.english_description')} 
          />
          <LanguageOption 
            language="ar" 
            flag="🇸🇦" 
            label="العربية" 
            description={t('language.arabic_description')} 
          />
        </div>
      </div>
    </div>
  );
};

const LanguageOption = ({ language, flag, label, description }) => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lng);
  };

  const isActive = i18n.language === language;

  return (
    <button
      onClick={() => changeLanguage(language)}
      className={`w-full p-4 rounded-lg border transition-all duration-200 flex items-start space-x-4 rtl:space-x-reverse ${
        isActive 
          ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      <span className="text-2xl">{flag}</span>
      <div className="text-left rtl:text-right">
        <h3 className={`font-medium ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
          {label}
        </h3>
        <p className={`text-sm ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
      {isActive && (
        <span className="ml-auto rtl:mr-auto rtl:ml-0 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </button>
  );
};

export default LanguageSelectionPage;