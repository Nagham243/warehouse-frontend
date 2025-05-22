const formatUserData = (apiUser) => {
  return {
    id: apiUser.id,
    username: apiUser.username || '',
    name: `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.username || 'Unknown User',
    email: apiUser.email || '',
    first_name: apiUser.first_name || '',
    last_name: apiUser.last_name || '',
    role: apiUser.user_type ? formatUserRole(apiUser.user_type) : 'Client',
    status: apiUser.is_active !== undefined ? (apiUser.is_active ? 'Active' : 'Inactive') : 'Unknown',
    user_type: apiUser.user_type || 'client',
    is_active: apiUser.is_active !== undefined ? apiUser.is_active : true,
    last_login: apiUser.last_login || null,
    date_joined: apiUser.date_joined || null,
  };
};

const formatUserRole = (userType) => {
  const roleMap = {
    'client': 'Client',
    'vendor': 'Vendor',
    'technical': 'Technical Support',
    'financial': 'Financial Manager',
    'superadmin': 'Super Admin'
  };
  
  return roleMap[userType] || 'Client';
};

export { formatUserData, formatUserRole };