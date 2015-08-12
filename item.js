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
    this.synergy[ref] = Math.ceil(((end - start) / ((5 * (rarity + 1)) - 1)) * (((5 * (rarity + 1)) + (10 * (rarity + 2))) - 1) + start);
};

/**
 *
 * @returns {string}
 */
Item.prototype.export = function () {
    var tab = [];

    tab.push(this.name);
    tab.push(this.type);
    tab.push(this.rarity);
    tab.push(this.url);

    var refs = ['base', 'max', 'synergy'];
    var stats = ['atk', 'mag', 'acc', 'def', 'res', 'eva', 'mnd'];

    for (var i in refs) {
        for (var j in stats) {
            tab.push(this[refs[i]][stats[j]]);
        }
    }

    return tab.join(',') + "\n";
};

module.exports = Item;