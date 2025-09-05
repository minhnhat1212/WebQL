import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Layout, 
  Typography, 
  Badge, 
  Button
} from 'antd';
import { 
  ProjectOutlined, 
  UnorderedListOutlined, 
  BellOutlined, 
  BarChartOutlined, 
  HomeOutlined,
  CalendarOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  HistoryOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

import { getProjectCount } from '../services/projectApi';
import { getTaskCount } from '../services/taskApi';
import { getNotificationCount } from '../services/notificationApi';
import { getCalendarCount } from '../services/calendarApi';
import { useAuth } from '../hooks/useAuth';

const { Sider, Content } = Layout;
const { Text } = Typography;

const AdminSidebarLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [notificationCount, setNotificationCount] = useState<number | null>(null);
  const [calendarCount, setCalendarCount] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getProjectCount().then(setProjectCount).catch(() => setProjectCount(null));
    getTaskCount().then(setTaskCount).catch(() => setTaskCount(null));
    getNotificationCount().then(setNotificationCount).catch(() => setNotificationCount(null));
    getCalendarCount().then(setCalendarCount).catch(() => setCalendarCount(null));
  }, []);

  // Khai báo sidebarItems với quyền theo vai trò
  const currentRole = user?.role || 'member';
  const allSidebarItems = [
    { label: 'Dashboard', icon: <HomeOutlined />, path: '/dashboard', badge: null },
    { label: 'Dự án', icon: <ProjectOutlined />, path: '/projects', badge: projectCount },
    { label: 'Task', icon: <UnorderedListOutlined />, path: '/tasks', badge: taskCount },
    // { label: 'Thành viên', icon: <TeamOutlined />, path: '/members', badge: null, allowedRoles: ['admin', 'leader'] as const },
    { label: 'Lịch', icon: <CalendarOutlined />, path: '/calendar', badge: calendarCount },
    { label: 'Thông báo', icon: <BellOutlined />, path: '/notifications', badge: notificationCount },
    { label: 'Thống kê', icon: <BarChartOutlined />, path: '/statistics', badge: null, allowedRoles: ['admin', 'leader'] as const },
    { label: 'Tìm kiếm', icon: <SearchOutlined />, path: '/search', badge: null },
    { label: 'Chat', icon: <MessageOutlined />, path: '/chat', badge: null },
    { label: 'Hồ sơ cá nhân', icon: <UserOutlined />, path: '/profile', badge: null },
    { label: 'Lịch sử hoạt động', icon: <HistoryOutlined />, path: '/activity-log', badge: null, allowedRoles: ['admin', 'leader'] as const },
  ];
  const sidebarItems = allSidebarItems.filter((item: any) => !item.allowedRoles || item.allowedRoles.includes(currentRole));

  const selectedKey = sidebarItems.find(item => 
    location.pathname.startsWith(item.path)
  )?.path || '/dashboard';

  const menuItems = sidebarItems.map(item => ({
    key: item.path,
    icon: item.icon,
    label: (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <span>{item.label}</span>
        {item.badge && (
          <Badge 
            count={item.badge} 
            size="small" 
            style={{ 
              backgroundColor: '#6366f1',
              fontSize: '10px',
              fontWeight: 'bold'
            }} 
          />
        )}
      </div>
    ),
    onClick: () => navigate(item.path),
  }));

  return (
    <Layout style={{ 
      minHeight: 'calc(100vh - 64px)',
      background: '#f6f8fa'
    }}>
      {/* Sidebar */}
      <Sider
        width={280}
        collapsed={collapsed}
        collapsedWidth={80}
        style={{
          background: '#fff',
          borderRight: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          padding: '16px 12px 12px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            {!collapsed && (
              <Text 
                strong 
                style={{ 
                  fontSize: '16px',
                  color: '#23272f',
                  margin: 0
                }}
              >
                Menu chính
              </Text>
            )}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                borderRadius: '8px',
                color: '#64748b'
              }}
            />
          </div>
          
          {!collapsed && (
            <div style={{
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '10px'
            }}>
              <Text style={{ 
                fontSize: '12px', 
                color: '#64748b',
                display: 'block',
                marginBottom: '4px'
              }}>
                Chào mừng trở lại!
              </Text>
              <Text strong style={{ 
                fontSize: '14px', 
                color: '#23272f',
                margin: 0
              }}>
                Hôm nay bạn có {taskCount !== null ? taskCount : '...'} task cần làm
              </Text>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '0 6px'
          }}
          className="custom-menu"
        />

        {/* Quick Actions */}
        {!collapsed && (
          <div style={{ padding: '12px' }}>
            <Text style={{ 
              fontSize: '12px', 
              color: '#64748b',
              marginBottom: '12px',
              display: 'block'
            }}>
              Thao tác nhanh
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {user?.role !== 'member' && (
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  style={{
                    borderRadius: '8px',
                    height: '32px',
                    fontSize: '12px'
                  }}
                  onClick={() => navigate('/projects')}
                >
                  + Tạo dự án mới
                </Button>
              )}
              <Button
                size="small"
                icon={<PlusOutlined />}
                style={{
                  borderRadius: '8px',
                  height: '32px',
                  fontSize: '12px'
                }}
                onClick={() => navigate('/tasks')}
              >
                + Tạo task mới
              </Button>
            </div>
          </div>
        )}
      </Sider>

      {/* Main Content */}
      <Content style={{
        padding: '16px',
        background: '#f6f8fa',
        minHeight: 'calc(100vh - 64px)',
        overflow: 'auto'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default AdminSidebarLayout; 