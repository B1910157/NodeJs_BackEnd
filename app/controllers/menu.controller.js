const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");
const UserService = require("../services/user.service");

exports.addToMenuFood = async (req, res, next) => {
  // user_id = req.user.id;
  //   food_id = '6470499916a430589e1e24f3';
  user_id = "64705bfdcebbd53517478b4c";
  if (!req.body?.food_id) {
    return next(new ApiError(400, "id can not be empty!"));
  }
  try {
    const userService = new UserService(MongoDB.client);
    // const productService = new ProductService(MongoDB.client);
    const user = await userService.findById(user_id);
    // const existingItem = user.menu.items.find(
    //     item => item.productId.toString() === req.body.productId
    // );
    // if (existingItem) {
    //     existingItem.quantity += req.body.quantity;
    // }
    // else {
    //     user.cart.items.push({
    //         productId: new ObjectId(req.body.productId),
    //         quantity: req.body.quantity,
    //     });
    // }
    console.log(req.body);
    //Tìm menu có type là food
    const foodMenu = user.menu.items.find((item) => item.type === "food");
    console.log("menu1", foodMenu);

    if (foodMenu) {
      //   const foodIdObject = { food_id: new Object(req.body.food_id) };
      ;
      const a = user.menu.items
        .find((item) => item.type === "food")
        .items.push({ food_id: new ObjectId(req.body.food_id) });
      //   const foodItems = user.menu.items.filter((item) => item.type === "food");
      //   console.log("menu2", user.menu.items);
      //   console.log("menu3", foodItems);
      console.log("a", foodMenu);
    } else {
      console.log("Menu 'food' not found!");
    }

    // update total
    // user.cart.total = await user.cart.items.reduce(async (t, item) => {
    //     const product = await productService.findById(item.productId);
    //     return (await t) + (product.price * item.quantity);
    // }, Promise.resolve(0));

    // user.menu.total = await updateTotal(user.menu.items);
    // const document = await userService.updateMenu(
    //   user_id,
    //   user.menu.items.find((item) => item.type === "food")
    // );

    const document = await userService.updateMenu(
        user_id,
        user.menu
      );
    return res.send("add thành công menu cho food");
  } catch (error) {
    return next(
      new ApiError(
        500,
        `An error occurred while creating the product! ${error}`
      )
    );
  }
};
