const TypePartyService = require("../services/type_party.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    console.log("body:",req.body);
    if (!req.body?.type_party) {
        return next(new ApiError(400, "type party Category Name can not be empty!"));
    }
    try {
        const type_partyService = new TypePartyService(MongoDB.client);

      
        const document = await type_partyService.create(req.body);
        console.log("hi", document)
        return res.send(document);
    } catch (error) {
        return next (
            new ApiError(500, "An error occurred while creating the type party!")
        );
    }
}

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const type_partyService = new TypePartyService(MongoDB.client);
        // const {type_party} = req.query;
        documents = await type_partyService.find();
       
            
    } catch (error) {
        return next(
            new ApiError(500, "An error occured while retrieving type party!")
        );
    }

    return res.send(documents);
};



exports.findOne = async (req, res, next) => {
   
    const category_id  = req.params.id
    try {
        const type_partyService = new TypePartyService(MongoDB.client);
        // const {type_party} = req.query;
        category = await type_partyService.findById(category_id);
        return res.send(category);
            
    } catch (error) {
        return next(
            new ApiError(500, "An error occured while retrieving type party!")
        );
    }
    
};


exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next (new ApiError(400, "Data to update can not be empty!"));
    }

    try {
        const type_partyService = new TypePartyService(MongoDB.client);
        console.log("id mon:",req.params.id)
        console.log("body", req.body)
       
        const document = await type_partyService.update(req.params.id, req.body);
        console.log("document",document)
        if (!document) {
            return next (new ApiError(404, "type party not found!"));
        }
        return res.send({message: "type party was updated successfully!"});
    } catch (error) {
        return next (
            new ApiError(
                500,
                `Error updating type party with id = ${req.params.id} !`
            )
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const type_partyService = new TypePartyService(MongoDB.client);
        const document = await type_partyService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "type party not found!"));
        }
        return res.send({message: "type party was deleted successfully"});
    } catch (error) {
        return next (
            new ApiError(
                500,
                `Could not delete type party with id = ${req.params.id} !`
            )
        );
    }
};
