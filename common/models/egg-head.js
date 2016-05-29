var _ = require('lodash');
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
            name = egghead.name;

        EggHead.findOne({where: {name: name}}).then(function(egghead){
            var eggheadInfoObj = {};
            eggheadInfoObj.name = egghead.name;
            eggheadInfoObj.profilePic = egghead.profile_pic;
            eggheadInfoObj.site = egghead.site;
            eggheadInfoObj.id = egghead.id;
            return eggheadInfoObj;
        }).then(function(eggheadInfoObj){
            eggheadInfoObj.recommendations = [];
            var eggheadInfoWithRecommendationsObj;

            app.models.Recommendation.find({where: {egghead_id: eggheadInfoObj.id}}).then(function(recommendations){
                recommendations.forEach(function(recommendation){
                    var reformedRecommendation = { bookTitle: null,
                                                   src: recommendation.src };

                    app.models.Book.findById(recommendation.book_id).then(function(book){
                        reformedRecommendation.bookTitle = book.title;
                        eggheadInfoObj.recommendations.push(reformedRecommendation);
                        eggheadInfoWithRecommendationsObj = eggheadInfoObj;
                    })
                })
            })
            return eggheadInfoWithRecommendationsObj;
        }).then(function(egghead){
            console.log('---', egghead);
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