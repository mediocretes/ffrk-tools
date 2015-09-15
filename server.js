var Refresh = require('./refresh.js');

var CronJob = require('cron').CronJob;
var job = new CronJob({
    cronTime: '0 0 3 1/1 * ? *',
    onTick: function() {
        Refresh();
    },
    start: false,
    timeZone: 'Europe/Paris'
});
job.start();