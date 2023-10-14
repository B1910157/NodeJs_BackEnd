//sU DUNG CAC api CUA THU VIEN MONGODB DE THUC HIEN CAC THAO TAC CSDL MONGODB
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class ServiceProvider {
  constructor(client) {
    this.Service = client.db().collection("services");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractServiceData(payload) {
    const hashPass = await bcrypt.hash(payload.password, 10);
    const service = {
      service_name: payload.service_name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      password: hashPass,
      bank_name: payload.bank_name,
      card_number: payload.card_number,
      status: "1",
      support_area: payload.support_area,
      support_party_type: payload.support_party_type,
      foods: payload.food || [],
      others: payload.other || [],
      image: payload.image || [],
    };

    //Remove undefined fields
    Object.keys(service).forEach(
      (key) => service[key] === undefined && delete service[key]
    );
    return service;
  }

  async create(payload) {
    const service = await this.extractServiceData(payload);
    service.createAt = new Date();
    service.updateAt = new Date();
    const result = await this.Service.insertOne(service);
    return result.insertedId;
  }
  async updateService(serviceId, payload) {
    const filter = {
      _id: ObjectId.isValid(serviceId) ? new ObjectId(serviceId) : null,
    };

    const update = this.extractServiceData(payload);
    update.updateAt = new Date();
    const result = await this.Service.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }
  async changeImage(serviceId, image) {
    const filter = {
      _id: ObjectId.isValid(serviceId) ? new ObjectId(serviceId) : null,
    };

    // const update = this.extractServiceData(payload);
    const result = await this.Service.findOneAndUpdate(
      filter,
      { $set: { image: image, updateAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value;
  }

  //cap nhat thong tin ca nhân
  async updateServiceInfo(service_id, newInfo) {
    const result = await this.Service.updateOne(
      { _id: new ObjectId(service_id) },
      {
        $set: {
          service_name: newInfo.service_name,
          email: newInfo.email,
          phone: newInfo.phone,
          address: newInfo.address,
          // bank_name: newInfo.bank_name,
          support_area: newInfo.support_area,
          support_party_type: newInfo.support_party_type,
          updateAt: new Date(),
        },
      }
    );
    console.log(result);
    return result.acknowledged;
  }

  // async updateSupportArea(serviceId, supportArea) {
  //   try {
  //     // Cập nhật trường support_area trong cơ sở dữ liệu
  //     const result = await this.Service.findOneAndUpdate(
  //       { _id: new ObjectId(serviceId) },
  //       { $set: { support_area: supportArea } },
  //       { returnDocument: "after" }
  //     );

  //     return result.value;
  //   } catch (error) {
  //     throw new Error(`Error updating support_area: ${error.message}`);
  //   }
  // }

  // async updateSupportPartyType(serviceId, supportPartyType) {
  //   try {
  //     // Cập nhật trường support_area trong cơ sở dữ liệu
  //     const result = await this.Service.findOneAndUpdate(
  //       { _id: new ObjectId(serviceId) },
  //       { $set: { support_area: supportArea } },
  //       { returnDocument: "after" }
  //     );

  //     return result.value;
  //   } catch (error) {
  //     throw new Error(`Error updating support_area: ${error.message}`);
  //   }
  // }

  async findAllService() {
    const service = await this.Service.find().toArray();
    return service;
  }

  async findEmail(email) {
    const service = await this.Service.findOne({ email: email });
    return service;
  }

  async findById(id) {
    return await this.Service.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  extractOthersData(payload) {
    const other = {
      _id: new ObjectId(),
      other_name: payload.other_name,
      price: payload.price,
      description: payload.description,
      unit: payload.unit,
    };

    return other;
  }
  async createOther(serviceId, payload) {
    const other = await this.extractOthersData(payload);
    console.log("asss", other);

    const result = await this.Service.updateOne(
      { _id: new ObjectId(serviceId) },
      { $push: { others: other } }
    );
    return result.modifiedCount > 0;
  }
  async findAllOtherOfService(serviceId) {
    const service = await this.Service.findOne({
      _id: new ObjectId(serviceId),
    });
    console.log(service.others);
    return service.others;
  }
  async findOneOther(serviceId, otherId) {
    console.log("hi");
    console.log(serviceId);
    const service = await this.findById(serviceId);
    // console.log(service);
    const other = service.others.find(
      (c) => c._id.toString() === otherId.toString()
    );

    if (!other) {
      throw new ApiError(400, "other not found");
    }
    return other;
  }

  async deleteOneOther(serviceId, otherId) {
    const rs = await this.Service.updateOne(
      { _id: new ObjectId(serviceId) },
      { $pull: { others: { _id: new ObjectId(otherId) } } }
    );
    return rs.modifiedCount > 0;
  }

  async updateOneOther(serviceId, otherId, updated) {
    const result = await this.Service.updateOne(
      { _id: new ObjectId(serviceId), "others._id": new ObjectId(otherId) },
      {
        $set: {
          "others.$.other_name": updated.other_name,
          "others.$.price": updated.price,
          "others.$.description": updated.description,
        },
      }
    );
    console.log(result);
    return result.modifiedCount > 0;
  }

  ///
  extractMenuData(payload) {
    const food = {
      _id: new ObjectId(),
      food_name: payload.food_name,
      food_category: payload.food_category
        ? new ObjectId(payload.food_category)
        : undefined,
      price: payload.price,
    };

    return food;
  }
  async createFood(serviceId, payload) {
    const food = await this.extractMenuData(payload);
    console.log("asss", food);

    const result = await this.Service.updateOne(
      { _id: new ObjectId(serviceId) },
      { $push: { foods: food } }
    );
    return result.modifiedCount > 0;
  }

  async findAllFoodOfService(serviceId) {
    const service = await this.Service.findOne({
      _id: new ObjectId(serviceId),
    });
    // console.log(service.foods);
    return service.foods;
  }

  async findOneFood(serviceId, foodId) {
    // console.log("hi");
    // console.log(serviceId);
    const service = await this.findById(serviceId);
    // console.log(service);
    const food = service.foods.find(
      (c) => c._id.toString() === foodId.toString()
    );

    if (!food) {
      throw new ApiError(400, "food not found");
    }
    return food;
  }

  async findByName(nameService) {
    const service = await this.Service.findOne({ service_name: nameService });
    return service;
  }

  async deleteAllFood(serviceId) {
    const rs = await this.Service.updateOne(
      { _id: new ObjectId(serviceId) },
      { $unset: { foods: [] } }
    );
    return rs.modifiedCount > 0;
  }
  async deleteOneFood(serviceId, foodId) {
    const rs = await this.Service.updateOne(
      { _id: new ObjectId(serviceId) },
      { $pull: { foods: { _id: new ObjectId(foodId) } } }
    );
    return rs.modifiedCount > 0;
  }

  async updateOneFood(serviceId, foodId, updated) {
    const result = await this.Service.updateOne(
      { _id: new ObjectId(serviceId), "foods._id": new ObjectId(foodId) },
      {
        $set: {
          "foods.$.food_name": updated.food_name,
          "foods.$.food_category": updated.food_category
            ? new ObjectId(updated.food_category)
            : undefined,
          "foods.$.price": updated.price,
        },
      }
    );
    console.log(result);
    return result.modifiedCount > 0;
  }
}

module.exports = ServiceProvider;
