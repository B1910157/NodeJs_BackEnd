const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

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
    console.log("return", evaluate);
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
  //   async updateStatus(id, status) {
  //     const filter = {
  //       _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
  //     };
  //     if (status == 1) {
  //       const cancel = await this.Evaluate.findOneAndUpdate(
  //         filter,
  //         { $set: { status: 0 } },
  //         { returnDocument: "after" }
  //       );
  //     }
  //     if (status == 0) {
  //       const accept = await this.Evaluate.findOneAndUpdate(
  //         filter,
  //         { $set: { status: 1 } },
  //         { returnDocument: "after" }
  //       );
  //     }
  //   }

  async findById(id) {
    console.log("hi", id);
    return await this.Evaluate.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = await this.extractEvaluateData(payload);
    const result = await this.Evaluate.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    console.log("rs", result);
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
