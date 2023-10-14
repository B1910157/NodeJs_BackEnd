const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class MenuService {
  constructor(client) {
    this.Menu = client.db().collection("menus");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractMenuData(payload, service_id) {
    const menu = {
      service_id: new ObjectId(service_id),
      menu_name: payload.menu_name,
      list: { items: [], total: 0 },
      status: 0,
    };

    Object.keys(menu).forEach(
      (key) => menu[key] === undefined && delete menu[key]
    );

    return menu;
  }

  async updateNameMenu(id, nameMenu) {
    const result = await this.Menu.updateOne(
      { _id: new ObjectId(id) },
      { $set: { menu_name: nameMenu } },
      { returnDocument: "after" }
    );
    return result.value;
  }
  async updateMenu(id, list) {
    const result = await this.Menu.updateOne(
      { _id: new ObjectId(id) },
      { $set: { list: list } },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async create(payload, service_id) {
    const menu = await this.extractMenuData(payload, service_id);
    menu.createAt = new Date();
    menu.updateAt = new Date();
    const result = await this.Menu.insertOne(menu);
    return result;
  }
  async find(filter) {
    const cursor = await this.Menu.find(filter);
    return await cursor.toArray();
  }
  async findByName(menu_name) {
    return await this.find({
      menu_name: { $regex: new RegExp(menu_name), $options: "i" },
    });
  }
  async findById(id) {
    return await this.Menu.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  async findOneMenu(id, service_id) {
    return await this.Menu.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      service_id: new ObjectId(service_id),
    });
  }

  async findMenusHasFoodIdToDelete(foodId) {
    const menus = await this.Menu.aggregate([
      {
        $match: {
          "list.items.foodId": new ObjectId(foodId),
        },
      },
    ]).toArray();

    return menus;
  }

  //Tìm tất cả món ăn của một dịch vụ Cho User STATUS = 1
  async findAllMenuOfServiceByUser(service_id) {
    const pipeline = [
      {
        $match: {
          service_id: new ObjectId(service_id),
          status: 1,
        },
      },
      {
        $lookup: {
          from: "foods",
          localField: "list.items.foodId",
          foreignField: "_id",
          as: "foodInfo",
        },
      },
      {
        $group: {
          _id: "$_id",
          service_id: { $first: "$service_id" },
          menu_name: { $first: "$menu_name" },
          list: {
            $first: "$foodInfo",
          },
          total: {
            $first: "$list.total",
          },
          createAt: { $first: "$createAt" },
          updateAt: { $first: "$updateAt" },
        },
      },
    ];

    const result = await this.Menu.aggregate(pipeline);
    const rs = await result.toArray();

    return rs;
  }

  //Tìm tất cả món ăn của một dịch vụ
  async findAllMenuOfService(service_id) {
    const pipeline = [
      {
        $match: {
          service_id: new ObjectId(service_id),
        },
      },
      {
        $lookup: {
          from: "foods",
          localField: "list.items.foodId",
          foreignField: "_id",
          as: "foodInfo",
        },
      },
      {
        $group: {
          _id: "$_id",
          service_id: { $first: "$service_id" },
          menu_name: { $first: "$menu_name" },
          list: {
            $first: "$foodInfo",
          },
          total: {
            $first: "$list.total",
          },
          createAt: { $first: "$createAt" },
          updateAt: { $first: "$updateAt" },
          status: { $first: "$status" },
        },
      },
    ];

    const result = await this.Menu.aggregate(pipeline);
    const rs = await result.toArray();

    return rs;
  }
  async publishMenu(menuId, service_id) {
    const filter = {
      _id: ObjectId.isValid(menuId) ? new ObjectId(menuId) : null,
      service_id: new ObjectId(service_id),
    };
    const rs = await this.Menu.findOneAndUpdate(
      filter,
      { $set: { status: 1 } },
      { returnDocument: "after" }
    );
  }

  async hiddenMenu(menuId, service_id) {
    const filter = {
      _id: ObjectId.isValid(menuId) ? new ObjectId(menuId) : null,
      service_id: new ObjectId(service_id),
    };
    const rs = await this.Menu.findOneAndUpdate(
      filter,
      { $set: { status: 0 } },
      { returnDocument: "after" }
    );
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = await this.extractMenuData(payload);
    const result = await this.Menu.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result.value;
  }

  async delete(id) {
    const result = await this.Menu.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }
}

module.exports = MenuService;
