//sU DUNG CAC api CUA THU VIEN MONGODB DE THUC HIEN CAC THAO TAC CSDL MONGODB
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class AdminService {
  constructor(client) {
    this.Admin = client.db().collection("admin");
  }

  async extractAdminData(payload) {
    const hashPass = await bcrypt.hash(payload.password, 10);
    const admin = {
      username: payload.username,
      password: hashPass,
      fullname: payload.fullname,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    };

    //Remove undefined fields
    Object.keys(admin).forEach(
      (key) => admin[key] === undefined && delete admin[key]
    );
    return admin;
  }

  async create(payload) {
    const user = await this.extractAdminData(payload);
    const result = await this.Admin.insertOne(user);
    return result.insertedId;
  }
  async findAdmin(username) {
    const user = await this.Admin.findOne({ username: username });
    // console.log("hi", user);
    return user;
  }
  async findById(id) {
    return await this.User.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
}

module.exports = AdminService;
