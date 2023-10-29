const EvaluateService = require("../services/evaluate.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");

exports.create = async (req, res, next) => {
  try {
    console.log("BODY có 3 thứ nè", req.body);
    const evaluateService = new EvaluateService(MongoDB.client);
    const userService = new UserService(MongoDB.client);
    //tìm đánh giá của user tại nhà hàng
    const evaluate = await evaluateService.findByIdUser(
      req.body.user_id,
      req.body.service_id
    );

    if (evaluate != null) {
      const rs = await evaluateService.update(
        req.body.user_id,
        req.body.service_id,
        req.body
      );

      return res.send(evaluate);
    } else {
      const documents = await evaluateService.create(req.body);
      console.log("dcreatet", documents);
      return res.send(documents);
    }
  } catch (error) {
    return next(new ApiError(500, "An error occurred while creating the job!"));
  }
};

exports.findAllEvaluateOfServiceReal = async (req, res, next) => {
  let service_id;
  service_id = req.params.service_id;

  try {
    const evaluateService = new EvaluateService(MongoDB.client);

    let documents = await evaluateService.findAllEvaluateOfService(service_id);

    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occured while retrieving job!"));
  }
};

exports.findAllEvaluate = async (req, res, next) => {
  try {
    const evaluateService = new EvaluateService(MongoDB.client);

    let documents = await evaluateService.findAllEvaluate();

    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occured while retrieving job!"));
  }
};
