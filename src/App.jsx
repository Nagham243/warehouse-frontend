import { Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/common/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import CommissionPage from "./pages/CommissionPage";
import DealsPage from "./pages/DealsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import CategoriesPage from "./pages/CategoriesPage";
import OffersPage from "./pages/OffersPage";
import VendorManagementPage from "./pages/VendorManagementPage";
import LoginForm from './LoginForm';
import ClientsPage from "./pages/ClientsPage";	
import VendorsPage from "./pages/VendorsPage";
import TechnicalsPage from "./pages/TechnicalsPage";
import FinancialsPage from "./pages/FinancialsPage";
import VendorCommissionsPage from "./pages/VendorCommissionsPage"
import ActivityDashboard from "./ActivityDashboard";
import LanguageSwitcher from "./components/LanguageSwitcher";
import OfferDetailsPage from "./components/offers/OfferDetailsPage";
import Profile from './components/settings/Profile';
import ProfileEditPage from "./pages/ProfileEditPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className='flex h-screen bg-white bg-opacity-100 text-gray-100 overflow-hidden'>
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}
      <Routes>
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />} 
        />
        {isLoggedIn ? (
          <>
            <Route path='/' element={<OverviewPage />} />
            <Route path='/categories' element={<CategoriesPage />} />
            <Route path='/products' element={<ProductsPage />} />
            <Route path='/users' element={<UsersPage />} />
            <Route path='/clients' element={<ClientsPage />} />
            <Route path='/VendorsPage' element={<VendorsPage />} />
            <Route path='/technicals' element={<TechnicalsPage />} />
            <Route path='/financials' element={<FinancialsPage />}/>
            <Route path='/vendors' element={<VendorManagementPage/>} />
            <Route path='/commission' element={<CommissionPage />} />
            <Route path='/VendorCommissions' element={<VendorCommissionsPage />} />
            <Route path='/offers' element={<OffersPage />} />
            <Route path='/offers/:id' element={<OfferDetailsPage />} />
            <Route path='/deals' element={<DealsPage />} />
            <Route path='/usersActivities' element={<ActivityDashboard />} />
            <Route path='/analytics' element={<AnalyticsPage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/language' element={<LanguageSwitcher />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </div>
  );
}

export default App;