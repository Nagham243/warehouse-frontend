import { useState } from "react";
import { useTranslation } from 'react-i18next';

const ProfileForm = ({ profileData, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: profileData?.first_name || '',
    last_name: profileData?.last_name || '',
    email: profileData?.email || '',
    phone_number: profileData?.phone_number || '',
    profile: {
      address: profileData?.profile?.address || '',
      company_name: profileData?.profile?.company_name || '',
      bio: profileData?.profile?.bio || ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.profile) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('profileForm.firstName')}</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('profileForm.lastName')}</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t('profileForm.email')}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t('profileForm.phoneNumber')}</label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t('profileForm.companyName')}</label>
        <input
          type="text"
          name="company_name"
          value={formData.profile.company_name}
          onChange={handleChange}
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t('profileForm.address')}</label>
        <input
          type="text"
          name="address"
          value={formData.profile.address}
          onChange={handleChange}
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('common.saveChanges')}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;