var _ = require('lodash');
var app = require('../../server/server.js');

module.exports = function(Recommendation) {
    Recommendation.addRecommendation = function (recommendation, cb) {
        // recommendation object for testing
        var recommendation = { bookTitle: 'Fuck That Shit',
                               authors: ['Enimen','Snoop Dogg'],
                               amazonPage: 'amazon.hiphop.com',
                               categories: ['Hip Hop'],
                               egghead: 'Coolio',
                               src: 'd12.com' },
            // processing variables
            bookTitle = recommendation.bookTitle,
            authors = recommendation.authors,
            amazonPage = recommendation.amazonPage,
            categories = recommendation.categories,
            egghead = recommendation.egghead,
            src = recommendation.src,
            lowerCaseEgghead = egghead.toLowerCase(),
            lowerCaseEggheadsInBookshelf = null;

        // check if bookshelf has the egghead
        var hasEgghead = app.models.EggHead.find().then(function(eggheads){
            lowerCaseEggheadsInBookshelf = turnBookshelfElementsToLowerCase(eggheads);
            if (lowerCaseEggheadsInBookshelf.indexOf(lowerCaseEgghead) === -1) {
                console.log("The egghead doesn't exist. Please create one.");
                return;
            }
        })
        // reference book id by title
        
        // check if there is a duplicated recommendation

        Promise.all([hasEgghead]);

        // add recommendation: old book + new egghead
        // add recommendation: new book + old egghead

    }
    Recommendation.remoteMethod('addRecommendation', {
        description: 'Add a new book recommendation',
        http: {path: '/addRecommendation', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Recommendation info', type: 'Recommendation', description: 'Recommendation detail', http: {source: 'body'}},
        returns: {arg: 'book', type: Recommendation, root: true}
    });
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