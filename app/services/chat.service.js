const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const UserService = require("./user.service");
const MongoDB = require("../utils/mongodb.util");
const ServiceProvider = require("./serviceProvider");

class ChatService {
  constructor(client) {
    this.Chat = client.db().collection("chats");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractChatData(payload) {
    const chat = {
      user_id: payload.user_id ? new ObjectId(payload.user_id) : null,
      service_id: payload.service_id ? new ObjectId(payload.service_id) : null,
      chat: payload.chat,
      sender: payload.sender,
      createAt: new Date(),
      user_seen: payload.user_seen ? payload.user_seen : false,
      service_seen: payload.service_seen ? payload.service_seen : false,
    };

    //Remove undefined fields
    Object.keys(chat).forEach(
      (key) => chat[key] === undefined && delete chat[key]
    );

    return chat;
  }

  async create(payload) {
    const chat = await this.extractChatData(payload);
    const result = await this.Chat.insertOne(chat);
    return result;
  }

  async find(filter) {
    const cursor = await this.Chat.find(filter);
    return await cursor.toArray();
  }

  async findAllChatOfOneServiceAndOneUser(service_id, userId) {
    // return await this.find({
    //   service_id: new ObjectId(service_id),
    //   status: 1,
    // });
    const comments = await this.find({
      service_id: new ObjectId(service_id),
      user_id: new ObjectId(userId),
      //   status: 1,
    });

    for (const comment of comments) {
      const serviceService = new ServiceProvider(MongoDB.client);
      const userService = new UserService(MongoDB.client);
      const service = await serviceService.findById(comment.service_id);
      const user = await userService.findById(comment.user_id);

      if (user) {
        comment.fullname = user.fullname;
      }
      if (service) {
        comment.service_name = service.service_name;
      }
    }
    // await this.isSeen(service_id, userId);
    return comments;
  }

  async isUserSeen(serviceId, userId) {
    const result = await this.Chat.updateMany(
      {
        service_id: new ObjectId(serviceId),
        user_id: new ObjectId(userId),
        user_seen: false,
        sender: "service",
      },
      { $set: { user_seen: true } }
    );
    return result.modifiedCount > 0;
  }

  async isServiceSeen(serviceId, userId) {
    const result = await this.Chat.updateMany(
      {
        service_id: new ObjectId(serviceId),
        user_id: new ObjectId(userId),
        service_seen: false,
        sender: "user",
      },
      { $set: { service_seen: true } }
    );
    // console.log("is service seen", result);
    return result.modifiedCount > 0;
  }

  async findById(id) {
    return await this.Chat.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async getAllChatsForUser(userId) {
    try {
      // Find distinct service_id for the given user
      const distinctServices = await this.Chat.distinct("service_id", {
        user_id: new ObjectId(userId),
      });

      // Create an array to store the final result
      const allChats = [];

      // Iterate through each service_id and fetch the last 2 chats
      for (const serviceId of distinctServices) {
        const chatsForService = await this.Chat.find({
          user_id: new ObjectId(userId),
          service_id: new ObjectId(serviceId),
        })
          .sort({ createAt: -1 }) // Sort by createAt in descending order
          .limit(1) // Limit to the last 2 chats
          .toArray();

        // Get service details
        const serviceService = new ServiceProvider(MongoDB.client);
        const service = await serviceService.findById(serviceId);

        // Add service details to each chat entry
        chatsForService.forEach((chat) => {
          chat.service_name = service ? service.service_name : null;
          chat.service_image = service ? service.image : null;
        });

        // Add the chats to the final result array
        allChats.push(...chatsForService);
      }

      return allChats;
    } catch (error) {
      // Handle errors appropriately (throw, log, etc.)
      console.error("Error retrieving chats for user:", error);
      throw new ApiError("Error retrieving chats for user", 500);
    }
  }

  async getAllChatsForService(serviceId) {
    try {
      // Find distinct service_id for the given user
      const distinctUsers = await this.Chat.distinct("user_id", {
        service_id: new ObjectId(serviceId),
      });

      const allChats = [];

      for (const userId of distinctUsers) {
        const chatsForService = await this.Chat.find({
          user_id: new ObjectId(userId),
          service_id: new ObjectId(serviceId),
        })
          .sort({ createAt: -1 }) // Sort by createAt in descending order
          .limit(1) // Limit to the last 2 chats
          .toArray();

        // Get service details
        // const serviceService = new ServiceProvider(MongoDB.client);
        // const service = await serviceService.findById(serviceId);

        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(userId);

        // Add service details to each chat entry
        chatsForService.forEach((chat) => {
          chat.fullname = user ? user.fullname : null;
          // chat.service_image = service ? service.image : null;
        });

        // Add the chats to the final result array
        allChats.push(...chatsForService);
      }

      return allChats;
    } catch (error) {
      // Handle errors appropriately (throw, log, etc.)
      console.error("Error retrieving chats for service:", error);
      throw new ApiError("Error retrieving chats for service", 500);
    }
  }

  async getNewMessageCountForService(serviceId) {
    try {
      const result = await this.Chat.countDocuments({
        service_id: new ObjectId(serviceId),
        sender: "user",
        service_seen: false,
      });

      return result;
    } catch (error) {
      console.error("Error getting new message count for service:", error);
      throw new ApiError("Error getting new message count for service", 500);
    }
  }

  async getNewMessageCountForUser(userId) {
    try {
      const result = await this.Chat.countDocuments({
        user_id: new ObjectId(userId),
        sender: "service",
        user_seen: false,
      });

      return result;
    } catch (error) {
      console.error("Error getting new message count for service:", error);
      throw new ApiError("Error getting new message count for service", 500);
    }
  }
}

module.exports = ChatService;
