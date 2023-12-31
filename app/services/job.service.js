const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const ServiceProvider = require("./serviceProvider");
const MongoDB = require("../utils/mongodb.util");
class JobService {
  constructor(client) {
    this.Job = client.db().collection("jobs");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractJobData(payload, service_id) {
    const job = {
      service_id: new ObjectId(service_id),
      type_job: payload.type_job,
      title: payload.title,
      description: payload.description,
      wage: payload.wage,
      requirement: payload.requirement,
      slot: payload.slot,
      area: payload.area,
      deadline: payload.deadline,
      list: [],
      status: 1 ,
    };

    Object.keys(job).forEach(
      (key) => job[key] === undefined && delete job[key]
    );
    return job;
  }

  async create(payload, service_id) {
    const job = await this.extractJobData(payload, service_id);
    job.createAt = new Date();
    job.updateAt = new Date();
    const result = await this.Job.insertOne(job);
    return result;
  }
  async find(filter) {
    const cursor = await this.Job.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Job.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  async findAllJobOfService(service_id) {
    return await this.find({
      service_id: new ObjectId(service_id),
    });
  }

  async findAllJobPublish() {
    const rs = await this.Job.find({ status: 1 }).toArray();
    for (const comment of rs) {
      const serviceService = new ServiceProvider(MongoDB.client);
      const service = await serviceService.findById(comment.service_id);
      if (service.status != 1) {
        return [];
      } else if (service && service.status == 1) {
        comment.service_name = service.service_name;
        comment.phone = service.phone;
        comment.email = service.email;
        comment.image = service.image;
      }
    }
    return rs;
  }

  async findAllJob() {
    const rs = await this.Job.find().toArray();
    return rs;
  }

  // async findOneJobOfService(id, service_id) {
  //   return await this.Job.findOne({
  //     _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
  //     service_id: new ObjectId(service_id),
  //   });
  // }

  //TODO TÌM 1 JOB CỦA NGƯỜI DÙNG
  async findOneJobOfUser(id, user_id) {
    return await this.Job.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      user_id: new ObjectId(user_id),
    });
  }

  //TODO tìm all job của người dùng
  async findAllJobOfUser(user_id) {
    return await this.find({
      user_id: new ObjectId(user_id),
    });
    // .sort({ createAt: 1 })
    // .lean();
  }
  async publishPost(jobId) {
    const filter = {
      _id: ObjectId.isValid(jobId) ? new ObjectId(jobId) : null,
    };
    const accept = await this.Job.findOneAndUpdate(
      filter,
      { $set: { status: 1, updateAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  async hiddenPost(jobId) {
    const filter = {
      _id: ObjectId.isValid(jobId) ? new ObjectId(jobId) : null,
    };
    const cancel = await this.Job.findOneAndUpdate(
      filter,
      { $set: { status: 0, updateAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  async updateOnePostJob(id, service_id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      service_id: new ObjectId(service_id),
    };
    const update = await this.extractJobData(payload, service_id);
    update.updateAt = new Date();
    const result = await this.Job.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async updateListInOneJob(id, listUser) {
    const result = await this.Job.updateOne(
      { _id: new ObjectId(id) },
      { $set: { list: listUser, updateAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value;
  }
}

module.exports = JobService;
