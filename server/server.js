var loopback = require('loopback'),
    boot = require('loopback-boot'),
    exphbs = require('express-handlebars'),
    express = require('express'),
    path = require('path'),
    app = module.exports = loopback(),
    // routers
    categoriesRouter = require('./routes/categories');
    eggheadsRouter = require('./routes/eggheads');
    booksRouter = require('./routes/books');

// require modules
app.handlebars = require('handlebars');

// routing
app.use('/categories', categoriesRouter);
app.use('/eggheads', eggheadsRouter);
app.use('/books', booksRouter);

app.engine('hbs', exphbs({extname:'hbs',
                          defaultLayout:'main',
                          layoutsDir: process.cwd() + '/client/views/layouts',
                          partialsDir: process.cwd() + '/client/views/components'}));

app.set('view engine', 'hbs');
app.set('views', process.cwd() + '/client/views');
app.use('/images', express.static(process.cwd() + '/client/assets/images'));
app.use('/css', express.static(process.cwd() + '/client/assets/css'));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});