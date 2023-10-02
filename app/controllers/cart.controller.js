const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");
const MenuService = require("../services/menu_of_service.service");
const ServiceProvider = require("../services/serviceProvider");
const UserService = require("../services/user.service");
const FoodService = require("../services/food.service");
const DrinkService = require("../services/drink.service");
const OtherService = require("../services/other.service");

const checkUser = require("../middlewares/check_user");
exports.chooseService = async (req, res, next) => {
  checkUser(req, res, async () => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");

      TODO;
    } else {
      try {
        const service_id = req.params.service_id;
        const userService = new UserService(MongoDB.client);
        const serviceProvider = new ServiceProvider(MongoDB.client);
        const service = await serviceProvider.findById(service_id);
        const user = await userService.findById(req.user.id);

        const ServiceInCart = user.cart.service_id;
        if (ServiceInCart && ServiceInCart == service_id) {
          console.log("Có rồi");
        } else if (ServiceInCart && ServiceInCart != service_id) {
          console.log("Có rồi mà khác với cái đang chọn...be careful");
        } else {
          user.cart.service_id = new ObjectId(service_id);

          const updatedUser = await userService.updateCartOfUser(
            req.user.id,
            user.cart
          );
        }

        return res.send("Added service to cart successfully");
      } catch (error) {
        return next(
          new ApiError(
            500,
            `An error occurred while adding service to cart! ${error}`
          )
        );
      }
    }
  });
};

exports.removeService = async (req, res, next) => {
  checkUser(req, res, async () => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
      //Sử dụng localStorage để lưu cart

      TODO;
    } else {
      const service_id = req.params.service_id;
      try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(req.user.id);

        if (user.cart) {
          user.cart.service_id = null;

          user.cart.items[0].menu = [];
          user.cart.items[0].totalMenu = await updateCartTotal(
            req,
            user.cart.items[0].menu
          );
          user.cart.items[1].drink = [];
          user.cart.items[1].totalDrink = await updateCartTotal(
            req,
            user.cart.items[1].drink
          );

          user.cart.items[2].other = [];
          user.cart.items[2].totalOther = await updateCartOtherTotal(
            service_id,
            user.cart.items[2].other
          );

          await userService.updateCartOfUser(req.user.id, user.cart);
          return res.send("Remove the service from the cart");
        } else {
          return res.send("My cart is empty!!");
        }
      } catch (error) {
        return next(
          new ApiError(
            500,
            `An error occurred while removing service from cart! ${error}`
          )
        );
      }
    }
  });
};

//add to field menu in my cart
exports.addFoodToCart = async (req, res, next) => {
  const service_id = req.params.service_id;
  const user_id = req.user.id;
  const foodId = req.params.foodId;

  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(req.user.id);

    const existingFood = user.cart.items[0].menu.find(
      (food) => food.foodId.toString() === foodId
    );

    if (existingFood) {
      console.log("Food was exist in my cart");
    } else {
      user.cart.items[0].menu.push({
        foodId: new ObjectId(foodId),
      });
    }
    user.cart.items[0].totalMenu = await updateCartTotal(
      service_id,
      user.cart.items[0].menu
    );
    const document = await userService.updateCart(user_id, user.cart);

    return res.send({ foodId: user.cart });
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};

//add to field other in my cart
exports.addOtherToCart = async (req, res, next) => {
  const service_id = req.params.service_id;
  const user_id = req.user.id;
  const otherId = req.params.otherId;

  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(user_id);

    const existingOther = user.cart.items[2].other.find(
      (other) => other.otherId.toString() === otherId
    );

    if (existingOther) {
      console.log("Other was exist in my cart");
    } else {
      user.cart.items[2].other.push({
        otherId: new ObjectId(otherId),
      });
    }
    console.log(user.cart.items[2].other);
    console.log("other id", otherId);
    user.cart.items[2].totalOther = await updateCartOtherTotal(
      service_id,
      user.cart.items[2].other
    );
    const document = await userService.updateCart(user_id, user.cart);

    return res.send({ otherId: user.cart });
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};

//Remove each food in field menu of my cart
exports.removeOtherInCart = async (req, res, next) => {
  const user_id = req.user.id;
  const otherId = req.params.otherId;
  const service_id = req.params.service_id;

  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(req.user.id);
    console.log(user.cart.items[2].other);
    user.cart.items[2].other = user.cart.items[2].other.filter(
      (other) => other.otherId.toString() !== otherId
    );

    user.cart.items[2].totalOther = await updateCartOtherTotal(
      service_id,
      user.cart.items[2].other
    );
    const document = await userService.updateCart(user_id, user.cart);
    return res.send("Deleted successfully");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};

//Remove each food in field menu of my cart
exports.removeFoodInCart = async (req, res, next) => {
  const user_id = req.user.id;
  const foodId = req.params.foodId;
  const service_id = req.params.service_id;

  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(req.user.id);
    console.log(user.cart.items[0].menu);
    user.cart.items[0].menu = user.cart.items[0].menu.filter(
      (food) => food.foodId.toString() !== foodId
    );

    user.cart.items[0].totalMenu = await updateCartTotal(
      service_id,
      user.cart.items[0].menu
    );
    const document = await userService.updateCart(user_id, user.cart);
    return res.send("Xóa món ăn thành công khỏi menu trong cart");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};

