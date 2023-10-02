const { ObjectId } = require("mongodb");
class FeedBackService {
    constructor(client) {
        this.FeedBack = client.db().collection("feedback");
    }

    extractUserFeedBackData(payload, userId) {
        console.log('feedback: ', userId);
        const feedback = {
            content: payload.content,
            date_feedback: new Date,

            userId: new ObjectId(userId)
        };

        Object.keys(feedback).forEach(
            (key) => feedback[key] === undefined && delete feedback[key]
        );
        console.log(feedback);
        return feedback;
    }

    //Tim feedbakc cua user
    async findAllFeedBackOfUser(userId) {
        return await this.find({
            userId: new ObjectId(userId)
        });
    }

    //tìm tất cả feedback
    async findAllFeedBack() {
        const rs = await this.FeedBack.find({}).toArray();
        console.log(rs)
        return rs;
    }

    async createFeedBack(payload, userId) {
        console.log('fb 2: ', userId);
        const feedback = this.extractUserFeedBackData(payload, userId);
        const result = await this.FeedBack.insertOne(
            feedback
        );
        return result;
    }


    
}
module.exports = FeedBackService;