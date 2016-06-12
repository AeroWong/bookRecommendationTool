var loopback = require('loopback');
var boot = require('loopback-boot');
var exphbs = require('express-handlebars');
var express = require('express');
var path = require('path');

var app = module.exports = loopback();

// require modules
app.handlebars = require('handlebars');

app.engine('hbs', exphbs({extname:'hbs', 
                          defaultLayout:'main',
                          layoutsDir: process.cwd() + '/client/views/layouts'}));

app.set('view engine', 'hbs');
app.set('views', process.cwd() + '/client/views');

app.get('/testing', function(req, res){
  res.render('index');
})

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
