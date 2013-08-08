// load require modules
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var md = require("node-markdown").Markdown;
var path = require('path');
var crypto = require('crypto');
var moment = require('moment');
var config = require('../config');
moment.lang("es");

// command lines puts
function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

// home
exports.home = function (req, res) {
    function out() {
        var data = {};
        data.title = config.web.title;
        data.type = 'home';
        var path_articles = path.join(__dirname, '../', 'articles.json');
        var path_hangouts = path.join(__dirname, '../', 'hangouts.json');
        var path_news = path.join(__dirname, '../', 'news.json');

        fs.readFile(path_articles, 'utf-8', function (err, articles) {
            if (err){
                res.send('Error loading JSON articles');
            }
            else{
                // set articles object
                data.articles = JSON.parse( articles );
                fs.readFile(path_hangouts, 'utf-8', function (err, hangouts) {
                    if (err){
                        res.send('Error loading JSON hangouts');
                    }
                    else{
                        // set hangouts object
                        data.hangouts = JSON.parse( hangouts );
                        fs.readFile(path_news, 'utf-8', function (err, news) {
                            if (err){
                                res.send('Error loading JSON news');
                            }
                            else{
                                data.news = JSON.parse( news );
                                res.render('index', { data: data });
                            }
                        });
                    }
                });

            }
        });
    }

    return out();
}

// hook
exports.hook  = function (req, res) {
    function create( type ){
        // set directory files
        var dir = path.join(__dirname, '../' + config.content.repository.name + '/' +type + '/', '');


        var data = new Array();

        // read directory
        fs.readdir(dir, function (err, files) {
            if (err) throw err;
            var c = 0;

            // recore files
            files.forEach(function (file) {

                // read file
                fs.readFile(dir + file, 'utf-8', function (err, json_file) {
                    c++;
                    if (err) throw err;

                    // if file mime/type = text/json
                    if (file.split('.').pop() === "json") {
                        var json = JSON.parse(json_file);
                        var obj_item = {};
                        obj_item.date_format = json.date;
                        obj_item.date = moment(json.date).format('MMMM Do YYYY, h:mm:ss a');
                        obj_item.title = json.title;
                        switch(json.type){
                            case "manual":
                                obj_item.href = "/articulo/" + file.replace("." + file.split('.').pop(), '');
                                break;
                            case "hangout":
                                obj_item.href = "/hangout/" + file.replace("." + file.split('.').pop(), '');
                                obj_item.youtube = json.youtube;
                                break;
                            case "news":
                                obj_item.href = "/noticia/" + file.replace("." + file.split('.').pop(), '');
                                break;
                        }

                        data.push(obj_item);
                    }

                    // if finish load al files
                    if (files.length == c) {
                        // order object by date
                        var new_item = data.sort(function (a, b) {
                            return (new Date(b.date_format).getTime() - new Date(a.date_format).getTime());
                        });


                        // create a json objet
                        var export_json = {};

                        //export_json.type = 'home';
                        export_json.rows = new_item;
                        switch(type){
                            case "articles":
                                export_json.title = 'Artículos - ' +  config.web.title;
                                break;
                            case "hangouts":
                                export_json.title = 'Hangouts - ' +  config.web.title;
                                break;
                            case "news":
                                export_json.title = 'Noticias - ' +  config.web.title;
                                break;
                            case "events":
                                export_json.title = 'Eventos - ' +  config.web.title;
                                break;
                        }


                        // export a json file
                        fs.writeFile('./' + type + '.json', JSON.stringify(export_json), function (error) {
                            if (error) {
                                res.send(error)
                            }
                        });
                    }
                });
            });
        });
    }

    function out() {
        exec(config.repository.exec, puts);

        create('articles');
        create('hangouts');
        create('news');

        res.send('true');
    }

    return out();
}

// articles
exports.articles = function (req, res) {
    function out() {
        var path_articles = path.join(__dirname, '../', 'articles.json');

        fs.readFile(path_articles, 'utf-8', function (err, data) {
            if (err){
                res.send('Error loading JSON articles file');
            }
            else{
                res.render('articles', { data: JSON.parse(data) });
            }
        });
    }

    return out();
}

// article
exports.article = function (req, res) {
    function out() {

        // set path to article files
        var path_article_json = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.json');
        var path_article_markdown = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.markdown');

        // load article json
        fs.readFile(path_article_json, 'utf8', function (err1, article_json) {
            if (err1) {
                res.send('Error loading JSON article file');
            }
            else {
                // load article markdown
                fs.readFile(path_article_markdown, 'utf8', function (err2, article_markdown) {
                    if (err2) {
                        res.send('Error loading MARKDOWN article file');
                    }
                    else {
                        // set article object
                        var article_obj = JSON.parse(article_json);

                        // load author json
                        var path_author_json = path.join(__dirname, '../' + config.content.repository.name + '/authors', article_obj.author + '.json');

                        fs.readFile(path_author_json, 'utf8', function (err3, author_json) {
                            if (err3) {
                                res.send('Error loading MARKDOWN article file');
                            }
                            else {
                                // set markdown to html content in article object
                                article_obj.content = md(article_markdown);

                                // set date from string reading
                                article_obj.date = moment(article_obj.date).fromNow();

                                if (article_obj.update != "") {
                                    article_obj.update = moment(article_obj.update).fromNow();
                                }

                                // set author object
                                var author_obj = JSON.parse(author_json);

                                // set md5 hash to load picture from gravatar.com
                                author_obj.picture = crypto.createHash('md5').update(author_obj.email).digest("hex");

                                // set author object on article object
                                article_obj.author = author_obj;

                                // load article template with article object
                                res.render('article', { data: article_obj });
                            }
                        });

                    }
                });
            }
        });
    }

    return out();
}

