import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Popconfirm, Tag, Select, Typography, Space, Tooltip, Row, Col, Statistic, Progress, Avatar, Empty } from 'antd';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskApi';
import { getProjects } from '../services/projectApi';
import { getMembers } from '../services/memberApi';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';
import { App as AntdApp } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, CalendarOutlined, FileTextOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, TeamOutlined } from '@ant-design/icons';
import './Tasks.css';

const statusColor: Record<string, string> = {
  todo: 'default',
  doing: 'processing',
  done: 'success',
};

const statusIcons: Record<string, any> = {
  todo: ClockCircleOutlined,
  doing: ExclamationCircleOutlined,
  done: CheckCircleOutlined,
};

const statusText: Record<string, string> = {
  todo: 'Chờ thực hiện',
  doing: 'Đang thực hiện',
  done: 'Hoàn thành',
};

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<{ project?: string; status?: string }>({});
  const [members, setMembers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tk, pj] = await Promise.all([
        getTasks(filter),
        getProjects(),
      ]);
      setTasks(tk);
      setProjects(pj);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [JSON.stringify(filter)]);

  // Lấy thành viên khi chọn dự án trong form
  const fetchMembers = async (projectId: string) => {
    if (!projectId) {
      setMembers([]);
      return;
    }
    try {
      const data = await getMembers(projectId);
      // Xử lý response từ backend - có thể trả về object hoặc array
      if (data && data.members) {
        setMembers(data.members);
      } else if (Array.isArray(data)) {
        setMembers(data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  // Khi mở modal, nếu có task thì lấy thành viên dự án của task, nếu tạo mới thì lấy theo project đầu tiên hoặc project đang chọn
  const openModal = (task?: any) => {
    setEditTask(task || null);
    setModalOpen(true);
    let projectId = '';
    if (task) {
      form.setFieldsValue({
        ...task,
        project: task.project?._id || task.project, // Đảm bảo đúng định dạng
        assignees: task.assignees ? task.assignees.map((u: any) => u._id || u) : [],
        deadline: task.deadline ? dayjs(task.deadline) : null,
      });
      projectId = task.project?._id || task.project;
    } else {
      form.resetFields();
      // Không tự động chọn project khi tạo task mới
      projectId = filter.project || '';
      if (projectId) form.setFieldsValue({ project: projectId });
    }
    if (projectId) fetchMembers(projectId);
    else setMembers([]);
  };

  // Khi chọn dự án trong form, tự động lấy lại thành viên
  const handleProjectChange = (projectId: string) => {
    if (!projectId) {
      setMembers([]);
      form.setFieldsValue({ assignees: undefined });
      return;
    }
    form.setFieldsValue({ assignees: undefined }); // reset assignee khi đổi dự án
    fetchMembers(projectId);
  };

  const handleOk = async () => {
    setModalLoading(true);
    try {
      const values = await form.validateFields();
      
      // Validation bổ sung
      if (!values.project) {
        message.error('Vui lòng chọn dự án');
        return;
      }
      
      if (!values.assignees || values.assignees.length === 0) {
        message.error('Vui lòng chọn người thực hiện');
        return;
      }
      
      const payload = {
        ...values,
        projectId: values.project, // Đảm bảo truyền projectId đúng backend
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        assignees: values.assignees,
      };
      delete payload.project; // Xóa trường project vì backend không nhận
      
      if (editTask) {
        await updateTask(editTask._id, payload);
        message.success('Cập nhật task thành công');
      } else {
        const newTask = await createTask(payload);
        message.success('Tạo task thành công');
        // Đánh dấu task mới để có animation
        setNewTaskId(newTask._id);
        // Xóa đánh dấu sau 3 giây
        setTimeout(() => setNewTaskId(null), 3000);
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error creating/updating task:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra khi tạo/cập nhật task');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      message.success('Đã xóa task');
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa task');
    }
  };

  const canEdit = () => user?.role === 'admin' || user?.role === 'leader';
  const canCreate = user?.role === 'admin' || user?.role === 'leader';

  // Tính toán thống kê
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const doingTasks = tasks.filter(t => t.status === 'doing').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Render task card
  const renderTaskCard = (task: any, index: number) => {
    const IconComponent = statusIcons[task.status] || ClockCircleOutlined;
    const isOverdue = task.deadline && dayjs(task.deadline).isBefore(dayjs(), 'day');
    const isNewTask = task._id === newTaskId;
    
    return (
      <div
        key={task._id}
        className={`task-card-container ${isNewTask ? 'new-task-animation' : ''}`}
        style={{
          animationDelay: `${index * 0.1}s`,
        }}
      >
        <Card
          className="task-card"
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: isNewTask ? 'linear-gradient(135deg, #fff5f5 0%, #fef7f0 100%)' : 'white',
            borderColor: isNewTask ? '#ff6b6b' : '#e5e7eb',
          }}
          hoverable
          onClick={() => navigate(`/tasks/${task._id}`)}
        >
          {/* Status indicator */}
          <div className={`status-indicator ${task.status}`} />
          
          {/* Header */}
          <div className="task-header">
            <div style={{ flex: 1 }}>
              <Typography.Title level={4} className="task-title">
                {task.name}
              </Typography.Title>
              <Tag className="task-project-tag">
                {task.project?.name}
              </Tag>
            </div>
            <Space>
              <Tag 
                color={statusColor[task.status]} 
                icon={<IconComponent />}
                className="status-tag"
              >
                {statusText[task.status]}
              </Tag>
              {canEdit() && (
                <div onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Chỉnh sửa">
                    <Button 
                      size="small" 
                      icon={<EditOutlined />}
                      onClick={() => openModal(task)}
                      style={{ 
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Sửa
                    </Button>
                  </Tooltip>
                </div>
              )}
            </Space>
          </div>

          {/* Description */}
          {task.description && (
            <Typography.Paragraph className="task-description">
              {task.description}
            </Typography.Paragraph>
          )}

          {/* Progress */}
          <div className="progress-section">
            <div className="progress-header">
              <Typography.Text className="progress-label">
                Tiến độ
              </Typography.Text>
              <Typography.Text className="progress-percentage">
                {task.progress || 0}%
              </Typography.Text>
            </div>
            <Progress 
              percent={task.progress || 0} 
              size="small" 
              showInfo={false}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>

          {/* Assignees */}
          <div className="assignees-section">
            <div className="assignees-header">
              <TeamOutlined className="assignees-icon" />
              <Typography.Text className="assignees-label">
                Người thực hiện
              </Typography.Text>
            </div>
            <div className="assignees-list">
              {task.assignees?.map((assignee: any, index: number) => (
                <div key={assignee._id || index} className="assignee-item">
                  <Avatar 
                    size="small" 
                    className="assignee-avatar"
                  >
                    {assignee.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography.Text className="assignee-name">
                    {assignee.name}
                  </Typography.Text>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="task-footer" style={{ marginTop: 'auto' }}>
            <div className="deadline-info">
              <CalendarOutlined className="deadline-icon" />
              <Typography.Text className="deadline-text">
                {task.deadline ? (
                  <span className={isOverdue ? 'deadline-overdue' : ''}>
                    {dayjs(task.deadline).format('DD/MM/YYYY')}
                    {isOverdue && ' (Quá hạn)'}
                  </span>
                ) : 'Chưa có deadline'}
              </Typography.Text>
            </div>
            
            <div className="task-actions">
              <Button 
                size="small" 
                type="primary" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tasks/${task._id}`);
                }}
                className="action-button action-button-primary"
                icon={<FileTextOutlined />}
              >
                Chi tiết
              </Button>
              {canEdit() && (
                <Popconfirm 
                  title="Xóa task" 
                  description="Bạn có chắc chắn muốn xóa task này?"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(task._id);
                  }}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Tooltip title="Xóa">
                    <Button 
                      size="small" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      className="action-button action-button-danger"
                    >
                      Xóa
                    </Button>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <Card 
          className="task-header-card fade-in-up"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography.Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                Quản lý công việc
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Theo dõi và quản lý tất cả task trong dự án
              </Typography.Text>
            </div>
            {canCreate && (
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                onClick={() => openModal()} 
                style={{ 
                  borderRadius: '12px', 
                  height: '48px', 
                  fontWeight: 600, 
                  background: 'rgba(255,255,255,0.2)', 
                  border: '1px solid rgba(255,255,255,0.3)', 
                  color: 'white',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Tạo task mới
              </Button>
            )}
          </div>
        </Card>

        {/* Statistics Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="statistics-card slide-in-up"
            >
              <Statistic
                title="Tổng số task"
                value={totalTasks}
                valueStyle={{ color: '#3f51b5', fontWeight: 700 }}
                prefix={<FileTextOutlined style={{ color: '#3f51b5' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="statistics-card slide-in-up"
            >
              <Statistic
                title="Chờ thực hiện"
                value={todoTasks}
                valueStyle={{ color: '#ff9800', fontWeight: 700 }}
                prefix={<ClockCircleOutlined style={{ color: '#ff9800' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="statistics-card slide-in-up"
            >
              <Statistic
                title="Đang thực hiện"
                value={doingTasks}
                valueStyle={{ color: '#2196f3', fontWeight: 700 }}
                prefix={<ExclamationCircleOutlined style={{ color: '#2196f3' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="statistics-card slide-in-up"
            >
              <Statistic
                title="Hoàn thành"
                value={doneTasks}
                valueStyle={{ color: '#4caf50', fontWeight: 700 }}
                prefix={<CheckCircleOutlined style={{ color: '#4caf50' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress Overview */}
        <Card 
          className="progress-overview-card slide-in-up"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Typography.Title level={4} style={{ margin: 0, color: '#374151' }}>
              Tiến độ tổng thể
            </Typography.Title>
            <Progress 
              percent={progressPercentage} 
              size={[300, 20]}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ flex: 1 }}
            />
            <Typography.Text strong style={{ fontSize: '16px', color: '#374151' }}>
              {progressPercentage}%
            </Typography.Text>
          </div>
        </Card>

        {/* Filters Section */}
        <Card 
          className="filters-card slide-in-up"
        >
          <Typography.Title level={4} style={{ margin: '0 0 16px 0', color: '#374151' }}>
            Bộ lọc và tìm kiếm
          </Typography.Title>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography.Text style={{ fontWeight: 500, color: '#64748b' }}>
                  Dự án:
                </Typography.Text>
                <Select 
                  placeholder="Tất cả dự án" 
                  allowClear 
                  style={{ flex: 1 }} 
                  value={filter.project} 
                  onChange={v => setFilter(f => ({ ...f, project: v }))} 
                  showSearch 
                  optionFilterProp="children"
                >
                  {projects.map((pj: any) => (
                    <Select.Option key={pj._id} value={pj._id}>{pj.name}</Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography.Text style={{ fontWeight: 500, color: '#64748b' }}>
                  Trạng thái:
                </Typography.Text>
                <Select 
                  placeholder="Tất cả trạng thái" 
                  allowClear 
                  style={{ flex: 1 }} 
                  value={filter.status} 
                  onChange={v => setFilter(f => ({ ...f, status: v }))}
                >
                  <Select.Option value="todo">Chờ thực hiện</Select.Option>
                  <Select.Option value="doing">Đang thực hiện</Select.Option>
                  <Select.Option value="done">Hoàn thành</Select.Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  onClick={() => setFilter({})}
                  style={{ 
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  Xóa bộ lọc
                </Button>
                <Typography.Text style={{ 
                  alignSelf: 'center', 
                  color: '#64748b', 
                  fontSize: '14px' 
                }}>
                  {totalTasks} task được tìm thấy
                </Typography.Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Tasks Cards Section */}
        <Card 
          className="task-table-card fade-in-scale"
        >
          <Typography.Title level={4} style={{ margin: '0 0 16px 0', color: '#374151' }}>
            Danh sách công việc
          </Typography.Title>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="ant-spin-dot">
                <i></i><i></i><i></i><i></i>
              </div>
              <Typography.Text style={{ marginTop: '16px', color: '#64748b' }}>
                Đang tải dữ liệu...
              </Typography.Text>
            </div>
          ) : tasks.length === 0 ? (
            <Empty
              description="Không có task nào"
              style={{ padding: '40px' }}
            />
          ) : (
            <div className="task-grid">
              {tasks.map((task, index) => renderTaskCard(task, index))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={
          <Typography.Title level={3} style={{ margin: 0, color: '#374151' }}>
            {editTask ? 'Chỉnh sửa task' : 'Tạo task mới'}
          </Typography.Title>
        }
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText={editTask ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
        maskClosable={false}
        width={700}
        confirmLoading={modalLoading}
        style={{ borderRadius: '12px' }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="name" 
                label={
                  <Typography.Text strong style={{ color: '#374151' }}>
                    Tên task
                  </Typography.Text>
                } 
                rules={[{ required: true, message: 'Vui lòng nhập tên task' }]}
              > 
                <Input 
                  placeholder="Nhập tên task..."
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="project" 
                label={
                  <Typography.Text strong style={{ color: '#374151' }}>
                    Dự án
                  </Typography.Text>
                } 
                rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
              > 
                <Select 
                  onChange={handleProjectChange} 
                  disabled={!!editTask}
                  placeholder="Chọn dự án"
                  showSearch
                  optionFilterProp="children"
                  allowClear={false}
                  style={{ borderRadius: '8px' }}
                >
                  {projects.map((pj: any) => (
                    <Select.Option key={pj._id} value={pj._id}>{pj.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label={
                  <Typography.Text strong style={{ color: '#374151' }}>
                    Trạng thái
                  </Typography.Text>
                } 
                initialValue="todo"
              >
                <Select style={{ borderRadius: '8px' }}>
                  <Select.Option value="todo">Chờ thực hiện</Select.Option>
                  <Select.Option value="doing">Đang thực hiện</Select.Option>
                  <Select.Option value="done">Hoàn thành</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="assignees" 
                label={
                  <Typography.Text strong style={{ color: '#374151' }}>
                    Người thực hiện
                  </Typography.Text>
                } 
                rules={[{ required: true, message: 'Vui lòng chọn người thực hiện' }]}
              > 
                <Select
                  mode="multiple"
                  placeholder={members.length === 0 ? "Vui lòng chọn dự án trước" : "Chọn thành viên"}
                  disabled={members.length === 0}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  style={{ borderRadius: '8px' }}
                >
                  {members.map((m: any) => (
                    <Select.Option key={m._id} value={m._id}>{m.name} ({m.email})</Select.Option>
                  ))}
                </Select>
                {members.length === 0 && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    Vui lòng chọn dự án để hiển thị danh sách thành viên
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="progress" 
                label={
                  <Typography.Text strong style={{ color: '#374151' }}>
                    Tiến độ (%)
                  </Typography.Text>
                }
              >
                <Input 
                  type="number" 
                  min={0} 
                  max={100} 
                  placeholder="0-100"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="deadline" 
                label={
                  <Typography.Text strong style={{ color: '#374151' }}>
                    Deadline
                  </Typography.Text>
                }
              >
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
                  style={{ borderRadius: '8px', width: '100%' }}
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

          <Form.Item 
            name="description" 
            label={
              <Typography.Text strong style={{ color: '#374151' }}>
                Mô tả
              </Typography.Text>
            }
          >
            <Input.TextArea 
              rows={4}
              placeholder="Nhập mô tả chi tiết về task..."
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks; 