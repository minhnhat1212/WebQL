import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Progress, Button, Input, List, Upload, Form, Select, App as AntdApp, Typography, Avatar, Row, Col, Spin, Tag, Space, Divider, Tabs, Statistic, Badge, Tooltip, Popconfirm } from 'antd';
import { getTaskDetail, updateTaskDetail, getComments, addComment, uploadFiles, toggleChecklistItem, updateChecklist, addSubtask, startTimer, stopTimer } from '../services/taskDetailApi';
import { getTasks } from '../services/taskApi';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';
import { 
  SendOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined,
  EditOutlined,
  SettingOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';

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
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  const [subtaskForm] = Form.useForm();
  const [projectTasks, setProjectTasks] = useState<any[]>([]);

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

  useEffect(() => {
    (async () => {
      if (task?.project?._id || task?.project) {
        try {
          const list = await getTasks({ project: task.project._id || task.project });
          // loại bỏ chính nó
          setProjectTasks((list || []).filter((t: any) => t._id !== task._id));
        } catch {}
      }
    })();
  }, [task?.project, task?._id]);

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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleToggleChecklist = async (itemId: string, done?: boolean) => {
    await toggleChecklistItem(id!, itemId, done);
    fetchData();
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistTitle.trim()) return;
    const next = [...(task.checklist || [])];
    // tạo id đơn giản client-side
    const cid = Math.random().toString(36).slice(2);
    next.push({ id: cid, title: newChecklistTitle.trim(), done: false });
    await updateChecklist(id!, next);
    setNewChecklistTitle('');
    fetchData();
  };

  const handleRemoveChecklistItem = async (itemId: string) => {
    const next = (task.checklist || []).filter((i: any) => i.id !== itemId);
    await updateChecklist(id!, next);
    fetchData();
  };

  const handleCreateSubtask = async () => {
    try {
      const values = await subtaskForm.validateFields();
      await addSubtask(id!, {
        name: values.name,
        description: values.description,
        assignees: values.assignees || [],
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        priority: values.priority,
      });
      setCreatingSubtask(false);
      subtaskForm.resetFields();
      fetchData();
      message.success('Đã tạo subtask');
    } catch (e) {
      // ignore
    }
  };

  const handleStartTimer = async () => {
    await startTimer(id!);
    fetchData();
  };

  const handleStopTimer = async () => {
    await stopTimer(id!);
    fetchData();
  };

  const handleUpdateDependencies = async (deps: string[]) => {
    await updateTaskDetail(id!, { dependencies: deps });
    fetchData();
    message.success('Đã cập nhật phụ thuộc');
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
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card className="project-header-card fade-in-up">
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={18}>
              <Title level={2} style={{ margin: 0 }}>
                {task?.name}
              </Title>
              <Text type="secondary">
                {task?.description || 'Không có mô tả'}
              </Text>
            </Col>
            <Col xs={24} md={6} style={{ textAlign: 'right' }}>
              <Space>
                <Tooltip title="Chỉnh sửa task">
                  <Button type="text" size="large" icon={<EditOutlined />} className="action-button" />
                </Tooltip>
                <Tooltip title="Cài đặt task">
                  <Button type="text" size="large" icon={<SettingOutlined />} className="action-button" />
                </Tooltip>
                <Popconfirm
                  title="Xóa task"
                  description="Bạn có chắc chắn muốn xóa task này? Hành động này không thể hoàn tác."
                  onConfirm={() => {
                    message.success('Xóa task thành công!');
                    navigate('/tasks');
                  }}
                  okText="Xóa"
                  cancelText="Hủy"
                  icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                >
                  <Tooltip title="Xóa task">
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
                          {task?.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Chưa có'}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                      <Card className="project-stats-card fade-in-up">
                        <UserOutlined style={{ fontSize: 28, color: '#52c41a', marginBottom: 12 }} />
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 6, fontWeight: 500 }}>Người thực hiện</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}>
                          {Array.isArray(task?.assignees) ? task.assignees.length : 0}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                      <Card className="project-stats-card fade-in-up">
                        <TeamOutlined style={{ fontSize: 28, color: '#722ed1', marginBottom: 12 }} />
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 6, fontWeight: 500 }}>Trạng thái</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#722ed1' }}>
                          <Tag color={statusColor[task?.status]} icon={React.createElement(statusIcons[task?.status])} style={{ borderRadius: 12, padding: '4px 10px', fontWeight: 600 }}>
                            {task?.status?.toUpperCase()}
                          </Tag>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                      <Card className="project-stats-card fade-in-up">
                        <BarChartOutlined style={{ fontSize: 28, color: '#fa8c16', marginBottom: 12 }} />
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 6, fontWeight: 500 }}>Tiến độ</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fa8c16' }}>
                          {task?.progress || 0}%
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="task-statistics-card fade-in-up">
                    <Row gutter={[24, 16]} align="middle">
                      <Col xs={24} md={12}>
                        <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
                          <BarChartOutlined style={{ marginRight: 8 }} />
                          Thông tin Task
                        </Title>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Statistic title={<span>Dự án</span>} value={task?.project?.name || 'N/A'} />
                          </Col>
                          <Col span={12}>
                            <Statistic title={<span>Thời gian làm việc</span>} value={formatDuration(task?.timeTracking?.totalSeconds || 0)} valueStyle={{ color: '#52c41a' }} />
                          </Col>
                        </Row>
                      </Col>
                      <Col xs={24} md={12}>
                        <div style={{ padding: 16 }}>
                          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>Tiến độ hoàn thành</Text>
                            <Text strong>{task?.progress || 0}%</Text>
                          </div>
                          <Progress percent={task?.progress || 0} strokeWidth={12} showInfo={false} style={{ marginBottom: 16 }} />
                          <Row gutter={[8, 8]}>
                            <Col span={8}>
                              <Badge count={task?.checklist?.filter((c: any) => !c.done).length || 0}>
                                <Tag color="default" style={{ borderRadius: 8, padding: '4px 12px' }}>Chưa hoàn thành</Tag>
                              </Badge>
                            </Col>
                            <Col span={8}>
                              <Badge count={task?.checklist?.filter((c: any) => c.done).length || 0}>
                                <Tag color="success" style={{ borderRadius: 8, padding: '4px 12px' }}>Đã hoàn thành</Tag>
                              </Badge>
                            </Col>
                            <Col span={8}>
                              <Badge count={task?.files?.length || 0}>
                                <Tag color="processing" style={{ borderRadius: 8, padding: '4px 12px' }}>File đính kèm</Tag>
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
              key: 'details',
              label: 'Chi tiết',
              children: (
                <Card className="task-table-card fade-in-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 8px' }}>
                    <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                      <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Thông tin chi tiết
                    </Title>
                  </div>
                  <div style={{ padding: '24px' }}>
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
                  </div>
                </Card>
              )
            },
            {
              key: 'checklist',
              label: 'Checklist & Subtasks',
              children: (
                <Card className="fade-in-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                      <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      Checklist & Subtasks
                    </Title>
                  </div>
                  <div style={{ padding: '24px' }}>
                    {/* Checklist */}
                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ color: '#23272f', fontSize: '16px' }}>Checklist</Text>
                      <List
                        style={{ marginTop: 8 }}
                        size="small"
                        dataSource={task.checklist || []}
                        locale={{ emptyText: 'Chưa có checklist' }}
                        renderItem={(item: any) => (
                          <List.Item
                            actions={isAssignee || isAdminOrLeader ? [
                              <Button key="toggle" type="link" onClick={() => handleToggleChecklist(item.id)}>
                                {item.done ? 'Bỏ hoàn thành' : 'Hoàn thành'}
                              </Button>,
                              <Button key="remove" type="link" danger onClick={() => handleRemoveChecklistItem(item.id)}>Xóa</Button>
                            ] : undefined}
                          >
                            <Space>
                              <input type="checkbox" checked={!!item.done} onChange={(e) => handleToggleChecklist(item.id, e.target.checked)} />
                              <Text delete={!!item.done}>{item.title}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                      {(isAssignee || isAdminOrLeader) && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Input
                            placeholder="Thêm mục checklist"
                            value={newChecklistTitle}
                            onChange={(e) => setNewChecklistTitle(e.target.value)}
                            onPressEnter={handleAddChecklistItem}
                          />
                          <Button type="primary" onClick={handleAddChecklistItem}>Thêm</Button>
                        </div>
                      )}
                    </div>

                    <Divider />

                    {/* Subtasks quick create */}
                    <div>
                      <Text strong style={{ color: '#23272f', fontSize: '16px' }}>Tạo subtask</Text>
                      {(isAssignee || isAdminOrLeader) && (
                        <Form form={subtaskForm} layout="inline" style={{ marginTop: 8 }}>
                          <Form.Item name="name" rules={[{ required: true, message: 'Nhập tên subtask' }]}>
                            <Input placeholder="Tên subtask" />
                          </Form.Item>
                          <Form.Item name="priority" initialValue="medium">
                            <Select style={{ width: 120 }}>
                              <Select.Option value="low">Low</Select.Option>
                              <Select.Option value="medium">Medium</Select.Option>
                              <Select.Option value="high">High</Select.Option>
                              <Select.Option value="urgent">Urgent</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item>
                            <Button type="primary" loading={creatingSubtask} onClick={handleCreateSubtask}>Tạo</Button>
                          </Form.Item>
                        </Form>
                      )}
                    </div>
                  </div>
                </Card>
              )
            },
            {
              key: 'files',
              label: 'Files & Comments',
              children: (
                <div>
                  {/* Files Section */}
                  <Card className="task-table-card fade-in-up" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 8px' }}>
                      <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                        <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        File đính kèm
                      </Title>
                    </div>
                    <div style={{ padding: '24px' }}>
                      {(isAssignee || isAdminOrLeader) && (
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
                          <Button loading={uploading} type="primary" icon={<FileTextOutlined />}>
                            Nộp file
                          </Button>
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
                    </div>
                  </Card>

                  {/* Comments Section */}
                  <Card className="fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                        <SendOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        Bình luận
                      </Title>
                    </div>
                    <div style={{ padding: '24px' }}>
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
                    </div>
                  </Card>
                </div>
              )
            },
            {
              key: 'dependencies',
              label: 'Phụ thuộc & Thời gian',
              children: (
                <div>
                  {/* Dependencies Section */}
                  <Card className="task-table-card fade-in-up" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 8px' }}>
                      <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                        <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        Phụ thuộc Task
                      </Title>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ color: '#64748b' }}>Chọn các task cần hoàn thành trước</Text>
                      </div>
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Chọn task phụ thuộc"
                        value={(task?.dependencies || []).map((d: any) => d?._id || d)}
                        onChange={handleUpdateDependencies}
                        showSearch
                        optionFilterProp="children"
                        disabled={!isAdminOrLeader}
                      >
                        {projectTasks.map((t: any) => (
                          <Select.Option key={t._id} value={t._id}>
                            {t.name} {t.status === 'done' ? '(done)' : ''}
                          </Select.Option>
                        ))}
                      </Select>
                      {Array.isArray(task?.dependencies) && task.dependencies.length === 0 && (
                        <div style={{ color: '#94a3b8', marginTop: 8 }}>Chưa có phụ thuộc</div>
                      )}
                    </div>
                  </Card>

                  {/* Time Tracking Section */}
                  <Card className="fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Title level={3} style={{ margin: 0, fontSize: 20 }}>
                        <ClockCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Chấm công & Thời gian
                      </Title>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <Text strong style={{ fontSize: '16px', color: '#23272f' }}>Tổng thời gian làm việc</Text>
                          <div style={{ color: '#64748b', fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>
                            {formatDuration(task?.timeTracking?.totalSeconds || 0)}
                          </div>
                        </div>
                        <Space>
                          <Button 
                            onClick={handleStartTimer} 
                            disabled={task?.timeTracking?.isTimerRunning}
                            type="primary"
                            style={{ borderRadius: '8px' }}
                          >
                            Bắt đầu
                          </Button>
                          <Button 
                            onClick={handleStopTimer} 
                            disabled={!task?.timeTracking?.isTimerRunning}
                            style={{ borderRadius: '8px' }}
                          >
                            Dừng
                          </Button>
                        </Space>
                      </div>
                      
                      <Divider />
                      
                      {/* Members Section */}
                      <div>
                        <Text strong style={{ fontSize: '16px', color: '#23272f', marginBottom: '16px', display: 'block' }}>
                          Thành viên thực hiện
                        </Text>
                        <div style={{ marginBottom: '16px' }}>
                          {Array.isArray(task.assignees) && task.assignees.map((assignee: any, index: number) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px', 
                              marginBottom: '12px',
                              padding: '12px',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <Avatar 
                                size={40}
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
                                  fontSize: '16px', 
                                  color: '#23272f',
                                  fontWeight: '500',
                                  display: 'block'
                                }}>
                                  {assignee?.name || 'Unknown'}
                                </Text>
                                <Text style={{ 
                                  fontSize: '14px', 
                                  color: '#64748b'
                                }}>
                                  {assignee?.email || ''}
                                </Text>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default TaskDetail; 