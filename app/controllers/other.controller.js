const OtherService = require("../services/other.service");
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
  if (!req.body?.other_name) {
    return next(new ApiError(400, "Other Name can not be empty!"));
  }
  try {
    const otherService = new OtherService(MongoDB.client);
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
    const document = await otherService.create(req.body, service_id);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the other!")
    );
  }
};

exports.findAllOtherOfService = async (req, res, next) => {
  let documents = [];
  let service_id;
  if (!req.service) {
    service_id = req.params.service_id;
  } else {
    service_id = req.service.id;
  }

  try {
    const otherService = new OtherService(MongoDB.client);
    const { other_name } = req.query;
    if (other_name) {
      documents = await otherService.findByName(other_name);
    } else {
      documents = await otherService.findAllOtherOfService(service_id);
    }
    documents.sort((a, b) => {
      const dateA = new Date(a.updateAt);
      const dateB = new Date(b.updateAt);
      return dateB - dateA;
    });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving other!"));
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
    const otherService = new OtherService(MongoDB.client);
    const document = await otherService.findOneOther(
      req.params.otherId,
      service_id
    );
    if (!document) {
      return next(new ApiError(404, "other not found!"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving other with id = ${req.params.otherId} !`
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
    const otherService = new OtherService(MongoDB.client);
    const other = await otherService.findById(req.params.otherId);
    const oldImage = other.image;
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

    const document = await otherService.update(
      req.params.otherId,
      service_id,
      req.body
    );

    if (!document) {
      return next(new ApiError(404, "other not found!"));
    }
    return res.send({ message: "other was updated successfully!" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating other with id = ${req.params.otherId} !`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const otherService = new OtherService(MongoDB.client);
    const document = await otherService.delete(req.params.otherId);
    if (!document) {
      return next(new ApiError(404, "other not found!"));
    }
    return res.send({ message: "other was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete other with id = ${req.params.otherId} !`
      )
    );
  }
};
