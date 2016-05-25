var _ = require('lodash');
var app = require('../../server/server.js');

module.exports = function(Recommendation) {
    Recommendation.addRecommendation = function (recommendation, cb) {
        // recommendation object for testing
        var recommendation = { bookTitle: 'on writing well',
                               authors: ['Enimen','Snoop Dogg'],
                               amazonPage: 'amazon.hiphop.com',
                               categories: ['Hip Hop'],
                               egghead: 'coolio',
                               src: 'd12.com' },
            // processing variables
            bookTitle = recommendation.bookTitle,
            authors = recommendation.authors,
            amazonPage = recommendation.amazonPage,
            categories = recommendation.categories,
            egghead = recommendation.egghead,
            src = recommendation.src,
            lowerCaseEgghead = egghead.toLowerCase(),
            lowerCaseEggheadsWithIdInBookshelf = null,
            lowerCaseEggheadsInBookshelf = null,
            lowerCaseBookTitle = bookTitle.toLowerCase(),
            lowerCaseBookTitlesWithIdInBookshelf = null,
            lowerCaseBookTitlesInBookshelf = null,
            eggheadId = null,
            bookId = null,
            // recommendation obj to save
            recommendationObj = { id: null,
                                  src: null,
                                  book_id: null,
                                  egghead_id: null },
            // book obj to save
            bookObj = { id: null,
                        title: null,
                        authors: null,
                        amazon_page: null,
                        categories_id: null,
                        egghead_id: null };

        // check if bookshelf has the egghead
        var hasEgghead = app.models.EggHead.find().then(function(eggheads){
            lowerCaseEggheadsInBookshelf = turnBookshelfElementsToLowerCase(eggheads);
            lowerCaseEggheadsWithIdInBookshelf = reformBookshelfElements(eggheads);
            if (lowerCaseEggheadsInBookshelf.indexOf(lowerCaseEgghead) === -1) {
                console.log("The egghead doesn't exist. Please create one.");
                return;
            } else {
                // reference egghead id by egghead's name
                lowerCaseEggheadsWithIdInBookshelf.forEach(function(egghead){
                    if (lowerCaseEgghead === egghead.name) {
                        eggheadId = egghead.id;
                    }
                })
            }
        })
        // reference book id by book title
        var getBookId = app.models.Book.find().then(function(books){
            lowerCaseBookTitlesWithIdInBookshelf = reformBookshelfElements(books);
            lowerCaseBookTitlesInBookshelf = turnBookshelfElementsToLowerCase(books);
            // use existing id if there is a duplicated book
            lowerCaseBookTitlesWithIdInBookshelf.forEach(function(book){
                if (lowerCaseBookTitle === book.title) {
                    bookId = book.id;
                }
            })
            // create a new id
            if (lowerCaseBookTitlesInBookshelf.indexOf(lowerCaseBookTitle) === -1) {
                bookId = 'b-' + String(books.length + 1);
            }
        })
        // check if there is a duplicated recommendation
        var hasRecommendation = Recommendation.find().then(function(recommendations){
            var counter = 0;
            recommendations.forEach(function(recommendation){
                if (bookId === recommendation.book_id && eggheadId === recommendation.egghead_id) {
                    counter++;
                }
            })
            if (counter > 0) {
                return true;
            } else {
                return false;
            }
        })

        Promise.all([hasEgghead, getBookId, hasRecommendation]).then(function(promises){
            if (promises[2] === true) {
                console.log('A recommendation made by ' + egghead + " for book '" + bookTitle + "' existed.");
                return;
            }
        });

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
    function reformBookshelfElements (elems) {
        if (elems[0].id.charAt(0) === 'c') {
            return elems.map(function(category){
                var reformedCategory = {};
                reformedCategory.name = category.name.toLowerCase();
                reformedCategory.categories_id = category.id;
                return reformedCategory;
            })
        } else if (elems[0].id.charAt(0) === 'e') {
            return elems.map(function(egghead){
                var reformedEgghead = {};
                reformedEgghead.name = egghead.name.toLowerCase();
                reformedEgghead.profile_pic = egghead.profile_pic;
                reformedEgghead.site = egghead.site;
                reformedEgghead.id = egghead.id;
                return reformedEgghead;
            })
        } else if (elems[0].id.charAt(0) === 'b') {
            return elems.map(function(book){
                var reformedBook = {};
                reformedBook.id = book.id;
                reformedBook.title = book.title.toLowerCase();
                reformedBook.authors = book.authors;
                reformedBook.amazonPage = book.amazon_page;
                reformedBook.categories = book.categories_id;
                reformedBook.eggheads = book.eggheads_id;
                return reformedBook;
            })
        }
    }
};