var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (Wisdomizer) {
    Wisdomizer.addWisdomizer = function (wisdomizer, cb) {
        var lowerCaseName = wisdomizer.name.toLowerCase(),
            lowerCaseNamesInBookshelf = null,
            wisdomizerId = null,
            wisdomizerObj = {};

        return Wisdomizer.find()
        .then(function(wisdomizers){
            wisdomizerId = 'eh-' + String(wisdomizers.length + 1);
            lowerCaseNamesInBookshelf = turnBookshelfElementsToLowerCase(wisdomizers);
            if (lowerCaseNamesInBookshelf.indexOf(lowerCaseName) > -1) {
                var e = new Error("Duplicated wisdomizer.");
                cb(null, e.message);
                throw e;
            } else {
                wisdomizerObj.id = wisdomizerId;
                wisdomizerObj.name = wisdomizer.name;
                wisdomizerObj.gender = wisdomizer.gender;
                wisdomizerObj.profile_pic = wisdomizer.profile_pic;
                wisdomizerObj.site = wisdomizer.site;
                wisdomizerObj.alias = 'wisdomizers/' + _.words(wisdomizer.name).join('').toLowerCase();
                Wisdomizer.create(wisdomizerObj);
                console.log("A new wisdomizer '" + wisdomizer.name +"' was created.")
            }
        })
        .then(function(){
            cb(null, wisdomizerObj);
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Wisdomizer.getWisdomizerInfo = function(wisdomizerAlias, cb) {
        var wisdomizerInfoObj = {};

        return Wisdomizer.findOne({where: {alias: wisdomizerAlias}})
        .then(function(wisdomizer){
            // get wisdomizer's basic info
            wisdomizerInfoObj.name = wisdomizer.name;
            wisdomizerInfoObj.profilePic = wisdomizer.profile_pic;
            wisdomizerInfoObj.site = wisdomizer.site;
            wisdomizerInfoObj.alias = wisdomizer.alias;

            if(wisdomizer.gender === 'm'){
                wisdomizerInfoObj.pronoun = 'his'; 
            } else if (wisdomizer.gender === 'f'){
                wisdomizerInfoObj.pronoun = 'her';
            } else {
                wisdomizerInfoObj.pronoun = "the wisdomizer's";
            }

            var getReformedRecommendations = app.models.Recommendation.find({where: {wisdomizer_id: wisdomizer.id}})
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
                            recommendation.wisdomizerName = wisdomizerInfoObj.name;
                            recommendation.title = book.title;
                            recommendation.coverImage = book.cover_image;
                            recommendation.authors = book.authors;
                            recommendation.alias = book.alias;
                        }
                    })
                    return recommendation;
                })
            })
        })
        .then(function(recommendations){
            wisdomizerInfoObj.recommendations = {};
            wisdomizerInfoObj.recommendations.count = recommendations.length;
            wisdomizerInfoObj.recommendations.books = shuffle(recommendations);

            console.log("Rendering wisdomizer " + wisdomizerInfoObj.name + "'s info...");
            // cb(null, wisdomizerInfoObj);
            return wisdomizerInfoObj;
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Wisdomizer.getWisdomizersInfo = function(options, cb) {
        return Wisdomizer.find().then(function(wisdomizers){
            return wisdomizers.map(function(wisdomizer){
                var reformedWisdomizer = {};
                reformedWisdomizer.profilePic = wisdomizer.profile_pic;
                reformedWisdomizer.name = wisdomizer.name;
                reformedWisdomizer.alias = wisdomizer.alias;
                return reformedWisdomizer;
            })
        })
        .then(function(wisdomizers){
            console.log("rendering wisdomizers' basic info...");
            return shuffle(wisdomizers);
            // cb(null, wisdomizers);
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Wisdomizer.getWisdomizerCount = function(options, cb) {
        return Wisdomizer.find().then(function(wisdomizers){
            return wisdomizers.length;
        })
    }
    Wisdomizer.remoteMethod('addWisdomizer', {
        description: 'Add a new wisdomizer',
        http: {path: '/addWisdomizer', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Wisdomizer info', type: 'Wisdomizer', description: 'Wisdomizer detail', http: {source: 'body'}},
        returns: {arg: 'data', type: Wisdomizer, root: true}
    })
    Wisdomizer.remoteMethod('getWisdomizerInfo', {
        description: "render wisdomizer's profile and recommendations",
        http: {path: '/getWisdomizerInfo', verb: 'get', status: 200},
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
        returns: {arg: 'data', type: 'object', root: true}
    })
    Wisdomizer.remoteMethod('getWisdomizerCount', {
        description: "get the latest wisdomizer amount",
        http: {path: '/getWisdomizerCount', verb: 'get', status: 200},
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
        returns: {arg: 'data', type: 'object', root: true}
    })
    Wisdomizer.remoteMethod('getWisdomizersInfo', {
        description: "render all wisdomizer's basic info",
        http: {path: '/getWisdomizersInfo', verb: 'get', status: 200},
        accepts: {arg: 'wisdomizer alias', type: 'string', description: "render the given wisdomizer's URL", http: {source: 'query'}},
        returns: {arg: 'data', type: 'object', root: true}
    })
    function shuffle(array) {
        var counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            var index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            var temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }
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