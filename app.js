var express = require('express');
var app = express();

var controllers = require('./controllers');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', controllers.system.home);
app.get('/articulo/:slug', controllers.system.article);
app.get('/update', controllers.system.update);

app.listen(process.env.VCAP_APP_PORT || 3000);