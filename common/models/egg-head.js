var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (EggHead) {
    EggHead.addEgghead = function (egghead, cb) {
        // egghead object for testing --- will be deleted after implementation
        var egghead = {name: 'Blake',
                       profilePic: 'egghead.jpg',
                       site: 'superEgghead.com'},
        //
            name = egghead.name,
            profilePic = egghead.profilePic,
            site = egghead.site,
            lowerCaseName = name.toLowerCase(),
            lowerCaseNamesInBookshelf = null,
            eggheadId = null,
            eggheadObj = { id: null,
                           name: null,
                           profile_pic: null,
                           site: null };

        EggHead.find().then(function(eggheads){
            eggheadId = 'eh-' + String(eggheads.length + 1);
            lowerCaseNamesInBookshelf = turnBookshelfElementsToLowerCase(eggheads);
            if (lowerCaseNamesInBookshelf.indexOf(lowerCaseName) > -1) {
                var e = new Error("Duplicated egghead.");
                console.log(e.message);
                throw e;
            } else {
                eggheadObj.id = eggheadId;
                eggheadObj.name = name;
                eggheadObj.profile_pic = profilePic;
                eggheadObj.site = site;
                EggHead.create(eggheadObj);
                console.log("A new egghead '" + name +"' was created.")
            }
        })
    }
    EggHead.getEggheadProfileAndRecommendations = function(egghead, cb) {
        // egghead object for testing --- will be deleted after implementation
        var egghead = {name: 'Derek Sivers'},
        //
            name = egghead.name,
            eggheadInfoObj = {};

        EggHead.findOne({where: {name: name}}).then(function(egghead){
            eggheadInfoObj.name = egghead.name;
            eggheadInfoObj.profilePic = egghead.profile_pic;
            eggheadInfoObj.site = egghead.site;
            eggheadInfoObj.id = egghead.id;
            eggheadInfoObj.recommendations = [];
            return eggheadInfoObj.id;
        }).then(function(eggheadId){
            return app.models.Recommendation.find({where: {egghead_id: eggheadId}}).then(function(recommendations){
                return Promise.map(recommendations, function(recommendation){
                    var reformedRecommendation = { bookTitle: null,
                                                   bookId: recommendation.book_id,
                                                   src: recommendation.src };
                    return reformedRecommendation;
                })
            })
        }).then(function(recommendations){
            console.log("Fetching " + name + "'s recommendations...")
            return recommendations.map(function(recommendation){
                app.models.Book.findById(recommendation.bookId).then(function(book){
                    recommendation.bookTitle = book.title;
                    console.log('Recommendation: ' + recommendation.bookTitle + ' | Book id: ' + recommendation.bookId);
                })
                return recommendation;
            })
        }).catch(function(e){
            console.log(e);
        })
    }
    EggHead.remoteMethod('addEgghead', {
        description: 'Add a new egghead',
        http: {path: '/addEgghead', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Egghead info', type: 'EggHead', description: 'EggHead detail', http: {source: 'body'}},
        returns: {arg: 'Egghead', type: EggHead, root: true}
    })
    EggHead.remoteMethod('getEggheadProfileAndRecommendations', {
        description: 'Get egghead recommendations',
        http: {path: '/getEggheadProfileAndRecommendations', verb: 'get', status: 200},
        accepts: {arg: 'Egghead name', type: 'EggHead', description: 'Get a list of recommendations', http: {source: 'body'}},
        returns: {arg: 'EggHead', type: EggHead, root: true}
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