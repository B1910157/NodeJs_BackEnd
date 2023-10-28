const UserService = require("../services/admin.service");

const { client } = require("../utils/mongodb.util");

const MongoDB = require("../utils/mongodb.util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");

exports.create = async (req, res, next) => {
  if (!req.body?.username) {
    return next(new ApiError(400, "Username can not be empty"));
  }

  if (!req.body?.password) {
    return next(new ApiError(400, "Password can not be empty"));
  }

  try {
    console.log(req.body);
    const userService = new UserService(MongoDB.client);
    const document = await userService.create(req.body);
    return res.send(document);
    // return res.send(`Inserted new user have Id: ${document.insertedId}`);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the User11111")
    );
  }
};

exports.findOneAdmin = async (req, res, next) => {
  const userId = req.admin.id;
  try {
    const userService = new UserService(MongoDB.client);
    console.log(userId);
    console.log("sss aloooooooooooooooo");
    const info = await userService.findById(userId);
    console.log(info);

    if (!info) {
      return next(new ApiError(404, "User not found"));
    }
    return res.send(info);
  } catch (error) {
    return next(new ApiError(500, `Error updating user with userid=${userId}`));
  }
};
exports.loginAdmin = async (req, res, next) => {
  console.log(req.body);
  if (!req.body?.username || !req.body?.password) {
    return next(new ApiError(400, "Input username/password"));
  }
  try {
    const userService = new UserService(MongoDB.client);

    const user = await userService.findAdmin(req.body.username);
    console.log("12345", user);
    const comparePass = await bcrypt.compare(req.body.password, user.password);

    if (!user) {
      return next(new ApiError(401, "Username notfound"));
    } else if (!comparePass) {
      return next(new ApiError(400, "password fail"));
    } else {
      const token = jwt.sign({ id: user._id }, "secret", { expiresIn: 864000 });
      console.log("token", token);
      return res.send({
        status: "success",
        message: "Login successfully",
        token: token,
      });
    }
  } catch (error) {
    return next(new ApiError(500, "Login error"));
  }
};

exports.logout = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    console.log(auth);
    if (!auth) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const token = auth.split(" ")[1];
    const decoded_user = jwt.decode(token);
    console.log("decoded: ", decoded_user);
    return res.send({ message: "Logout success" });
  } catch (error) {
    return next(new ApiError(500, "logout fail"));
  }
};

//Cap nhat thong tin ca nhan
exports.updateInfo = async (req, res, next) => {
  const userId = req.user.id;
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const userService = new UserService(MongoDB.client);
    console.log(userId);
    console.log(req.body);
    const document = await userService.updateUserInfo(userId, req.body);
    console.log(document);
    console.log("HOHO");
    if (!document) {
      return next(new ApiError(404, "User not found"));
    }
    return res.send({ message: "InfoOfUser was updated successfully" });
  } catch (error) {
    return next(new ApiError(500, `Error updating user with userid=${userId}`));
  }
};
