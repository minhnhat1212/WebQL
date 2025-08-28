import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Progress, Button, Input, List, Upload, Form, Select, App as AntdApp, Breadcrumb, Typography, Avatar, Row, Col, Spin, Tag, Space } from 'antd';
import { getTaskDetail, updateTaskDetail, getComments, addComment, uploadFiles } from '../services/taskDetailApi';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';
import { HomeOutlined, SendOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

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

const TaskDetail: React.FC = () => {
  const { message } = AntdApp.useApp();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tk, cm] = await Promise.all([
        getTaskDetail(id!),
        getComments(id!),
      ]);
      setTask(tk);
      setComments(cm);
      setFileList(tk.files || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const isAdminOrLeader = user?.role === 'admin' || (task?.project?.leader && (task.project.leader._id === user?.id || task.project.leader === user?.id));
  // Sửa điều kiện isAssignee để đúng với dữ liệu trả về từ backend
  const isAssignee = Array.isArray(task?.assignees) && task.assignees.some((a: any) => (a?._id || a) === user?.id);

  const handleUpdate = async (values: any) => {
    setUpdating(true);
    try {
      await updateTaskDetail(id!, values);
      message.success('Cập nhật thành công');
      fetchData();
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    await addComment(id!, comment);
    setComment('');
    fetchData();
  };

  // Upload nhiều file
  const handleUpload = async (info: any) => {
    setUploading(true);
    try {
      const files = info.fileList.map((f: any) => f.originFileObj).filter(Boolean);
      if (files.length === 0) return;
      await uploadFiles(id!, files);
      message.success('Đã upload file');
      setFileList([]); // reset
      fetchData();
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px' }}>
      <Spin size="large" />
    </div>
  );
  
  if (!task) return (
    <div style={{ textAlign: 'center', padding: '48px' }}>
      <Text style={{ fontSize: '18px', color: '#64748b' }}>
        Không tìm thấy task
      </Text>
    </div>
  );

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh' 
    }}>
      {/* Breadcrumb */}
      <Breadcrumb 
        style={{ marginBottom: '16px' }}
        items={[
          { title: <HomeOutlined />, href: '/dashboard' },
          { title: 'Tasks', href: '/tasks' },
          { title: task.name }
        ]}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <Card className="project-header-card fade-in-up" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={4}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>{task.name}</Title>
                <Space wrap>
                  <Tag color={statusColor[task.status]} icon={React.createElement(statusIcons[task.status])} style={{ borderRadius: 12, padding: '4px 10px', fontWeight: 600 }}>
                    {task.status?.toUpperCase()}
                  </Tag>
                  {task.deadline && (
                    <Space>
                      <CalendarOutlined style={{ color: 'white' }} />
                      <Text style={{ color: 'rgba(255,255,255,0.95)' }}>{dayjs(task.deadline).format('DD/MM/YYYY')}</Text>
                    </Space>
                  )}
                  {task.project?.name && (
                    <Space>
                      <FileTextOutlined style={{ color: 'white' }} />
                      <Text style={{ color: 'rgba(255,255,255,0.95)' }}>{task.project?.name}</Text>
                    </Space>
                  )}
                </Space>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                {isAdminOrLeader && (
                  <Select
                    value={task.status}
                    onChange={(value) => handleUpdate({ status: value })}
                    style={{ width: 140 }}
                    size="large"
                  >
                    <Select.Option value="todo">To Do</Select.Option>
                    <Select.Option value="doing">Doing</Select.Option>
                    <Select.Option value="done">Hoàn thành</Select.Option>
                  </Select>
                )}
                <Button 
                  onClick={() => navigate(-1)} 
                  size="large" 
                  style={{ 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '8px',
                    background: 'transparent'
                  }}
                >
                  ← Quay lại
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main Content */}
        <Row gutter={24}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Details Section */}
            <Card
              title="Chi tiết"
              className="task-table-card fade-in-up"
              style={{ marginBottom: '24px' }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#23272f', fontSize: '16px' }}>
                  Tên task:
                </Text>
                <Text style={{ color: '#64748b', fontSize: '14px', marginLeft: '8px' }}>
                  {task.name}
                </Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#23272f', fontSize: '16px' }}>
                  Dự án:
                </Text>
                <Text style={{ color: '#64748b', fontSize: '14px', marginLeft: '8px' }}>
                  {task.project?.name}
                </Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#23272f', fontSize: '16px' }}>
                  Người thực hiện:
                </Text>
                <Text style={{ color: '#64748b', fontSize: '14px', marginLeft: '8px' }}>
                  {Array.isArray(task.assignees) ? task.assignees.map((a: any) => a?.name).join(', ') : ''}
                </Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#23272f', fontSize: '16px' }}>
                  Deadline:
                </Text>
                <Text style={{ color: '#64748b', fontSize: '14px', marginLeft: '8px' }}>
                  {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'N/A'}
                </Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#23272f', fontSize: '16px' }}>
                  Tiến độ:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <Progress 
                    percent={task.progress || 0} 
                    size="small" 
                    style={{ width: 200 }} 
                  />
                  {isAdminOrLeader && (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => form.setFieldsValue({ progress: task.progress, status: task.status })}
                    >
                      Cập nhật
                    </Button>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#23272f', fontSize: '16px' }}>
                  Mô tả:
                </Text>
                <Text style={{ color: '#64748b', fontSize: '14px', marginLeft: '8px' }}>
                  {task.description || 'Không có mô tả'}
                </Text>
              </div>
              
              {isAdminOrLeader && (
                <Form
                  form={form}
                  layout="inline"
                  initialValues={{ progress: task.progress, status: task.status }}
                  onFinish={handleUpdate}
                  style={{ marginTop: '16px' }}
                >
                  <Form.Item name="progress" label="Tiến độ">
                    <Input type="number" min={0} max={100} style={{ width: 80 }} />
                  </Form.Item>
                  <Form.Item name="status" label="Trạng thái">
                    <Select style={{ width: 120 }}>
                      <Select.Option value="todo">To Do</Select.Option>
                      <Select.Option value="doing">Doing</Select.Option>
                      <Select.Option value="done">Done</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={updating}>Cập nhật</Button>
                  </Form.Item>
                </Form>
              )}
            </Card>

            {/* Files Section */}
            <Card
              title="File đính kèm"
              className="task-table-card fade-in-up"
              style={{ marginBottom: '24px' }}
              styles={{ body: { padding: '24px' } }}
            >
              {isAssignee && (
                <Upload
                  multiple
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={handleUpload}
                  showUploadList={true}
                  accept="*"
                  disabled={uploading}
                  style={{ marginBottom: '16px' }}
                >
                  <Button loading={uploading}>Nộp file</Button>
                </Upload>
              )}
              
              <List
                size="small"
                dataSource={task.files}
                renderItem={(file: any) => (
                  <List.Item>
                    <a
                      href={`http://localhost:5000${encodeURI(file.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {decodeURIComponent(file.name)}
                    </a>
                    {file.uploadedAt && (
                      <span style={{ marginLeft: 8, color: '#64748b' }}>
                        ({dayjs(file.uploadedAt).format('HH:mm DD/MM/YYYY')})
                      </span>
                    )}
                    {file.uploadedBy && (
                      <span style={{ marginLeft: 8, color: '#64748b' }}>
                        bởi {typeof file.uploadedBy === 'object' ? (file.uploadedBy.name || file.uploadedBy.email) : file.uploadedBy}
                      </span>
                    )}
                  </List.Item>
                )}
                locale={{ emptyText: 'Chưa có file nào' }}
              />
            </Card>

            {/* History Section */}
            <Card
              title="Lịch sử"
              className="task-table-card fade-in-up"
              styles={{ body: { padding: '24px' } }}
            >
              <List
                dataSource={comments}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar 
                        size={32}
                        style={{ 
                          background: '#6366f1',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {item.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <div>
                        <Text style={{ color: '#23272f', fontSize: '14px' }}>
                          {item.user?.name || 'Unknown'}
                        </Text>
                        <div>
                          <Text style={{ color: '#64748b', fontSize: '12px' }}>
                            {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: 'Chưa có lịch sử' }}
              />
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Members Section */}
            <Card
              title="Thành viên"
              className="task-table-card fade-in-up"
              style={{ marginBottom: '24px' }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ marginBottom: '16px' }}>
                {Array.isArray(task.assignees) && task.assignees.map((assignee: any, index: number) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '12px',
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <Avatar 
                      size={32}
                      style={{ 
                        background: '#3b82f6',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {assignee?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <div>
                      <Text style={{ 
                        fontSize: '14px', 
                        color: '#23272f',
                        fontWeight: '500'
                      }}>
                        {assignee?.name || 'Unknown'}
                      </Text>
                      <Text style={{ 
                        fontSize: '12px', 
                        color: '#64748b'
                      }}>
                        {assignee?.email || ''}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Comments Section */}
            <Card
              title="Bình luận"
              className="task-table-card fade-in-up"
              styles={{ body: { padding: '24px' } }}
            >
              {/* Comment List */}
              <div style={{ marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
                <List
                  dataSource={comments}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px',
                        width: '100%'
                      }}>
                        <Avatar 
                          size={32}
                          style={{ 
                            background: '#6366f1',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {item.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '8px' }}>
                            <Text strong style={{ color: '#23272f', fontSize: '14px' }}>
                              {item.user?.name || 'Unknown'}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>
                              {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </div>
                          <Text style={{ color: '#23272f', fontSize: '14px', display: 'block' }}>
                            {item.content}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'Chưa có bình luận' }}
                />
              </div>

              {/* Comment Input */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <Input
                  placeholder="Viết bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onPressEnter={handleAddComment}
                  style={{ flex: 1 }}
                  size="large"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleAddComment}
                  style={{
                    background: '#6366f1',
                    border: 'none',
                    borderRadius: '6px',
                    height: '40px',
                    width: '40px'
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TaskDetail; 