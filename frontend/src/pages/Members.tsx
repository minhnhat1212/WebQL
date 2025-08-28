import React, { useEffect, useState } from 'react';
import { Card, Select, List, Button, Popconfirm, Modal, Form, AutoComplete, Tag, Spin, Avatar, Typography, Space } from 'antd';
import { App as AntdApp } from 'antd';
import { getProjects } from '../services/projectApi';
import { getMembers, addMember, removeMember, changeLeader } from '../services/memberApi';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Members: React.FC = () => {
  const { user } = useAuth();
  const { message } = AntdApp.useApp();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      // Chỉ set project đầu tiên nếu chưa có project nào được chọn
      if (!selectedProject && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      message.error('Không thể tải danh sách dự án');
    }
  };

  const fetchMembers = async (projectId: string) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await getMembers(projectId);
      
      // Xử lý response từ backend
      if (response && response.members) {
        setMembers(response.members);
        // Cập nhật thông tin project nếu cần
        if (response.project && response.project.leader) {
          setSelectedProject((prev: any) => ({
            ...prev,
            leader: response.project.leader
          }));
        }
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      message.error('Không thể tải danh sách thành viên');
      setMembers([]);
    } finally {
      // Đảm bảo loading state được reset
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Kiểm tra xem có project được chọn từ trang Projects không
    const selectedProjectFromStorage = localStorage.getItem('selectedProjectForMembers');
    if (selectedProjectFromStorage) {
      try {
        const project = JSON.parse(selectedProjectFromStorage);
        setSelectedProject(project);
        // Xóa dữ liệu khỏi localStorage sau khi sử dụng
        localStorage.removeItem('selectedProjectForMembers');
      } catch (error) {
        console.error('Error parsing selected project:', error);
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedProject && selectedProject._id) {
      fetchMembers(selectedProject._id);
    }
    // eslint-disable-next-line
  }, [selectedProject?._id]); // Chỉ trigger khi _id thay đổi

  const canEdit = selectedProject && (
    user?.role === 'admin' || 
    selectedProject.leader?._id === user?.id ||
    selectedProject.leader?.id === user?.id
  );

  const handleAddMember = async () => {
    try {
      const values = await form.validateFields();
      await addMember(selectedProject._id, values.userId);
      message.success('Đã thêm thành viên');
      setModalOpen(false);
      form.resetFields();
      await fetchMembers(selectedProject._id);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      setActionLoading(`remove-${userId}`);
      await removeMember(selectedProject._id, userId);
      message.success('Đã gỡ thành viên');
      await fetchMembers(selectedProject._id);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeLeader = async (userId: string) => {
    try {
      setActionLoading(`leader-${userId}`);
      await changeLeader(selectedProject._id, userId);
      message.success('Đã đổi trưởng nhóm');
      await fetchMembers(selectedProject._id);
      // Refresh project data to update leader info
      await fetchProjects();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  const searchUser = async (q: string) => {
    if (!q) return setUserOptions([]);
    try {
      const res = await api.get('/search/users', { params: { q } });
      setUserOptions(res.data.map((u: any) => ({ value: u._id, label: `${u.name} (${u.email})` })));
    } catch (error) {
      setUserOptions([]);
    }
  };

  const isLeader = (memberId: string) => 
    selectedProject?.leader?._id === memberId || 
    selectedProject?.leader?.id === memberId;

  return (
    <section className="section-appear section-important" style={{ marginBottom: '32px' }}>
      <Card 
        title={
          <Space>
            <TeamOutlined style={{ color: '#6366f1' }} />
            <span>Quản lý thành viên dự án</span>
          </Space>
        } 
        className="section-appear" 
        style={{ borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 300 }}
            value={selectedProject?._id}
            onChange={id => setSelectedProject(projects.find((p: any) => p._id === id))}
            placeholder="Chọn dự án"
          >
            {projects.map((pj: any) => (
              <Select.Option key={pj._id} value={pj._id}>{pj.name}</Select.Option>
            ))}
          </Select>
          {canEdit && (
            <Button type="primary" style={{ marginLeft: 16 }} onClick={() => setModalOpen(true)}>
              Thêm thành viên
            </Button>
          )}
        </div>
        
        {selectedProject && (
          <div style={{ marginBottom: 16, padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
            <Text strong>Trưởng nhóm:</Text> {selectedProject.leader?.name || 'Chưa có'}
            {selectedProject.leader?.email && ` (${selectedProject.leader.email})`}
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" tip="Đang tải danh sách thành viên..." />
          </div>
        ) : members.length > 0 ? (
          <List
            dataSource={members}
            renderItem={item => (
              <List.Item
                style={{ 
                  padding: '16px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}
                actions={canEdit ? [
                  !isLeader(item._id) && (
                    <Popconfirm 
                      title="Gỡ thành viên khỏi dự án?" 
                      onConfirm={() => handleRemove(item._id)}
                      okText="Gỡ"
                      cancelText="Hủy"
                    >
                      <Button 
                        size="small" 
                        danger 
                        loading={actionLoading === `remove-${item._id}`}
                      >
                        Gỡ
                      </Button>
                    </Popconfirm>
                  ),
                  !isLeader(item._id) && (
                    <Popconfirm
                      title="Đổi trưởng nhóm cho người này?"
                      onConfirm={() => handleChangeLeader(item._id)}
                      okText="Đổi"
                      cancelText="Hủy"
                    >
                      <Button 
                        size="small" 
                        type="primary" 
                        loading={actionLoading === `leader-${item._id}`}
                      >
                        Đổi trưởng nhóm
                      </Button>
                    </Popconfirm>
                  )
                ].filter(Boolean) : []}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size={40} 
                      style={{ 
                        background: isLeader(item._id) ? '#f59e0b' : '#6366f1',
                        fontWeight: 'bold'
                      }}
                    >
                      {item.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text strong>{item.name}</Text>
                      {isLeader(item._id) && (
                        <Tag color="green">Trưởng nhóm</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Text type="secondary">{item.email}</Text>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Chưa có thành viên
          </div>
        )}
        
        <Modal
          open={modalOpen}
          title="Thêm thành viên vào dự án"
          onCancel={() => {
            setModalOpen(false);
            form.resetFields();
          }}
          onOk={handleAddMember}
          okText="Thêm"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Form.Item name="userId" label="Tìm kiếm người dùng" rules={[{ required: true, message: 'Chọn người dùng' }]}> 
              <AutoComplete
                options={userOptions}
                onSearch={searchUser}
                style={{ width: '100%' }}
                placeholder="Nhập tên hoặc email"
                filterOption={false}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </section>
  );
};

export default Members; 