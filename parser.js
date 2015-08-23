var Item = require('./item.js');

/**
 *
 * @param data
 * @returns {string}
 * @constructor
 */
function Parser(data) {

    var html = '';
    var item = null;

    for (var n in data) {

        var i = data[n];

        // new item
        if (i.BigName != '') {

            if (item) {
                html += item.export();
            }

            item = new Item();
            item.name = i.BigName;
            item.type = i.itemtype.text.replace('Type: ', '');
            item.rarity = parseInt(i.rarity);
            item.url = i.url;
        }

        if (i.stats != '') {
            item.addStat(i.stats, i.start, i.end);
        }

    }

    // last line
    if (item) {
        html += item.export();
    }

    return html;
}

module.exports = Parser;