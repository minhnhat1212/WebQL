import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Popconfirm, Tag, Select, Spin, Avatar, Typography, Row, Col, Tooltip, Badge, List } from 'antd';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectApi';
import { createTask } from '../services/taskApi';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, CalendarOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { App as AntdApp } from 'antd';


const { Text, Title } = Typography;

const statusColor: Record<string, string> = {
  not_started: 'default',
  in_progress: 'processing',
  done: 'success',
};

const Projects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  // const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  // const [selectedProject, setSelectedProject] = useState<any>(null);

  // State cho modal thành viên, task, chat
  const [taskModal, setTaskModal] = useState<{ open: boolean, project: any | null }>({ open: false, project: null });
  const [chatModal, setChatModal] = useState<{ open: boolean, project: any | null }>({ open: false, project: null });

  // State cho task
  const [taskForm] = Form.useForm();
  // const [taskLoading, setTaskLoading] = useState(false);
  // const [taskMembers, setTaskMembers] = useState<any[]>([]);

  // State cho chat

  const [messages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  const messagesEndRef = React.useRef<HTMLDivElement>(null);



  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openModal = (project?: any) => {
    setEditProject(project || null);
    setModalOpen(true);
    if (project) {
      form.setFieldsValue({
        ...project,
        deadline: project.deadline ? dayjs(project.deadline) : null,
      });
    } else {
      form.resetFields();
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
      };
      if (editProject) {
        await updateProject(editProject._id, payload);
        message.success('Cập nhật dự án thành công');
      } else {
        await createProject(payload);
        message.success('Tạo dự án thành công');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating/updating project:', error);
      message.error('Có lỗi xảy ra khi tạo/cập nhật dự án');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      message.success('Đã xóa dự án');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      message.error('Có lỗi xảy ra khi xóa dự án');
    }
  };

  const canEdit = (project: any) => user?.role === 'admin' || project.leader?._id === user?.id;


  // Điều hướng đến trang chi tiết dự án để quản lý thành viên và task
  const goToProjectDetail = (project: any) => {
    navigate(`/projects/${project._id}`);
  };

  // Hàm mở modal task
  // const openTaskModal = async (project: any) => {
  //   setTaskModal({ open: true, project });
  //   setTaskLoading(true);
  //   try {
  //       const data = await getMembers(project._id);
  //       setTaskMembers(data);
  //   } finally {
  //       setTaskLoading(false);
  //   }
  //   taskForm.resetFields();
  // };
  // Thêm task
  const handleAddTask = async () => {
    const values = await taskForm.validateFields();
    await createTask({ ...values, projectId: taskModal.project._id });
    message.success('Đã thêm task');
    setTaskModal({ open: false, project: null });
  };




  // Chuyển sang chế độ chi tiết
  // const switchToDetail = (project: any) => {
  //   setSelectedProject(project);
  //   setViewMode('detail');
  // };

  // Quay lại danh sách
  // const switchToList = () => {
  //   setSelectedProject(null);
  //   setViewMode('list');
  // };

  // if (viewMode === 'detail' && selectedProject) {
  //   return (
  //     <div style={{ background: '#fff', minHeight: '100vh' }}>
  //       {/* Breadcrumb */}
  //       <Breadcrumb 
  //         style={{ marginBottom: '24px', padding: '0 24px', paddingTop: '16px' }}
  //         items={[
  //           { title: <HomeOutlined />, href: '/dashboard' },
  //           { title: 'Dự án', onClick: switchToList },
  //           { title: selectedProject.name }
  //         ]}
  //       />

  //       {/* Main Content */}
  //       <div style={{ padding: '0 24px 24px' }}>
  //         {/* Project Header */}
  //         <div style={{ marginBottom: '32px' }}>
  //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  //           <div>
  //             <Title level={2} style={{ margin: 0, color: '#23272f', fontSize: '28px' }}>
  //               {selectedProject.name}
  //             </Title>
  //             <Text style={{ color: '#64748b', fontSize: '16px' }}>
  //               {selectedProject.name}
  //             </Text>
  //           </div>
  //           {canEdit(selectedProject) && (
  //             <Space>
  //               <Button
  //                 type="primary"
  //                 icon={<EditOutlined />}
  //                 onClick={() => openModal(selectedProject)}
  //                 style={{
  //                   background: '#6366f1',
  //                   border: 'none',
  //                   borderRadius: '8px',
  //                   height: '40px',
  //                   fontSize: '14px',
  //                   fontWeight: '500'
  //                 }}
  //               >
  //                 Chỉnh sửa
  //               </Button>
  //               <Popconfirm
  //                 title="Xóa dự án"
  //                 description="Bạn có chắc chắn muốn xóa dự án này?"
  //                 onConfirm={() => {
  //                   handleDelete(selectedProject._id);
  //                   switchToList();
  //                 }}
  //                 okText="Xóa"
  //                 cancelText="Hủy"
  //               >
  //                 <Button
  //                   danger
  //                   icon={<DeleteOutlined />}
  //                     style={{
  //                       borderRadius: '8px',
  //                       height: '40px',
  //                       fontSize: '14px',
  //                       fontWeight: '500'
  //                     }}
  //                   >
  //                     Xóa
  //                   </Button>
  //                 </Popconfirm>
  //               </Space>
  //             )}
  //           </div>
  //         </div>

  //         {/* Add Task Button */}
  //         <div style={{ marginBottom: '24px' }}>
  //           <Button
  //             type="primary"
  //             icon={<PlusOutlined />}
  //             size="large"
  //             style={{
  //               background: '#6366f1',
  //               border: 'none',
  //               borderRadius: '8px',
  //               height: '48px',
  //               fontSize: '16px',
  //               fontWeight: '600'
  //             }}
  //             onClick={() => openTaskModal(selectedProject)}
  //           >
  //             THÊM TASK
  //           </Button>
  //         </div>

  //         {/* Project Details */}
  //         <div style={{ marginTop: '48px' }}>
  //           <Title level={3} style={{ margin: 0, color: '#23272f', fontSize: '20px', marginBottom: '16px' }}>
  //             {selectedProject.name}
  //           </Title>
  //           <Text style={{ color: '#64748b', fontSize: '14px', display: 'block', marginBottom: '24px' }}>
  //             {selectedProject.description || 'Không có mô tả'}
  //           </Text>
            
  //           <Title level={4} style={{ margin: 0, color: '#23272f', fontSize: '16px', marginBottom: '12px' }}>
  //             CHI TIẾT DỰ ÁN
  //           </Title>
  //           <div style={{ marginBottom: '24px' }}>
  //             <Text style={{ color: '#64748b', fontSize: '14px' }}>
  //               Deadline: {selectedProject.deadline ? dayjs(selectedProject.deadline).format('DD/MM/YYYY') : 'Chưa có'}
  //             </Text>
  //             <br />
  //             <Text style={{ color: '#64748b', fontSize: '14px' }}>
  //               Trạng thái: <Tag color={statusColor[selectedProject.status]}>{selectedProject.status}</Tag>
  //             </Text>
  //             <br />
  //             <Text style={{ color: '#64748b', fontSize: '14px' }}>
  //               Trưởng nhóm: {selectedProject.leader?.name || 'Chưa có'}
  //             </Text>
  //           </div>
            
  //           <Title level={4} style={{ margin: 0, color: '#23272f', fontSize: '16px', marginBottom: '12px' }}>
  //             THÀNH VIÊN DỰ ÁN
  //           </Title>
  //           <div>
  //             <Button
  //               type="primary"
  //               size="small"
  //               onClick={() => openMemberModal(selectedProject)}
  //               style={{
  //                 background: '#6366f1',
  //                 border: 'none',
  //                 borderRadius: '6px',
  //                 marginBottom: '12px'
  //             }}
  //           >
  //             Quản lý thành viên
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={1} style={{ margin: 0, color: '#23272f', fontSize: '32px' }}>
              Dự án
            </Title>
            <Text style={{ color: '#64748b', fontSize: '16px' }}>
              Danh sách
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user?.role !== 'member' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onClick={() => openModal()}
              >
                Thêm dự án
              </Button>
            )}
          </div>
        </div>

        {/* Search Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <Input
            placeholder="Tìm kiếm dự án"
            style={{ width: '200px' }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: '150px' }}
            allowClear
          >
            <Select.Option value="not_started">Chưa bắt đầu</Select.Option>
            <Select.Option value="in_progress">Đang thực hiện</Select.Option>
            <Select.Option value="done">Hoàn thành</Select.Option>
          </Select>
          <Button
            type="primary"
            style={{
              background: '#22c55e',
              border: 'none',
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Project Cards */}
      <div style={{ padding: '0 24px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Text style={{ fontSize: '18px', color: '#64748b', marginBottom: '24px', display: 'block' }}>
              Chưa có dự án nào
            </Text>
            {user?.role !== 'member' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => openModal()}
                style={{
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Tạo dự án đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {projects.map((project) => (
              <Col xs={24} sm={12} lg={6} key={project._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    height: '100%'
                  }}
                  styles={{ body: { padding: '20px' } }}
                  actions={[
                    canEdit(project) && (
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        style={{ color: '#6366f1' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(project);
                        }}
                        title="Chỉnh sửa"
                      />
                    ),
                    canEdit(project) && (
                      <Popconfirm
                        title="Xóa dự án"
                        description="Bạn có chắc chắn muốn xóa dự án này?"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDelete(project._id);
                        }}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          style={{ color: '#ef4444' }}
                          onClick={(e) => e.stopPropagation()}
                          title="Xóa"
                        />
                      </Popconfirm>
                    ),
                    <Button
                      type="text"
                      icon={<TeamOutlined />}
                      style={{ color: '#10b981' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToProjectDetail(project);
                      }}
                      title="Quản lý thành viên"
                    />
                  ].filter(Boolean)}
                  onClick={() => goToProjectDetail(project)}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0, color: '#23272f', fontSize: '18px' }}>
                      {project.name}
                    </Title>
                    <Text style={{ color: '#64748b', fontSize: '14px' }}>
                      {project.description || 'Không có mô tả'}
                    </Text>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarOutlined style={{ color: '#6366f1', fontSize: '16px' }} />
                      <Text style={{ color: '#64748b', fontSize: '14px' }}>
                        Deadline: {project.deadline ? dayjs(project.deadline).format('DD/MM/YYYY') : 'Chưa có'}
                      </Text>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Text style={{ color: '#64748b', fontSize: '14px' }}>Trưởng nhóm:</Text>
                      <Avatar 
                        size={24}
                        style={{ 
                          background: project.leader ? '#3b82f6' : '#dc2626',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {project.leader ? project.leader.name.charAt(0) : 'X'}
                      </Avatar>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text style={{ color: '#64748b', fontSize: '14px' }}>Thành viên:</Text>
                      <Badge 
                        count={Array.isArray(project.members) ? project.members.length : 0} 
                        style={{ 
                          backgroundColor: '#6366f1',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {Array.isArray(project.members) && project.members.slice(0, 5).map((member: any, index: number) => (
                        <Tooltip key={index} title={member.name || `Thành viên ${index + 1}`}>
                          <Avatar 
                            size={24}
                            style={{ 
                              background: '#10b981',
                              color: 'white',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {member.name ? member.name.charAt(0).toUpperCase() : <UserOutlined />}
                          </Avatar>
                        </Tooltip>
                      ))}
                      {Array.isArray(project.members) && project.members.length > 5 && (
                        <Tooltip title={`+${project.members.length - 5} thành viên khác`}>
                          <Avatar 
                            size={24}
                            style={{ 
                              background: '#64748b',
                              color: 'white',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            +{project.members.length - 5}
                          </Avatar>
                        </Tooltip>
                      )}
                      <Tooltip title="Quản lý thành viên">
                        <Button
                          type="text"
                          size="small"
                          icon={<UserAddOutlined />}
                          style={{ 
                            color: '#6366f1',
                            width: '24px',
                            height: '24px',
                            minWidth: '24px',
                            padding: '0',
                            borderRadius: '50%'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToProjectDetail(project);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Text style={{ color: '#64748b', fontSize: '14px' }}>Trạng thái:</Text>
                      <Tag color={statusColor[project.status]}>{project.status}</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Modals */}
      <Modal
        open={modalOpen}
        title={editProject ? 'Sửa dự án' : 'Tạo dự án'}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleOk}
        okText={editProject ? 'Cập nhật' : 'Tạo mới'}
        destroyOnHidden
        width={600}
        styles={{
          header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' },
          body: { paddingTop: '24px' },
          footer: { borderTop: '1px solid #f0f0f0', paddingTop: '16px' }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: 'Nhập tên dự án' }]}> 
            <Input placeholder="Nhập tên dự án" style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả dự án" rows={4} style={{ borderRadius: '8px' }} />
          </Form.Item>
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
          {editProject && (
            <Form.Item name="status" label="Trạng thái">
              <Select placeholder="Chọn trạng thái" style={{ borderRadius: '8px' }}>
                <Select.Option value="not_started">Chưa bắt đầu</Select.Option>
                <Select.Option value="in_progress">Đang thực hiện</Select.Option>
                <Select.Option value="done">Hoàn thành</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal thêm task */}
      <Modal
        open={taskModal.open}
        title={taskModal.project ? `Thêm task cho dự án: ${taskModal.project.name}` : ''}
        onCancel={() => setTaskModal({ open: false, project: null })}
        onOk={taskForm.submit}
        okText="Thêm task"
        confirmLoading={false}
        destroyOnClose
      >
        <Spin spinning={false}>
          <Form form={taskForm} layout="vertical" onFinish={handleAddTask}>
            <Form.Item name="name" label="Tên task" rules={[{ required: true, message: 'Nhập tên task' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="assignees" label="Người thực hiện" rules={[{ required: true, message: 'Chọn người thực hiện' }]}> 
              <Select
                mode="multiple"
                placeholder="Chọn thành viên"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {/* {taskMembers.map((m: any) => (
                  <Select.Option key={m._id} value={m._id}>{m.name} ({m.email})</Select.Option>
                ))} */}
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" initialValue="todo">
              <Select>
                <Select.Option value="todo">To Do</Select.Option>
                <Select.Option value="doing">Doing</Select.Option>
                <Select.Option value="done">Done</Select.Option>
              </Select>
            </Form.Item>
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
                          taskForm.setFieldValue('deadline', today);
                        }}
                      >
                        Hôm nay
                      </Button>
                    </div>
                  </div>
                )}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal chat */}
      <Modal
        open={chatModal.open}
        title={chatModal.project ? `Chat dự án: ${chatModal.project.name}` : ''}
        onCancel={() => setChatModal({ open: false, project: null })}
        footer={null}
        width={600}
        destroyOnClose
      >
        <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16, paddingRight: 8 }}>
          <List
            dataSource={messages}
            renderItem={(msg: any) => (
              <List.Item style={{ justifyContent: msg.sender?._id === user?.id ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  background: msg.sender?._id === user?.id ? '#6366f1' : '#f0f5ff',
                  color: msg.sender?._id === user?.id ? 'white' : 'black',
                  borderRadius: 12,
                  padding: '8px 16px',
                  maxWidth: 320,
                  wordBreak: 'break-word',
                }}>
                  <b>{msg.sender?.name || 'Bạn'}:</b> {msg.content}
                </div>
              </List.Item>
            )}
            locale={{ emptyText: 'Chưa có tin nhắn' }}
          />
          <div ref={messagesEndRef} />
        </div>
        <Input.Group compact>
          <Input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            style={{ width: 'calc(100% - 90px)' }}
          />
          <Button type="primary" style={{ width: 80 }}>Gửi</Button>
        </Input.Group>
      </Modal>
    </div>
  );
};

export default Projects; 