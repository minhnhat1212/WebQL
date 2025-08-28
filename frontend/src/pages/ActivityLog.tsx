import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Select } from 'antd';
import api from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const actionColor: Record<string, string> = {
  create_task: 'green',
  update_task: 'blue',
  delete_task: 'red',
  create_project: 'green',
  update_project: 'blue',
  delete_project: 'red',
  add_member: 'purple',
  remove_member: 'orange',
  change_leader: 'gold',
};

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await api.get('/statistics/logs');
    setLogs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      render: (d: string) => dayjs(d).format('HH:mm DD/MM/YYYY'),
      width: 160
    },
    {
      title: 'Người thực hiện',
      dataIndex: ['user', 'name'],
      width: 160
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      render: (a: string) => <Tag color={actionColor[a] || 'default'}>{a}</Tag>,
      width: 140
    },
    {
      title: 'Đối tượng',
      dataIndex: 'targetType',
      width: 100
    },
    {
      title: 'Chi tiết',
      dataIndex: 'detail',
      width: 320
    }
  ];

  const filteredLogs = actionFilter ? logs.filter(l => l.action === actionFilter) : logs;

  return (
    <Card title={<Title level={4}>Lịch sử hoạt động</Title>} style={{ borderRadius: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Lọc theo hành động"
          style={{ width: 220 }}
          value={actionFilter}
          onChange={setActionFilter}
        >
          {[...new Set(logs.map(l => l.action))].map(a => (
            <Select.Option key={a} value={a}>{a}</Select.Option>
          ))}
        </Select>
      </div>
      <Table
        dataSource={filteredLogs}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: 900 }}
      />
    </Card>
  );
};

export default ActivityLog; 