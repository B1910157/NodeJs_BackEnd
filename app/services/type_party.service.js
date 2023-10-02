const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class TypePartyService {
  constructor(client) {
    this.TypeParty = client.db().collection("type_party");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractTypePartyData(payload) {
    const type_party = {
      type_party: payload.type_party,
    };

    //Remove undefined fields
    Object.keys(type_party).forEach(
      (key) => type_party[key] === undefined && delete type_party[key]
    );
    console.log("return", type_party);
    return type_party;
  }

  async create(payload) {
    const type_party = await this.extractTypePartyData(payload);
    const result = await this.TypeParty.insertOne(type_party);
    return result;
  }

  async find(filter) {
    const cursor = await this.TypeParty.find(filter);
    return await cursor.toArray();
  }

 
  async findById(id) {
    console.log("hi", id)
    return await this.TypeParty.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = await this.extractTypePartyData(payload);
    const result = await this.TypeParty.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    console.log("rs", result);
    return result.value;
  }

  async delete(id) {
    const result = await this.TypeParty.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }

}

module.exports = TypePartyService;
