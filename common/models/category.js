var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function(Category) {
    Category.getCategoryRecommendations = function(categoryAlias, cb) {
        var categoryInfoObj = {};
        // get the category name and the number of book count
        var getRefromedBooks = Category.findOne({where: {alias: categoryAlias}})
        .then(function(category){
            categoryInfoObj.categoryName = category.name;
            categoryInfoObj.recommendations = {};
            categoryInfoObj.recommendations.count = category.books_id.length;
            categoryInfoObj.totalEgghead = 0;
            return category.books_id;
        })
        .then(function(booksId){
            //get the books id and start to construct books
            return Promise.map(booksId, function(bookId){
                var reformedBook = { id: null };
                reformedBook.id = bookId;
                return reformedBook;
            })
        })
        var getBooks = app.models.Book.find()
        .then(function(books){
            return books;
        })
        var getRecommendations = app.models.Recommendation.find()
        .then(function(recommendations){
            return recommendations;
        })
        var getEggheads = app.models.EggHead.find()
        .then(function(eggheads){
            return eggheads;
        })
        return Promise.all([getRefromedBooks, getBooks, getRecommendations, getEggheads])
        .then(function(promises){
            var reformedBooks = promises[0],
                books = promises[1],
                recommendations = promises[2],
                eggheads = promises[3],
                fullBooks = null,
                fullRecommendations = null,
                reformedRecommendations = null,
                blankRecommendations = null,
                uniqReformedRecommendations = null,
                uniqRecommendations = null,
                bookNo = 1;

            fullBooks = reformedBooks.map(function(reformedBook){
                books.forEach(function(book){
                    if (reformedBook.id === book.id) {
                        reformedBook.title = book.title;
                        reformedBook.authors = book.authors;
                        reformedBook.coverImage = book.cover_image;
                        reformedBook.alias = book.alias;
                        reformedBook.eggheads = [];
                    }
                })
                return reformedBook;
            })

            blankRecommendations = recommendations.map(function(recommendation){
                var reformedRecommendation = {};
                eggheads.forEach(function(egghead){
                    if (recommendation.egghead_id === egghead.id) {
                        reformedRecommendation.bookId = recommendation.book_id;
                    }
                })
                return reformedRecommendation;
            })

            uniqReformedRecommendations = _.uniqBy(blankRecommendations, 'bookId');

            reformedRecommendations = recommendations.map(function(recommendation){
                var reformedEgghead = {};
                eggheads.forEach(function(egghead){
                    if (recommendation.egghead_id === egghead.id) {
                        reformedEgghead.bookId = recommendation.book_id;
                        reformedEgghead.name = egghead.name;
                        reformedEgghead.alias = egghead.alias;
                        reformedEgghead.src = recommendation.src;
                        reformedEgghead.srcTitle = recommendation.src_title;
                    }
                })
                return reformedEgghead;
            })

            fullRecommendations = uniqReformedRecommendations.map(function(uniqRecommendation){
                uniqRecommendation.eggheads = [];
                reformedRecommendations.forEach(function(reformedRecommendation){
                    if (uniqRecommendation.bookId === reformedRecommendation.bookId) {
                        uniqRecommendation.eggheads.push(reformedRecommendation);
                    }
                })
                return uniqRecommendation;
            })

            return fullBooks.map(function(book){
                fullRecommendations.forEach(function(recommendation){
                    if (book.id === recommendation.bookId) {
                        book.eggheads = recommendation.eggheads;
                        book.no = bookNo;
                        bookNo++;
                    }
                })
                return book;
            })
        })
        .then(function(books){
            categoryInfoObj.recommendations.books = books;

            categoryInfoObj.recommendations.books.forEach(function(book){
                categoryInfoObj.totalEgghead += book.eggheads.length;
            })

            // console.log('categoryInfoObj: ', categoryInfoObj.recommendations.books[1].eggheads);
            console.log("rendering category " + categoryInfoObj.categoryName + "'s book recommendations...");
            return categoryInfoObj;
            // cb(null, categoryInfoObj);
        })
    }
    Category.getCatgoriesInfo = function(options, cb) {
        return Category.find().then(function(categories){
            return categories.map(function(category){
                var reformedCategory = {};
                reformedCategory.name = category.name;
                if (category.books_id) {
                    reformedCategory.recommendationCount = category.books_id.length;
                }
                if (category.alias) {
                    reformedCategory.alias = category.alias;
                }
                return reformedCategory;
            })
        }).then(function(categories){
            console.log("rendering categories' info...");
            // cb(null, categories);
            return categories;
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Category.remoteMethod ('getCategoryRecommendations', {
        description: 'get a list of books from a selcted category',
        http: {path: '/getCategoryRecommendations', verb: 'get', status: 200},
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
        returns: {arg: 'category info and its books', type: Category, root: true}
    });
    Category.remoteMethod ('getCatgoriesInfo', {
        description: 'get a list of all categories',
        http: {path: '/getCatgoriesInfo', verb: 'get', status: 200},
        accepts: {arg: 'category', type: 'string', description: 'Category ', http: {source: 'query'}},
        returns: {arg: 'category info and its books', type: Category, root: true}
    });
};