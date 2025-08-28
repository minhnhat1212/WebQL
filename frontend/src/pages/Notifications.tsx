import React, { useEffect, useState } from 'react';
import { Card, List, Button, Badge } from 'antd';
import { getNotifications, markAsRead } from '../services/notificationApi';
import dayjs from 'dayjs';
import { App as AntdApp } from 'antd';

const Notifications: React.FC = () => {
  const { message } = AntdApp.useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    message.success('Đã đánh dấu đã đọc');
    fetchData();
  };

  return (
    <section className="section-appear section-important" style={{ marginBottom: '32px' }}>
      <Card title="Thông báo của bạn" className="section-appear" style={{ borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={item => (
            <List.Item
              actions={item.read ? [] : [
                <Button size="small" onClick={() => handleMarkAsRead(item._id)}>Đánh dấu đã đọc</Button>
              ]}
            >
              <List.Item.Meta
                title={<span>{item.read ? <Badge status="default" /> : <Badge status="processing" />} {item.content}</span>}
                description={dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có thông báo' }}
        />
      </Card>
    </section>
  );
};

export default Notifications; 