import LanguageSwitcher from '../LanguageSwitcher';
const Header = ({ title }) => {
    return (
        <header className='bg-white bg-opacity-100 backdrop-blur-md shadow-lg border-b border-gray-300 relative z-10'> {/* Lower z-index */}
            <div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                <h1 className='text-2xl font-semibold text-black'>{title}</h1>
                <div className='relative z-[60]'>
                </div>
            </div>
        </header>
    );
};
export default Header;
