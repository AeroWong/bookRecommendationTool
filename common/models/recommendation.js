var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');
var app = require('../../server/server.js');

module.exports = function(Recommendation) {
    Recommendation.addRecommendation = function (recommendation, cb) {
        var bookTitle = recommendation.bookTitle,
            categories = recommendation.categories,
            lowerCaseEgghead = recommendation.egghead.toLowerCase(),
            lowerCaseEggheadsWithIdInBookshelf = null,
            lowerCaseEggheadsInBookshelf = null,
            lowerCaseBookTitle = bookTitle.toLowerCase(),
            lowerCaseBookTitlesWithIdInBookshelf = null,
            lowerCaseBookTitlesInBookshelf = null,
            lowerCaseCategories = categories.map(function(category){return category.toLowerCase()}),
            lowerCaseCategoriesInBookshelf = null,
            lowerCaseCategoriesWithIdInBookshelf = null,
            eggheadId = null,
            bookId = null,
            isNewBook = null,
            recommendationId = null,
            hasRecommendation = null,
            categoryObj = {},
            recommendationObj = {},
            bookObj = {};

        // check if the bookshelf has the egghead
        var hasEgghead = app.models.EggHead.find()
        .then(function(eggheads){
            lowerCaseEggheadsInBookshelf = turnBookshelfElementsToLowerCase(eggheads);
            lowerCaseEggheadsWithIdInBookshelf = reformBookshelfElements(eggheads);
            if (lowerCaseEggheadsInBookshelf.indexOf(lowerCaseEgghead) === -1) {
                // stop the system
                var e = new Error("The egghead doesn't exist. Please create one.");
                cb(null, e.message);
                throw e;
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
        var getBookId = app.models.Book.find()
        .then(function(books){
            lowerCaseBookTitlesWithIdInBookshelf = reformBookshelfElements(books);
            lowerCaseBookTitlesInBookshelf = turnBookshelfElementsToLowerCase(books);
            // use existing id if there is a duplicated book
            lowerCaseBookTitlesWithIdInBookshelf.forEach(function(book){
                if (lowerCaseBookTitle === book.title) {
                    bookId = book.id;
                    isNewBook = false;
                }
            })
            // create a new id
            if (lowerCaseBookTitlesInBookshelf.indexOf(lowerCaseBookTitle) === -1) {
                bookId = 'b-' + String(books.length + 1);
                isNewBook = true;
            }
        })
        // check if there is a duplicated recommendation
        Promise.all([hasEgghead, getBookId]).then(function(){
            Recommendation.find()
            .then(function(recommendations){
                // creating new id if there is no duplicated one in bookshelf
                recommendationId = 'r-' + String(recommendations.length + 1);
                var counter = 0;
                recommendations.forEach(function(recommendation){
                    if (bookId === recommendation.book_id && eggheadId === recommendation.egghead_id) {
                        counter++;
                    }
                })
                if (counter > 0) {
                    return hasRecommendation = true;
                } else {
                    return hasRecommendation = false;
                }
            })
            .then(function(hasRecommendation){
                if (hasRecommendation === true) {
                    var e = new Error('Duplicated book recommendation.')
                    cb(null, e.message);
                    throw e;
                } else {
                    recommendationObj.id = recommendationId;
                    recommendationObj.src = recommendation.src;
                    recommendationObj.src_title = recommendation.srcTitle;
                    recommendationObj.book_id = bookId;
                    recommendationObj.egghead_id = eggheadId;
                    recommendationObj.created = moment.utc().format('YYYY-MM-DD');
                    // add recommendation: new book + old egghead
                    Recommendation.create(recommendationObj);
                    console.log("A new recommendation was just made by '" + 
                                recommendation.egghead + "' for the book '" + bookTitle + "'.")
                    // egghead recommends new book
                    if (isNewBook) {
                        // add book step 1: referencing categories id by category's name
                        var getCategoriesId = app.models.Category.find()
                        .then(function(categories){
                            var categoryLen = categories.length;
                            lowerCaseCategoriesInBookshelf = turnBookshelfElementsToLowerCase(categories);
                            lowerCaseCategoriesWithIdInBookshelf = reformBookshelfElements(categories);
                            bookObj.categories_id = [];
                            // insert bookshelf category id to book
                            lowerCaseCategories.forEach(function(inputCategory){
                                lowerCaseCategoriesWithIdInBookshelf.forEach(function(bookshelfCategory){
                                    if (inputCategory === bookshelfCategory.name) {
                                        bookObj.categories_id.push(bookshelfCategory.categories_id);
                                    }
                                })
                            })
                            // create new category in bookshelf if bookshelf doesn't have the input category
                            lowerCaseCategories.forEach(function(category){
                                var categoryId = null;
                                if (lowerCaseCategoriesInBookshelf.indexOf(category) === -1) {
                                    categoryLen++;
                                    categoryId = 'c-' + String(categoryLen);
                                    bookObj.categories_id.push(categoryId);
                                    var startCaseCategory = _.startCase(category);
                                    categoryObj.id = categoryId;
                                    categoryObj.name = startCaseCategory;
                                    categoryObj.books_id = [];
                                    categoryObj.books_id.push(bookId);
                                    categoryObj.alias = 'categories/' +
                                                        _.words(startCaseCategory).join('').toLowerCase();
                                    app.models.Category.create(categoryObj);
                                    console.log("A new category '" + startCaseCategory + "' was created in bookshelf")
                                }
                            })
                        })
                        .catch(function(e){
                            console.log(e);
                        })
                        // add book step 2: referencing eggheads id by egghead's name
                        var getEggheadId = app.models.EggHead.find()
                        .then(function(eggheads){
                            eggheadId = 'eh-' + String(categories.length + 1);
                            // insert bookshelf egghead id to book
                            lowerCaseEggheadsWithIdInBookshelf.forEach(function(bookshelfEgghead){
                                if (bookshelfEgghead.name === lowerCaseEgghead) {
                                    bookObj.eggheads_id = [];
                                    bookObj.eggheads_id.push(bookshelfEgghead.id);
                                }
                            })
                        })
                        .catch(function(e){
                            console.log(e);
                        })
                        // add book step 3: construct alias
                        var alias = _.words(bookTitle).join('').toLowerCase();
                        // add book step 4: add id / title / authors / amazonPage / alias
                        Promise.all([getCategoriesId, getEggheadId])
                        .then(function(){
                            bookObj.id = bookId;
                            bookObj.title = bookTitle;
                            bookObj.cover_image = recommendation.bookCoverImage;
                            bookObj.amazon_page = recommendation.amazonPage;
                            bookObj.alias = 'books/' + alias;
                            bookObj.created = moment.utc().format('YYYY-MM-DD');;
                            bookObj.authors = recommendation.authors.map(function(author){
                                return {name: author};
                            });
                            // insert book to bookshelf
                            app.models.Book.create(bookObj);
                            console.log("A new book '" + bookTitle + "' was inserted in bookshelf.");
                            return bookObj.categories_id;
                        })
                        .then(function(bookCategoriesId){
                            return Promise.map(bookCategoriesId, function(bookCategoryId){
                                return app.models.Category.findOne({where: {id: bookCategoryId}})
                                    .then(function(category){
                                        if (category.books_id.indexOf(bookId) === -1) {
                                            return category.id;
                                        }
                                    })
                            })
                        })
                        .then(function(filteredCategoriesId){
                            var cleanFilteredCategoriesId = _.compact(filteredCategoriesId);
                            cleanFilteredCategoriesId.forEach(function(categoryId){
                                app.models.Category.findById(categoryId, function(err, category){
                                    var booksIdList = category.books_id;
                                    booksIdList.push(bookId);
                                    category.updateAttributes({books_id: booksIdList})
                                })
                            })
                        })
                        .then(function(){
                            cb(null, "A new recommendation for the book '" + bookTitle + "' is made.");
                        })
                        .catch(function(e){
                            console.log(e);
                        })
                    } else {
                        // a different egghead recommends old book
                        app.models.Book.findById(bookId, function(err, book){
                            var eggheadList = book.eggheads_id;
                            eggheadList.push(eggheadId);
                            book.updateAttributes({eggheads_id: eggheadList}, function(err, book){
                                console.log("Updated the book '" + bookTitle + "' egghead's List.");
                                cb(null, "Updated the book '" + bookTitle + "' egghead's List.");
                            });
                        })
                        .catch(function(e){
                            console.log(e);
                        })
                    }
                }
            })
            .catch(function(e){
                console.log(e);
            })
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Recommendation.getCurrentMonthRecommendations = function (options, cb) {

        var lastDayOfPreviousMonth = moment.utc().date(0).format('YYYY-MM-DD'),
            today = new Date(), currentMonth = today.getMonth(),
            currentMonth = moment().month(currentMonth).format('MMM'),
            currentMonthRecommendationInfo = { currentMonth: currentMonth };

        return Recommendation.find().then(function(recommendations){
            return recommendations.map(function(recommendation){
                if (recommendation.created &&
                    recommendation.created !== undefined &&
                    moment(recommendation.created).isAfter(lastDayOfPreviousMonth))
                {
                    return recommendation;
                }
            })
        })
        .then(function(recommendations){
            return _.compact(recommendations);
        })
        .then(function(recommendations){
            var booksInfo = app.models.Book.find()
            .then(function(books){
                return recommendations.map(function(recommendation){
                    var reformedRecommendation = {};
                    books.forEach(function(book){
                        if (book.id === recommendation.book_id) {
                            reformedRecommendation.title = book.title;
                            reformedRecommendation.alias = book.alias;
                            reformedRecommendation.coverImage = book.cover_image;
                            reformedRecommendation.authors = book.authors;
                            reformedRecommendation.src = recommendation.src;
                            reformedRecommendation.srcTitle = recommendation.src_title;
                            reformedRecommendation.recommendationId = recommendation.id;
                        }
                    })
                    return reformedRecommendation;
                })
            })
            .catch(function(e){
                console.log(e);
            })
            var eggheadsInfo = app.models.EggHead.find()
            .then(function(eggheads){
                return recommendations.map(function(recommendation){
                    var reformedRecommendation = {};
                    eggheads.forEach(function(egghead){
                        if (egghead.id === recommendation.egghead_id) {
                            reformedRecommendation.name = egghead.name;
                            reformedRecommendation.alias = egghead.alias;
                            reformedRecommendation.src = recommendation.src;
                            reformedRecommendation.srcTitle = recommendation.src_title;
                            reformedRecommendation.recommendationId = recommendation.id;
                        }
                    })
                    return reformedRecommendation;
                })
            })
            .catch(function(e){
                console.log(e);
            })
            return Promise.all([booksInfo, eggheadsInfo]).then(function(promises){
                var booksInfo = promises[0],
                    eggheadsInfo = promises[1];

                return booksInfo.map(function(bookInfo){
                    var reformedRecommendation = {};
                    eggheadsInfo.forEach(function(eggheadInfo){
                        if (bookInfo.recommendationId === eggheadInfo.recommendationId) {
                            reformedRecommendation.bookTitle = bookInfo.title;
                            reformedRecommendation.bookAlias = bookInfo.alias;
                            reformedRecommendation.coverImage = bookInfo.coverImage;
                            reformedRecommendation.authors = bookInfo.authors;
                            reformedRecommendation.eggheadName = eggheadInfo.name;
                            reformedRecommendation.eggheadAlias = eggheadInfo.alias;
                            reformedRecommendation.src = eggheadInfo.src;
                            reformedRecommendation.srcTitle = eggheadInfo.srcTitle;
                        }
                    })
                    return reformedRecommendation;
                })
            })
        })
        .then(function(recommendations){
            var uniqRecommendations = _.uniqBy(recommendations, 'bookAlias');
            return uniqRecommendations.map(function(uniqRecommendation){
                var reformedRecommendation = { eggheads: [] };
                recommendations.forEach(function(recommendation){
                    if (uniqRecommendation.bookAlias === recommendation.bookAlias) {
                        var egghead = { name: recommendation.eggheadName,
                                        alias: recommendation.eggheadAlias,
                                        src: recommendation.src,
                                        srcTitle: recommendation.srcTitle };
                        reformedRecommendation.authors = recommendation.authors;
                        reformedRecommendation.bookTitle = recommendation.bookTitle;
                        reformedRecommendation.bookAlias = recommendation.bookAlias;
                        reformedRecommendation.coverImage = recommendation.coverImage;
                        reformedRecommendation.eggheads.push(egghead);
                    }
                })
                return reformedRecommendation;
            })
        })
        .then(function(recommendations){
            currentMonthRecommendationInfo.count = recommendations.length;
            currentMonthRecommendationInfo.recommendations = shuffle(recommendations);
            console.log("rendering current month recommendation's info...");
            return currentMonthRecommendationInfo;
            // cb(null, currentMonthRecommendationInfo);
        })
        .catch(function(e){
            console.log(e);
        })
    }
    Recommendation.remoteMethod('addRecommendation', {
        description: 'Add a new book recommendation',
        http: {path: '/addRecommendation', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Recommendation info', type: 'Recommendation', description: 'Recommendation detail', http: {source: 'body'}},
        returns: {arg: 'Recommendation', type: Recommendation, root: true}
    });
    Recommendation.remoteMethod('getCurrentMonthRecommendations', {
        description: 'Get a list of current month recommendations',
        http: {path: '/getCurrentMonthRecommendations', verb: 'get', status: 200},
        accepts: {arg: 'filter', type: 'string', description: "Filter defining fields, where, include, order, offset, and limit", http: {source: 'query'}},
        returns: {arg: 'Recommendations', type: 'object', root: true}
    });
    function isRecommendationDetialFilled (bookTitle, authors, amazonPage, categories, egghead, src, cb) {
        var error = new Error();
        if (_.isEmpty(title) || title === 'string') {
            console.log("Please insert the book title.");
            error = {name: 'Book without title',
                     status: 400,
                     message: 'Please fill in the title field'};
            cb(null, error);
            return false;
        } else if (_.isEmpty(authors) || authors[0] === 'string') {
            console.log("Please insert at least 1 author for the book.");
            error = {name: 'Book without author',
                     status: 400,
                     message: 'Please insert at least 1 author for the book'};
            cb(null, error);
            return false;
        } else if (_.isEmpty(amazonPage) || amazonPage === 'string') {
            console.log("Please insert the amazon page for the book.");
            error = {name: 'Book without amazon page',
                     status: 400,
                     message: 'Please insert the amazon page for the book'};
            cb(null, error);
            return false;
        } else if (_.isEmpty(categories) || categories[0] === 'string') {
            console.log("Please insert at least 1 category for the book.");
            error = {name: 'Book without category',
                     status: 400,
                     message: 'Please insert at least 1 category for the book'};
            cb(null, error);
            return false;
        } else if (_.isEmpty(eggheads) || eggheads[0] === 'string') {
            console.log("Please insert at least 1 egghead for the book.");
            error = {name: "Book without egghead's recommendation",
                     status: 400,
                     message: 'Please insert at least 1 egghead for the book'};
            cb(null, error);
            return false;
        } else {
            console.log('Recommendation detail filled.')
        }
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
};