import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Table, Tag, Modal, Form, Input, DatePicker, Select, Spin, Row, Col, Divider, Space, Avatar, Progress, Statistic, Popconfirm, message, Tooltip, Badge } from 'antd';
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
import { getMembers } from '../services/memberApi';
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
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const [detailModal, setDetailModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projects, tasks, members] = await Promise.all([
        getProjects(),
        getTasks({ project: id }),
        getMembers(id!),
      ]);
      setProject(projects.find((p: any) => p._id === id));
      setTasks(tasks);
      setMembers(members);
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
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <Card className="project-header-card fade-in-up">
          <Row gutter={[24, 16]} align="middle" style={{ position: 'relative', zIndex: 1 }}>
            <Col xs={24} md={16}>
              <Title level={2} style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {project?.name}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {project?.description}
              </Text>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={openCreateTask}
                  style={{ 
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  THÊM TASK
                </Button>
                <Tooltip title="Chỉnh sửa dự án">
                  <Button 
                    type="text"
                    size="large"
                    icon={<EditOutlined />}
                    className="action-button"
                  />
                </Tooltip>
                <Tooltip title="Cài đặt dự án">
                  <Button 
                    type="text"
                    size="large"
                    icon={<SettingOutlined />}
                    className="action-button"
                  />
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
                    <Button 
                      type="text"
                      size="large"
                      danger
                      icon={<DeleteOutlined />}
                      className="action-button delete-button"
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Project Info Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={6}>
            <Card className="project-stats-card fade-in-up">
              <CalendarOutlined style={{ fontSize: '28px', color: '#1890ff', marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px', fontWeight: 500 }}>Deadline</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1890ff' }}>
                {project?.deadline ? dayjs(project.deadline).format('DD/MM/YYYY') : 'Chưa có'}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="project-stats-card fade-in-up">
              <UserOutlined style={{ fontSize: '28px', color: '#52c41a', marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px', fontWeight: 500 }}>Trưởng nhóm</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#52c41a' }}>
                {project?.leader?.name || 'Chưa có'}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="project-stats-card fade-in-up">
              <TeamOutlined style={{ fontSize: '28px', color: '#722ed1', marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px', fontWeight: 500 }}>Thành viên</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#722ed1' }}>
                {Array.isArray(project?.members) ? project.members.length : 0}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="project-stats-card fade-in-up">
              <BarChartOutlined style={{ fontSize: '28px', color: '#fa8c16', marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px', fontWeight: 500 }}>Tiến độ</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fa8c16' }}>
                {progressPercent}%
              </div>
            </Card>
          </Col>
        </Row>

        {/* Task Statistics */}
        <Card className="task-statistics-card fade-in-up">
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={12}>
              <Title level={4} style={{ color: 'white', margin: 0, marginBottom: '16px' }}>
                <BarChartOutlined style={{ marginRight: '8px' }} />
                Thống kê Task
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Tổng cộng</span>}
                    value={taskStats.total}
                    valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Đang làm</span>}
                    value={taskStats.doing}
                    valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Hoàn thành</span>}
                    value={taskStats.done}
                    valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontWeight: 600 }}>Tiến độ hoàn thành</Text>
                  <Text style={{ color: 'white', fontWeight: 600 }}>{progressPercent}%</Text>
                </div>
                <Progress 
                  percent={progressPercent} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  strokeWidth={12}
                  showInfo={false}
                  style={{ marginBottom: '16px' }}
                />
                <Row gutter={[8, 8]}>
                  <Col span={8}>
                    <Badge count={taskStats.todo} style={{ backgroundColor: '#d9d9d9' }}>
                      <Tag color="default" style={{ borderRadius: '8px', padding: '4px 12px' }}>
                        To Do
                      </Tag>
                    </Badge>
                  </Col>
                  <Col span={8}>
                    <Badge count={taskStats.doing} style={{ backgroundColor: '#faad14' }}>
                      <Tag color="processing" style={{ borderRadius: '8px', padding: '4px 12px' }}>
                        Doing
                      </Tag>
                    </Badge>
                  </Col>
                  <Col span={8}>
                    <Badge count={taskStats.done} style={{ backgroundColor: '#52c41a' }}>
                      <Tag color="success" style={{ borderRadius: '8px', padding: '4px 12px' }}>
                        Done
                      </Tag>
                    </Badge>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Tasks Section */}
        <Card className="task-table-card fade-in-up">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            padding: '0 8px'
          }}>
            <Title level={3} style={{ margin: 0, color: '#262626', fontSize: '24px' }}>
              <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Danh sách task ({tasks.length})
            </Title>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={openCreateTask}
                style={{ 
                  borderRadius: '12px',
                  height: '40px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                }}
              >
                Tạo task mới
              </Button>
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
              style: { marginTop: '16px' }
            }}
            style={{ borderRadius: '16px', overflow: 'hidden' }}
            rowClassName={(_, index) => 
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
            onRow={(_, index) => ({
              style: { transition: 'all 0.2s ease' },
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.transform = 'scale(1.01)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = (index || 0) % 2 === 0 ? '#ffffff' : '#fafafa';
                e.currentTarget.style.transform = 'scale(1)';
              }
            })}
          />
        </Card>
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