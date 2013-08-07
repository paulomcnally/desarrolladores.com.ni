var express = require('express');
var app = express();

var controllers = require('./controllers');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', controllers.system.home);
app.get('/articulo/:slug', controllers.system.article);
app.get('/hangouts/:slug', controllers.system.hangouts);
app.post('/hook', controllers.system.hook);

app.listen(1934);