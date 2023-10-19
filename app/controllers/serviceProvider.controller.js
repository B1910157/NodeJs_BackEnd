const ServiceProvider = require("../services/serviceProvider");
const { client } = require("../utils/mongodb.util");

const MongoDB = require("../utils/mongodb.util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");
const path = require("path");
const fs = require("fs");

exports.create = async (req, res, next) => {
  if (!req.body?.email) {
    return next(new ApiError(400, "Email can not be empty"));
  }

  if (!req.body?.password) {
    return next(new ApiError(400, "Password can not be empty"));
  }
  if (!req.body?.support_area || !req.body?.support_party_type) {
    return next(
      new ApiError(400, "support area or support party type not be empty")
    );
  }
  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);

    const document = await serviceProvider.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the service")
    );
  }
};

exports.login = async (req, res, next) => {
  console.log(req.body);
  if (!req.body?.email || !req.body?.password) {
    return next(new ApiError(400, "Input email/password"));
  }
  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findEmail(req.body.email);
    const comparePass = await bcrypt.compare(
      req.body.password,
      service.password
    );
    if (!service) {
      return next(new ApiError(401, "Email Service notfound"));
    } else if (!comparePass) {
      return next(new ApiError(400, "Password fail"));
    } else {
      const token = jwt.sign({ id: service._id }, "secret", {
        expiresIn: 864000,
      });
      return res.send({
        status: "success",
        message: "Login successfully",
        token: token,
      });
    }
  } catch (error) {
    return next(new ApiError(500, "Login error"));
  }
};

exports.logout = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    console.log(auth);
    if (!auth) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const token = auth.split(" ")[1];
    const decoded_service = jwt.decode(token);
    console.log("decoded: ", decoded_service);
    return res.send({ message: "Logout success" });
  } catch (error) {
    return next(new ApiError(500, "logout fail"));
  }
};

exports.changeImage = async (req, res, next) => {
  // console.log("tới đây: change image", req.body.image);
  const service_id = req.service.id;
  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(service_id);

    let oldImage = null;
    let imageReal = null;
    if (service.image) {
      oldImage = service.image;
    }

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

      imageReal = filename;
    } else {
      imageReal = oldImage;
    }

    const document = await serviceProvider.changeImage(service_id, imageReal);

    if (!document) {
      return next(new ApiError(404, "service not found!"));
    }
    return res.send({ message: "Change image successfully!" });
  } catch (error) {
    return next(new ApiError(500, `Error change image service !`));
  }
};

//Cap nhat thong tin ca nhan
exports.updateInfo = async (req, res, next) => {
  const service_id = req.service.id;
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const serviceService = new ServiceProvider(MongoDB.client);
    console.log("iddd", service_id);

    const document = await serviceService.updateServiceInfo(
      service_id,
      req.body
    );

    if (!document) {
      return next(new ApiError(404, "service not found"));
    }
    return res.send({ message: "InfoOfService was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating user with userid=${service_id}`)
    );
  }
};

//Tim dich vu dua vao id
exports.findOneService = async (req, res, next) => {
  try {
    let service_id = "";
    if (req.service) {
      service_id = req.service.id;
    } else {
      service_id = req.params.service_id;
    }

    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(service_id);
    console.log(service);
    if (!service) {
      return next(new ApiError(404, "Service not found"));
    }
    return res.send(service);
  } catch (err) {
    return next(
      new ApiError(500, `Error find service whit id = ${service_id}`)
    );
  }
};

exports.findAllService = async (req, res, next) => {
  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const document = await serviceProvider.findAllService();
    document.sort((a, b) => {
      const dateA = new Date(a.updateAt);
      const dateB = new Date(b.updateAt);
      return dateB - dateA;
    });
    return res.send(document);
    // return res.send(`Inserted new service have Id: ${document.insertedId}`);
  } catch (error) {
    return next(new ApiError(500, "findAllService error"));
  }
};

//Food
exports.addFood = async (req, res, next) => {
  try {
    const serviceId = req.service.id;
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Service not found"));
    }

    const addFood = await serviceProvider.createFood(serviceId, req.body);

    return res.send(addFood);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the foood")
    );
  }
};

exports.addOther = async (req, res, next) => {
  try {
    const serviceId = req.service.id;
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Service not found"));
    }
    console.log("oayload: ", req.body);
    const addOther = await serviceProvider.createOther(serviceId, req.body);
    console.log("helalala:", addOther);
    return res.send(addOther);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the other")
    );
  }
};

