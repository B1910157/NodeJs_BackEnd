const CommentService = require("../services/comment.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  try {
    console.log("BODY CÓ 3 THỨ", req.body);
    const commentService = new CommentService(MongoDB.client);

    const document = await commentService.create(req.body);
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

exports.findAllCommentOfServiceReal = async (req, res, next) => {
  let service_id;

  service_id = req.params.service_id;
  console.log("hihi nè", req.params);
  try {
    const commentService = new CommentService(MongoDB.client);
    let documents = await commentService.findAllCommentOfService(service_id);
    console.log("DỮ LIỆU", documents);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occured while retrieving job!"));
  }

  return res.send(documents);
};
