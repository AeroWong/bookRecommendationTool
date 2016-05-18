module.exports = function(Recommendation) {
    Recommendation.addRecommendation = function (recommendationDetailObj, cb) {
        var book = recommendationDetailObj.book_id,
            egghead = recommendationDetailObj.egghead_id,
            src = recommendationDetailObj.src,
            recommendationObjectToSave = {};
    }
    Recommendation.remoteMethod('addRecommendation', {
        description: 'Add a new book recommendation',
        http: {path: '/addRecommendation', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Recommendation info', type: 'Recommendation', description: 'Recommendation detail', http: {source: 'body'}},
        returns: {arg: 'book', type: Recommendation, root: true}
    });
};