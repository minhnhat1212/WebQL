import React, { useEffect, useState } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Spin, 
  Alert, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Avatar, 
  Tag,
  Badge
} from 'antd';
import { 
  ProjectOutlined, 
  UnorderedListOutlined, 
  BellOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { getMyProjects, getMyTasksNearDeadline, getMyNotifications } from '../services/dashboardApi';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      setError(null);
      try {
        const [pj, tk, nt] = await Promise.all([
          getMyProjects(),
          getMyTasksNearDeadline(),
          getMyNotifications(),
        ]);
        setProjects(pj);
        setTasks(tk);
        setNotifications(nt.slice(0, 5));
      } catch (err: any) {
        setError('Không thể tải dữ liệu tổng quan');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return '#10b981';
      case 'in progress':
      case 'progressing':
        return '#3b82f6';
      case 'pending':
      case 'todo':
        return '#f59e0b';
      case 'overdue':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return <CheckCircleOutlined style={{ color: '#10b981' }} />;
      case 'in progress':
      case 'progressing':
        return <ClockCircleOutlined style={{ color: '#3b82f6' }} />;
      case 'pending':
      case 'todo':
        return <ExclamationCircleOutlined style={{ color: '#f59e0b' }} />;
      case 'overdue':
        return <FireOutlined style={{ color: '#ef4444' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#6b7280' }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        type="error" 
        message={error} 
        style={{ 
          borderRadius: '12px',
          border: 'none',
          background: 'rgba(239, 68, 68, 0.1)'
        }} 
      />
    );
  }

  return (
    <div className="fade-in">
      {/* Welcome Section */}
      <section className="section-appear section-important" style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Chào mừng trở lại, {user?.name}! 👋
        </Title>
        <Text style={{ 
          color: 'var(--text-secondary)',
          fontSize: '16px'
        }}>
          Đây là tổng quan về hoạt động của bạn hôm nay
        </Text>
      </section>

      {/* Statistics Cards */}
      <section className="section-appear" style={{ marginBottom: '32px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="section-appear"
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <Statistic
                title={
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Tổng dự án
                  </Text>
                }
                value={projects.length}
                prefix={<ProjectOutlined style={{ color: '#6366f1' }} />}
                valueStyle={{ 
                  color: '#6366f1',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="section-appear"
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <Statistic
                title={
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Task hoàn thành
                  </Text>
                }
                value={tasks.filter(t => t.status?.toLowerCase() === 'completed').length}
                prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                valueStyle={{ 
                  color: '#10b981',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="section-appear"
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <Statistic
                title={
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Task đang làm
                  </Text>
                }
                value={tasks.filter(t => t.status?.toLowerCase() === 'in progress').length}
                prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
                valueStyle={{ 
                  color: '#f59e0b',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="section-appear"
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <Statistic
                title={
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Task quá hạn
                  </Text>
                }
                value={tasks.filter(t => t.status?.toLowerCase() === 'overdue').length}
                prefix={<FireOutlined style={{ color: '#ef4444' }} />}
                valueStyle={{ 
                  color: '#ef4444',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* Main Content */}
      <section className="section-appear" style={{ marginBottom: '32px' }}>
        <Row gutter={[24, 24]}>
          {/* Projects Section */}
          <Col xs={24} lg={12}>
            <Card 
              className="section-appear"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ProjectOutlined style={{ color: '#6366f1' }} />
                  <span>Dự án của bạn</span>
                  <Badge count={projects.length} style={{ backgroundColor: '#6366f1' }} />
                </div>
              }
              extra={
                <Button 
                  type="link" 
                  onClick={() => navigate('/projects')}
                  style={{ color: '#6366f1', padding: 0 }}
                >
                  Xem tất cả
                </Button>
              }
              style={{ borderRadius: '16px', height: '100%' }}
            >
              <List
                dataSource={projects.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item 
                    style={{ 
                      padding: '12px 0',
                      borderBottom: index === projects.slice(0, 5).length - 1 ? 'none' : '1px solid var(--border-color)'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            fontWeight: 'bold'
                          }}
                        >
                          {item.name?.charAt(0)?.toUpperCase() || 'P'}
                        </Avatar>
                      }
                      title={
                        <Text strong style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </Text>
                      }
                      description={
                        <div>
                          <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {item.description || 'Không có mô tả'}
                          </Text>
                          <div style={{ marginTop: '8px' }}>
                            <Tag color="blue" style={{ borderRadius: '6px' }}>
                              {item.status || 'Đang thực hiện'}
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ 
                  emptyText: (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <ProjectOutlined style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
                      <Text style={{ display: 'block', marginTop: '16px', color: 'var(--text-muted)' }}>
                        Chưa có dự án nào
                      </Text>
                    </div>
                  ) 
                }}
              />
            </Card>
          </Col>

          {/* Tasks Section */}
          <Col xs={24} lg={12}>
            <Card 
              className="section-appear"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UnorderedListOutlined style={{ color: '#6366f1' }} />
                  <span>Task gần deadline</span>
                  <Badge count={tasks.filter(t => new Date(t.deadline) > new Date()).length} style={{ backgroundColor: '#f59e0b' }} />
                </div>
              }
              extra={
                <Button 
                  type="link" 
                  onClick={() => navigate('/tasks')}
                  style={{ color: '#6366f1', padding: 0 }}
                >
                  Xem tất cả
                </Button>
              }
              style={{ borderRadius: '16px', height: '100%' }}
            >
              <List
                dataSource={tasks.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item 
                    style={{ 
                      padding: '12px 0',
                      borderBottom: index === tasks.slice(0, 5).length - 1 ? 'none' : '1px solid var(--border-color)'
                    }}
                  >
                    <List.Item.Meta
                      avatar={getStatusIcon(item.status)}
                      title={
                        <Text strong style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </Text>
                      }
                      description={
                        <div>
                          <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                          </Text>
                          <div style={{ marginTop: '8px' }}>
                            <Tag 
                              color={getStatusColor(item.status)} 
                              style={{ borderRadius: '6px' }}
                            >
                              {item.status || 'Chưa bắt đầu'}
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ 
                  emptyText: (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <UnorderedListOutlined style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
                      <Text style={{ display: 'block', marginTop: '16px', color: 'var(--text-muted)' }}>
                        Không có task sắp hết hạn
                      </Text>
                    </div>
                  ) 
                }}
              />
            </Card>
          </Col>
        </Row>
      </section>
      {/* Notifications Section */}
      <section className="section-appear section-important">
        <Card 
          className="section-appear"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BellOutlined style={{ color: '#6366f1' }} />
              <span>Thông báo mới nhất</span>
              <Badge count={notifications.length} style={{ backgroundColor: '#6366f1' }} />
            </div>
          }
          extra={
            <Button 
              type="link" 
              onClick={() => navigate('/notifications')}
              style={{ color: '#6366f1', padding: 0 }}
            >
              Xem tất cả
            </Button>
          }
          style={{ borderRadius: '16px' }}
        >
          <List
            dataSource={notifications}
            renderItem={(item, index) => (
              <List.Item 
                style={{ 
                  padding: '12px 0',
                  borderBottom: index === notifications.length - 1 ? 'none' : '1px solid var(--border-color)'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        fontWeight: 'bold'
                      }}
                    >
                      <BellOutlined style={{ color: 'white' }} />
                    </Avatar>
                  }
                  title={
                    <Text strong style={{ color: 'var(--text-primary)' }}>
                      {item.title || 'Thông báo mới'}
                    </Text>
                  }
                  description={
                    <div>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {item.content}
                      </Text>
                      <Text style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '12px',
                        display: 'block',
                        marginTop: '4px'
                      }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
            locale={{ 
              emptyText: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <BellOutlined style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
                  <Text style={{ display: 'block', marginTop: '16px', color: 'var(--text-muted)' }}>
                    Không có thông báo mới
                  </Text>
                </div>
              ) 
            }}
          />
        </Card>
      </section>
    </div>
  );
};

export default Dashboard; 