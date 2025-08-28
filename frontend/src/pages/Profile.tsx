import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileApi } from '../services/profileApi';
import type { ProfileUpdateData, PasswordChangeData } from '../types/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [profileForm, setProfileForm] = useState<ProfileUpdateData>({
    name: '',
    phone: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    gender: 'other'
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || 'other'
      });
      if (user.avatar) {
        setAvatarPreview(`http://localhost:5000${user.avatar}`);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await profileApi.updateProfile(profileForm);
      updateUser(updatedUser);
      toast.success('Thông tin cá nhân đã được cập nhật!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setAvatarLoading(true);
    try {
      console.log('Uploading file:', selectedFile);
      const updatedUser = await profileApi.updateAvatar(selectedFile);
      console.log('Upload response:', updatedUser);
      updateUser(updatedUser);
      setAvatarPreview(URL.createObjectURL(selectedFile));
      setSelectedFile(null);
      toast.success('Avatar đã được cập nhật!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    setPasswordLoading(true);
    try {
      await profileApi.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      toast.success('Mật khẩu đã được thay đổi!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn! Kích thước tối đa là 5MB');
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f6f8fa'
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f6f8fa',
      padding: '0'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: '#374151',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Quay về trang chính
          </button>
          
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0'
          }}>
            Hồ sơ cá nhân
          </h1>
          
          <div style={{ width: '128px' }}></div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px'
        }}>
          {/* Avatar Section */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <img
                src={avatarPreview || (user.avatar ? `http://localhost:5000${user.avatar}` : `https://ui-avatars.com/api/?name=${user.name}&size=128&background=3B82F6&color=fff`)}
                alt="Avatar"
                style={{
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
            
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>{user.name}</h2>
            <p style={{
              color: '#6b7280',
              margin: '0 0 24px 0',
              fontSize: '14px'
            }}>{user.email}</p>
            
            <div style={{ marginBottom: '16px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
            
            {selectedFile && (
              <button
                onClick={handleAvatarUpload}
                disabled={avatarLoading}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: avatarLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {avatarLoading ? 'Đang tải...' : 'Cập nhật avatar'}
              </button>
            )}
          </div>

          {/* Profile Form */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 24px 0'
            }}>Thông tin cá nhân</h2>
            
            <form onSubmit={handleProfileSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#f9fafb',
                      color: '#6b7280'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Giới tính
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({...profileForm, gender: e.target.value as 'male' | 'female' | 'other'})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Giới thiệu
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'none'
                    }}
                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                  />
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Form */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 24px 0'
            }}>Thay đổi mật khẩu</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    required
                    minLength={6}
                  />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    padding: '8px 24px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {passwordLoading ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
