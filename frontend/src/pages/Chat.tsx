import React, { useEffect, useState, useRef } from 'react';
import { Card, List, Input, Button, Typography, Spin, Avatar } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

const { Title } = Typography;

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { joinConversation, sendMessage, onReceiveMessage } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách hội thoại
  const fetchConversations = async () => {
    const res = await api.get('/chat/conversations');
    setConversations(res.data);
  };

  // Lấy lịch sử tin nhắn
  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    const res = await api.get(`/chat/messages/${conversationId}`);
    setMessages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Khi chọn hội thoại
  useEffect(() => {
    if (selectedConv) {
      joinConversation(selectedConv._id);
      fetchMessages(selectedConv._id);
    }
  }, [selectedConv]);

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    const off = onReceiveMessage((msg) => {
      if (msg.conversation === selectedConv?._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });
    return off;
    // eslint-disable-next-line
  }, [selectedConv]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv) return;
    // Gửi lên server lưu DB
    const res = await api.post('/chat/messages', {
      conversationId: selectedConv._id,
      content: input
    });
    // Gửi real-time
    sendMessage(selectedConv._id, res.data);
    setInput('');
    setMessages((prev) => [...prev, res.data]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ display: 'flex', height: '80vh', gap: 24 }}>
      {/* Danh sách hội thoại */}
      <Card style={{ width: 320, overflow: 'auto', borderRadius: 16 }} title={<Title level={4}>Hội thoại</Title>}>
        <List
          dataSource={conversations}
          renderItem={item => (
            <List.Item
              style={{ cursor: 'pointer', background: selectedConv?._id === item._id ? '#f0f5ff' : undefined, borderRadius: 8 }}
              onClick={() => setSelectedConv(item)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar src={
                    item.type === 'group'
                      ? undefined
                      : (item.members?.filter((m: any) => m._id !== user?.id)[0]?.avatar
                        ? `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/uploads/avatars/${item.members?.filter((m: any) => m._id !== user?.id)[0]?.avatar}`
                        : undefined)
                  } />
                }
                title={
                  <b>
                    {item.type === 'group' ? (item.name || item.project?.name || 'Nhóm') : item.members?.filter((m: any) => m._id !== user?.id)[0]?.name}
                  </b>
                }
                description={<div style={{ fontSize: 12, color: '#888' }}>{item.lastMessage?.content?.slice(0, 30)}</div>}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có hội thoại' }}
        />
      </Card>
      {/* Khung chat */}
      <Card style={{ flex: 1, borderRadius: 16, display: 'flex', flexDirection: 'column' }} title={<Title level={4}>Chat</Title>}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, paddingRight: 8 }}>
          {loading ? <Spin /> : (
            <List
              dataSource={messages}
              renderItem={msg => (
                <List.Item style={{ justifyContent: msg.sender?._id === user?.id ? 'flex-end' : 'flex-start' }}>
                  {msg.sender?._id !== user?.id && (
                    <Avatar
                      style={{ marginRight: 8 }}
                      src={msg.sender?.avatar ? `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/uploads/avatars/${msg.sender.avatar}` : undefined}
                    >
                      {msg.sender?.name?.[0]?.toUpperCase()}
                    </Avatar>
                  )}
                  <div style={{
                    background: msg.sender?._id === user?.id ? '#6366f1' : '#f0f5ff',
                    color: msg.sender?._id === user?.id ? 'white' : 'black',
                    borderRadius: 12,
                    padding: '8px 16px',
                    maxWidth: 420,
                    wordBreak: 'break-word',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{msg.sender?.name || 'Bạn'}</div>
                    <div>{msg.content}</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: 'Chưa có tin nhắn' }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Nhập tin nhắn */}
        <Input.Group compact>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="Nhập tin nhắn..."
            style={{ width: 'calc(100% - 90px)' }}
          />
          <Button type="primary" onClick={handleSend} style={{ width: 80 }}>Gửi</Button>
        </Input.Group>
      </Card>
    </div>
  );
};

export default Chat; 