var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');
var app = require('../../server/server.js');

module.exports = function(Recommendation) {
    Recommendation.addRecommendation = function (recommendation, cb) {

        var bookTitle = recommendation.bookTitle,
            bookIsbn = recommendation.bookIsbn,
            categories = recommendation.categories,
            lowerCaseWisdomizer = recommendation.wisdomizer.toLowerCase(),
            lowerCaseWisdomizersWithIdInBookshelf = null,
            lowerCaseWisdomizersInBookshelf = null,
            lowerCaseBookTitle = bookTitle.toLowerCase(),
            lowerCaseBookTitlesWithIdInBookshelf = null,
            lowerCaseBookTitlesInBookshelf = null,
            lowerCaseCategories = categories.map(function(category){
                var lowerCaseCategory;
                lowerCaseCategory = category.toLowerCase();
                lowerCaseCategory = _.trim(lowerCaseCategory);
                return lowerCaseCategory;
            }),
            lowerCaseCategoriesInBookshelf = null,
            lowerCaseCategoriesWithIdInBookshelf = null,
            wisdomizerId = null,
            bookId = null,
            isNewBook = null,
            recommendationId = null,
            hasRecommendation = null,
            categoryObj = {},
            recommendationObj = {},
            bookObj = {};

        // check if the bookshelf has the wisdomizer
        var hasWisdomizer = app.models.Wisdomizer.find()
        .then(function(wisdomizers){
            lowerCaseWisdomizersInBookshelf = turnBookshelfElementsToLowerCase(wisdomizers);
            lowerCaseWisdomizersWithIdInBookshelf = reformBookshelfElements(wisdomizers);
            if (lowerCaseWisdomizersInBookshelf.indexOf(lowerCaseWisdomizer) === -1) {
                // stop the system
                var e = new Error("The wisdomizer doesn't exist. Please create one.");
                cb(null, e.message);
                throw e;
            } else {
                // reference wisdomizer id by wisdomizer's name
                lowerCaseWisdomizersWithIdInBookshelf.forEach(function(wisdomizer){
                    if (lowerCaseWisdomizer === wisdomizer.name) {
                        wisdomizerId = wisdomizer.id;
                    }
                })
            }
        })
        // reference book id by book title
        var getBookId = app.models.Book.find()
        .then(function(books){
            if (books.length === 0) {
                bookId = 'b-1';
                isNewBook = true;
            } else {
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
            }
        })
        // check if there is a duplicated recommendation
        Promise.all([hasWisdomizer, getBookId]).then(function(){
            Recommendation.find()
            .then(function(recommendations){
                // creating new id if there is no duplicated one in bookshelf
                recommendationId = 'r-' + String(recommendations.length + 1);
                var counter = 0;
                recommendations.forEach(function(recommendation){
                    if (bookId === recommendation.book_id && wisdomizerId === recommendation.wisdomizer_id) {
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
                    recommendationObj.wisdomizer_id = wisdomizerId;
                    recommendationObj.created = moment.utc().format('YYYY-MM-DD');
                    // add recommendation: new book + old wisdomizer
                    Recommendation.create(recommendationObj);
                    console.log("A new recommendation was just made by '" + 
                                recommendation.wisdomizer + "' for the book '" + bookTitle + "'.")
                    // wisdomizer recommends new book
                    if (isNewBook) {
                        var getCategoriesId = app.models.Category.find()
                        .then(function(categories){
                            var categoryLen;
                            bookObj.categories_id = [];
                            // add book step 1: referencing categories id by category's name
                            if (categories.length > 0) {
                                categoryLen = categories.length;
                                lowerCaseCategoriesInBookshelf = turnBookshelfElementsToLowerCase(categories);
                                lowerCaseCategoriesWithIdInBookshelf = reformBookshelfElements(categories);
                                // insert bookshelf category id to book
                                lowerCaseCategories.forEach(function(inputCategory){
                                    lowerCaseCategoriesWithIdInBookshelf.forEach(function(bookshelfCategory){
                                        if (inputCategory === bookshelfCategory.name) {
                                            bookObj.categories_id.push(bookshelfCategory.categories_id);
                                        }
                                    })
                                })
                            } else if (categories.length === 0) {
                                categoryLen = 0;
                            }
                            // for no existing categories in DB (init case)
                            if (lowerCaseCategoriesInBookshelf === null) {
                                lowerCaseCategoriesInBookshelf = [];
                            }
                            // create new category in bookshelf if bookshelf doesn't have the input category
                            lowerCaseCategories.forEach(function(category){
                                var categoryId = null;
                                if (lowerCaseCategoriesInBookshelf.indexOf(category) === -1 || lowerCaseCategoriesInBookshelf.indexOf(category) === null) {
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
                        // add book step 2: referencing wisdomizers id by wisdomizer's name
                        var getWisdomizerId = app.models.Wisdomizer.find()
                        .then(function(wisdomizers){
                            wisdomizerId = 'eh-' + String(categories.length + 1);
                            // insert bookshelf wisdomizer id to book
                            lowerCaseWisdomizersWithIdInBookshelf.forEach(function(bookshelfWisdomizer){
                                if (bookshelfWisdomizer.name === lowerCaseWisdomizer) {
                                    bookObj.wisdomizers_id = [];
                                    bookObj.wisdomizers_id.push(bookshelfWisdomizer.id);
                                }
                            })
                        })
                        .catch(function(e){
                            console.log(e);
                        })
                        // add book step 3: construct alias
                        var alias = _.words(bookTitle).join('').toLowerCase();
                        // add book step 4: add id / title / authors / amazonPage / alias
                        Promise.all([getCategoriesId, getWisdomizerId])
                        .then(function(){
                            bookObj.id = bookId;
                            bookObj.title = bookTitle;
                            bookObj.isbn = bookIsbn;
                            bookObj.cover_image = recommendation.bookCoverImage;
                            bookObj.amazon_page = recommendation.amazonPage;
                            bookObj.alias = 'books/' + alias;
                            bookObj.created = moment.utc().format('YYYY-MM-DD');;
                            bookObj.authors = recommendation.authors.map(function(author){
                                return {name: author};
                            });
                            // insert book to bookshelf
                            console.log('bookObj: ', bookObj);
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
                        // a different wisdomizer recommends old book
                        app.models.Book.findById(bookId, function(err, book){
                            var wisdomizerList = book.wisdomizers_id;
                            wisdomizerList.push(wisdomizerId);
                            book.updateAttributes({wisdomizers_id: wisdomizerList}, function(err, book){
                                console.log("Updated the book '" + bookTitle + "' wisdomizer's List.");
                                cb(null, "Updated the book '" + bookTitle + "' wisdomizer's List.");
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
            lastDayOfMonthBeforeThePreviousMonth = moment.utc().date(0).subtract(1,'months').endOf('month').format('YYYY-MM-DD'),
            today = new Date(), currentMonth = today.getMonth(),
            currentMonth = moment().month(currentMonth).format('MMM'),
            currentMonthRecommendationInfo = { currentMonth: currentMonth };

        return Recommendation.find().then(function(recommendations){
            return recommendations.map(function(recommendation){
                if (recommendation.created &&
                    recommendation.created !== undefined &&
                    moment(recommendation.created).isBefore(lastDayOfPreviousMonth) &&
                    moment(recommendation.created).isAfter(lastDayOfMonthBeforeThePreviousMonth))
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
            var wisdomizersInfo = app.models.Wisdomizer.find()
            .then(function(wisdomizers){
                return recommendations.map(function(recommendation){
                    var reformedRecommendation = {};
                    wisdomizers.forEach(function(wisdomizer){
                        if (wisdomizer.id === recommendation.wisdomizer_id) {
                            reformedRecommendation.name = wisdomizer.name;
                            reformedRecommendation.alias = wisdomizer.alias;
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
            return Promise.all([booksInfo, wisdomizersInfo]).then(function(promises){
                var booksInfo = promises[0],
                    wisdomizersInfo = promises[1];

                return booksInfo.map(function(bookInfo){
                    var reformedRecommendation = {};
                    wisdomizersInfo.forEach(function(wisdomizerInfo){
                        if (bookInfo.recommendationId === wisdomizerInfo.recommendationId) {
                            reformedRecommendation.bookTitle = bookInfo.title;
                            reformedRecommendation.bookAlias = bookInfo.alias;
                            reformedRecommendation.coverImage = bookInfo.coverImage;
                            reformedRecommendation.authors = bookInfo.authors;
                            reformedRecommendation.wisdomizerName = wisdomizerInfo.name;
                            reformedRecommendation.wisdomizerAlias = wisdomizerInfo.alias;
                            reformedRecommendation.src = wisdomizerInfo.src;
                            reformedRecommendation.srcTitle = wisdomizerInfo.srcTitle;
                        }
                    })
                    return reformedRecommendation;
                })
            })
        })
        .then(function(recommendations){
            var uniqRecommendations = _.uniqBy(recommendations, 'bookAlias');
            return uniqRecommendations.map(function(uniqRecommendation){
                var reformedRecommendation = { wisdomizers: [] };
                recommendations.forEach(function(recommendation){
                    if (uniqRecommendation.bookAlias === recommendation.bookAlias) {
                        var wisdomizer = { name: recommendation.wisdomizerName,
                                        alias: recommendation.wisdomizerAlias,
                                        src: recommendation.src,
                                        srcTitle: recommendation.srcTitle };
                        reformedRecommendation.authors = recommendation.authors;
                        reformedRecommendation.bookTitle = recommendation.bookTitle;
                        reformedRecommendation.bookAlias = recommendation.bookAlias;
                        reformedRecommendation.coverImage = recommendation.coverImage;
                        reformedRecommendation.wisdomizers.push(wisdomizer);
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
    function isRecommendationDetialFilled (bookTitle, authors, amazonPage, categories, wisdomizer, src, cb) {
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
        } else if (_.isEmpty(wisdomizers) || wisdomizers[0] === 'string') {
            console.log("Please insert at least 1 wisdomizer for the book.");
            error = {name: "Book without wisdomizer's recommendation",
                     status: 400,
                     message: 'Please insert at least 1 wisdomizer for the book'};
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
            return elems.map(function(wisdomizer){
                var reformedWisdomizer = {};
                reformedWisdomizer.name = wisdomizer.name.toLowerCase();
                reformedWisdomizer.profile_pic = wisdomizer.profile_pic;
                reformedWisdomizer.site = wisdomizer.site;
                reformedWisdomizer.id = wisdomizer.id;
                return reformedWisdomizer;
            })
        } else if (elems[0].id.charAt(0) === 'b') {
            return elems.map(function(book){
                var reformedBook = {};
                reformedBook.id = book.id;
                reformedBook.title = book.title.toLowerCase();
                reformedBook.authors = book.authors;
                reformedBook.amazonPage = book.amazon_page;
                reformedBook.categories = book.categories_id;
                reformedBook.wisdomizers = book.wisdomizers_id;
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