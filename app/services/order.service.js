const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class OrderService {
  constructor(client) {
    this.Order = client.db().collection("orders");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

  async extractOrderData(payload) {
    const order = {
      service_id: new ObjectId(payload.cart.service_id),
      user_id: payload.user_id ? new ObjectId(payload.user_id) : null,
      event_date: payload.event_date,
      event_time: payload.event_time,
      tray_quantity: payload.tray_quantity,
      cart: payload.cart.items || [], //TODO can xem lai luc push cart ???
      note: payload.note,
      fullname: payload.fullname,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      payment: payload.payment,
      deposit: payload.deposit || 0,
      status: 0,
    };

    Object.keys(order).forEach(
      (key) => order[key] === undefined && delete order[key]
    );
    return order;
  }

  async create(payload) {
    const order = await this.extractOrderData(payload);
    order.createAt = new Date();
    order.updateAt = new Date();
    const result = await this.Order.insertOne(order);
    return result;
  }
  async find(filter) {
    const cursor = await this.Order.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Order.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  async findAllOrderOfService(service_id) {
    return await this.find({
      service_id: new ObjectId(service_id),
    });
  }
  async findOneOrderOfService(id, service_id) {
    return await this.Order.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      service_id: new ObjectId(service_id),
    });
  }
  async findOneOrderOfUser(id, user_id) {
    return await this.Order.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      user_id: new ObjectId(user_id),
    });
  }
  async findAllOrderOfUser(user_id) {
    return await this.find({
      user_id: new ObjectId(user_id),
    });
    // .sort({ createAt: 1 })
    // .lean();
  }
  async acceptOrder(orderId) {
    const filter = {
      _id: ObjectId.isValid(orderId) ? new ObjectId(orderId) : null,
    };
    const accept = await this.Order.findOneAndUpdate(
      filter,
      { $set: { status: 1, updateAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  async cancelOrder(orderId) {
    const filter = {
      _id: ObjectId.isValid(orderId) ? new ObjectId(orderId) : null,
    };
    const cancel = await this.Order.findOneAndUpdate(
      filter,
      { $set: { status: 2, updateAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  async cancelOrderForUser(orderId) {
    const filter = {
      _id: ObjectId.isValid(orderId) ? new ObjectId(orderId) : null,
    };
    const cancel = await this.Order.findOneAndUpdate(
      filter,
      { $set: { status: 3, updateAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  async update(id, service_id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      service_id: new ObjectId(service_id),
    };
    const update = await this.extractOrderData(payload);
    update.updateAt = new Date();
    const result = await this.Order.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }
  async updateCartInOrder(id, menu) {
    const result = await this.Order.updateOne(
      { _id: new ObjectId(id) },
      { $set: { cart: menu, updateAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value;
  }
}

module.exports = OrderService;
