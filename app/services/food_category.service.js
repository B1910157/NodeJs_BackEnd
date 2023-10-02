const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class FoodCategoryService {
  constructor(client) {
    this.FoodCategory = client.db().collection("food_category");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractFoodCategoryData(payload) {
    const food_category = {
      food_category: payload.food_category,
    };

    //Remove undefined fields
    Object.keys(food_category).forEach(
      (key) => food_category[key] === undefined && delete food_category[key]
    );
    console.log("return", food_category);
    return food_category;
  }

  async create(payload) {
    const food_category = await this.extractFoodCategoryData(payload);
    const result = await this.FoodCategory.insertOne(food_category);
    return result;
  }

  async find(filter) {
    const cursor = await this.FoodCategory.find(filter);
    return await cursor.toArray();
  }

 
  async findById(id) {
    console.log("hi", id)
    return await this.FoodCategory.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = await this.extractFoodCategoryData(payload);
    const result = await this.FoodCategory.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    console.log("rs", result);
    return result.value;
  }

  async delete(id) {
    const result = await this.FoodCategory.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }

}

module.exports = FoodCategoryService;
