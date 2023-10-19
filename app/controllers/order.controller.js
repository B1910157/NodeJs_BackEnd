const OrderService = require("../services/order.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const ServiceProvider = require("../services/serviceProvider");
const FoodService = require("../services/food.service");
const OtherService = require("../services/other.service");
const UserService = require("../services/user.service");
const { ObjectId } = require("mongodb");

//STATUS == 0 => new order
//STATUS == 1 => order accept
//STATUS == 2 => order cancel bt admin
//STATUS == 3 => order cancel by user

//STATUS == 4 => order successful (USER)?

const nodemailer = require("nodemailer");
const checkUser = require("../middlewares/check_user");
const DrinkService = require("../services/drink.service");
// Hàm để gửi email
const sendEmail = async (toEmail, subject, text) => {
  try {
    // Tạo một transporter (cấu hình tài khoản email gửi)
    const transporter = nodemailer.createTransport({
      service: "gmail", // Sử dụng dịch vụ Gmail
      auth: {
        user: "huutintin1312@gmail.com", // Email nguồn
        pass: "xozk rcvy ttlv tmts", // Mật khẩu email nguồn
      },
    });

    // Thông tin email
    const mailOptions = {
      from: "huutintin1312@gmail.com", // Email nguồn
      to: toEmail, // Email đích
      subject: subject, // Tiêu đề email
      html: `
        <div>${text}</div>
      `,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
function formatDateTime(dateTimeStr) {
  const date = new Date(dateTimeStr);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
function formatDate(inputDateStr) {
  const parts = inputDateStr.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  // Trả về chuỗi gốc nếu đầu vào không hợp lệ
  return inputDateStr;
}
exports.acceptOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const orderService = new OrderService(MongoDB.client);
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const order = await orderService.findById(orderId);
    service = await serviceProvider.findById(order.service_id);
    orderService.acceptOrder(orderId);
    const formattedCreateAt = formatDateTime(order.createAt);
    const formattedEventDate = formatDate(order.event_date);
    Title = "Email xác nhận đặt tiệc";
    let content =
      "Bạn vừa đặt tiệc thành công từ: " +
      "<b>" +
      service.service_name +
      "</b>" +
      "<br>" +
      "<b>THÔNG TIN DỊCH VỤ</b> <br>" +
      "<b>Email:</b> " +
      service.email +
      "<br>" +
      "<b>Số điện thoại:</b> " +
      service.phone +
      "<br>" +
      "<b>Địa chỉ:</b> " +
      service.address +
      "<br>" +
      "<b>THÔNG TIN ĐẶT TIỆC</b>" +
      "<br>" +
      "<b>Khách hàng:</b> " +
      order.fullname +
      "<br>" +
      "<b>Số điện thoại:</b> " +
      order.phone +
      "<br>" +
      "<b>Địa chỉ tiệc: </b>" +
      order.address +
      "<br>" +
      "<b>Ngày thực hiện:</b> " +
      formattedCreateAt +
      "<br>" +
      "<b>Ngày diễn ra:</b> " +
      formattedEventDate +
      "<b> Vào lúc: </b>" +
      order.event_time +
      "<br>";
    let menuContent = `
  <h3>Thực đơn</h3>
  <table border="1">
    <tr>
      <th>Số thứ tự</th>
      <th>Tên món ăn</th>
      <th>Giá</th>
    </tr>
`;

    order.cart[0].menu.forEach((menuItem, index) => {
      menuContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${menuItem.food_name}</td>
          <td>${menuItem.price} VND</td>
        </tr>
      `;
    });

    menuContent += `
    <tr>
      <td colspan="2">Tổng tiền thực đơn:</td>
      <td>${order.cart[0].totalMenu} VND/Bàn</td>
    </tr>
    </table>
    `;
    content += menuContent + "<br>";
    if (order.cart[1].drink.length > 0) {
      let drinkContent = "<h3>Đồ uống</h3><table border='1'>";
      order.cart[1].drink.forEach((drinkItem, index) => {
        drinkContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${drinkItem.drink_name}</td>
            <td>Số lượng: ${drinkItem.quantity}</td>
            <td>Giá: ${drinkItem.price} VND</td>
          </tr>
        `;
      });
      drinkContent += `
        <tr>
          <td colspan='3'>Tổng tiền đồ uống:</td>
          <td>${order.cart[1].totalDrink} VND</td>
        </tr>
      </table>`;
      // console.log("Drink", drinkContent);
      content += drinkContent + "<br>";
    }

    if (order.cart[2].other.length > 0) {
      let otherContent = "<h3>Khác:</h3><table border='1'>";
      order.cart[2].other.forEach((otherItem, index) => {
        otherContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${otherItem.other_name}</td>
            <td>Giá: ${otherItem.price} VND</td>
          </tr>
        `;
      });
      otherContent += `
        <tr>
          <td colspan='2'>Tổng tiền:</td>
          <td>${order.cart[2].totalOther} VND</td>
        </tr>
      </table>`;
      // console.log("Other", otherContent);
      content += otherContent + "<br>";
    }
    const totalOrder =
      parseInt(order.cart[0].totalMenu) * parseInt(order.tray_quantity) +
      parseInt(order.cart[1].totalDrink) +
      parseInt(order.cart[2].totalOther);

    let deposit = order.deposit;
    let depositSend = "";
    formatDeposit = deposit.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    if (order.paymentMethod === "vnpay") {
      depositSend = "Bạn đã thanh toán trước: " + formatDeposit + "<br>";
    } else if (order.paymentMethod === "paylater") {
      depositSend = "Bạn chọn thanh toán trực tiếp <br>";
    }
    // depositSend = "Bạn đã thanh toán trước: " + deposit;

    const formattedTotalOrder = totalOrder.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    content +=
      "<b>Số lượng bàn: </b>" +
      order.tray_quantity +
      "<br>" +
      "Tổng tiền theo đơn đặt tiệc của bạn: " +
      formattedTotalOrder +
      "<br>" +
      "Cảm ơn bạn đã sử dụng dịch vụ. Bạn có thể thanh toán đơn hàng trong phần <b> lịch sử đơn hàng </b> hoặc bạn có thể <b> thanh toán trực tiếp</b>" +
      "<br>" +
      "Bạn có thể hủy yêu cầu đặt tiệc trong vòng 24h" +
      "<br>" +
      ` <button style="background-color: #FF0000; color: white; padding: 5px 10px; border: none; cursor: pointer;">
    <a href="http://localhost:3001/notification/${orderId}" style="text-decoration: none; color: white;">Hủy</a>
  </button>`;

    sendEmail(
      "tinb1910157@student.ctu.edu.vn",
      "Phản hồi yêu cầu đặt tiệc",
      content
    );
    return res.send("Accept order successful");
  } catch (error) {}
};

exports.orderUserCancel = async (req, res, next) => {
  try {
    console.log("hihihihi", req.body, req.params.id, req.params.email);
    const orderId = req.params.id;
    // const order = await orderService.findById(orderId);
    email = req.params.email;
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);
    console.log("order", order);
    if (order.email == email) {
      console.log("HỢP LỆ -> CHO HỦY");
    } else if (order.email != email) {
      console.log("KHÔNG HỢP LỆ");
    }
  } catch (error) {}
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    console.log("body reason", req.body, orderId);

    const orderService = new OrderService(MongoDB.client);
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const order = await orderService.findById(orderId);
    service = await serviceProvider.findById(order.service_id);
    orderService.cancelOrder(orderId);
    let content = "<b>ĐƠN ĐẶT TIỆC KHÔNG THÀNH CÔNG</b><br>";
    content +=
      "Bạn vừa đặt tiệc của dịch vụ: " +
      service.service_name +
      "<b> không thành công </b>";
    if (req.body.reason) {
      content += "<b>Lý do: </b>" + req.body.reason + "<br>";
    }
    content +=
      "Vui lòng thử lại hoặc liên hệ đến chủ dịch vụ <br> Trân trọng!!!";
    //SEND MAIL CANCEL ORDER WITH REASON
    sendEmail(
      "tinb1910157@student.ctu.edu.vn",
      "Phản hồi yêu cầu đặt tiệc",
      content
    );
    return res.send("cancel order successful");
  } catch (error) {}
};

exports.cancelOrderByUser = async (req, res, next) => {
  try {
    orderId = req.params.orderId;
    const orderService = new OrderService(MongoDB.client);
    orderService.cancelOrderForUser(orderId);
    return res.send("cancel order by user successful");
  } catch (error) {}
};

exports.paymentWithUser = async (req, res, next) => {
  try {
    orderId = req.body.orderId;
    statusPayment = req.body.paymentMethod;
    console.log("Payment method: ", req.body);
    const orderService = new OrderService(MongoDB.client);
    let amount = req.body.amount;
    amount = amount / 100;
    orderService.updateStatusPayment(orderId, statusPayment, amount);
    return res.send("update status payment successful");
  } catch (error) {}
};

exports.addOrder = async (req, res, next) => {
  if (!req.body) {
    return next(new ApiError(400, "COntent can not be empty"));
  }
  try {
    let address = [];
    address =
      req.body.address_book +
      ", " +
      req.body.wardName +
      ", " +
      req.body.districtName +
      ", " +
      req.body.provinceName;

    req.body.address = address;

    const orderservice = new OrderService(MongoDB.client);
    const userService = new UserService(MongoDB.client);
    const document = await orderservice.create(req.body);
    if (req.body.user_id != null) {
      const user = await userService.findById(req.body.user_id);

      user.cart.service_id = null;
      user.cart.items[0].menu = [];
      user.cart.items[0].totalMenu = 0;
      user.cart.items[1].drink = [];
      user.cart.items[1].totalDrink = 0;
      user.cart.items[2].other = [];
      user.cart.items[2].totalOther = 0;
      const updatedUser = await userService.updateCartOfUser(
        req.body.user_id,
        user.cart
      );
    }

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the contact")
    );
  }
};
exports.findAllOrderOfUser = async (req, res, next) => {
  checkUser(req, res, async () => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
      //Nguoi dung vang lai

      TODO;
    } else {
      try {
        const orderService = new OrderService(MongoDB.client);
        const orders = await orderService.findAllOrderOfUser(req.user.id);
        orders.sort((a, b) => {
          const dateA = new Date(a.createAt);
          const dateB = new Date(b.createAt);
          return dateB - dateA;
        });

        return res.send(orders);
      } catch (error) {
        return next(new ApiError(500, "Error find All order"));
      }
    }
  });
};

exports.findAllOrderOfService = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);

    const orders = await orderService.findAllOrderOfService(req.service.id);
    orders.sort((a, b) => {
      const dateA = new Date(a.updateAt);
      const dateB = new Date(b.updateAt);
      return dateB - dateA;
    });

    return res.send(orders);
  } catch (error) {
    return next(new ApiError(500, "Error find All order"));
  }
};

exports.findOneOrderOfService = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const orderService = new OrderService(MongoDB.client);

    const order = await orderService.findOneOrderOfService(
      orderId,
      req.service.id
    );

    return res.send(order);
  } catch (error) {
    return next(new ApiError(500, "Error find All order"));
  }
};

exports.findOneOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const orderService = new OrderService(MongoDB.client);

    const order = await orderService.findById(orderId);

    return res.send(order);
  } catch (error) {
    return next(new ApiError(500, "Error find  order"));
  }
};

//UPDATE ORDER

exports.findFoodNotInOrder = async (req, res, next) => {
  service_id = req.service.id;
  orderId = req.params.orderId;
  try {
    const foodService = new FoodService(MongoDB.client);
    allFood = await foodService.findAllFoodOfService(service_id);
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);

    const foodNotInOrder = [];
    console.log("order", order.cart[0].menu);
    for (const food of allFood) {
      const isInMenu = order.cart[0].menu.some(
        (menuItem) => String(menuItem._id) === String(food._id)
      );

      if (!isInMenu) {
        foodNotInOrder.push(food);
      }
    }

    return res.send(foodNotInOrder);
  } catch (error) {
    return next(
      new ApiError(500, `An error get All food not in one menu! ${error}`)
    );
  }
};

exports.findDrinkNotInOrder = async (req, res, next) => {
  service_id = req.service.id;
  orderId = req.params.orderId;
  try {
    const drinkService = new DrinkService(MongoDB.client);
    allDrink = await drinkService.findAllDrinkOfService(service_id);
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);

    const foodNotInOrder = [];

    for (const food of allDrink) {
      const isInMenu = order.cart[1].drink.some(
        (menuItem) => String(menuItem._id) === String(food._id)
      );

      if (!isInMenu) {
        foodNotInOrder.push(food);
      }
    }

    return res.send(foodNotInOrder);
  } catch (error) {
    return next(
      new ApiError(500, `An error get All food not in one menu! ${error}`)
    );
  }
};

exports.findOtherNotInOrder = async (req, res, next) => {
  service_id = req.service.id;
  orderId = req.params.orderId;
  try {
    const otherService = new OtherService(MongoDB.client);
    allOther = await otherService.findAllOtherOfService(service_id);
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);

    const foodNotInOrder = [];
    console.log("other", order.cart[2].other);
    for (const food of allOther) {
      const isInMenu = order.cart[2].other.some(
        (menuItem) => String(menuItem._id) === String(food._id)
      );

      if (!isInMenu) {
        foodNotInOrder.push(food);
      }
    }

    return res.send(foodNotInOrder);
  } catch (error) {
    return next(
      new ApiError(500, `An error get All food not in one menu! ${error}`)
    );
  }
};

exports.addOrUpdateDrinkInCartOfOrder = async (req, res, next) => {
  const service_id = req.service.id;
  const orderId = req.params.orderId;

  if (!req.body?.drinkId || !req.body?.quantity) {
    return next(new ApiError(400, "id and quantity can not be empty!"));
  }
  try {
    const drinkService = new DrinkService(MongoDB.client);
    const drink = await drinkService.findById(req.body.drinkId);
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);

    const existingItem = order.cart[1].drink.find(
      (item) => item._id.toString() === req.body.drinkId
    );

    if (existingItem) {
      existingItem.quantity = req.body.quantity;
    } else {
      drink.quantity = req.body.quantity;
      order.cart[1].drink.push(drink);
    }

    order.cart[1].totalDrink = updateDrinkTotal(order.cart[1].drink);

    const document = await orderService.updateCartInOrder(orderId, order.cart);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while creating the product! ${error}`
      )
    );
  }
};

//add to field menu in my cart
exports.addFoodToCartInOrder = async (req, res, next) => {
  const service_id = req.service.id;
  const orderId = req.params.orderId;
  const foodId = req.params.foodId;
  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);
    const foodService = new FoodService(MongoDB.client);
    const food = await foodService.findById(foodId);
    const existingFood = order.cart[0].menu.find(
      (food) => food._id.toString() === foodId
    );

    if (existingFood) {
      console.log("Food was exist in my cart");
    } else {
      order.cart[0].menu.push(food);
    }

    order.cart[0].totalMenu = updateFoodTotal(order.cart[0].menu);
    const document = await orderService.updateCartInOrder(orderId, order.cart);

    return res.send({ foodId: order.cart });
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};

//add to field menu in my cart
exports.addOtherToCartInOrder = async (req, res, next) => {
  const service_id = req.service.id;
  const orderId = req.params.orderId;
  const otherId = req.params.otherId;
  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);
    const otherService = new OtherService(MongoDB.client);
    const other = await otherService.findById(otherId);
    const existingFood = order.cart[2].other.find(
      (food) => food._id.toString() === otherId
    );

    if (existingFood) {
      console.log("Food was exist in my cart");
    } else {
      order.cart[2].other.push(other);
    }

    order.cart[2].totalOther = updateOtherTotal(order.cart[2].other);
    const document = await orderService.updateCartInOrder(orderId, order.cart);

    return res.send({ foodId: order.cart });
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};

function updateFoodTotal(menu) {
  let total = 0;
  for (const food of menu) {
    total += food.price;
  }
  return total;
}

function updateOtherTotal(menu) {
  let total = 0;
  for (const food of menu) {
    total += food.price;
  }
  return total;
}

function updateDrinkTotal(menu) {
  let total = 0;
  for (const drink of menu) {
    total = total + drink.price * drink.quantity;
  }
  return total;
}
//Remove each food in field menu of order
exports.removeFoodInOrder = async (req, res, next) => {
  const foodId = req.params.foodId;
  const service_id = req.service.id;
  const orderId = req.params.orderId;

  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);
    order.cart[0].menu = order.cart[0].menu.filter(
      (food) => String(food._id) !== String(foodId)
    );

    order.cart[0].totalMenu = updateFoodTotal(order.cart[0].menu);

    const document = await orderService.updateCartInOrder(orderId, order.cart);
    return res.send("Xóa món ăn thành công khỏi menu trong order");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};

exports.removeDrinkInOrder = async (req, res, next) => {
  const drinkId = req.params.drinkId;
  const service_id = req.service.id;
  const orderId = req.params.orderId;

  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);
    order.cart[1].drink = order.cart[1].drink.filter(
      (drink) => String(drink._id) !== String(drinkId)
    );

    order.cart[1].totalDrink = updateDrinkTotal(order.cart[1].drink);

    const document = await orderService.updateCartInOrder(orderId, order.cart);
    return res.send("Xóa món ăn thành công khỏi menu trong order");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};
exports.removeOtherInOrder = async (req, res, next) => {
  const otherId = req.params.otherId;
  const service_id = req.service.id;
  const orderId = req.params.orderId;

  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);
    order.cart[2].other = order.cart[2].other.filter(
      (food) => String(food._id) !== String(otherId)
    );

    order.cart[2].totalOther = updateOtherTotal(order.cart[2].other);

    const document = await orderService.updateCartInOrder(orderId, order.cart);
    return res.send("Xóa món thành công khỏi menu trong order");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};
