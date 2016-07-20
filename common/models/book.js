var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (Book) {
    Book.getBookInfo = function (bookAlias, cb) {
        var bookInfoObj = {};
        return Book.findOne({where: {alias: bookAlias}})
        .then(function(book){
            // get book's basic info
            bookInfoObj.title = book.title;
            bookInfoObj.isbn = book.isbn;
            bookInfoObj.alias = book.alias;
            bookInfoObj.authors = book.authors;
            bookInfoObj.coverImage = book.cover_image;
            bookInfoObj.amazonPage = book.amazon_page;

            var getReformedRecommendations = app.models.Recommendation.find({where: {'book_id': book.id}})
            .then(function(recommendations){
                var reformedRecommendations = [];
                recommendations.forEach(function(recommendation){
                    var reformedRecommendation = {};

                    reformedRecommendation.src = recommendation.src;
                    reformedRecommendation.srcTitle = recommendation.src_title;
                    reformedRecommendation.wisdomizerId = recommendation.wisdomizer_id;
                    reformedRecommendations.push(reformedRecommendation);
                })
                return reformedRecommendations;
            })
            var getWisdomizers = app.models.Wisdomizer.find().then(function(wisdomizers){
                return wisdomizers;
            })
            return Promise.all([getReformedRecommendations, getWisdomizers]).then(function(promises){
                var reformedRecommendations = promises[0],
                    wisdomizers = promises[1];

                return reformedRecommendations.map(function(recommendation){
                    wisdomizers.forEach(function(wisdomizer){
                        if (recommendation.wisdomizerId === wisdomizer.id) {
                            recommendation.wisdomizerName = wisdomizer.name;
                            recommendation.wisdomizerAlias = wisdomizer.alias;
                            delete recommendation.wisdomizerId;
                        }
                    })
                    return recommendation;
                })
            })
        })
        .then(function(recommendations){
            bookInfoObj.recommendations = {};
            bookInfoObj.recommendations.count = recommendations.length;
            bookInfoObj.recommendations.wisdomizers = recommendations;
            console.log("rendering the '" + bookInfoObj.title + "' book's info...");
            return bookInfoObj;
            // cb(null, bookInfoObj);
        }).catch(function(e){
            console.log(e);
        })
    }
    Book.remoteMethod('getBookInfo', {
        description: "render book's info and its recommendation sources",
        http: {path: '/getBookInfo', verb: 'get', status: 200},
        accepts: {arg: 'book alias', type: 'string', description: "render the given book's url", http: {source: 'query'}},
        returns: {arg: 'Book', type: 'object', root: true}
    })
};