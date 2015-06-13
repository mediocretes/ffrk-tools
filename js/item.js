function Item(app, name) {
    var infos = _.find(app.items, function (x) {
        return x.indexOf(name.original) > -1;
    });

    if (!infos) throw new Error('No item found!');

    var d = infos.split(',');

    var re = /\((.*)\)/;
    var str = name.translated;
    var origins = re.exec(str);

    this.index = _.uniqueId();
    this.name = name;
    this.origin = origins[1];
    this.rarity = d[2];
    this.url = d[3];
    this.level = (this.rarity - 1) * 5;
    this.type = d[1];
    this.toRemove = false;
    this.base = {
        atk: d[4],
        mag: d[5],
        acc: d[6],
        def: d[7],
        res: d[8],
        eva: d[9],
        mnd: d[10]
    };
    this.max = {
        atk: d[11],
        mag: d[12],
        acc: d[13],
        def: d[14],
        res: d[15],
        eva: d[16],
        mnd: d[17]
    };
    this.synergy = {
        atk: d[18],
        mag: d[19],
        acc: d[20],
        def: d[21],
        res: d[22],
        eva: d[23],
        mnd: d[24]
    };

}

Item.prototype.betterThan = function (other) {
    var diff = 0;
    for (var i in this.synergy) {
        diff += (this.synergy[i] - other.synergy[i]);
    }
    return (diff > 0);
};

Item.prototype.curr = function (stat) {
    var start = (this.base[stat] == '') ? 0 : parseInt(this.base[stat]);
    var max = (this.max[stat] == '') ? 0 : parseInt(this.max[stat]);
    var level = parseInt(this.level);
    var maxLevel = (parseInt(this.rarity) + 1) * 5;

    if (max == '') {
        return '';
    } else {
        return start + Math.ceil((max - start) * ((level - 1) / (maxLevel - 1)));
    }
};

Item.prototype.syn = function (stat) {
    var start = (this.base[stat] == '') ? 0 : parseInt(this.base[stat]);
    var max = (this.max[stat] == '') ? 0 : parseInt(this.max[stat]);
    var level = parseInt(this.level);
    var maxLevel = (parseInt(this.rarity) + 1) * 5;

    var bonusLevel = (Math.floor(this.level / 5) + 1) * 10;
    if (this.level < 5) {
        bonusLevel += 5;
    }

    if (max == '') {
        return '';
    } else {
        return start + Math.ceil((max - start) * ((level - 1 + bonusLevel) / (maxLevel - 1)));
    }
};