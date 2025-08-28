import React, { useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Select, Switch, Avatar, Badge, Typography } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  SearchOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { getNotificationCount } from '../services/notificationApi';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

const MainHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number | null>(null);

  useEffect(() => {
    getNotificationCount().then(setNotificationCount).catch(() => setNotificationCount(null));
  }, []);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout,
    },
  ];

  return (
    <Header 
      style={{ 
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Left Section - Hamburger Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          style={{
            borderRadius: '8px',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            background: '#fff'
          }}
        />
        <Text 
          strong 
          style={{ 
            fontSize: '18px', 
            color: '#23272f',
            margin: 0
          }}
        >
          WebQL
        </Text>
      </div>

      {/* Center Section - Project Title (if on project page) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        flex: 1,
        justifyContent: 'center'
      }}>
        {/* This will be populated by individual pages */}
      </div>

      {/* Right Section */}
      <div 
        className={`header-right-section ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px'
        }}
      >
        {/* Search Button */}
        <Button
          type="text"
          icon={<SearchOutlined />}
          style={{
            borderRadius: '8px',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            background: '#fff'
          }}
        />

        {/* Notifications */}
        <Badge count={notificationCount ?? 0} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{
              borderRadius: '8px',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              background: '#fff'
            }}
          />
        </Badge>

        {/* Theme Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '4px 8px',
          borderRadius: '8px',
          background: '#fff',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>☀️</span>
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
            size="small"
            style={{
              backgroundColor: theme === 'dark' ? '#6366f1' : '#d1d5db'
            }}
          />
          <span style={{ fontSize: '12px', color: '#64748b' }}>🌙</span>
        </div>

        {/* Language Selector */}
        <Select
          value={i18n.language}
          onChange={lng => i18n.changeLanguage(lng)}
          style={{ 
            width: 100,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#fff'
          }}
          size="small"
        >
          <Select.Option value="vi">🇻🇳 Tiếng Việt</Select.Option>
          <Select.Option value="en">🇺🇸 English</Select.Option>
        </Select>

        {/* User Profile */}
        {user && (
          <Dropdown
            menu={{
              items: userMenuItems,
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div 
              className="user-profile-dropdown"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '12px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              <Avatar 
                size={32}
                style={{ 
                  background: '#6366f1',
                  fontWeight: 'bold'
                }}
                src={user.avatar ? `http://localhost:5000${user.avatar}` : undefined}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '14px', 
                    color: '#23272f',
                    lineHeight: '1.2'
                  }}
                >
                  {user.name}
                </Text>
                <Text 
                  style={{ 
                    fontSize: '12px', 
                    color: '#64748b',
                    lineHeight: '1.2'
                  }}
                >
                  {user.role}
                </Text>
              </div>
            </div>
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default MainHeader; 