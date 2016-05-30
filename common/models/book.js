var _ = require('lodash');
var app = require('../../server/server.js');

module.exports = function (Book) {
    Book.getBookInfo = function (book, cb) {

    }
    Book.remoteMethod('getBookInfo', {
        description: 'Insert a new book in bookshelf',
        http: {path: '/getBookInfo', verb: 'post', status: 200},
        accessType: 'WRITE',
        accepts: {arg: 'Book info', type: 'Book', description: 'Book detail', http: {source: 'body'}},
        returns: {arg: 'book', type: Book, root: true}
    });
};