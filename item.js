/**
 *
 * @constructor
 */
function Item() {
    this.base = {};
    this.max = {};
    this.synergy = {};
}

/**
 *
 * @param name
 * @param start
 * @param end
 */
Item.prototype.addStat = function (name, start, end) {
    var ref;
    var rarity = this.rarity;
    switch (name) {
        case 'Attack':
            ref = 'atk';
            break;
        case 'Accuracy':
            ref = 'acc';
            break;
        case 'Evasion':
            ref = 'eva';
            break;
        case 'Magic':
            ref = 'mag';
            break;
        case 'Mind':
            ref = 'mnd';
            break;
        case 'Defense':
            ref = 'def';
            break;
        case 'Resistance':
            ref = 'res';
            break;
        default:
            throw new Error('Wrong stat');
    }

    start = parseInt(start);
    end = parseInt(end);

    this.base[ref] = start;
    this.max[ref] = end;
};

/**
 *
 * @returns {string}
 */
Item.prototype.export = function () {
    
    // exclude this item
    // todo handle better?
    if (this.name == 'Defense Veil (X)') {
        return '';
    }

    var tab = [];

    tab.push(this.name);
    tab.push(this.type);
    tab.push(this.rarity);

    var refs = ['base', 'max'];
    var stats = ['atk', 'mag', 'acc', 'def', 'res', 'eva', 'mnd'];

    for (var i in refs) {
        for (var j in stats) {
            tab.push(this[refs[i]][stats[j]]);
        }
    }

    return tab.join(',') + "\n";
};

module.exports = Item;