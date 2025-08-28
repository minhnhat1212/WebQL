import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme as antdTheme } from 'antd';
import 'antd/dist/reset.css';
import './index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Members from './pages/Members';
import Statistics from './pages/Statistics';
import CalendarPage from './pages/Calendar';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import Profile from './pages/Profile';
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import MainHeader from './layouts/MainHeader';
import TaskDetail from './pages/TaskDetail';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import AdminSidebarLayout from './layouts/AdminSidebarLayout';
import Chat from './pages/Chat';
import ActivityLog from './pages/ActivityLog';
import { Toaster } from 'react-hot-toast';

const { Content } = Layout;

function App() {
  const { theme } = useTheme();
  
  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        },
        components: {
          Layout: {
            headerBg: 'var(--bg-primary)',
            siderBg: 'var(--bg-primary)',
            bodyBg: 'var(--bg-primary)',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'rgba(99, 102, 241, 0.1)',
            itemHoverBg: 'rgba(99, 102, 241, 0.05)',
            itemSelectedColor: '#6366f1',
            itemColor: 'var(--text-secondary)',
            itemHoverColor: 'var(--text-primary)',
          },
          Button: {
            borderRadius: 8,
            primaryShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
          },
          Card: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          },
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Layout 
            style={{ 
              minHeight: '100vh',
              background: '#f6f8fa',
              position: 'relative'
            }}
            data-theme={theme}
          >
            <MainHeader />
            <Content style={{ 
              minHeight: 'calc(100vh - 70px)',
              background: '#f6f8fa'
            }}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: 'calc(100vh - 70px)',
                    padding: '24px',
                    background: '#f6f8fa'
                  }}>
                    <div style={{
                      width: '100%',
                      maxWidth: 400,
                      background: '#fff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '40px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Login />
                    </div>
                  </div>
                } />
                <Route path="/register" element={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: 'calc(100vh - 70px)',
                    padding: '24px',
                    background: '#f6f8fa'
                  }}>
                    <div style={{
                      width: '100%',
                      maxWidth: 400,
                      background: '#fff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '40px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Register />
                    </div>
                  </div>
                } />
                
                {/* Protected Routes */}
                <Route path="*" element={
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route element={
                      <PrivateRoute>
                        <AdminSidebarLayout />
                      </PrivateRoute>
                    }>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/tasks/:id" element={<TaskDetail />} />
                      <Route path="/members" element={<Members />} />
                      <Route path="/statistics" element={<Statistics />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/activity-log" element={<ActivityLog />} />
                    </Route>
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } />
                    <Route path="*" element={
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 'calc(100vh - 70px)',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <h1 style={{ 
                          fontSize: '6rem', 
                          margin: 0,
                          color: '#6366f1'
                        }}>
                          404
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
                          Trang không tồn tại
                        </p>
                      </div>
                    } />
                  </Routes>
                } />
              </Routes>
            </Content>
          </Layout>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

const AppWithThemeProvider = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithThemeProvider;
