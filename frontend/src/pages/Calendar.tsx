import React, { useEffect, useState } from 'react';
import { Card, Calendar as AntdCalendar, List, Radio, Typography, Badge } from 'antd';
import { getTasksByDay, getTasksByMonth } from '../services/calendarApi';
import dayjs, { Dayjs } from 'dayjs';

const CalendarPage: React.FC = () => {
  const [mode, setMode] = useState<'month' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [tasks, setTasks] = useState<any[]>([]);
  const [monthTasks, setMonthTasks] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (mode === 'month') {
      getTasksByMonth(selectedDate.year(), selectedDate.month() + 1).then(data => {
        // Gom task theo ngày
        const grouped: Record<string, any[]> = {};
        data.forEach((t: any) => {
          const d = dayjs(t.deadline).format('YYYY-MM-DD');
          if (!grouped[d]) grouped[d] = [];
          grouped[d].push(t);
        });
        setMonthTasks(grouped);
      });
    } else {
      getTasksByDay(selectedDate.format('YYYY-MM-DD')).then(setTasks);
    }
  }, [selectedDate, mode]);

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayTasks = monthTasks[dateStr] || [];
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayTasks.slice(0, 2).map((item, idx) => (
          <li key={idx}>
            <Badge status={item.status === 'done' ? 'success' : item.status === 'doing' ? 'processing' : 'default'} text={item.name} />
          </li>
        ))}
        {dayTasks.length > 2 && <li>+{dayTasks.length - 2} task</li>}
      </ul>
    );
  };

  return (
    <section className="section-appear section-important" style={{ marginBottom: '32px' }}>
      <Card title="Lịch & Deadline" className="section-appear" style={{ borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
        <Radio.Group
          value={mode}
          onChange={e => setMode(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="month">Xem theo tháng</Radio.Button>
          <Radio.Button value="day">Xem theo ngày</Radio.Button>
        </Radio.Group>
        {mode === 'month' ? (
          <AntdCalendar
            value={selectedDate}
            onSelect={setSelectedDate}
            dateCellRender={dateCellRender}
            fullscreen={false}
          />
        ) : (
          <>
            <Typography.Title level={5} style={{ marginTop: 16 }}>Task ngày {selectedDate.format('DD/MM/YYYY')}</Typography.Title>
            <List
              dataSource={tasks}
              renderItem={item => (
                <List.Item>
                  <Badge status={item.status === 'done' ? 'success' : item.status === 'doing' ? 'processing' : 'default'} />
                  <span style={{ marginLeft: 8 }}>{item.name} ({item.status}) - Deadline: {item.deadline ? dayjs(item.deadline).format('HH:mm DD/MM/YYYY') : 'N/A'}</span>
                </List.Item>
              )}
              locale={{ emptyText: 'Không có task cho ngày này' }}
            />
          </>
        )}
      </Card>
    </section>
  );
};

export default CalendarPage; 