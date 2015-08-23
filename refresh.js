var fs = require('fs');
var request = require('request');
var CSVParser = require('./parser.js');
var winston = require('winston');
var moment = require('moment');

winston.add(winston.transports.File, {filename: 'logs/refresh.log', json: false});

function Refresh(fn) {

    request.get('http://kimonolabs.com/api/json/2kfal7ve', function (err, resp, data) {
        if (!err && resp.statusCode == 200) {

            data = JSON.parse(data);

            var html = null;

            if (data.newdata) {

                try {
                    html = CSVParser(data.results.name);
                } catch (err) {
                    winston.error('Error: ' + err.message);
                }

            }

            if (html != null) {
                fs.writeFile(__dirname + '/data/en.csv', html, function (err) {
                    if (err) {
                        winston.error('Error: ' + err);
                    }
                    winston.info('Done: v' + data.version + ': ' + data.count + ' items');
                });
            }
        }
    });
}

module.exports = Refresh;