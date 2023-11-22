const express = require("express");
const cors = require("cors"); //cho phép hoặc từ chối các yêu cầu từ các trang web khác origin

const ApiError = require("./app/api-error");
const multer = require("multer"); //middleware cho express => xử lý upload file từ client
const http = require("http"); //xư lý các yêu cầu và phản hồi (req, res)
const socketIO = require("socket.io");

const paymentRoute = require("./app/routes/payment.js");
const paymentVNPayRoute = require("./app/routes/paymentVNPay.js");
const userRoute = require("./app/routes/user.route");
const adminRoute = require("./app/routes/admin.route.js");
const adminInfoRoute = require("./app/routes/infoAdmin.route.js");
const serviceRoute = require("./app/routes/service.route");
const managerServiceRoute = require("./app/routes/managerService.route");
const managerRoute = require("./app/routes/manager.route");
const food_categoryRoute = require("./app/routes/food_category.route");
const type_partyRoute = require("./app/routes/type_party.route");
const homeRoute = require("./app/routes/home.route");
const menuRoute = require("./app/routes/menu.route");
const infoRoute = require("./app/routes/info.route");
const feedback = require("./app/routes/feedback");
const orderRoute = require("./app/routes/order_user.route");
const orderServiceRoute = require("./app/routes/order_admin.route");
const cartRoute = require("./app/routes/cart.route");
const itemsRoute = require("./app/routes/items.route");
const infoServiceRoute = require("./app/routes/infoService.route");
const commentAndEvaluate = require("./app/routes/commentAndEvaluate.route");
const chatServiceRoute = require("./app/routes/userChat.route.js");

const checkUser = require("./app/middlewares/check_user");
const checkService = require("./app/middlewares/checkService.js");
const checkAdmin = require("./app/middlewares/check_adminPage");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public/images"));

const server = http.createServer(app); // Tạo server HTTP

// const io = socketIO(server);
const io = socketIO(server, {
  cors: {
    origin: (origin, callback) => {
      // Kiểm tra nếu origin nằm trong danh sách các địa chỉ được phép
      const allowedOrigins = [
        "http://localhost:3001",
        "http://localhost:3003" 
      ];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Project. This is PartyPLanner." });
});
// const checkUser = require("./app/middlewares/check_user")
// app.use("/api/contacts", checkUser, userContacts);
// app.use("/api/users", usersRouter);

const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("image!!"), false);
    }
    cb(null, true);
  },
});

app.use("/api/users", userRoute);

//user chat with service
app.use("/api/userChat", checkUser, chatServiceRoute);

app.use("/api/admin", adminRoute);
app.use("/api/adminInfo", checkAdmin, adminInfoRoute);
app.use("/api/services", serviceRoute);
app.use("/api/managerService", checkAdmin, managerServiceRoute);
// app.use("/api/foods", checkUser, upload.single('image'), foodRoute);
// app.use("/api/manager", checkService,  managerRoute)
app.use("/api/manager", checkService, upload.single("image"), managerRoute);
app.use("/api/food_category", food_categoryRoute);
app.use("/api/type_party", type_partyRoute);
app.use("/api/home", homeRoute);
app.use("/api/service", checkUser, menuRoute);
app.use("/api/user_orders", orderRoute);
app.use("/api/service_orders", checkService, orderServiceRoute);
app.use("/api/info", checkUser, infoRoute);
app.use("/api/infoService", checkService, infoServiceRoute);
app.use("/api/feedback", checkUser, feedback);
app.use("/api/cart", checkUser, cartRoute);
app.use("/api/items", itemsRoute);
app.use("/api/commentAndEvaluate", commentAndEvaluate);
app.use("/api/payment", paymentRoute);
app.use("/api/paymentVNpay", paymentVNPayRoute);

// handle 404 response
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});
// define error-handling middleware last, after other app.use() and routes calls
app.use((error, req, res, next) => {
  // Middleware xử lý lỗi tập trung.
  // Trong các đoạn code xử lý ở các route, gọi next(error)
  // sẽ chuyển về middleware xử lý lỗi này
  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
  });
});

// // Namespace cho cổng 3001
// const namespace3001 = io.of("/namespace");
// namespace3001.on("connection", (socket) => {
//   console.log("User connected to namespace3001");

//   socket.on("chat message", (msg) => {
//     namespace3001.emit("chat message", msg);
//     console.log("user 1 chat", msg);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected from namespace3001");
//   });
// });

// // Namespace cho cổng 3003
// const namespace3003 = io.of("/namespace");
// namespace3003.on("connection", (socket) => {
//   console.log("User connected to namespace3003");

//   socket.on("chat message", (msg) => {
//     // namespace3003.emit("chat message service", msg);
//     console.log("user 2 chat", msg);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected from namespace3003");
//   });
// });

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("chat message", (msg) => {
    // Gửi tin nhắn đến phòng tương ứng
    io.to(msg.roomId).emit("chat message", msg);
    console.log(`User ${socket.id} sent a message to room ${msg.roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});
server.listen(3009, () => {
  console.log("Server socket IO listening on port 3009");
});

module.exports = app;
