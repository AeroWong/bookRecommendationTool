var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (EggHead) {
    EggHead.addEgghead = function (egghead, cb) {
        var name = egghead.name,
            profilePic = egghead.profile_pic,
            site = egghead.site,
            lowerCaseName = name.toLowerCase(),
            lowerCaseNamesInBookshelf = null,
            eggheadId = null,
            eggheadObj = { id: null,
                           name: null,
                           profile_pic: null,
                           site: null,
                           alias: null };

        EggHead.find()
        .then(function(eggheads){
            eggheadId = 'eh-' + String(eggheads.length + 1);
            lowerCaseNamesInBookshelf = turnBookshelfElementsToLowerCase(eggheads);
            if (lowerCaseNamesInBookshelf.indexOf(lowerCaseName) > -1) {
                var e = new Error("Duplicated egghead.");
                cb(null, e.message);
                throw e;
            } else {
                eggheadObj.id = eggheadId;
                eggheadObj.name = name;
                eggheadObj.profile_pic = profilePic;
                eggheadObj.site = site;
                eggheadObj.alias = _.words(name).join('').toLowerCase();
                EggHead.create(eggheadObj);
                console.log("A new egghead '" + name +"' was created.")
            }
        })
        .then(function(){
            cb(null, eggheadObj);
        })
        .catch(function(e){
            console.log(e);
        })
    }
    EggHead.getEggheadInfo = function(eggheadAlias, cb) {
        var eggheadInfoObj = { name: null,
                               profilePic: null,
                               site: null };

        EggHead.findOne({where: {alias: eggheadAlias}})
        .then(function(egghead){
            // get egghead's basic info
            eggheadInfoObj.name = egghead.name;
            eggheadInfoObj.profilePic = egghead.profile_pic;
            eggheadInfoObj.site = egghead.site;

            var getReformedRecommendations = app.models.Recommendation.find({where: {egghead_id: egghead.id}})
            .then(function(recommendations){
                return Promise.map(recommendations, function(recommendation){
                    var reformedRecommendation = { bookTitle: null,
                                                   bookAlias: null,
                                                   bookId: recommendation.book_id,
                                                   src: recommendation.src };
                    return reformedRecommendation;
                })
            })
            var getBooks = app.models.Book.find()
            .then(function(books){
                return books;
            })
            return Promise.all([getReformedRecommendations, getBooks]).then(function(promises){
                var reformedRecommendations = promises[0],
                    books = promises[1];

                return reformedRecommendations.map(function(recommendation){
                    books.forEach(function(book){
                        if (recommendation.bookId === book.id) {
                            recommendation.bookTitle = book.title;
                            recommendation.bookAlias = book.alias;
                        }
                    })
                    return recommendation;
                })
            })
        })
        .then(function(recommendations){
            eggheadInfoObj.recommendations = recommendations;
            console.log("Rendering the following egghead's info:\n", eggheadInfoObj);
            cb(null, eggheadInfoObj);
        })
        .catch(function(e){
            console.log(e);
        })
    }
    EggHead.remoteMethod('addEgghead', {
        description: 'Add a new egghead',
        http: {path: '/addEgghead', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Egghead info', type: 'EggHead', description: 'EggHead detail', http: {source: 'body'}},
        returns: {arg: 'data', type: EggHead, root: true}
    })
    EggHead.remoteMethod('getEggheadInfo', {
        description: "render egghead's profile and recommendations",
        http: {path: '/getEggheadInfo', verb: 'get', status: 200},
        accepts: {arg: 'egghead alias', type: 'string', description: "render the given egghead's URL", http: {source: 'query'}},
        returns: {arg: 'data', type: 'object', root: true}
    })
    function turnBookshelfElementsToLowerCase (elems) {
        return elems.map(function(elem){
            if ('title' in elem){
                return elem.title.toLowerCase();
            } else if ('name' in elem) {
                return elem.name.toLowerCase();
            }
        })
    }
};