//tim 1 mon an cua dich vu => trên vai trò của dịch vụ
exports.findOneFoodWithUser = async (req, res, next) => {
  try {
    const serviceId = req.params.service_id;
    const foodId = req.params.foodId;
    console.log("conta", foodId);

    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Service not found"));
    }
    const food = await serviceProvider.findOneFood(serviceId, foodId);
    if (!food) {
      return next(new ApiError(404, "Food not found"));
    }
    return res.send(food);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving the food")
    );
  }
};

//tim 1 mon an cua dich vu => trên vai trò của dịch vụ
exports.findOneFood = async (req, res, next) => {
  try {
    const serviceId = req.service.id;
    const foodId = req.params.id;
    console.log("conta", foodId);

    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Service not found"));
    }
    const food = await serviceProvider.findOneFood(serviceId, foodId);
    if (!food) {
      return next(new ApiError(404, "Food not found"));
    }
    return res.send(food);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving the food")
    );
  }
};

exports.findOneOther = async (req, res, next) => {
  try {
    const serviceId = req.service.id;
    const otherId = req.params.id;
    console.log("contact", otherId);

    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Service not found"));
    }

    console.log("hi");
    const other = await serviceProvider.findOneOther(serviceId, otherId);

    console.log("findOne", other);
    if (!other) {
      return next(new ApiError(404, "other not found"));
    }
    return res.send(other);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving the other")
    );
  }
};

exports.findAllFood = async (req, res, next) => {
  let foods = [];
  try {
    const serviceId = req.service.id;

    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Food not found"));
    }

    foods = await serviceProvider.findAllFoodOfService(serviceId);
    return res.send(foods);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving foods"));
  }
};

exports.findAllOther = async (req, res, next) => {
  let others = [];
  try {
    const serviceId = req.service.id;
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const service = await serviceProvider.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "other not found"));
    }

    others = await serviceProvider.findAllOtherOfService(serviceId);
    return res.send(others);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving others"));
  }
};

exports.deleteOneFood = async (req, res, next) => {
  const serviceId = req.service.id;
  console.log("service ne: ", serviceId);
  const foodId = req.params;
  console.log("food:", foodId);
  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const deleteOne = await serviceProvider.deleteOneFood(serviceId, foodId);
    if (!deleteOne) {
      return next(new ApiError(404, "food not found"));
    }
    return res.send({ message: "Delete success" });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while delete the food"));
  }
};
exports.deleteOneOther = async (req, res, next) => {
  const serviceId = req.service.id;
  console.log("service ne: ", serviceId);
  const otherId = req.params;
  console.log("other:", otherId);
  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const deleteOne = await serviceProvider.deleteOneOther(serviceId, otherId);
    if (!deleteOne) {
      return next(new ApiError(404, "other not found"));
    }
    return res.send({ message: "Delete success" });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while delete the other"));
  }
};

exports.deleteAllFood = async (req, res, next) => {
  const serviceId = req.service.id;

  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const deleteAll = await serviceProvider.deleteAllFood(serviceId);
    return res.send({ message: "Delete All contact success" });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while deleteall the contact")
    );
  }
};

exports.deleteAllOther = async (req, res, next) => {
  const serviceId = req.service.id;

  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const deleteAll = await serviceProvider.deleteAllOther(serviceId);
    return res.send({ message: "Delete All contact success" });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while deleteall the contact")
    );
  }
};

exports.updateOneFood = async (req, res, next) => {
  const serviceId = req.service.id;
  const foodId = req.params;
  if (!req.body.food_name) {
    return next(new ApiError(400, "Name can not be empty"));
  }

  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const document = await serviceProvider.updateOneFood(
      serviceId,
      foodId,
      req.body
    );

    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while updating the food"));
  }
};

exports.updateOneOther = async (req, res, next) => {
  const serviceId = req.service.id;
  const otherId = req.params;
  if (!req.body.other_name) {
    return next(new ApiError(400, "Name can not be empty"));
  }

  try {
    const serviceProvider = new ServiceProvider(MongoDB.client);
    const document = await serviceProvider.updateOneOther(
      serviceId,
      otherId,
      req.body
    );

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while updating the other")
    );
  }
};
