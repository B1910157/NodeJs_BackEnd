const CommentService = require("../services/comment.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");

exports.create = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);

    const document = await commentService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the comment!")
    );
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
    return next(
      new ApiError(500, "An error occured while retrieving comment!")
    );
  }
};

exports.findAllComment = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);
    let documents = await commentService.findAllComment();
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occured while retrieving comment!")
    );
  }
};

exports.updateStatus = async (req, res, next) => {
  const comment_id = req.body.id;
  const status = req.body.status;
  try {
    const comment = new CommentService(MongoDB.client);
    const cmt = comment.findById(comment_id);
    // let status = cmt.status;
    const rs = await comment.updateStatus(comment_id, status);
    return res.send("thành công");
  } catch (error) {
    return next(new ApiError(500, `Publish menu error! ${error}`));
  }
};
