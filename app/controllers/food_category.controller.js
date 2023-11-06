const FoodCategoryService = require("../services/food_category.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    console.log("body12:",req.body);
    if (!req.body?.food_category) {
        return next(new ApiError(400, "Food Category Name can not be empty!"));
    }
    try {
        const foodcategoryService = new FoodCategoryService(MongoDB.client);

      
        const document = await foodcategoryService.create(req.body);
        console.log("hi", document)
        return res.send(document);
    } catch (error) {
        return next (
            new ApiError(500, "An error occurred while creating the food!")
        );
    }
}

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const foodcategoryService = new FoodCategoryService(MongoDB.client);
        // const {food_category} = req.query;
        documents = await foodcategoryService.find();
        
            
    } catch (error) {
        return next(
            new ApiError(500, "An error occured while retrieving food!")
        );
    }

    return res.send(documents);
};



exports.findOne = async (req, res, next) => {
   
    const category_id  = req.params.id
    try {
        const food_categoryService = new FoodCategoryService(MongoDB.client);
        // const {food_category} = req.query;
        category = await food_categoryService.findById(category_id);
        return res.send(category);
            
    } catch (error) {
        return next(
            new ApiError(500, "An error occured while retrieving food!")
        );
    }
    
};


exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next (new ApiError(400, "Data to update can not be empty!"));
    }

    try {
        const foodcategoryService = new FoodCategoryService(MongoDB.client);
        console.log("id mon:",req.params.id)
        console.log("body", req.body)
       
        const document = await foodcategoryService.update(req.params.id, req.body);
        console.log("document",document)
        if (!document) {
            return next (new ApiError(404, "food not found!"));
        }
        return res.send({message: "Food was updated successfully!"});
    } catch (error) {
        return next (
            new ApiError(
                500,
                `Error updating food with id = ${req.params.id} !`
            )
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const foodcategoryService = new FoodCategoryService(MongoDB.client);
        const document = await foodcategoryService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "food not found!"));
        }
        return res.send({message: "Food was deleted successfully"});
    } catch (error) {
        return next (
            new ApiError(
                500,
                `Could not delete food with id = ${req.params.id} !`
            )
        );
    }
};
