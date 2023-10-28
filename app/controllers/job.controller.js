const JobService = require("../services/job.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  let service_id;
  service_id = req.service.id;
  if (!req.body?.title) {
    return next(new ApiError(400, "Title can not be empty!"));
  }
  try {
    const jobService = new JobService(MongoDB.client);

    const document = await jobService.create(req.body, service_id);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while creating the job!"));
  }
};
//Cap nhat thong tin ca nhan
exports.updateOnePostJob = async (req, res, next) => {
  const jobId = req.params.jobId;
  const service_id = req.service.id;
  console.log("body", req.body);
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const jobService = new JobService(MongoDB.client);

    const document = await jobService.updateOnePostJob(
      jobId,
      service_id,
      req.body
    );
    // console.log(document);
    console.log("HOHO");
    if (!document) {
      return next(new ApiError(404, "User not found"));
    }
    return res.send({ message: "update job was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating user with service_id=${service_id}`)
    );
  }
};

exports.findOneJob = async (req, res, next) => {
  let service_id;
  service_id = req.service.id;
  const jobId = req.params.jobId;
  try {
    const jobService = new JobService(MongoDB.client);
    const document = await jobService.findById(jobId);
    if (!document) {
      return next(new ApiError(404, "job not found!"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving food with id = ${jobId} !`)
    );
  }
};

exports.findAllJobOfService = async (req, res, next) => {
  let documents = [];
  let service_id;
  service_id = req.service.id;
  try {
    const jobService = new JobService(MongoDB.client);
    documents = await jobService.findAllJobOfService(service_id);
  } catch (error) {
    return next(new ApiError(500, "An error occured while retrieving job!"));
  }

  return res.send(documents);
};
