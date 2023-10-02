
const { ObjectId } = require("mongodb");
const ApiError = require('../api-error');

class OtherService {
    constructor(client) {
        this.Other = client.db().collection("others");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    async extractOtherData(payload, service_id) {

        const other = {
            service_id: new ObjectId(service_id),
            other_name: payload.other_name,
            price: parseInt(payload.price),
            image: payload.image ? payload.image : "",
            description: payload.description

        };

        //Remove undefined fields
        Object.keys(other).forEach(
            (key) => other[key] === undefined && delete other[key]
        );
        console.log("return", other)
        return other;

    }

    async create(payload, service_id) {
        const other = await this.extractOtherData(payload, service_id);
        other.createAt = new Date();
        other.updateAt = new Date();
        const result = await this.Other.insertOne(
            other
        );
        return result;
    }
    async find(filter) {
        const cursor = await this.Other.find(filter);
        return await cursor.toArray();
    }
    async findByName(other_name) {
        return await this.find({
            other_name: { $regex: new RegExp(other_name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Other.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async findAllOtherOfService(service_id) {
        return await this.find({
            service_id: new ObjectId(service_id)
        });
    }
    async findOneOther(id, service_id) {
        return await this.Other.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
            service_id: new ObjectId(service_id)
        });
    }
    async update(id, service_id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
            service_id: new ObjectId(service_id)
        };
        const update = await this.extractOtherData(payload, service_id);
        update.updateAt = new Date();
        // update.service_id = new ObjectId(service_id) ;
        const result = await this.Other.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }


    async delete(id) {
        const result = await this.Other.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Other.deleteMany({});
        return result.deletedCount;
    }

    // async findFavorite() {
    //     return await this.find({
    //         favorite: true
    //     });
    // }

}


module.exports = OtherService;