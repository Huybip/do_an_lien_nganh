"use strict";

const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

// Helper to fix old media URLs
const normalizeMediaUrls = (messages = []) => {
  return messages.map((msg) => {
    if (msg.audioUrl) {
      // Convert full URL to relative path if needed
      const match = msg.audioUrl.match(/\/uploads\/[^\s?#]*/);
      msg.audioUrl = match ? match[0] : msg.audioUrl;

      // Ensure it includes the /uploads/ prefix
      if (!msg.audioUrl.includes("/uploads/")) {
        const filename = msg.audioUrl.split("/").pop();
        msg.audioUrl = `/uploads/audio/${filename}`;
      }
    }
    if (msg.imageUrl) {
      // Convert full URL to relative path if needed
      const match = msg.imageUrl.match(/\/uploads\/[^\s?#]*/);
      msg.imageUrl = match ? match[0] : msg.imageUrl;

      // Ensure it includes the /uploads/ prefix
      if (!msg.imageUrl.includes("/uploads/")) {
        const filename = msg.imageUrl.split("/").pop();
        msg.imageUrl = `/uploads/images/${filename}`;
      }
    }
    return msg;
  });
};

// GET /api/conversations - Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const userId = req.user._id;

    const [conversations, total] = await Promise.all([
      Conversation.find({ participants: userId, isActive: true })
        .populate("participants", "name email avatar role")
        .populate("lastMessage.sender", "name avatar")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ participants: userId, isActive: true }),
    ]);

    // Format response to show other participant info
    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p && p._id && p._id.toString() !== userId.toString(),
      );
      return {
        id: conv._id,
        conversationId: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        messageCount: conv.messages.length,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    return sendPaginated(res, formatted, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/conversations/:id - Get conversation with messages
const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(id)
      .populate("participants", "name email avatar role")
      .populate("messages.sender", "name avatar _id");

    if (!conversation) {
      return sendError(res, 404, "Conversation not found");
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString(),
    );
    if (!isParticipant) {
      return sendError(res, 403, "Access denied");
    }

    // Get paginated messages
    const messages = conversation.messages.slice(-limit).reverse();
    const otherParticipant = conversation.participants.find(
      (p) => p && p._id && p._id.toString() !== userId.toString(),
    );

    // Normalize media URLs before sending
    const normalizedMessages = normalizeMediaUrls(messages);

    return sendSuccess(res, 200, "Conversation retrieved", {
      id: conversation._id,
      conversationId: conversation._id,
      otherUser: otherParticipant,
      messages: normalizedMessages.reverse(),
      totalMessages: conversation.messages.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /api/conversations/:id/messages - Send message in conversation
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = "text", imageUrl, audioUrl } = req.body;
    const userId = req.user._id;

    if (!content && !imageUrl && !audioUrl) {
      return sendError(res, 400, "Message content is required");
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return sendError(res, 404, "Conversation not found");
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString(),
    );
    if (!isParticipant) {
      return sendError(res, 403, "Access denied");
    }

    // Add message
    // Normalize URLs: Convert full URL to relative path
    const normalizeUrl = (url) => {
      if (!url) return url;
      const match = url.match(/\/uploads\/[^\s?#]*/);
      return match ? match[0] : url;
    };

    const newMessage = {
      sender: userId,
      content: content || (type === "image" ? "Image" : "Audio"),
      type,
      imageUrl: normalizeUrl(imageUrl),
      audioUrl: normalizeUrl(audioUrl),
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = {
      content: newMessage.content,
      sender: userId,
      timestamp: new Date(),
    };

    await conversation.save();
    const populated = await conversation.populate([
      { path: "participants", select: "name email avatar role" },
      { path: "messages.sender", select: "name avatar _id" },
    ]);

    const lastMsg = populated.messages[populated.messages.length - 1];
    return sendSuccess(res, 201, "Message sent", lastMsg);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /api/conversations/find-or-create - Get or create conversation between two users
const findOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return sendError(res, 400, "Other user ID is required");
    }

    if (userId.toString() === otherUserId.toString()) {
      return sendError(res, 400, "Cannot create conversation with yourself");
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return sendError(res, 404, "User not found");
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    })
      .populate("participants", "name email avatar role")
      .populate("lastMessage.sender", "name avatar");

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, otherUserId],
        messages: [],
      });
      await conversation.save();
      await conversation.populate([
        { path: "participants", select: "name email avatar role" },
      ]);
    }

    const otherParticipant = conversation.participants.find(
      (p) => p && p._id && p._id.toString() !== userId.toString(),
    );

    return sendSuccess(res, 200, "Conversation", {
      id: conversation._id,
      conversationId: conversation._id,
      otherUser: otherParticipant,
      messages: conversation.messages,
      messageCount: conversation.messages.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/conversations/available-users - Get list of users to chat with
const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = { _id: { $ne: userId }, isActive: true }; // Always exclude current user and only active users

    if (userRole === "patient") {
      // Patients can chat with doctors
      query.role = "doctor";
    } else if (userRole === "doctor") {
      // Doctors can chat with patients
      query.role = "patient";
    }
    // Admin can chat with anyone (query already set to exclude self)

    const users = await User.find(query)
      .select("name email avatar role")
      .limit(100);

    return sendSuccess(res, 200, "Available users", users);
  } catch (err) {
    console.error("getAvailableUsers error:", err);
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  getConversations,
  getConversation,
  sendMessage,
  findOrCreateConversation,
  getAvailableUsers,
};
