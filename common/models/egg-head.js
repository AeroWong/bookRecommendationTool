var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (EggHead) {
    EggHead.addEgghead = function (egghead, cb) {
        var lowerCaseName = egghead.name.toLowerCase(),
            lowerCaseNamesInBookshelf = null,
            eggheadId = null,
            eggheadObj = {};

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
                eggheadObj.name = egghead.name;
                eggheadObj.gender = egghead.gender;
                eggheadObj.profile_pic = egghead.profile_pic;
                eggheadObj.site = egghead.site;
                eggheadObj.alias = 'eggheads/' + _.words(egghead.name).join('').toLowerCase();
                EggHead.create(eggheadObj);
                console.log("A new egghead '" + egghead.name +"' was created.")
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
        var eggheadInfoObj = {};

        return EggHead.findOne({where: {alias: eggheadAlias}})
        .then(function(egghead){
            // get egghead's basic info
            eggheadInfoObj.name = egghead.name;
            eggheadInfoObj.profilePic = egghead.profile_pic;
            eggheadInfoObj.site = egghead.site;
            eggheadInfoObj.alias = egghead.alias;

            var getReformedRecommendations = app.models.Recommendation.find({where: {egghead_id: egghead.id}})
            .then(function(recommendations){
                return Promise.map(recommendations, function(recommendation){
                    var reformedRecommendation = { id: recommendation.book_id,
                                                   src: recommendation.src,
                                                   srcTitle: recommendation.src_title };
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
                        if (recommendation.id === book.id) {
                            recommendation.title = book.title;
                            recommendation.alias = book.alias;
                        }
                    })
                    return recommendation;
                })
            })
        })
        .then(function(recommendations){
            console.log("Rendering egghead " + eggheadInfoObj.name + "'s info...");
            eggheadInfoObj.recommendations = {};
            eggheadInfoObj.recommendations.count = recommendations.length;
            eggheadInfoObj.recommendations.books = recommendations;
            cb(null, eggheadInfoObj);
        })
        .catch(function(e){
            console.log(e);
        })
    }
    EggHead.getEggHeadsInfo = function(options, cb) {
        return EggHead.find().then(function(eggheads){
            return eggheads.map(function(egghead){
                var reformedEgghead = {};
                reformedEgghead.profilePic = egghead.profile_pic;
                reformedEgghead.name = egghead.name;
                reformedEgghead.alias = egghead.alias;
                return reformedEgghead;
            })
        })
        .then(function(eggheads){
            console.log("rendering all eggheads' basic info...");
            cb(null, eggheads);
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
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
        returns: {arg: 'data', type: 'object', root: true}
    })
    EggHead.remoteMethod('getEggHeadsInfo', {
        description: "render all egghead's basic info",
        http: {path: '/getEggHeadsInfo', verb: 'get', status: 200},
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