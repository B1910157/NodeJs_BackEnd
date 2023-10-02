const DrinkService = require("../services/drink.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const path = require("path");
const fs = require("fs");

exports.create = async (req, res, next) => {
  let service_id;
  if (!req.service) {
    service_id = req.params.service_id;
  } else {
    service_id = req.service.id;
  }
  if (!req.body?.drink_name) {
    return next(new ApiError(400, "Drink Name can not be empty!"));
  }
  try {
    const drinkService = new DrinkService(MongoDB.client);
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
    const document = await drinkService.create(req.body, service_id);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the drink!")
    );
  }
};

exports.findAllDrinkOfService = async (req, res, next) => {
  let documents = [];
  let service_id;
  if (!req.service) {
    service_id = req.params.service_id;
  } else {
    service_id = req.service.id;
  }
 
  try {
    const drinkService = new DrinkService(MongoDB.client);
    const { drink_name } = req.query;
    
    if (drink_name) {
      documents = await drinkService.findByName(drink_name);
    } else {
      documents = await drinkService.findAllDrinkOfService(service_id);
    }
   
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving drink!"));
  }

 
};



exports.findOneDrink = async (req, res, next) => {
  try {
    const drinkService = new DrinkService(MongoDB.client);
    const document = await drinkService.findById(
      req.params.drinkId
    
    );
    if (!document) {
      return next(new ApiError(404, "drink not found!"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving drink with id = ${req.params.drinkId} !`
      )
    );
  }
};

exports.findOne = async (req, res, next) => {
  let service_id;
  if (!req.service) {
    service_id = req.params.service_id;
  } else {
    service_id = req.service.id;
  }
  try {
    const drinkService = new DrinkService(MongoDB.client);
    const document = await drinkService.findOneDrink(
      req.params.drinkId,
      service_id
    );
    if (!document) {
      return next(new ApiError(404, "drink not found!"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving drink with id = ${req.params.drinkId} !`
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
    const drinkService = new DrinkService(MongoDB.client);
    const drink = await drinkService.findById(req.params.drinkId);
    const oldImage = drink.image;
    if (req.file) {
      if (oldImage) {
        const imagePath = path.join(__dirname, "../../public/images");
        const oldImagePath = path.join(imagePath, oldImage);
        fs.unlinkSync(oldImagePath); // Xóa ảnh cũ
      }
      const imagePath = path.join(__dirname, "../../public/images");
      const stringDate = new Date().getTime();
      const filename = stringDate + "_" + req.file.originalname;
      //đọc file từ bộ đệm;
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

    const document = await drinkService.update(
      req.params.drinkId,
      service_id,
      req.body
    );

    if (!document) {
      return next(new ApiError(404, "drink not found!"));
    }
    return res.send({ message: "drink was updated successfully!" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating drink with id = ${req.params.drinkId} !`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const drinkService = new DrinkService(MongoDB.client);
    const document = await drinkService.delete(req.params.drinkId);
    if (!document) {
      return next(new ApiError(404, "drink not found!"));
    }
    return res.send({ message: "drink was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete drink with id = ${req.params.drinkId} !`
      )
    );
  }
};
