var fs = require('fs');
var request = require('request');
var CSVParser = require('./parser.js');
var winston = require('winston');
var moment = require('moment');

winston.add(winston.transports.File, {filename:'logs/refresh.log', json: false});

function Refresh(fn) {

    winston.info(moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));

    request.get('http://kimonolabs.com/api/csv/2kfal7ve', function (err, resp, data) {
        if (!err && resp.statusCode == 200) {

            var html = null;

            try {
                html = CSVParser(data);
            } catch (err) {
                winston.error(err.message);
            }

            if (html != null) {
                fs.writeFile(__dirname + '/data/en.csv', html, function (err) {
                    if (err) {
                        winston.error(err);
                    }
                    winston.info('--done');
                });
            }
        }
    });
}

module.exports = Refresh;