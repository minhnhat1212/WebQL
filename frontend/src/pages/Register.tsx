import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { UserAddOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const { register, loading, error } = useAuth();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    await register(values.name, values.email, values.password);
    setSuccess(true);
    setTimeout(() => navigate('/login'), 1500);
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
          <UserAddOutlined style={{ fontSize: '28px', color: 'white' }} />
        </div>
        <Title level={2} style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Tạo tài khoản mới
        </Title>
        <Text style={{ 
          color: 'var(--text-secondary)',
          fontSize: '16px'
        }}>
          Tham gia cùng chúng tôi để quản lý dự án hiệu quả
        </Text>
      </div>

      {/* Alerts */}
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
      
      {success && (
        <Alert 
          type="success" 
          message="Đăng ký thành công! Đang chuyển sang trang đăng nhập..." 
          style={{ 
            marginBottom: '24px',
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981'
          }} 
        />
      )}

      {/* Register Form */}
      <Form 
        layout="vertical" 
        onFinish={onFinish}
        size="large"
      >
        <Form.Item 
          name="name" 
          label={
            <Text strong style={{ color: 'var(--text-primary)' }}>
              Họ tên
            </Text>
          }
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        > 
          <Input 
            prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Nhập họ tên của bạn"
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
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        > 
          <Input.Password 
            prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Nhập mật khẩu của bạn"
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
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
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

      {/* Login Link */}
      <div style={{ textAlign: 'center' }}>
        <Text style={{ color: 'var(--text-secondary)' }}>
          Đã có tài khoản?{' '}
        </Text>
        <Link 
          to="/login"
          style={{
            color: '#6366f1',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
        >
          Đăng nhập ngay
        </Link>
      </div>

      {/* Benefits */}
      <div style={{ 
        marginTop: '32px',
        padding: '20px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.1)'
      }}>
        <Text strong style={{ 
          color: 'var(--text-primary)',
          display: 'block',
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          Lợi ích khi tham gia:
        </Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Text style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#10b981' }}>✓</span>
            Quản lý dự án chuyên nghiệp
          </Text>
          <Text style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#10b981' }}>✓</span>
            Theo dõi tiến độ real-time
          </Text>
          <Text style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#10b981' }}>✓</span>
            Hợp tác nhóm hiệu quả
          </Text>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '24px',
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
          Bằng cách đăng ký, bạn đồng ý với
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

export default Register; 