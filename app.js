var express = require('express');
var app = express();

var controllers = require('./controllers');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', controllers.system.home);
app.get('/articulos', controllers.system.articles);
app.get('/articulo/:slug', controllers.system.article);
app.get('/hangouts', controllers.system.hangouts);
app.get('/hangout/:slug', controllers.system.hangout);
app.get('/noticias', controllers.system.news);
app.get('/noticia/:slug', controllers.system.new);
app.post('/hook', controllers.system.hook);
app.get('/busqueda', controllers.system.search);

app.listen(1934);