// hangouts
exports.hangout = function (req, res) {
    function out() {
        // set path to article files
        var path_hangout_json = path.join(__dirname, '../' + config.content.repository.name + '/hangouts', req.params.slug + '.json');
        var path_hangout_markdown = path.join(__dirname, '../' + config.content.repository.name + '/hangouts', req.params.slug + '.markdown');

        // read file content
        fs.readFile(path_hangout_json, 'utf-8', function (err1, hangout_json) {
            if (err1) {
                res.send('Error loading JSON hangout file');
            }
            else{
                // load article markdown
                fs.readFile(path_hangout_markdown, 'utf8', function (err2, hangout_markdown) {
                    if (err2) {
                        res.send('Error loading MARKDOWN hangout file');
                    }
                    else{
                        // set article object
                        var hangout_obj = JSON.parse(hangout_json);

                        // load author json
                        var path_author_json = path.join(__dirname, '../' + config.content.repository.name + '/authors', hangout_obj.author + '.json');

                        fs.readFile(path_author_json, 'utf8', function (err3, author_json) {
                            if (err3) {
                                res.send('Error loading JSON author file');
                            }
                            else {
                                hangout_obj.href = '/hangout/' + req.params.slug;

                                // set markdown to html content in article object
                                hangout_obj.content = md(hangout_markdown);

                                // set date from string reading
                                hangout_obj.date = moment(hangout_obj.date).fromNow();

                                if (hangout_obj.update != "") {
                                    hangout_obj.update = moment(hangout_obj.update).fromNow();
                                }

                                // set author object
                                var author_obj = JSON.parse(author_json);

                                // set md5 hash to load picture from gravatar.com
                                author_obj.picture = crypto.createHash('md5').update(author_obj.email).digest("hex");

                                // set author object on hangout object
                                hangout_obj.author = author_obj;

                                // load article template with hangout object
                                res.render('hangout', { data: hangout_obj });
                            }
                        });
                    }
                });
            }
        });
    }

    return out();
}

// hangouts
exports.hangouts = function (req, res) {
    function out() {
        var path_hangouts = path.join(__dirname, '../', 'hangouts.json');

        fs.readFile(path_hangouts, 'utf-8', function (err, data) {
            if (err){
                res.send('Error loading JSON hangouts file');
            }
            else{
                res.render('hangouts', { data: JSON.parse(data) });
            }

        });
    }

    return out();
}

// new
exports.new = function (req, res) {
    function out() {

        // set path to new files
        var path_new_json = path.join(__dirname, '../' + config.content.repository.name + '/news', req.params.slug + '.json');
        var path_new_markdown = path.join(__dirname, '../' + config.content.repository.name + '/news', req.params.slug + '.markdown');

        // load new json
        fs.readFile(path_new_json, 'utf8', function (err1, new_json) {
            if (err1) {
                res.send('Error loading JSON new file');
            }
            else {
                // load new markdown
                fs.readFile(path_new_markdown, 'utf8', function (err2, new_markdown) {
                    if (err2) {
                        res.send('Error loading MARKDOWN new file');
                    }
                    else {
                        // set new object
                        var new_obj = JSON.parse(new_json);

                        // load author json
                        var path_author_json = path.join(__dirname, '../' + config.content.repository.name + '/authors', new_obj.author + '.json');

                        fs.readFile(path_author_json, 'utf8', function (err3, author_json) {
                            if (err3) {
                                res.send('Error loading JSON new file');
                            }
                            else {
                                // set markdown to html content in new object
                                new_obj.content = md(new_markdown);

                                // set date from string reading
                                new_obj.date = moment(new_obj.date).fromNow();

                                if (new_obj.update != "") {
                                    new_obj.update = moment(new_obj.update).fromNow();
                                }

                                // set author object
                                var author_obj = JSON.parse(author_json);

                                // set md5 hash to load picture from gravatar.com
                                author_obj.picture = crypto.createHash('md5').update(author_obj.email).digest("hex");

                                // set author object on new object
                                new_obj.author = author_obj;

                                // load article template with new object
                                res.render('new', { data: new_obj });
                            }
                        });

                    }
                });
            }
        });
    }

    return out();
}

// news
exports.news = function (req, res) {
    function out() {
        var path_news = path.join(__dirname, '../', 'news.json');

        fs.readFile(path_news, 'utf-8', function (err, data) {
            if (err){
                res.send('Error loading JSON news file');
            }
            else{
                res.render('news', { data: JSON.parse(data) });
            }
        });
    }

    return out();
}
