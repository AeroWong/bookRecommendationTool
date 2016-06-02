module.exports = function(Category) {
    Category.getCategoryBooks = function(categoryAlias, cb) {
        Category.findOne({where: {alias: categoryAlias}})
        .then(function(){
            
        })
    }
    Category.remoteMethod ('getCategoryBooks', {
        description: 'add a new category for the bookshelf',
        accessType: 'WRITE',
        http: {path: '/getCategoryBooks', verb: 'post', status: 200},
        accepts: {arg: 'category', type: 'Category', description: 'Category name', http: {source: 'body'}},
        returns: {arg: 'book', type: Category, root: true}
    });    
};