const OrderService = require("../services/order.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const ServiceProvider = require("../services/serviceProvider");
const FoodService = require("../services/food.service");
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
const sendEmail = async (toEmail, subject, text, orderId) => {
  try {
    // Tạo một transporter (cấu hình tài khoản email gửi)
    const transporter = nodemailer.createTransport({
      service: "gmail", // Sử dụng dịch vụ Gmail
      auth: {
        user: "huutintin1312@gmail.com", // Email nguồn
        pass: "xozk rcvy ttlv tmts", // Mật khẩu email nguồn
      },
    });

    console.log(toEmail, subject, text);

    // Thông tin email
    const mailOptions = {
      from: "huutintin1312@gmail.com", // Email nguồn
      to: toEmail, // Email đích
      subject: subject, // Tiêu đề email
      html: `
        <p>${text}</p>
        <p>Order ID: 123</p>
        <a href="http://localhost:3000/api/user_orders/cancel/${toEmail}/${orderId}">Hủy Hủy</a>
        <form id="cancelOrderForm" action="http://localhost:3000/api/user_orders/cancel/${toEmail}/${orderId}" method="POST">
  <input type="hidden" name="orderId" value="${orderId}">
  <button type="submit">Hủy đơn hàng</button>
    </form>
      `, // Nội dung email (dạng HTML) with a Cancel Order button
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

exports.acceptOrder = async (req, res, next) => {
  try {
    orderId = req.params.orderId;
    const orderService = new OrderService(MongoDB.client);
    const serviceProvider = new ServiceProvider(MongoDB.client);
    order = await orderService.findById(orderId);
    service = await serviceProvider.findById(order.service_id);
    orderService.acceptOrder(orderId);
    console.log("orderrrrr", order);
    Title = "Email xác nhận đặt tiệc";

    let menuContent = "Menu của bạn:\n";
    order.cart[0].menu.forEach((menuItem, index) => {
      menuContent += `${index + 1}. ${menuItem.food_name}: ${
        menuItem.price
      } VND\n`;
    });
    menuContent += `Tổng tiền Menu: ${order.cart[0].totalMenu} VND/Bàn\n`;
    console.log("Menu ", menuContent);
    if (order.cart[1].drink) {
      let drinkContent = "Đồ uống của bạn:\n";
      order.cart[1].drink.forEach((drinkItem, index) => {
        drinkContent += `${index + 1}. ${drinkItem.drink_name} - Số lượng: ${
          drinkItem.quantity
        } - Giá:${drinkItem.price} VND\n`;
      });
      drinkContent += `Tổng tiền đồ uống: ${order.cart[1].totalDrink} VND\n`;
      console.log("Drink", drinkContent);
    }
    if (order.cart[2].other) {
      let otherContent = "Khác:\n";
      order.cart[2].other.forEach((otherItem, index) => {
        otherContent += `${index + 1}. ${otherItem.other_name}  - Giá:${
          otherItem.price
        } VND\n`;
      });
      otherContent += `Tổng tiền: ${order.cart[2].totalOther} VND\n`;
      console.log("other", otherContent);
    }

    // Content = service.service_name + "hân hạnh phục vụ khách hàng.";

    sendEmail("tinb1910157@student.ctu.edu.vn", "Hello", menuContent, orderId);
    return res.send("Accept order successful");
  } catch (error) {}
};

exports.orderUserCancel = async (req, res, next) => {
  try {
    console.log("hihihihi", req.body, req.params.id, req.params.email);
    const orderId = req.params.id;
    email = req.params.email;
    const orderService = new OrderService(MongoDB.client);
    order = await orderService.findById(orderId);
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
    orderId = req.params.orderId;
    const orderService = new OrderService(MongoDB.client);
    orderService.cancelOrder(orderId);
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
function updateFoodTotal(menu) {
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
