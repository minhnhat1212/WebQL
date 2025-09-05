import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Table, Tag, Modal, Form, Input, DatePicker, Select, Spin, Row, Col, Divider, Space, Avatar, Progress, Statistic, Popconfirm, message, Tooltip, Badge, AutoComplete, Tabs } from 'antd';
import { 
  PlusOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UserSwitchOutlined,
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { getProjects, deleteProject } from '../services/projectApi';
import { getTasks, createTask } from '../services/taskApi';
import { getMembers, addMember, removeMember, changeLeader } from '../services/memberApi';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  todo: 'default',
  doing: 'processing',
  done: 'success',
};

const statusIcons: Record<string, any> = {
  todo: ClockCircleOutlined,
  doing: ClockCircleOutlined,
  done: CheckCircleOutlined,
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [memberForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projects, tasks, membersRes] = await Promise.all([
        getProjects(),
        getTasks({ project: id }),
        getMembers(id!),
      ]);
      setProject(projects.find((p: any) => p._id === id));
      setTasks(tasks);
      if (membersRes && (membersRes as any).members) {
        setMembers((membersRes as any).members);
      } else {
        setMembers(Array.isArray(membersRes) ? (membersRes as any) : []);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openCreateTask = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleCreateTask = async () => {
    try {
      const values = await form.validateFields();
      await createTask({ ...values, projectId: id });
      setModalOpen(false);
      message.success('Tạo task thành công!');
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo task');
    }
  };

  const openTaskDetail = (task: any) => {
    setTaskDetail(task);
    setDetailModal(true);
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(id!);
      message.success('Xóa dự án thành công!');
      navigate('/projects');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa dự án');
    }
  };

  // Quyền chỉnh sửa
  const canEdit = project && (
    user?.role === 'admin' ||
    project?.leader?._id === user?.id ||
    project?.leader?.id === user?.id
  );

  // Tìm user để thêm thành viên
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
    project?.leader?._id === memberId || project?.leader?.id === memberId;

  const handleAddMember = async () => {
    try {
      const values = await memberForm.validateFields();
      await addMember(id!, values.userId);
      message.success('Đã thêm thành viên');
      setMemberModalOpen(false);
      memberForm.resetFields();
      await fetchData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      setActionLoading(`remove-${userId}`);
      await removeMember(id!, userId);
      message.success('Đã gỡ thành viên');
      await fetchData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeLeader = async (userId: string) => {
    try {
      setActionLoading(`leader-${userId}`);
      await changeLeader(id!, userId);
      message.success('Đã đổi trưởng nhóm');
      await fetchData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  // Tính toán thống kê task
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const progressPercent = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  const columns = [
    { 
      title: 'Tên task', 
      dataIndex: 'name',
      render: (text: string) => <Text strong style={{ fontSize: '14px' }}>{text}</Text>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (s: string) => {
        const IconComponent = statusIcons[s];
        return (
          <Tag 
            color={statusColor[s]} 
            icon={<IconComponent />}
            style={{ 
              borderRadius: '12px', 
              padding: '6px 16px',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            {s.toUpperCase()}
          </Tag>
        );
      } 
    },
    { 
      title: 'Deadline', 
      dataIndex: 'deadline', 
      render: (d: string) => d ? (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
          <Text style={{ fontSize: '14px' }}>{dayjs(d).format('DD/MM/YYYY')}</Text>
        </Space>
      ) : '-' 
    },
    { 
      title: 'Người thực hiện', 
      dataIndex: 'assignees', 
      render: (a: any[]) => (
        <Space>
          <UserOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
          <Text style={{ fontSize: '14px' }}>{a?.map(u => u?.name).join(', ') || 'Chưa phân công'}</Text>
        </Space>
      )
    },
    {
      title: 'Hành động',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => openTaskDetail(record)}
            style={{ 
              borderRadius: '8px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card className="project-header-card fade-in-up">
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={18}>
              <Title level={2} style={{ margin: 0 }}>
                {project?.name}
              </Title>
              <Text type="secondary">
                {project?.description}
              </Text>
            </Col>
            <Col xs={24} md={6} style={{ textAlign: 'right' }}>
              <Space>
                <Tooltip title="Chỉnh sửa dự án">
                  <Button type="text" size="large" icon={<EditOutlined />} className="action-button" />
                </Tooltip>
                <Tooltip title="Cài đặt dự án">
                  <Button type="text" size="large" icon={<SettingOutlined />} className="action-button" />
                </Tooltip>
                <Popconfirm
                  title="Xóa dự án"
                  description="Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác."
                  onConfirm={handleDeleteProject}
                  okText="Xóa"
                  cancelText="Hủy"
                  icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                >
                  <Tooltip title="Xóa dự án">
                    <Button type="text" size="large" danger icon={<DeleteOutlined />} className="action-button delete-button" />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Card>

        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: 'Tổng quan',
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Card className="project-stats-card fade-in-up">
                        <CalendarOutlined style={{ fontSize: 28, color: '#1890ff', marginBottom: 12 }} />
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 6, fontWeight: 500 }}>Deadline</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#1890ff' }}>
                          {project?.deadline ? dayjs(project.deadline).format('DD/MM/YYYY') : 'Chưa có'}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                      <Card className="project-stats-card fade-in-up">
                        <UserOutlined style={{ fontSize: 28, color: '#52c41a', marginBottom: 12 }} />
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 6, fontWeight: 500 }}>Trưởng nhóm</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}>
                          {project?.leader?.name || 'Chưa có'}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                      <Card className="project-stats-card fade-in-up">
                        <TeamOutlined style={{ fontSize: 28, color: '#722ed1', marginBottom: 12 }} />
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 6, fontWeight: 500 }}>Thành viên</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#722ed1' }}>
                          {Array.isArray(project?.members) ? project.members.length : 0}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                      <Card className="project-stats-card fade-in-up">
                        <BarChartOutlined style={{ fontSize: 28, color: '#fa8c16', marginBottom: 12 }} />
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 6, fontWeight: 500 }}>Tiến độ</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fa8c16' }}>
                          {progressPercent}%
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="task-statistics-card fade-in-up">
                    <Row gutter={[24, 16]} align="middle">
                      <Col xs={24} md={12}>
                        <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
                          <BarChartOutlined style={{ marginRight: 8 }} />
                          Thống kê Task
                        </Title>
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Statistic title={<span>Tổng cộng</span>} value={taskStats.total} />
                          </Col>
                          <Col span={8}>
                            <Statistic title={<span>Đang làm</span>} value={taskStats.doing} valueStyle={{ color: '#faad14' }} />
                          </Col>
                          <Col span={8}>
                            <Statistic title={<span>Hoàn thành</span>} value={taskStats.done} valueStyle={{ color: '#52c41a' }} />
                          </Col>
                        </Row>
                      </Col>
                      <Col xs={24} md={12}>
                        <div style={{ padding: 16 }}>
                          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>Tiến độ hoàn thành</Text>
                            <Text strong>{progressPercent}%</Text>
                          </div>
                          <Progress percent={progressPercent} strokeWidth={12} showInfo={false} style={{ marginBottom: 16 }} />
                          <Row gutter={[8, 8]}>
                            <Col span={8}>
                              <Badge count={taskStats.todo}>
                                <Tag color="default" style={{ borderRadius: 8, padding: '4px 12px' }}>To Do</Tag>
                              </Badge>
                            </Col>
                            <Col span={8}>
                              <Badge count={taskStats.doing}>
                                <Tag color="processing" style={{ borderRadius: 8, padding: '4px 12px' }}>Doing</Tag>
                              </Badge>
                            </Col>
                            <Col span={8}>
                              <Badge count={taskStats.done}>
                                <Tag color="success" style={{ borderRadius: 8, padding: '4px 12px' }}>Done</Tag>
                              </Badge>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </div>
              )
            },
            {
              key: 'tasks',
              label: 'Task',
              children: (
                <Card className="task-table-card fade-in-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 8px' }}>
                    <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                      <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Danh sách task ({tasks.length})
                    </Title>
                    <Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={openCreateTask}>Tạo task mới</Button>
                    </Space>
                  </div>
                  <Table
                    dataSource={tasks}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ 
                      pageSize: 8,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} task`,
                      style: { marginTop: 16 }
                    }}
                    style={{ borderRadius: 16, overflow: 'hidden' }}
                    rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
                  />
                </Card>
              )
            },
            {
              key: 'members',
              label: 'Thành viên',
              children: (
                <Card className="fade-in-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                      <TeamOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                      Thành viên dự án ({members.length})
                    </Title>
                    {canEdit && (
                      <Button type="primary" onClick={() => setMemberModalOpen(true)}>Thêm thành viên</Button>
                    )}
                  </div>
                  <Row gutter={[12, 12]}>
                    {members.length > 0 ? members.map((m: any) => (
                      <Col xs={24} md={12} key={m._id}>
                        <Card size="small">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Space>
                              <Avatar
                                size={40}
                                style={{ background: isLeader(m._id) ? '#f59e0b' : '#6366f1', fontWeight: 'bold' }}
                              >
                                {m.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
                              </Avatar>
                              <div>
                                <Space>
                                  <Text strong>{m.name}</Text>
                                  {isLeader(m._id) && <Tag color="green">Trưởng nhóm</Tag>}
                                </Space>
                                <div><Text type="secondary">{m.email}</Text></div>
                              </div>
                            </Space>
                            {canEdit && !isLeader(m._id) && (
                              <Space>
                                <Popconfirm title="Đổi trưởng nhóm cho người này?" onConfirm={() => handleChangeLeader(m._id)} okText="Đổi" cancelText="Hủy">
                                  <Button size="small" type="primary" loading={actionLoading === `leader-${m._id}`}>Đổi trưởng nhóm</Button>
                                </Popconfirm>
                                <Popconfirm title="Gỡ thành viên khỏi dự án?" onConfirm={() => handleRemoveMember(m._id)} okText="Gỡ" cancelText="Hủy">
                                  <Button size="small" danger loading={actionLoading === `remove-${m._id}`}>Gỡ</Button>
                                </Popconfirm>
                              </Space>
                            )}
                          </div>
                        </Card>
                      </Col>
                    )) : (
                      <Col span={24}>
                        <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>Chưa có thành viên</div>
                      </Col>
                    )}
                  </Row>
                </Card>
              )
            }
          ]}
        />
      </div>

      {/* Modal tạo task */}
      <Modal
        open={modalOpen}
        title={
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>
            <PlusOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Tạo task mới
          </div>
        }
        onCancel={() => setModalOpen(false)}
        onOk={form.submit}
        okText="Tạo task"
        cancelText="Hủy"
        destroyOnHidden
        width={600}
        style={{ borderRadius: '16px' }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item 
            name="name" 
            label="Tên task" 
            rules={[{ required: true, message: 'Nhập tên task' }]}
          > 
            <Input placeholder="Nhập tên task..." style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item 
            name="assignees" 
            label="Người thực hiện" 
            rules={[{ required: true, message: 'Chọn người thực hiện' }]}
          > 
            <Select
              mode="multiple"
              placeholder="Chọn thành viên"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ borderRadius: '8px' }}
            >
              {members.map((m: any) => (
                <Select.Option key={m._id} value={m._id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {m.name} ({m.email})
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea 
              placeholder="Nhập mô tả task..." 
              rows={4}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="todo">
                <Select style={{ borderRadius: '8px' }}>
                  <Select.Option value="todo">To Do</Select.Option>
                  <Select.Option value="doing">Doing</Select.Option>
                  <Select.Option value="done">Done</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deadline" label="Deadline">
                <DatePicker 
                  format="DD/MM/YYYY" 
                  className="custom-datepicker"
                  placeholder="Chọn ngày deadline"
                  showTime={false}
                  allowClear
                  inputReadOnly
                  suffixIcon={<CalendarOutlined style={{ color: '#6366f1', fontSize: '18px' }} />}
                  disabledDate={(current) => {
                    // Không cho phép chọn ngày trong quá khứ
                    return current && current < dayjs().startOf('day');
                  }}
                  panelRender={(panelNode) => (
                    <div style={{ padding: '8px' }}>
                      {panelNode}
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '12px 0',
                        borderTop: '1px solid #f0f0f0',
                        marginTop: '8px'
                      }}>
                        <Button 
                          className="calendar-today-btn"
                          size="small"
                          onClick={() => {
                            const today = dayjs();
                            form.setFieldValue('deadline', today);
                          }}
                        >
                          Hôm nay
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal thêm thành viên */}
      <Modal
        open={memberModalOpen}
        title="Thêm thành viên vào dự án"
        onCancel={() => { setMemberModalOpen(false); memberForm.resetFields(); }}
        onOk={handleAddMember}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={memberForm} layout="vertical">
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

      {/* Modal chi tiết task */}
      <Modal
        open={detailModal}
        title={
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>
            <UserSwitchOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            {taskDetail?.name}
          </div>
        }
        onCancel={() => setDetailModal(false)}
        footer={null}
        destroyOnHidden
        width={600}
        style={{ borderRadius: '16px' }}
      >
        {taskDetail && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Trạng thái:</Text>
                  <Tag 
                    color={statusColor[taskDetail.status]} 
                    icon={React.createElement(statusIcons[taskDetail.status])}
                    style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: 600 }}
                  >
                    {taskDetail.status.toUpperCase()}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Deadline:</Text>
                  <Space>
                    <CalendarOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                    <Text style={{ fontSize: '14px' }}>{taskDetail.deadline ? dayjs(taskDetail.deadline).format('DD/MM/YYYY') : 'Chưa có'}</Text>
                  </Space>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Người thực hiện:</Text>
              <Space>
                <UserOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                <Text style={{ fontSize: '14px' }}>{taskDetail.assignees?.map((u: any) => u?.name).join(', ') || 'Chưa phân công'}</Text>
              </Space>
            </div>
            
            {taskDetail.description && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Mô tả:</Text>
                <div style={{ 
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  borderLeft: '4px solid #1890ff',
                  marginTop: '8px'
                }}>
                  {taskDetail.description}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
} 