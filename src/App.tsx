import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CampaignProvider } from './contexts/CampaignContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { DataIngestion } from './pages/DataIngestion/DataIngestion';
import { CampaignManager } from './pages/CampaignManager/CampaignManager';
import { Analytics } from './pages/Analytics/Analytics';
import { Login } from './pages/Auth/Login';
import Settings from './pages/Settings/Settings';
import { Callback } from './pages/Auth/Callback';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <CampaignProvider>
        <DataProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<Callback />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/data-ingestion" element={
                <ProtectedRoute>
                  <Layout>
                    <DataIngestion />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <Layout>
                    <CampaignManager />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </DataProvider>
      </CampaignProvider>
    </AuthProvider>
  );
}

export default App;