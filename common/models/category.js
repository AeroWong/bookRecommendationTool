module.exports = function(Category) {
    Category.findCategories = function(cb) {
        //check if the bookshelf already had the category
        Category.find().then(function(allCategories){
            // console.log(allCategories);
            return allCategories;
        });
    }
    Category.remoteMethod ('findCategories', {
        description: 'add a new category for the bookshelf',
        accessType: 'WRITE',
        http: {path: '/findCategories', verb: 'post', status: 200},
        accepts: {arg: 'category', type: 'Category', description: 'Category name', http: {source: 'body'}},
        returns: {arg: 'book', type: Category, root: true}
    });    
};