var _ = require('lodash');
var app = require('../../server/server.js');

module.exports = function (Book) {
    Book.addBook = function (bookDetialObj, cb) {
        var title = bookDetialObj.title,
            authors = bookDetialObj.authors,
            amazonPage = bookDetialObj.amazon_page,
            categories = bookDetialObj.categories_id,
            egghead = bookDetialObj.egghead_id,
            eggheadId,
            bookshelfBookLength,
            newBookId,
            isBookInBookshelf,
            lowerCaseBookTitle = title.toLowerCase(),
            lowerCaseEgghead = egghead.toLowerCase(),
            lowerCaseEggheadsInBookshelf,
            lowerCaseEggheadsWithIdInBookshelf,
            lowerCaseCategoriesWithIdInBookshelf,
            lowerCaseCategoriesInBookshelf,
            lowerCaseCategories = categories.map(function(category){return category.toLowerCase()}),
            bookObjectToSave = {categories_id: [],
                                authors: []};

        // check if the client fills in all the necessary book info
        // if (!isBookDetialFilled(title, authors, amazonPage, categories, eggheads, cb)) {
        //     return;
        // };

        // add book if only the book hasn't been recommended by an egghead before

        // query the bookshelf's books
        Book.find()
        .then(function(booksInBookshelf){
            bookshelfBookLength = booksInBookshelf.length;
            return turnBookshelfElementsToLowerCase(booksInBookshelf);
        })
        .then(function(lowerCaseBookTitles){
            return _.find(lowerCaseBookTitles, function(bookTitle){
                return bookTitle === lowerCaseBookTitle;
            })
        })
        .then(function(bookInBookshelf){
            // check if the book is already in bookshelf
            if (bookInBookshelf) {
                console.log("Bookshelf has a book named - " + title + " - already.");
                error = {name: 'Duplicated book in bookshelf',
                         status: 400,
                         message: "Bookshelf has a book named - " + title + " - already."};
                cb(null, error);
            } else {
                // check if the book was recommended by the egghead before
                // get egghead id

            }
        })
        // .then(function(categoriesInBookshelf){
        //     var bookshelfCategoryLength = categoriesInBookshelf.length;
        //     // create an array of categories with id
        //     lowerCaseCategoriesWithIdInBookshelf = reformBookshelfElements(categoriesInBookshelf);
        //     // create an array of categories
        //     lowerCaseCategoriesInBookshelf = turnBookshelfElementsToLowerCase(categoriesInBookshelf);
        //     // check if there is any new category bookshelf doesn't have
        //     categories.forEach(function(inputCategory){
        //         var lowerCaseCategory = inputCategory.toLowerCase();
        //         if (lowerCaseCategoriesInBookshelf.indexOf(lowerCaseCategory) == -1) {
        //             var newCategoryId;
        //             bookshelfCategoryLength ++;
        //             newCategoryId = 'c-' + String(bookshelfCategoryLength);
        //             // create new category if the bookshelf doesn't have input category
        //             // app.models.Category.create({
        //             //     id: newCategoryId,
        //             //     name: inputCategory
        //             // })
        //             console.log('New category created - ' + inputCategory);
        //             bookObjectToSave.categories_id.push(newCategoryId);
        //         } else {
        //             // get category id from existing categories in bookshelf
        //             getIdFromExistingElements(lowerCaseCategories, lowerCaseCategoriesWithIdInBookshelf, bookObjectToSave);
        //         }
        //     })
        //     // query bookshelf for existing eggheads
        //     return app.models.EggHead.find().then(function(eggheadsInBookshelf){
        //         return eggheadsInBookshelf;
        //     });
        // })
        // .then(function(eggheadsInBookshelf){
        //     var bookshelfEggheadLength = eggheadsInBookshelf.length;
        //     // create an array of eggheads with id
        //     lowerCaseEggheadsWithIdInBookshelf = reformBookshelfElements(eggheadsInBookshelf);
        //     // create an array of eggheads
        //     lowerCaseEggheadsInBookshelf = turnBookshelfElementsToLowerCase(eggheadsInBookshelf);
        //     // check if there the input egghead bookshelf doesn't have
        //     if (lowerCaseEggheadsInBookshelf.indexOf(lowerCaseEgghead) === -1) {
        //         var newEggheadId;
        //         bookshelfEggheadLength ++;
        //         newEggheadId = 'eh-' + String(bookshelfEggheadLength);
        //         // create new egghead if the bookshelf doesn't have input egghead
        //         // app.models.EggHead.create({
        //         //     id: newEggheadId,
        //         //     name: egghead
        //         // })
        //         console.log('New egghead created - ' + egghead);
        //         bookObjectToSave.egghead_id = newEggheadId;
        //     } else {
        //         // get existing egghead id
        //         lowerCaseEggheadsWithIdInBookshelf.forEach(function(egghead){
        //             if (lowerCaseEgghead === egghead.name) {
        //                 bookObjectToSave.egghead_id = egghead.id;
        //             }
        //         })
        //     }
                    // construct an id for new book
            bookshelfBookLength ++;
            newBookId = 'b-' + String(bookshelfBookLength);
            bookObjectToSave.id = newBookId;
            // insert the new book in the bookshelf
            Book.create({
                id: bookObjectToSave.id,
                title: bookObjectToSave.title,
                authors: bookObjectToSave.authors,
                amazon_page: bookObjectToSave.amazon_page,
                categories_id: bookObjectToSave.categories_id,
                eggheads_id: bookObjectToSave.eggheads_id
            })
            console.log('The following book is inserted in bookshelf: \n', bookObjectToSave);
        // })
    }
    Book.remoteMethod('addBook', {
        description: 'Insert a new book in bookshelf',
        http: {path: '/addBook', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Book info', type: 'Book', description: 'Book detail', http: {source: 'body'}},
        returns: {arg: 'book', type: Book, root: true}
    });
    function isBookDetialFilled (title, authors, amazonPage, categories, eggheads, cb) {
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
        }
    }
    function getIdFromExistingElements (lowerCaseElems, lowerCaseElemsWithIdInBookshelf, bookObjectToSave) {
        lowerCaseElems.forEach(function(inputElem){
            lowerCaseElemsWithIdInBookshelf.forEach(function(existingElem){
                if (inputElem === existingElem.name) {
                    if ('categories_id' in existingElem) {
                        bookObjectToSave.categories_id.push(existingElem.categories_id);
                    } else if ('eggheads_id' in existingElem) {
                        bookObjectToSave.eggheads_id.push(existingElem.eggheads_id);
                    }
                }
            })
        })
    }
};