var Item = require('./item.js');

/**
 *
 * @param data
 * @returns {Parser}
 * @constructor
 */
function Parser(data) {
    var lines = data.split("\n");

    // remove two first lines
    lines.shift();
    lines.shift();

    var html = '';
    var item = null;
    for (var i in lines) {

        if (lines[i] == '') continue;

        var line = lines[i].replace(new RegExp('"', 'g'), '').split(',');

        // new item
        if (line[3] != '') {
            if (item != null) {
                html += item.export();
            }

            item = new Item();
            item.name = line[3];
            item.type = line[5].replace('Type: ', '');
            item.rarity = parseInt(line[6]);
            item.url = line[8];

            if (item.type != 'Accessory') {
                item.addStat(line[0], line[1], line[2]);
            }

        } else if (item.type != 'Accessory') {
            item.addStat(line[0], line[1], line[2]);
        }
    }

    // last line
    if (item != null) {
        html += item.export();
    }

    return html;
}

module.exports = Parser;