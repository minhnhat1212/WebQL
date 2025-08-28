import React, { useState } from 'react';
import { Card, Tabs, Input, List, Select, DatePicker, Button } from 'antd';
import api from '../services/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const Search: React.FC = () => {
  const [projectQ, setProjectQ] = useState('');
  const [projectResults, setProjectResults] = useState<any[]>([]);
  const [taskQ, setTaskQ] = useState('');
  const [taskResults, setTaskResults] = useState<any[]>([]);
  const [userQ, setUserQ] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [filter, setFilter] = useState<{ status?: string; assignee?: string; from?: string; to?: string }>({});
  const [filterResults, setFilterResults] = useState<any[]>([]);

  const handleProjectSearch = async () => {
    const res = await api.get('/search/projects', { params: { q: projectQ } });
    setProjectResults(res.data);
  };
  const handleTaskSearch = async () => {
    const res = await api.get('/search/tasks', { params: { q: taskQ } });
    setTaskResults(res.data);
  };
  const handleUserSearch = async () => {
    const res = await api.get('/search/users', { params: { q: userQ } });
    setUserResults(res.data);
  };
  const handleFilter = async () => {
    const res = await api.get('/search/tasks/filter', { params: filter });
    setFilterResults(res.data);
  };

  return (
    <section className="section-appear section-important" style={{ marginBottom: '32px' }}>
      <Card title="Tìm kiếm & Lọc" className="section-appear" style={{ borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Dự án" key="1">
            <Input.Search
              placeholder="Nhập tên dự án..."
              value={projectQ}
              onChange={e => setProjectQ(e.target.value)}
              onSearch={handleProjectSearch}
              enterButton="Tìm kiếm"
              style={{ maxWidth: 400, marginBottom: 16 }}
            />
            <List
              dataSource={projectResults}
              renderItem={item => (
                <List.Item>
                  <b>{item.name}</b> - {item.description}
                </List.Item>
              )}
              locale={{ emptyText: 'Không có kết quả' }}
            />
          </TabPane>
          <TabPane tab="Công việc (Task)" key="2">
            <Input.Search
              placeholder="Nhập tên hoặc mô tả task..."
              value={taskQ}
              onChange={e => setTaskQ(e.target.value)}
              onSearch={handleTaskSearch}
              enterButton="Tìm kiếm"
              style={{ maxWidth: 400, marginBottom: 16 }}
            />
            <List
              dataSource={taskResults}
              renderItem={item => (
                <List.Item>
                  <b>{item.name}</b> ({item.status}) - {item.description} - Người thực hiện: {Array.isArray(item.assignees) ? item.assignees.map((a: any) => a?.name).join(', ') : ''}
                </List.Item>
              )}
              locale={{ emptyText: 'Không có kết quả' }}
            />
          </TabPane>
          <TabPane tab="Thành viên" key="3">
            <Input.Search
              placeholder="Nhập tên hoặc email thành viên..."
              value={userQ}
              onChange={e => setUserQ(e.target.value)}
              onSearch={handleUserSearch}
              enterButton="Tìm kiếm"
              style={{ maxWidth: 400, marginBottom: 16 }}
            />
            <List
              dataSource={userResults}
              renderItem={item => (
                <List.Item>
                  <b>{item.name}</b> - {item.email}
                </List.Item>
              )}
              locale={{ emptyText: 'Không có kết quả' }}
            />
          </TabPane>
          <TabPane tab="Lọc nâng cao" key="4">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <Select
                placeholder="Trạng thái"
                style={{ width: 140 }}
                value={filter.status}
                onChange={v => setFilter(f => ({ ...f, status: v }))}
                allowClear
              >
                <Select.Option value="todo">To Do</Select.Option>
                <Select.Option value="doing">Doing</Select.Option>
                <Select.Option value="done">Done</Select.Option>
              </Select>
              <Select
                placeholder="Người thực hiện"
                style={{ width: 180 }}
                value={filter.assignee}
                onChange={v => setFilter(f => ({ ...f, assignee: v }))}
                allowClear
              >
                {userResults.map((u: any) => (
                  <Select.Option key={u._id} value={u._id}>{u.name}</Select.Option>
                ))}
              </Select>
              <DatePicker
                placeholder="Từ ngày"
                style={{ width: 120 }}
                value={filter.from ? dayjs(filter.from) : undefined}
                onChange={d => setFilter(f => ({ ...f, from: d ? d.format('YYYY-MM-DD') : undefined }))}
              />
              <DatePicker
                placeholder="Đến ngày"
                style={{ width: 120 }}
                value={filter.to ? dayjs(filter.to) : undefined}
                onChange={d => setFilter(f => ({ ...f, to: d ? d.format('YYYY-MM-DD') : undefined }))}
              />
              <Button type="primary" onClick={handleFilter}>Lọc</Button>
            </div>
            <List
              dataSource={filterResults}
              renderItem={item => (
                <List.Item>
                  <b>{item.name}</b> ({item.status}) - {item.description} - Người thực hiện: {Array.isArray(item.assignees) ? item.assignees.map((a: any) => a?.name).join(', ') : ''}
                </List.Item>
              )}
              locale={{ emptyText: 'Không có kết quả' }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </section>
  );
};

export default Search; 