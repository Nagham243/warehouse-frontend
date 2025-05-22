import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Search, Filter, ChevronDown, Eye, Calendar, Clock, User, Edit, Trash2, DownloadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const colors = {
  primary: '#6366f1',
  secondary: '#9333ea',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  dark: '#1f2937',
  light: '#f3f4f6',
  background: '#ffffff',
  card: '#f9fafb',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

const activityTypeColors = {
  create: colors.success,
  update: colors.info,
  delete: colors.danger,
  login: colors.primary,
  logout: colors.secondary,
  view: colors.dark,
  suspend: colors.warning,
  activate: colors.info,
  other: colors.textSecondary,
};

const ACTIVITY_TYPES = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'view', label: 'View' },
  { value: 'suspend', label: 'Suspend' },
  { value: 'activate', label: 'Activate' },
  { value: 'other', label: 'Other' },
];

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};

const ActivityBadge = ({ type }) => {
  const color = activityTypeColors[type] || colors.textSecondary;
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
          style={{ backgroundColor: `${color}20`, color: color }}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const Icon = icon;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className="rounded-full p-3 mx-4" style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-black">{value}</h3>
      </div>
    </div>
  );
};

const ActivityTable = ({ activities, loading, onView, onDownload }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  if (loading) {
    return <div className="text-center py-10">{t('common.loading')}</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
        <tr>
              <th scope="col" className={`px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('activities.user')}
              </th>
              <th scope="col" className={`px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('activities.activity')}
              </th>
              <th scope="col" className={`px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('activities.objectType')}
              </th>
              <th scope="col" className={`px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('activities.timestamp')}
              </th>
              <th scope="col" className={`px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('activities.actions')}
              </th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 mx-2 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {activity.user ? activity.user.username.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{activity.user ? activity.user.username : t('activities.system')}</div>
                    <div className="text-xs text-gray-500">{activity.user ? activity.user.user_type : t('activities.system')}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ActivityBadge type={activity.activity_type} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.object_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatTimestamp(activity.timestamp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  onClick={() => onView(activity)}
                  className="text-blue-600 hover:text-blue-900 mx-3"
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => onDownload(activity)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <DownloadCloud size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FilterDropdown = ({ label, options, value, onChange }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        type="button"
        className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <ChevronDown size={16} className="mx-2" />
      </button>
      
      {isOpen && (
        <div className={`origin-top-right absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10`}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {options.map((option) => (
              <button
                key={option.value}
                className={`${
                  value === option.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                role="menuitem"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityDetailsModal = ({ activity, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  if (!activity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-black">Activity Details</h3>
          <button onClick={onClose} className="text-black hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-black">{t('activities.user')}</p>
            <p className='text-black'>{activity.user?.username || 'System'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('activities.activityType')}</p>
            <ActivityBadge type={activity.activity_type} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('activities.objectType')}</p>
            <p className='text-black'>{activity.object_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('activities.timestamp')}</p>
            <p className='text-black'>{formatTimestamp(activity.timestamp)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('activities.details')}</p>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto text-black">
              {JSON.stringify(activity, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ActivityDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activities, setActivities] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [objectTypeData, setObjectTypeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [objectTypeFilter, setObjectTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activitiesPerPage] = useState(10);

  const handleExportData = () => {
    if (activities.length === 0) return;

    const headers = Object.keys(activities[0]).join(',');
    const csvContent = [
      headers,
      ...activities.map(activity => 
        Object.values(activity).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity_logs_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadActivity = (activity) => {
    const dataStr = JSON.stringify(activity, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity_${activity.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setLoading(true);
    
    const queryParams = new URLSearchParams();
    if (activityTypeFilter) queryParams.append('activity_type', activityTypeFilter);
    if (objectTypeFilter) queryParams.append('object_type', objectTypeFilter);
    if (searchTerm) queryParams.append('search', searchTerm);
    
    fetch(`${import.meta.env.VITE_API_URL}/api/activities/?${queryParams.toString()}`, {
    credentials: 'include'
  })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const activitiesData = Array.isArray(data) ? data : (data.results || []);
        setActivities(activitiesData);
        
        const objectTypeCounts = activitiesData.reduce((acc, activity) => {
          const existing = acc.find(item => item.object_type === activity.object_type);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ object_type: activity.object_type, count: 1 });
          }
          return acc;
        }, []);
        
        setObjectTypeData(objectTypeCounts);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching activities:', error);
        setActivities([]);
        setLoading(false);
      });
      
    fetch(`${import.meta.env.VITE_API_URL}/api/activities/activity_summary/`, {
    credentials: 'include'
  })
      .then(response => response.json())
      .then(data => {
        setSummaryData(data || []);
      })
      .catch(error => {
        console.error('Error fetching summary:', error);
        setSummaryData([]);
      });
  }, [currentPage, searchTerm, activityTypeFilter, objectTypeFilter]);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === '' || 
      (activity.user && activity.user.username.toLowerCase().includes(searchTerm.toLowerCase())) || 
      activity.object_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActivityType = activityTypeFilter === '' || activity.activity_type === activityTypeFilter;
    const matchesObjectType = objectTypeFilter === '' || activity.object_type === objectTypeFilter;
    
    return matchesSearch && matchesActivityType && matchesObjectType;
  });

  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);

  const activityTypeCounts = ACTIVITY_TYPES.map(type => ({
    name: type.label,
    value: summaryData.find(item => item.activity_type === type.value)?.count || 0
  })).filter(item => item.value > 0);

  const objectTypePieData = objectTypeData.map(item => ({
    name: item.object_type,
    value: item.count
  }));

  const objectTypes = [...new Set(activities.map(activity => activity.object_type))].map(type => ({
    value: type,
    label: type
  }));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('activities.title')}</h1>
          <button 
            onClick={handleExportData}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" 
            style={{ backgroundColor: colors.primary }}
          >
            {t('activities.export')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" style={{ height: 'calc(100vh - 50px)', overflowY: 'auto', paddingBottom: '80px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title={t('activities.totalactivities')} 
            value={activities.length} 
            icon={Calendar} 
            color={colors.primary} 
          />
          <StatCard 
            title={t('activities.todaysactivities')}  
            value={activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length} 
            icon={Clock} 
            color={colors.info} 
          />
          <StatCard 
            title={t('activities.uniqueusers')}  
            value={[...new Set(activities.map(a => a.user?.id))].length} 
            icon={User} 
            color={colors.success} 
          />
          <StatCard 
            title={t('activities.deleteoperations')} 
            value={activities.filter(a => a.activity_type === 'delete').length} 
            icon={Trash2} 
            color={colors.danger} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('activities.activityType')} </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityTypeCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Count">
                    {activityTypeCounts.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={Object.values(activityTypeColors)[index % Object.values(activityTypeColors).length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('activities.objectType')}</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={objectTypePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {objectTypePieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={[colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.info][index % 6]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-lg font-medium text-gray-900">{t('activities.recentactivities')} </h2>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-4">
                <FilterDropdown
                  label={t('activities.activityType')}
                  options={[{ value: '', label: 'All Types' }, ...ACTIVITY_TYPES]}
                  value={activityTypeFilter}
                  onChange={setActivityTypeFilter}
                />
                
                <FilterDropdown
                  label={t('activities.objectType')}
                  options={[{ value: '', label: 'All Objects' }, ...objectTypes]}
                  value={objectTypeFilter}
                  onChange={setObjectTypeFilter}
                />
              </div>
            </div>
          </div>
          
          <ActivityTable 
            activities={currentActivities} 
            loading={loading}
            onView={(activity) => {
              setSelectedActivity(activity);
              setIsModalOpen(true);
            }}
            onDownload={handleDownloadActivity}
          />
          
          {filteredActivities.length > activitiesPerPage && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredActivities.length / activitiesPerPage)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{indexOfFirstActivity + 1}</span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastActivity, filteredActivities.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{filteredActivities.length}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(Math.ceil(filteredActivities.length / activitiesPerPage)).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === number + 1
                            ? 'bg-primary-50 border-primary-500 text-primary-600 z-10'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                        style={currentPage === number + 1 ? { backgroundColor: `${colors.primary}20`, borderColor: colors.primary, color: colors.primary } : {}}
                      >
                        {number + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredActivities.length / activitiesPerPage)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {isModalOpen && (
          <ActivityDetailsModal 
            activity={selectedActivity} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </main>
    </div>
  );
}
