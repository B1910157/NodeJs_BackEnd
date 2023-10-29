const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const UserService = require("./user.service");
const MongoDB = require("../utils/mongodb.util");

class EvaluateService {
  constructor(client) {
    this.Evaluate = client.db().collection("evaluate");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractEvaluateData(payload) {
    const evaluate = {
      user_id: payload.user_id ? new ObjectId(payload.user_id) : null,
      service_id: payload.service_id ? new ObjectId(payload.service_id) : null,
      evaluate: parseInt(payload.evaluate),
      createAt: new Date(),
    };

    //Remove undefined fields
    Object.keys(evaluate).forEach(
      (key) => evaluate[key] === undefined && delete evaluate[key]
    );

    return evaluate;
  }

  async create(payload) {
    const evaluate = await this.extractEvaluateData(payload);
    const result = await this.Evaluate.insertOne(evaluate);
    return result;
  }

  async find(filter) {
    const cursor = await this.Evaluate.find(filter);
    return await cursor.toArray();
  }
  async findAllEvaluateOfService(service_id) {
    const evaluates = await this.find({
      service_id: new ObjectId(service_id),
    });

    for (const evaluate of evaluates) {
      const userService = new UserService(MongoDB.client);
      const user = await userService.findById(evaluate.user_id);

      if (user) {
        evaluate.fullname = user.fullname;
      }
    }
    return evaluates;
  }

  async findAllEvaluate() {
    const evaluates = await this.Evaluate.find().toArray();
    for (const evaluate of evaluates) {
      const userService = new UserService(MongoDB.client);
      const user = await userService.findById(evaluate.user_id);

      if (user) {
        evaluate.fullname = user.fullname;
      }
    }
    return evaluates;
  }

  async findById(id) {
    return await this.Evaluate.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  async findByIdUser(id, service_id) {
    return await this.Evaluate.findOne({
      user_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      service_id: ObjectId.isValid(service_id)
        ? new ObjectId(service_id)
        : null,
    });
  }
  async update(id, service_id, payload) {
    const filter = {
      user_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      service_id: ObjectId.isValid(service_id)
        ? new ObjectId(service_id)
        : null,
    };
    const update = await this.extractEvaluateData(payload);
    const result = await this.Evaluate.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result.value;
  }

  async delete(id) {
    const result = await this.Evaluate.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }
}

module.exports = EvaluateService;
