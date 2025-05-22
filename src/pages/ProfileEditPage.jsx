import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/settings/ProfileForm";
import PasswordForm from "../components/settings/PasswordForm";
import { useTranslation } from 'react-i18next';
import axios from "axios";

const ProfileEditPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    } catch (error) {
      setMessage({
        text: error.response?.data?.detail || t('profile.errors.passwordFailed'),
        type: "error"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t('profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen overflow-y-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t('profile.backToProfile')}
        </button>
        <h1 className="text-2xl font-bold mt-4 text-black">{t('profileEditModal.title')}</h1>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "profile"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          {t('profileEditModal.profileTab')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "password"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("password")}
        >
          {t('profileEditModal.passwordTab')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "profile" && (
          <ProfileForm
            profileData={profileData}
            onSave={handleProfileUpdate}
            onClose={() => navigate(-1)}
          />
        )}
        {activeTab === "password" && (
          <PasswordForm
            onChangePassword={handlePasswordChange}
            onClose={() => navigate(-1)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileEditPage;