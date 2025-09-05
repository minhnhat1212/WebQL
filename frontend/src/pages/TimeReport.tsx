import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Select, DatePicker, Table, Space, Button } from 'antd';
import dayjs from 'dayjs';
import { getProjects } from '../services/projectApi';
import { getMembers } from '../services/memberApi';
import { getTimeReport } from '../services/taskApi';

const { RangePicker } = DatePicker;

const TimeReport: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const [range, setRange] = useState<any>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const pj = await getProjects();
      setProjects(pj);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!projectId) {
        setUsers([]);
        return;
      }
      const data = await getMembers(projectId);
      const list = data?.members ? data.members : (Array.isArray(data) ? data : []);
      setUsers(list);
    })();
  }, [projectId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (projectId) params.projectId = projectId;
      if (userId) params.userId = userId;
      if (range && range[0] && range[1]) {
        params.from = range[0].toISOString();
        params.to = range[1].toISOString();
      }
      const data = await getTimeReport(params);
      const items: any[] = [];
      Object.entries(data || {}).forEach(([key, seconds]: any) => {
        const [pjId, uId] = key.split(':');
        const p = projects.find(p => p._id === pjId);
        const u = users.find(u => (u._id || u.id) === uId);
        items.push({ key, project: p?.name || pjId, user: u?.name || uId, seconds });
      });
      setRows(items);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Dự án', dataIndex: 'project' },
    { title: 'Thành viên', dataIndex: 'user' },
    { title: 'Tổng thời gian (giờ)', dataIndex: 'seconds', render: (s: number) => (s / 3600).toFixed(2) },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card className="task-table-card fade-in-up" style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Time Report</Typography.Title>
      </Card>
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>Dự án</Typography.Text>
              <Select allowClear placeholder="Tất cả dự án" value={projectId} onChange={setProjectId} showSearch optionFilterProp="children">
                {projects.map((p: any) => (
                  <Select.Option key={p._id} value={p._id}>{p.name}</Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>Thành viên</Typography.Text>
              <Select allowClear placeholder="Tất cả thành viên" value={userId} onChange={setUserId} showSearch optionFilterProp="children">
                {users.map((u: any) => (
                  <Select.Option key={u._id || u.id} value={u._id || u.id}>{u.name}</Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>Khoảng thời gian</Typography.Text>
              <RangePicker value={range} onChange={setRange} allowClear={false} />
            </Space>
          </Col>
          <Col xs={24} md={4}>
            <Button type="primary" block onClick={fetchReport} loading={loading}>Xem báo cáo</Button>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Table columns={columns} dataSource={rows} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

export default TimeReport;


