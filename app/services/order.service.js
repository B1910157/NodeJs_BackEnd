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
      tray_quantity: parseInt(payload.tray_quantity),
      cart: payload.cart.items || [], //TODO can xem lai luc push cart ???
      note: payload.note,
      fullname: payload.fullname,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      payment: payload.payment,
      deposit: parseInt(payload.deposit) || 0,
      percentPayment: payload.percentPayment,
      total: parseInt(payload.total) || 0,
      status: 0,
      statusPayment: 0,
      paymentMethod: payload.paymentMethod || "",
      statusUpdate: 0,
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

  async findOrdersByDate(targetDate) {
    // Chuyển đổi targetDate từ chuỗi ngày thành đối tượng Date (nếu cần)
    // const dateObject = new Date(targetDate);

    // Sử dụng phương thức find() để tìm các đơn hàng có service_id và ngày giống với targetDate
    const orders = await this.find({
      event_date: targetDate, // Điều này cần điều chỉnh tùy vào cấu trúc dữ liệu của bạn
    });

    return orders;
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

  async addSurcharges(orderId, data) {
    const filter = {
      _id: ObjectId.isValid(orderId) ? new ObjectId(orderId) : null,
    };
    const accept = await this.Order.findOneAndUpdate(
      filter,
      { $set: { surcharges: data, updateAt: new Date() } },
      { returnDocument: "after" }
    );
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
  async updateStatusUpdate(orderId, status) {
    const filter = {
      _id: ObjectId.isValid(orderId) ? new ObjectId(orderId) : null,
    };
    if (status == 1) {
      const cancel = await this.Order.findOneAndUpdate(
        filter,
        {
          $set: {
            statusUpdate: 0,
            updateAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
    } else if (status == 0) {
      const cancel2 = await this.Order.findOneAndUpdate(
        filter,
        {
          $set: {
            statusUpdate: 1,
            updateAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
    }
  }

  async updateInfoParty(orderId, info) {
    const filter = {
      _id: ObjectId.isValid(orderId) ? new ObjectId(orderId) : null,
    };
    const cancel = await this.Order.findOneAndUpdate(
      filter,
      {
        $set: {
          fullname: info.fullname,
          email: info.email,
          phone: info.phone,
          event_date: info.event_date,
          event_time: info.event_time,
          address: info.address,
          tray_quantity: info.tray_quantity,
          total: info.total,
          surcharges: info.surcharges,
          updateAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
  }

  async updateStatusPayment(orderId, status, amount) {
    const filter = {
      _id: ObjectId.isValid(orderId) ? new ObjectId(orderId) : null,
    };
    const cancel = await this.Order.findOneAndUpdate(
      filter,
      {
        $set: {
          deposit: parseInt(amount),
          paymentMethod: status,
          statusPayment: 1,
          updateAt: new Date(),
        },
      },
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
