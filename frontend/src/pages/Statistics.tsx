import React, { useEffect, useState } from 'react';
import { Card, Table, Select, Row, Col, Typography } from 'antd';
import { getProjectProgress, getTaskStatusByProject, getMemberProgressByProject } from '../services/statisticsApi';
import { getProjects } from '../services/projectApi';
import { Pie, Bar } from '@ant-design/charts';

const Statistics: React.FC = () => {
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<any>(null);
  const [memberStats, setMemberStats] = useState<any[]>([]);

  useEffect(() => {
    getProjectProgress().then(setProjectStats);
    getProjects().then(data => {
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    });
  }, []);

  useEffect(() => {
    if (selectedProject) {
      getTaskStatusByProject(selectedProject._id).then(setTaskStatus);
      getMemberProgressByProject(selectedProject._id).then(setMemberStats);
    }
  }, [selectedProject]);

  return (
    <section className="section-appear section-important" style={{ marginBottom: '32px' }}>
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Tiến độ các dự án" className="section-appear" style={{ borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
            <Table
              dataSource={projectStats}
              columns={[
                { title: 'Dự án', dataIndex: 'projectName' },
                { title: 'Tổng task', dataIndex: 'totalTasks' },
                { title: 'Đã xong', dataIndex: 'doneTasks' },
                { title: '% hoàn thành', dataIndex: 'percentDone', render: (v: number) => `${v}%` },
              ]}
              rowKey="projectId"
              pagination={false}
              style={{ borderRadius: '16px', overflow: 'hidden' }}
              className="section-appear"
            />
            <Bar
              data={projectStats}
              xField="projectName"
              yField="percentDone"
              seriesField="projectName"
              legend={false}
              height={250}
              color="#1677ff"
              meta={{ percentDone: { alias: '% hoàn thành' } }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thống kê task & thành viên theo dự án" className="section-appear" style={{ borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ marginBottom: 16 }}>
              <Select
                style={{ width: 300 }}
                value={selectedProject?._id}
                onChange={id => setSelectedProject(projects.find((p: any) => p._id === id))}
              >
                {projects.map((pj: any) => (
                  <Select.Option key={pj._id} value={pj._id}>{pj.name}</Select.Option>
                ))}
              </Select>
            </div>
            {taskStatus && (
              <Pie
                data={[
                  { type: 'To Do', value: taskStatus.todo },
                  { type: 'Doing', value: taskStatus.doing },
                  { type: 'Done', value: taskStatus.done },
                ]}
                angleField="value"
                colorField="type"
                height={200}
                legend={{ position: 'bottom' }}
                label={{ type: 'outer', content: '{name} {percentage}' }}
              />
            )}
            <Typography.Title level={5} style={{ marginTop: 24 }}>Hiệu suất thành viên</Typography.Title>
            <Table
              dataSource={memberStats}
              columns={[
                { title: 'Tên', dataIndex: 'name' },
                { title: 'Email', dataIndex: 'email' },
                { title: 'Tổng task', dataIndex: 'total' },
                { title: 'Đã xong', dataIndex: 'done' },
              ]}
              rowKey="email"
              pagination={false}
              size="small"
              style={{ borderRadius: '16px', overflow: 'hidden' }}
              className="section-appear"
            />
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default Statistics; 