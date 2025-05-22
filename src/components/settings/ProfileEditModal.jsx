import { useState } from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import { useTranslation } from 'react-i18next';

const ProfileEditModal = ({ isOpen, onClose, profileData, onSave, onChangePassword }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white rounded-lg p-6 max-w-[600px] w-full mx-4 shadow-xl max-h-[90vh] flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold">{t('profileEditModal.title')}</h2>
        </div>

        {/* Custom Tabs Implementation */}
        <div className="flex border-b mb-4 mt-24">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            {t('profileEditModal.profileTab')}
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "password"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("password")}
          >
            {t('profileEditModal.passwordTab')}
          </button>
        </div>

        {/* Tab Content - Scrollable Area */}
        <div className="overflow-y-auto flex-1">
          {activeTab === "profile" && (
            <ProfileForm
              profileData={profileData}
              onSave={onSave}
              onClose={onClose}
            />
          )}
          {activeTab === "password" && (
            <PasswordForm
              onChangePassword={onChangePassword}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;