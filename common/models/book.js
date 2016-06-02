var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (Book) {
    Book.getBookInfo = function (bookAlias, cb) {
        // bookAlias for testing --- will be deleted after implementation
        var bookAlias = 'fuckthewholeuniverse',
            bookInfoObj = {title: null,
                           authors: null,
                           coverImage: null,
                           amazonPage: null,
                           src: null,
                           recommendations: []};
        // get book's basic info
        Book.findOne({where: {alias: bookAlias}}).then(function(book){
            bookInfoObj.title = book.title;
            bookInfoObj.authors = book.authors;
            bookInfoObj.coverImage = book.cover_image;
            bookInfoObj.amazonPage = book.amazon_page;

            var getReformedRecommendations = app.models.Recommendation.find({where: {'book_id': book.id}}).then(function(recommendations){
                var reformedRecommendations = [];
                recommendations.forEach(function(recommendation){
                    var reformedRecommendation = { src: null,
                                                   eggheadId: null,
                                                   eggheadName: null };

                    reformedRecommendation.src = recommendation.src;
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
                        }
                    })
                    return recommendation;
                })
            })
        })
        .then(function(recommendations){
            bookInfoObj.recommendations = recommendations;
            return bookInfoObj;
        }).catch(function(e){
            console.log(e);
        })
    }
    Book.remoteMethod('getBookInfo', {
        description: "Get a book's basic info and the recommendations",
        http: {path: '/getBookInfo', verb: 'get', status: 200},
        accepts: {arg: 'Book alias', type: 'string', description: "Get a book's detial for book page template", http: {source: 'query'}},
        returns: {arg: 'Book', type: Book, root: true}
    })
};