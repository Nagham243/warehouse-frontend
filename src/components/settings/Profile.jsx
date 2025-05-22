import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom"; 

const Profile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeModalTab, setActiveModalTab] = useState("profile");

  const getCsrfToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('/api/profile/');
        setProfileData(response.data);
      } catch (error) {
        setMessage({
          text: t('profile.errors.fetchFailed'),
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [t]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await axios.put('/api/profile/', updatedData, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
      setProfileData(response.data);
      setMessage({
        text: t('profile.updateSuccess'),
        type: "success"
      });
      setIsEditModalOpen(false);
    } catch (error) {
      setMessage({
        text: error.response?.data?.detail || t('profile.errors.updateFailed'),
        type: "error"
      });
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      const csrfToken = getCsrfToken();
      await axios.post('/api/password-change/', passwordData, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
      setMessage({
        text: t('profile.passwordSuccess'),
        type: "success"
      });
      setIsEditModalOpen(false);
    } catch (error) {
      setMessage({
        text: error.response?.data?.detail || t('profile.errors.passwordFailed'),
        type: "error"
      });
    }
  };

  const navigateToEdit = (tab = "profile") => {
    navigate("/profile/edit", { state: { activeTab: tab } });
  };

  if (loading) {
    return (
      <SettingSection icon={User} title={t('profile.title')}>
        <div className="flex justify-center items-center h-32">
          <p>{t('profile.loading')}</p>
        </div>
      </SettingSection>
    );
  }

  return (
    <SettingSection icon={User} title={t('profile.title')}>
      {/* Message Display */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className='flex flex-col sm:flex-row items-center mb-6'>
        <div className="relative">
          <img
            src={profileData?.profile_image || '/default-profile.png'}
            alt={t('profile.profileImageAlt')}
            className='rounded-full w-20 h-20 object-cover mr-4 border-2 border-gray-200'
          />
          <button 
            onClick={() => openEditModal()}
            className="absolute bottom-0 right-2 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            {profileData?.first_name} {profileData?.last_name}
          </h3>
          <p className='text-gray-600'>{profileData?.email}</p>
          <p className='text-sm text-gray-500'>{profileData?.profile?.company_name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">{t('profile.phone')}</h4>
            <p className="text-gray-900">{profileData?.phone_number || t('profile.notProvided')}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">{t('profile.address')}</h4>
            <p className="text-gray-900">{profileData?.profile?.address || t('profile.notProvided')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={() => navigateToEdit()}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 w-full sm:w-auto flex items-center justify-center gap-2'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            {t('profile.editProfile')}
          </button>
          
          <button 
            onClick={() => navigateToEdit()}
            className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 w-full sm:w-auto flex items-center justify-center gap-2'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            {t('passwordForm.changePassword')}
          </button>
        </div>
      </div>

      
    </SettingSection>
  );
};

export default Profile;