import { useState } from "react";
import { useTranslation } from 'react-i18next';

const PasswordForm = ({ onChangePassword }) => {
  const { t } = useTranslation();
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      onChangePassword(passwordData, t('passwordForm.errors.mismatch'));
      return;
    }
    onChangePassword(passwordData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('passwordForm.currentPassword')}
        </label>
        <input
          type="password"
          name="old_password"
          value={passwordData.old_password}
          onChange={handleChange}
          required
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('passwordForm.newPassword')}
        </label>
        <input
          type="password"
          name="new_password"
          value={passwordData.new_password}
          onChange={handleChange}
          required
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('passwordForm.confirmPassword')}
        </label>
        <input
          type="password"
          name="new_password_confirm"
          value={passwordData.new_password_confirm}
          onChange={handleChange}
          required
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('passwordForm.changePassword')}
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;