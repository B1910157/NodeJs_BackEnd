const ChatService = require("../services/chat.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");

exports.createWithUser = async (req, res, next) => {
  try {
    if (req.user) {
      req.body.user_id = req.user.id;
    }
    // if (req.service) {
    //   req.body.service_id = req.service.id;
    // }
    // console.log("BODY CHAT", req.body);
    req.body.sender = "user";
    req.body.user_seen = true;
    const chatService = new ChatService(MongoDB.client);

    const document = await chatService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the comment!")
    );
  }
};

exports.getAllChatsForUser = async (req, res, next) => {
  const user_id = req.user.id;
  const chatService = new ChatService(MongoDB.client);
  const document = await chatService.getAllChatsForUser(user_id);
  return res.send(document);
};

exports.getAllChatsForService = async (req, res, next) => {
  const service_id = req.service.id;
  const chatService = new ChatService(MongoDB.client);
  const document = await chatService.getAllChatsForService(service_id);
  return res.send(document);
};

exports.getQuantityNewChatWithService = async (req, res, next) => {
  const service_id = req.service.id;
  const chatService = new ChatService(MongoDB.client);
  const quantity = await chatService.getNewMessageCountForService(service_id);
  // console.log("hello", quantity);
  return res.send({ quantity: quantity });
};
exports.getQuantityNewChatForUser = async (req, res, next) => {
  const user_id = req.user.id;
  const chatService = new ChatService(MongoDB.client);
  const quantity = await chatService.getNewMessageCountForUser(user_id);
  // console.log("hello", quantity);
  return res.send({ quantity: quantity });
};
exports.createWithService = async (req, res, next) => {
  try {
    // if (req.user) {
    //   req.body.user_id = req.user.id;
    // }
    if (req.service) {
      req.body.service_id = req.service.id;
    }
    // console.log("BODY CHAT", req.body);
    const chatService = new ChatService(MongoDB.client);
    req.body.sender = "service";
    req.body.service_seen = true;
    const document = await chatService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the comment!")
    );
  }
};

exports.findContentInOneChatForUser = async (req, res, next) => {
  let service_id;
  let user_id;
  if (req.user) {
    user_id = req.user.id;
  } else {
    user_id = req.body.user_id;
  }
  if (req.service) {
    service_id = req.service.id;
  } else {
    service_id = req.body.service_id;
  }

  try {
    const chatService = new ChatService(MongoDB.client);
    // const userService = new UserService(MongoDB.client);

    let documents = await chatService.findAllChatOfOneServiceAndOneUser(
      service_id,
      user_id
    );

    await chatService.isUserSeen(service_id, user_id);

    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occured while retrieving comment!")
    );
  }
};

exports.findContentInOneChatForService = async (req, res, next) => {
  let service_id;
  let user_id;
  if (req.user) {
    user_id = req.user.id;
  } else {
    user_id = req.body.user_id;
  }
  if (req.service) {
    service_id = req.service.id;
  } else {
    service_id = req.body.service_id;
  }

  try {
    const chatService = new ChatService(MongoDB.client);
    // const userService = new UserService(MongoDB.client);

    let documents = await chatService.findAllChatOfOneServiceAndOneUser(
      service_id,
      user_id
    );

    await chatService.isServiceSeen(service_id, user_id);

    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occured while retrieving comment!")
    );
  }
};

// exports.findAllCommentOfServiceReal = async (req, res, next) => {
//   let service_id;
//   service_id = req.params.service_id;

//   try {
//     const commentService = new CommentService(MongoDB.client);
//     const userService = new UserService(MongoDB.client);

//     let documents = await commentService.findAllCommentOfService(service_id);

//     return res.send(documents);
//   } catch (error) {
//     return next(
//       new ApiError(500, "An error occured while retrieving comment!")
//     );
//   }
// };

// exports.findAllComment = async (req, res, next) => {
//   try {
//     const commentService = new CommentService(MongoDB.client);
//     let documents = await commentService.findAllComment();
//     return res.send(documents);
//   } catch (error) {
//     return next(
//       new ApiError(500, "An error occured while retrieving comment!")
//     );
//   }
// };

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
