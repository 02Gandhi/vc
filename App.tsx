
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicJobListPage from './pages/PublicJobListPage';
import SignUpPage from './pages/SignUpPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import JobDetailPage from './pages/JobDetailPage';
import CreditStorePage from './pages/CreditStorePage';
import { UserRole } from './types';
import CreateJobPage from './pages/CreateJobPage';
import ClientOrdersPage from './pages/ClientOrdersPage';
import ClientJobDetailPage from './pages/ClientJobDetailPage';
import ClientPaymentsPage from './pages/ClientPaymentsPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import PublicCompanyProfilePage from './pages/PublicCompanyProfilePage';
import ContractorProfilePage from './pages/ContractorProfilePage';
import PublicContractorProfilePage from './pages/PublicContractorProfilePage';
import UnlockedContactsPage from './pages/UnlockedContactsPage';
import PublicJobDetailPage from './pages/PublicJobDetailPage';
import LoginModal from './components/LoginModal';
import ClientSignUpPage from './pages/ClientSignUpPage';
import ContractorSignUpPage from './pages/ContractorSignUpPage';

const PrivateRoute: React.FC<{ children: React.ReactNode; role: UserRole }> = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  if (user.role !== role) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

const DashboardRedirect: React.FC = () => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" />;
    }
    if (user.role === UserRole.Client) {
        return <Navigate to="/client/dashboard" />;
    }
    // Contractors should be on the main page, so redirect to /
    if (user.role === UserRole.Contractor) {
        return <Navigate to="/" />;
    }
    return <Navigate to="/" />;
};

const AppContent: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal } = useAuth();

    return (
        <>
            <Routes>
            <Route path="/" element={<PublicJobListPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signup/client" element={<ClientSignUpPage />} />
            <Route path="/signup/contractor" element={<ContractorSignUpPage />} />
            <Route path="/jobs/public/:id" element={<PublicJobDetailPage />} />
            
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* Contractor Routes */}
            <Route 
                path="/jobs/:id" 
                element={<PrivateRoute role={UserRole.Contractor}><JobDetailPage /></PrivateRoute>} 
            />
            <Route
                path="/credits"
                element={<PrivateRoute role={UserRole.Contractor}><CreditStorePage /></PrivateRoute>}
            />
            <Route
                path="/contractor/profile"
                element={<PrivateRoute role={UserRole.Contractor}><ContractorProfilePage /></PrivateRoute>}
            />
            <Route
                path="/contractor/unlocked-contacts"
                element={<PrivateRoute role={UserRole.Contractor}><UnlockedContactsPage /></PrivateRoute>}
            />
            <Route 
                path="/contractor/profile/:contractorId" 
                element={<PublicContractorProfilePage />} 
            />
            
            {/* Client Routes */}
            <Route 
                path="/company/:clientId" 
                element={<PublicCompanyProfilePage />} 
            />
            <Route 
                path="/client/dashboard" 
                element={<PrivateRoute role={UserRole.Client}><ClientDashboardPage /></PrivateRoute>} 
            />
            <Route 
                path="/client/create-job" 
                element={<PrivateRoute role={UserRole.Client}><CreateJobPage /></PrivateRoute>} 
            />
            <Route 
                path="/client/orders" 
                element={<PrivateRoute role={UserRole.Client}><ClientOrdersPage /></PrivateRoute>} 
            />
            <Route 
                path="/client/orders/:id" 
                element={<PrivateRoute role={UserRole.Client}><ClientJobDetailPage /></PrivateRoute>} 
            />
            <Route 
                path="/client/profile" 
                element={<PrivateRoute role={UserRole.Client}><CompanyProfilePage /></PrivateRoute>} 
            />
            <Route 
                path="/client/payments" 
                element={<PrivateRoute role={UserRole.Client}><ClientPaymentsPage /></PrivateRoute>} 
            />
            </Routes>
            {isLoginModalOpen && <LoginModal onClose={closeLoginModal} />}
        </>
    );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
