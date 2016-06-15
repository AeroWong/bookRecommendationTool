var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (Book) {
    Book.getBookInfo = function (bookAlias, cb) {
        var bookInfoObj = { title: null,
                            authors: null,
                            coverImage: null,
                            amazonPage: null };

        return Book.findOne({where: {alias: bookAlias}})
        .then(function(book){
            // get book's basic info
            bookInfoObj.title = book.title;
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
                    reformedRecommendation.eggheadId = recommendation.egghead_id;
                    reformedRecommendations.push(reformedRecommendation);
                })
                return reformedRecommendations;
            })
            var getEggheads = app.models.EggHead.find().then(function(eggheads){
                return eggheads;
            })
            return Promise.all([getReformedRecommendations, getEggheads]).then(function(promises){
                var reformedRecommendations = promises[0],
                    eggheads = promises[1];

                return reformedRecommendations.map(function(recommendation){
                    eggheads.forEach(function(egghead){
                        if (recommendation.eggheadId === egghead.id) {
                            recommendation.eggheadName = egghead.name;
                            recommendation.eggheadAlias = egghead.alias;
                            delete recommendation.eggheadId;
                        }
                    })
                    return recommendation;
                })
            })
        })
        .then(function(recommendations){
            bookInfoObj.recommendations = {};
            bookInfoObj.recommendations.count = recommendations.length;
            bookInfoObj.recommendations.eggheads = recommendations;
            console.log("rending the '" + bookInfoObj.title + "' book's info...");
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