
const { ObjectId } = require("mongodb");
const ApiError = require('../api-error');

class DrinkService {
    constructor(client) {
        this.Drink = client.db().collection("drinks");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    async extractDrinkData(payload, service_id) {

        const drink = {
            service_id: new ObjectId(service_id),
            drink_name: payload.drink_name,
            price: parseInt(payload.price),
            image: payload.image ? payload.image : "",
            unit: payload.unit

        };

        //Remove undefined fields
        Object.keys(drink).forEach(
            (key) => drink[key] === undefined && delete drink[key]
        );
        console.log("return", drink)
        return drink;

    }

    async create(payload, service_id) {
        const drink = await this.extractDrinkData(payload, service_id);
        drink.createAt = new Date();
        drink.updateAt = new Date();
        const result = await this.Drink.insertOne(
            drink
        );
        return result;
    }
    async find(filter) {
        const cursor = await this.Drink.find(filter);
        return await cursor.toArray();
    }
    async findByName(drink_name) {
        return await this.find({
            drink_name: { $regex: new RegExp(drink_name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Drink.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async findAllDrinkOfService(service_id) {
        return await this.find({
            service_id: new ObjectId(service_id)
        });
    }
    async findOneDrink(id, service_id) {
        return await this.Drink.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
            service_id: new ObjectId(service_id)
        });
    }
    async update(id, service_id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
            service_id: new ObjectId(service_id)
        };
        const update = await this.extractDrinkData(payload, service_id);
        update.updateAt = new Date();
        // update.service_id = new ObjectId(service_id) ;
        const result = await this.Drink.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }


    async delete(id) {
        const result = await this.Drink.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Drink.deleteMany({});
        return result.deletedCount;
    }

    // async findFavorite() {
    //     return await this.find({
    //         favorite: true
    //     });
    // }

}


module.exports = DrinkService;