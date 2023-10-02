const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");
const MenuService = require("../services/menu_of_service.service");
const ServiceProvider = require("../services/serviceProvider");
const UserService = require("../services/user.service");
const FoodService = require("../services/food.service");

exports.createMenu = async (req, res, next) => {
  try {
    const menuService = new MenuService(MongoDB.client);
    const document1 = await menuService.create(req.body, req.service.id);
    console.log(document1);
    return res.send(document1);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the User11111")
    );
  }
};

exports.addToMenuFood = async (req, res, next) => {
  const menu_id = req.params.id;

  try {
    const menuService = new MenuService(MongoDB.client);
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const menu = await menuService.findById(menu_id);

    const existingFood = menu.list.items.find(
      (item) => item.foodId.toString() === req.params.foodId
    );

    if (existingFood) {
      console.log("Food was exist in menu");
    } else {
      menu.list.items.push({
        foodId: new ObjectId(req.params.foodId),
      });
    }

    menu.list.total = await updateTotal(req, menu.list.items);
    await menuService.updateMenu(menu_id, menu.list);

    return res.send("add thành công menu cho food");
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};
exports.deleteMenu = async (req, res, next) => {
  try {
    const menu_id = req.params.id;
    const menuService = new MenuService(MongoDB.client);

    const menu = await menuService.delete(menu_id);

    return res.send("Xóa menu thành công");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};

exports.deleteFoodInMenu = async (req, res, next) => {
  const menu_id = req.params.id;
  const food_id = req.params.foodId;
  try {
    const menuService = new MenuService(MongoDB.client);
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const menu = await menuService.findById(menu_id);

    menu.list.items = menu.list.items.filter((item) => {
      return item.foodId.toString() !== food_id;
    });

    menu.list.total = await updateTotal(req, menu.list.items);
    await menuService.updateMenu(menu_id, menu.list);

    return res.send("Xóa món ăn thành công khỏi menu");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while deleting the food from the menu! ${error}`
      )
    );
  }
};

// TODO
exports.findAllFoodInMenu = async (req, res, next) => {
  const menu_id = req.params.id;
  const user_id = req.user.id;
  const service_id = req.params.service_id;
  // console.log("service_id", service_id);
  try {
    const menuService = new MenuService(MongoDB.client);
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const menu = await menuService.findById(menu_id);
    const userService = new UserService(MongoDB.client);
    const user = await userService.findById(user_id);

    for (const item of menu.list.items) {
      const isFoodIdInCart = user.cart.items[0].menu.some((item) =>
        item.foodId.equals(item.foodId)
      );

      if (isFoodIdInCart) {
        console.log("food existing");
      } else {
        user.cart.items[0].menu.push({
          foodId: new ObjectId(item.foodId),
        });
      }
    }
    user.cart.items[0].totalMenu = await updateCartTotal(
      req,
      user.cart.items[0].menu
    );
    await userService.updateCart(user_id, user.cart);
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

const updateTotal = async (req, items) => {
  const foodService = new FoodService(MongoDB.client);
  const total = await items.reduce(async (t, item) => {
    const food = await foodService.findOneFood(item.foodId, req.service.id);
    return (await t) + food.price;
  }, Promise.resolve(0));
  return total;
};
exports.updateNameMenu = async (req, res, next) => {
  try {
    menu_id = req.params.menu_id;
    const menuService = new MenuService(MongoDB.client);
    await menuService.updateNameMenu(menu_id, req.body.menu_name);
    return res.send("update thành công");
  } catch (error) {
    return next(new ApiError(500, `An error updated name menu! ${error}`));
  }
};

const updateCartTotal = async (req, items) => {
  const serviceProvider = new ServiceProvider(MongoDB.client);
  const total = await items.reduce(async (t, item) => {
    const food = await serviceProvider.findOneFood(
      req.params.service_id,
      item.foodId
    );
    return (await t) + food.price;
  }, Promise.resolve(0));
  return total;
};

exports.getAllFoodNotInOneMenu = async (req, res, next) => {
  service_id = req.service.id;
  menu_id = req.params.menu_id;
  try {
    const foodService = new FoodService(MongoDB.client);
    allFood = await foodService.findAllFoodOfService(service_id);
    const menuService = new MenuService(MongoDB.client);
    const menu = await menuService.findById(menu_id);
    const foodNotInMenu = [];

    for (const food of allFood) {
      const isInMenu = menu.list.items.some((menuItem) =>
        menuItem.foodId.equals(food._id)
      );

      if (!isInMenu) {
        foodNotInMenu.push(food);
      }
    }

    return res.send(foodNotInMenu);
  } catch (error) {
    return next(
      new ApiError(500, `An error get All food not in one menu! ${error}`)
    );
  }
};

exports.getMenuOfService = async (req, res, next) => {
  service_id = req.service.id;
  try {
    const menuService = new MenuService(MongoDB.client);
    const menu = await menuService.findAllMenuOfService(service_id);
    
    menu.sort((a, b) => {
      const dateA = new Date(a.createAt);
      const dateB = new Date(b.createAt);
      return dateB - dateA;
    });
   

    return res.send(menu);
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};

exports.getOneMenu = async (req, res, next) => {
  const menu_id = req.params.id;
  try {
    const menuService = new MenuService(MongoDB.client);
    const menu = await menuService.findById(menu_id);

    return res.send(menu);
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};

exports.getMenuOfServiceForUser = async (req, res, next) => {
  service_id = req.params.service_id;
  try {
    const menuService = new MenuService(MongoDB.client);
    const menu = await menuService.findAllMenuOfService(service_id);
    return res.send(menu);
  } catch (error) {
    return next(
      new ApiError(500, `An error occurred while creating the menu! ${error}`)
    );
  }
};
