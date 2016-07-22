var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function (Wisdombaby) {
    Wisdombaby.getWisdombabyInfo = function(wisdombabyAlias, cb) {
        var wisdombabyInfoObj = {};

        return Wisdombaby.findOne({where: {alias: wisdombabyAlias}})
        .then(function(wisdombaby){
            // get wisdom baby's basic info
            wisdombabyInfoObj.name = wisdombaby.name;
            wisdombabyInfoObj.profilePic = wisdombaby.profile_pic;
            wisdombabyInfoObj.site = wisdombaby.site;
            wisdombabyInfoObj.alias = wisdombaby.alias;

            if(wisdombaby.gender === 'm'){
                wisdombabyInfoObj.pronoun = 'his'; 
            } else if (wisdombaby.gender === 'f'){
                wisdombabyInfoObj.pronoun = 'her';
            } else {
                wisdombabyInfoObj.pronoun = "the wisdombaby's";
            }

            return wisdombabyInfoObj;
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Wisdombaby.getWisdomBabiesInfo = function(options, cb) {
        return Wisdombaby.find().then(function(wisdomBabies){
            return wisdomBabies.map(function(wisdomBaby){
                var reformedWisdomBaby = {};
                reformedWisdomBaby.profilePic = wisdomBaby.profile_pic;
                reformedWisdomBaby.name = wisdomBaby.name;
                reformedWisdomBaby.alias = wisdomBaby.alias;
                return reformedWisdomBaby;
            })
        })
        .then(function(wisdomBabies){
            console.log("rendering wisdom babies' basic info...");
            return shuffle(wisdomBabies);
            // cb(null, wisdomBabies);
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Wisdombaby.getWisdombabyCount = function(options, cb) {
        return Wisdombaby.find().then(function(wisdomBabies){
            return wisdomBabies.length;
        })
    }
    Wisdombaby.remoteMethod('getWisdombabyInfo', {
        description: "render wisdom baby's profile",
        http: {path: '/getWisdombabyInfo', verb: 'get', status: 200},
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
        returns: {arg: 'data', type: 'object', root: true}
    })
    Wisdombaby.remoteMethod('getWisdombabyCount', {
        description: "get the latest wisdomizer amount",
        http: {path: '/getWisdombabyCount', verb: 'get', status: 200},
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
        returns: {arg: 'data', type: 'object', root: true}
    })
    Wisdombaby.remoteMethod('getWisdomBabiesInfo', {
        description: "render all wisdom babies' basic info",
        http: {path: '/getWisdomBabiesInfo', verb: 'get', status: 200},
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
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