const CommentService = require("../services/comment.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");

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

exports.findAllCommentOfServiceReal = async (req, res, next) => {
  let service_id;
  service_id = req.params.service_id;

  try {
    const commentService = new CommentService(MongoDB.client);
    const userService = new UserService(MongoDB.client);

    let documents = await commentService.findAllCommentOfService(service_id);

    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occured while retrieving job!"));
  }
};

exports.findAllComment = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);
    let documents = await commentService.findAllComment();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occured while retrieving job!"));
  }
};
