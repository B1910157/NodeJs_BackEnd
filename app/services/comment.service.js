const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const UserService = require("./user.service");
const MongoDB = require("../utils/mongodb.util");
const ServiceProvider = require("./serviceProvider");

class CommentService {
  constructor(client) {
    this.Comment = client.db().collection("comments");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractCommentData(payload) {
    const comment = {
      user_id: payload.user_id ? new ObjectId(payload.user_id) : null,
      service_id: payload.service_id ? new ObjectId(payload.service_id) : null,
      comment: payload.comment,
      createAt: new Date(),
      status: 1,
    };

    //Remove undefined fields
    Object.keys(comment).forEach(
      (key) => comment[key] === undefined && delete comment[key]
    );

    return comment;
  }

  async create(payload) {
    const comment = await this.extractCommentData(payload);
    const result = await this.Comment.insertOne(comment);
    return result;
  }

  async find(filter) {
    const cursor = await this.Comment.find(filter);
    return await cursor.toArray();
  }

  async findAllCommentOfService(service_id) {
    // return await this.find({
    //   service_id: new ObjectId(service_id),
    //   status: 1,
    // });
    const comments = await this.find({
      service_id: new ObjectId(service_id),
      status: 1,
    });

    for (const comment of comments) {
      const userService = new UserService(MongoDB.client);
      const user = await userService.findById(comment.user_id);

      if (user) {
        comment.fullname = user.fullname;
      }
    }
    return comments;
  }
  async findAllComment() {
    const comments = await this.Comment.find().toArray();
    for (const comment of comments) {
      const userService = new UserService(MongoDB.client);
      const serviceService = new ServiceProvider(MongoDB.client);
      const service = await serviceService.findById(comment.service_id);
      const user = await userService.findById(comment.user_id);

      if (user) {
        comment.fullname = user.fullname;
      }
      if (service) {
        comment.service_name = service.service_name;
      }
    }
    return comments;
  }

  async updateStatus(id, status) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    if (status == 1) {
      const cancel = await this.Comment.findOneAndUpdate(
        filter,
        { $set: { status: 0 } },
        { returnDocument: "after" }
      );
    }
    if (status == 0) {
      const accept = await this.Comment.findOneAndUpdate(
        filter,
        { $set: { status: 1 } },
        { returnDocument: "after" }
      );
    }
  }

  async findById(id) {
    return await this.Comment.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = await this.extractCommentData(payload);
    const result = await this.Comment.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result.value;
  }

  async delete(id) {
    const result = await this.Comment.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }
}

module.exports = CommentService;
