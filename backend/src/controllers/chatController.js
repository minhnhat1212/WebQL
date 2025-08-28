const { Conversation, Message, User, Project } = require('../models');

// Tạo hội thoại mới (private hoặc group)
exports.createConversation = async (req, res) => {
  try {
    const { type, memberIds, projectId, name } = req.body;
    let conversation;
    if (type === 'private') {
      // Kiểm tra đã có hội thoại private giữa 2 user chưa
      conversation = await Conversation.findOne({
        type: 'private',
        members: { $all: memberIds, $size: 2 }
      });
      if (conversation) return res.json(conversation);
    }
    conversation = new Conversation({
      type,
      members: memberIds,
      project: projectId,
      name: name || undefined
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách hội thoại của user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ members: req.user._id })
      .populate('members', 'name email role avatar')
      .populate('project', 'name')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content
    });
    await message.save();
    // Cập nhật lastMessage cho hội thoại
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() });
    // Populate sender để FE có avatar và name ngay lập tức
    const populated = await message.populate({ path: 'sender', select: 'name email avatar' });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy lịch sử tin nhắn của hội thoại
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 