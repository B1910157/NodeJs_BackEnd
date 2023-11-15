const express = require("express");

const chat = require("../controllers/chat.controller");
const chat_with_socket = require("../controllers/chat_with_socket.controller");

const router = express.Router();

router
  .route("/")
  .post(chat.createWithUser)
  .put(chat.findContentInOneChatForUser);
router.route("/").get(chat.getAllChatsForUser);

router.route("/getQuantityNewChatForUser").get(chat.getQuantityNewChatForUser);
//TODO FIND CHAT WITH ALL SERVICE

// with socket
router
  .route("/chat_with_socket")

  .post(chat_with_socket.createWithUser)
  .put(chat_with_socket.findContentInOneChatForUser);
router.route("/chat_with_socket").get(chat.getAllChatsForUser);
module.exports = router;
