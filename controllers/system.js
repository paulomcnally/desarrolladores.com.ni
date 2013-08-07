// load require modules
var sys = require('sys')
var exec = require('child_process').exec;
var fs = require('fs');
var md = require("node-markdown").Markdown;
var path = require('path');
var crypto = require('crypto');
var moment = require('moment');
var config = require('../config');
moment.lang("es");

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

// create public function article
exports.article = function (req, res) {
    function out() {

        // set path to article files
        var path_article_json = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.json');
        var path_article_markdown = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.markdown');

        // load article json
        fs.readFile(path_article_json, 'utf8', function (err1, article_json) {
            if (err1) {
                res.send('Error loading JSON file');
            }
            else {
                // load article markdown
                fs.readFile(path_article_markdown, 'utf8', function (err2, article_markdown) {
                    if (err2) {
                        res.send('Error loading MARKDOWN file');
                    }
                    else {
                        // set article object
                        var article_obj = JSON.parse(article_json);

                        // load author json
                        var path_author_json = path.join(__dirname, '../' + config.content.repository.name + '/authors', article_obj.author + '.json');

                        fs.readFile(path_author_json, 'utf8', function (err3, author_json) {
                            if (err3) {
                                res.send('Error loading MARKDOWN file');
                            }
                            else {
                                // set markdown to html content in article object
                                article_obj.content = md(article_markdown);

                                // set data from string reading
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

exports.update = function (req, res) {
    function out() {
        // download new changes from git
        exec("git pull", puts);


        // set directory files
        var dir = path.join(__dirname, '../' + config.content.repository.name + '/articles/', '');


        var data = new Array();

        // read directory
        fs.readdir(dir, function (err, files) {
            if (err) throw err;
            var c = 0;

            // recore files
            files.forEach(function (file) {

                // read file
                fs.readFile(dir + file, 'utf-8', function (err, html) {
                    c++;
                    if (err) throw err;

                    // if file mime/type = text/json
                    if (file.split('.').pop() === "json") {
                        var json = JSON.parse(html);
                        var obj_item = {};
                        obj_item.date_format = json.date;
                        obj_item.date = moment(json.date).format('MMMM Do YYYY, h:mm:ss a');
                        obj_item.title = json.title;
                        obj_item.href = "/articulo/" + file.replace("." + file.split('.').pop(), '');
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
                        export_json.title = 'Desarrolladores Nicaragua';
                        export_json.type = 'home';
                        export_json.articles = new_item;

                        // export a json file
                        fs.writeFile("./articles.json", JSON.stringify(export_json), function (error) {
                            if (error) {
                                res.send(error)
                            }
                            res.redirect('/');
                        });
                    }

                });
            });

        });
    }

    return out();
}


exports.home = function (req, res) {
    function out() {
        var path_articles = path.join(__dirname, '../', 'articles.json');

        fs.readFile(path_articles, 'utf-8', function (err, data) {
            if (err) throw err;
            res.render('index', { data: JSON.parse(data) });
        });
    }

    return out();
}