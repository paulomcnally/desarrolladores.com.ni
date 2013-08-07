// content = articles, authors, news, etc
var content = {};
content.repository = {};
content.repository.url = 'https://github.com/paulomcnally/content_desarrolladores.git';
content.repository.name = 'content_desarrolladores';

exports.content = content;

var web = {};

web.title = 'Desarrolladores Nicaragua';

exports.web = web;

var repository = {};

repository.exec = '/var/www/html/desarrolladores.com.ni/content_desarrolladores';

exports.repository = repository;