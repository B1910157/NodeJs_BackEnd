//sU DUNG CAC api CUA THU VIEN MONGODB DE THUC HIEN CAC THAO TAC CSDL MONGODB

const { ObjectId } = require("mongodb");
const ApiError = require('../api-error');

class PartyTypeService {
    constructor(client) {
        this.PartyType = client.db().collection("party_type");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    async extractPartyTypeData(payload) {

        const party_type = {
            // service_id: new ObjectId(service_id),
            name: payload.name,
            

        };

        //Remove undefined fields
        Object.keys(party_type).forEach(
            (key) => party_type[key] === undefined && delete party_type[key]
        );
        console.log("return", party_type)
        return party_type;

    }

    async create(payload) {
        const party_type = await this.extractPartyTypeData(payload);
        const result = await this.PartyType.insertOne(
            party_type
        );
        // const foodId = result.insertedId;
        // const imageName = foodId + path.extname(file.originalname);
        // const imagePath = path.join(__dirname, '..', 'public', 'images', imageName);
        // // Lưu ảnh trên server
        // await fs.writeFile(imagePath, file.buffer);
        // // Cập nhật đường dẫn ảnh trong cơ sở dữ liệu
        // await this.Food.updateOne(
        //     { _id: foodId },
        //     { $set: { image: '/images/' + imageName } }
        // );
        // return await this.findById(foodId);
        return result;
    }
    async find(filter) {
        const cursor = await this.PartyType.find(filter);
        return await cursor.toArray();
    }
    
    async findById(id) {
        return await this.PartyType.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async findOnePartyTypeOfService(id) {
        return await this.Food.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
            
        });
    }


    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = await this.extractPartyTypeData(payload);
        const result = await this.PartyType.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        console.log("rs", result)
        return result.value;
    }


    async delete(id) {
        const result = await this.PartyType.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }


}


module.exports = PartyTypeService;