import React, { useEffect } from 'react';
import { Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const onFinish = async (values: any) => {
    await login(values.email, values.password);
    // Nếu thành công sẽ tự chuyển hướng qua useEffect
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
        }}>
          <UserOutlined style={{ fontSize: '28px', color: 'white' }} />
        </div>
        <Title level={2} style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Chào mừng trở lại!
        </Title>
        <Text style={{ 
          color: 'var(--text-secondary)',
          fontSize: '16px'
        }}>
          Đăng nhập để tiếp tục quản lý dự án
        </Text>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert 
          type="error" 
          message={error} 
          style={{ 
            marginBottom: '24px',
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444'
          }} 
        />
      )}

      {/* Login Form */}
      <Form 
        layout="vertical" 
        onFinish={onFinish}
        size="large"
      >
        <Form.Item 
          name="email" 
          label={
            <Text strong style={{ color: 'var(--text-primary)' }}>
              Email
            </Text>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        > 
          <Input 
            prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Nhập email của bạn"
            autoComplete="username"
            style={{
              height: '48px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          />
        </Form.Item>
        
        <Form.Item 
          name="password" 
          label={
            <Text strong style={{ color: 'var(--text-primary)' }}>
              Mật khẩu
            </Text>
          }
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        > 
          <Input.Password 
            prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Nhập mật khẩu của bạn"
            autoComplete="current-password"
            style={{
              height: '48px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          />
        </Form.Item>
        
        <Form.Item style={{ marginBottom: '24px' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading}
            style={{
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </Form.Item>
      </Form>

      {/* Divider */}
      <Divider style={{ 
        borderColor: 'var(--border-color)',
        margin: '24px 0'
      }}>
        <Text style={{ color: 'var(--text-muted)' }}>hoặc</Text>
      </Divider>

      {/* Register Link */}
      <div style={{ textAlign: 'center' }}>
        <Text style={{ color: 'var(--text-secondary)' }}>
          Chưa có tài khoản?{' '}
        </Text>
        <Link 
          to="/register"
          style={{
            color: '#6366f1',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
        >
          Đăng ký ngay
        </Link>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '32px',
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Text style={{ 
          fontSize: '12px', 
          color: 'var(--text-muted)',
          display: 'block',
          marginBottom: '4px'
        }}>
          Bằng cách đăng nhập, bạn đồng ý với
        </Text>
        <Text style={{ 
          fontSize: '12px', 
          color: '#6366f1',
          cursor: 'pointer'
        }}>
          Điều khoản sử dụng và Chính sách bảo mật
        </Text>
      </div>
    </div>
  );
};

export default Login; 