const FoodService = require("../services/food.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const path = require("path");
const fs = require("fs");
const MenuService = require("../services/menu_of_service.service");
const UserService = require("../services/user.service");

exports.create = async (req, res, next) => {
  let service_id;
  if (!req.service) {
    service_id = req.params.service_id;
  } else {
    service_id = req.service.id;
  }
  if (!req.body?.food_name) {
    return next(new ApiError(400, "Food Name can not be empty!"));
  }
  try {
    const foodService = new FoodService(MongoDB.client);
    const imagePath = path.join(__dirname, "../../public/images");
    const stringDate = new Date().getTime();
    const filename = stringDate + "_" + req.file.originalname;
    const buffer = fs.readFileSync(req.file.path);
    fs.writeFile(`${imagePath}/${filename}`, buffer, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("File saved!");
    });

    req.body.image = filename;
    console.log("service_id", service_id);
    const document = await foodService.create(req.body, service_id);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the food!")
    );
  }
};

exports.findAllFoodOfService = async (req, res, next) => {
  let documents = [];
  let service_id;
  if (!req.service) {
    service_id = req.params.service_id;
  } else {
    service_id = req.service.id;
  }

  try {
    const foodService = new FoodService(MongoDB.client);
    const { food_name } = req.query;
    if (food_name) {
      documents = await foodService.findByName(food_name);
    } else {
      documents = await foodService.findAllFoodOfService(service_id);
    }
    documents.sort((a, b) => {
      const dateA = new Date(a.updateAt);
      const dateB = new Date(b.updateAt);
      return dateB - dateA;
    });
  } catch (error) {
    return next(new ApiError(500, "An error occured while retrieving food!"));
  }

  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  let service_id;
  if (!req.service) {
    service_id = req.params.service_id;
  } else {
    service_id = req.service.id;
  }
  try {
    const foodService = new FoodService(MongoDB.client);
    const document = await foodService.findOneFood(
      req.params.foodId,
      service_id
    );
    if (!document) {
      return next(new ApiError(404, "food not found!"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving food with id = ${req.params.foodId} !`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  let service_id;
  service_id = req.service.id;

  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty!"));
  }
  try {
    const foodService = new FoodService(MongoDB.client);
    const food = await foodService.findById(req.params.foodId);
    const oldImage = food.image;
    if (req.file) {
      if (oldImage) {
        const imagePath = path.join(__dirname, "../../public/images");
        const oldImagePath = path.join(imagePath, oldImage);
        fs.unlinkSync(oldImagePath); // Xóa ảnh cũ
      }
      const imagePath = path.join(__dirname, "../../public/images");
      const stringDate = new Date().getTime();
      const filename = stringDate + "_" + req.file.originalname;

      const buffer = fs.readFileSync(req.file.path);
      fs.writeFile(`${imagePath}/${filename}`, buffer, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("File saved!");
      });
      req.body.image = filename;
    } else {
      req.body.image = oldImage;
    }

    const document = await foodService.update(
      req.params.foodId,
      service_id,
      req.body
    );

    if (!document) {
      return next(new ApiError(404, "food not found!"));
    }
    return res.send({ message: "Food was updated successfully!" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating food with id = ${req.params.foodId} !`)
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
const updateCartTotal = async (service_id, items) => {
  const foodService = new FoodService(MongoDB.client);
  const total = await items.reduce(async (t, item) => {
    const food = await foodService.findOneFood(item.foodId, service_id);
    return (await t) + food.price;
  }, Promise.resolve(0));
  return total;
};

exports.delete = async (req, res, next) => {
  try {
    const foodService = new FoodService(MongoDB.client);
    const userService = new UserService(MongoDB.client);
    const menuService = new MenuService(MongoDB.client);
    const menus = await menuService.findMenusHasFoodIdToDelete(
      req.params.foodId
    );
    const users = await userService.findCartHasFoodIdToDelete(
      req.params.foodId
    );

    for (const user of users) {
      user.cart.items[0].menu = user.cart.items[0].menu.filter(
        (item) => item.foodId.toString() !== req.params.foodId
      );

      console.log("user", user.cart.items[0].menu);
      const service_id = user.cart.service_id;
      user.cart.items[0].totalMenu = await updateCartTotal(
        service_id,
        user.cart.items[0].menu
      );
      const document = await userService.updateCart(user._id, user.cart);
    }

    for (const menu of menus) {
      menu.list.items = menu.list.items.filter(
        (item) => item.foodId.toString() !== req.params.foodId
      );
      menu.list.total = await updateTotal(req, menu.list.items);
      await menuService.updateMenu(menu._id, menu.list);
    }
    await foodService.delete(req.params.foodId);
    return res.send({
      message: "Food was deleted successfully (Deleted this foodId in Menu)",
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete food with id = ${req.params.foodId} !`
      )
    );
  }
};