// Thêm món ăn từ menu của dịch vụ vào menu trong cart của người dùng
//add all food in menu of service enter the menu of cart
exports.addFoodFromMenu = async (req, res, next) => {
  const menu_id = req.params.menuId;
  const user_id = req.user.id;
  const service_id = req.params.service_id;

  try {
    const menuService = new MenuService(MongoDB.client);
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const menu = await menuService.findById(menu_id);
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(user_id);

    for (const item of menu.list.items) {
      const isFoodIdInCart = user.cart.items[0].menu.some((cartFood) =>
        cartFood.foodId.equals(item.foodId)
      );

      if (isFoodIdInCart) {
        console.log("food existing!!!");
      } else {
        user.cart.items[0].menu.push({
          foodId: new ObjectId(item.foodId),
        });
      }
    }

    user.cart.items[0].totalMenu = await updateCartTotal(
      service_id,
      user.cart.items[0].menu
    );
    const document = await userService.updateCart(user_id, user.cart);
    return res.send({ foodId: user.cart });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};

exports.addDrinkToCart = async (req, res, next) => {
  const service_id = req.params.service_id;
  const user_id = req.user.id;

  if (!req.body?.drinkId || !req.body?.quantity) {
    return next(new ApiError(400, "id and quantity can not be empty!"));
  }
  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(req.user.id);

    const existingItem = user.cart.items[1].drink.find(
      (item) => item.drinkId.toString() === req.body.drinkId
    );
    if (existingItem) {
      existingItem.quantity = req.body.quantity;
    } else {
      user.cart.items[1].drink.push({
        drinkId: new ObjectId(req.body.drinkId),
        quantity: req.body.quantity,
      });
    }

    user.cart.items[1].totalDrink = await updateCartDrinkTotal(
      service_id,
      user.cart.items[1].drink
    );

    const document = await userService.updateCart(user_id, user.cart);
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

exports.updateDrinkInCart = async (req, res, next) => {
  const service_id = req.params.service_id;
  const user_id = req.user.id;
  if (!req.body?.drinkId || !req.body?.quantity) {
    return next(new ApiError(400, "id and quantity can not be empty!"));
  }
  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(req.user.id);

    const existingItem = user.cart.items[1].drink.find(
      (item) => item.drinkId.toString() === req.body.drinkId
    );
    if (existingItem) {
      existingItem.quantity = req.body.quantity;
    }

    user.cart.items[1].totalDrink = await updateCartDrinkTotal(
      service_id,
      user.cart.items[1].drink
    );

    const document = await userService.updateCart(user_id, user.cart);
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

//Remove each drink in field menu of my cart
exports.removeDrinkInCart = async (req, res, next) => {
  const user_id = req.user.id;
  const service_id = req.params.service_id;
  const drinkId = req.params.drinkId;
  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(req.user.id);

    user.cart.items[1].drink = user.cart.items[1].drink.filter(
      (drink) => drink.drinkId.toString() !== drinkId
    );

    user.cart.items[1].totalDrink = await updateCartDrinkTotal(
      service_id,
      user.cart.items[1].drink
    );

    const document = await userService.updateCart(user_id, user.cart);

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the drink from the menu! ${error}`
      )
    );
  }
};

const updateCartOtherTotal = async (service_id, items) => {
  const otherService = new OtherService(MongoDB.client);
  const total = await items.reduce(async (t, item) => {
    const other = await otherService.findOneOther(item.otherId, service_id);
    return (await t) + other.price;
  }, Promise.resolve(0));
  return total;
};

const updateCartDrinkTotal = async (service_id, items) => {
  const drinkService = new DrinkService(MongoDB.client);
  const total = await items.reduce(async (t, item) => {
    const drink = await drinkService.findOneDrink(item.drinkId, service_id);

    return (await t) + drink.price * item.quantity;
  }, Promise.resolve(0));
  return total;
};

const updateCartTotal = async (service_id, items) => {
  const foodService = new FoodService(MongoDB.client);
  const total = await items.reduce(async (t, item) => {
    const food = await foodService.findOneFood(item.foodId, service_id);
    return (await t) + food.price;
  }, Promise.resolve(0));
  return total;
};

exports.findDrinkInCart = async (req, res, next) => {
  try {
    const userService = new UserService(MongoDB.client);
    const document = await userService.findById(req.user.id);
    if (!document) {
      return next(new ApiError(404, "User not found"));
    }
    console.log("cart123", document.cart.items[1].drink);
    return res.send(document.cart.items[1]);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving contact with id = ${req.user.id}`)
    );
  }
};

exports.findOtherInCart = async (req, res, next) => {
  let info = [];
  try {
    const userId = req.user.id;
    console.log("iduser", userId);
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    // const contactUserService = new ContactUserService(MongoDB.client);
    info = await userService.findOtherInCart(userId);
    return res.send(info);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving orders"));
  }
};

exports.findFoodInCartOfUser = async (req, res, next) => {
  let info = [];
  try {
    const userId = req.user.id;
    console.log("iduser", userId);
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    // const contactUserService = new ContactUserService(MongoDB.client);
    info = await userService.findFoodInCart(userId);
    return res.send(info);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving orders"));
  }
};
