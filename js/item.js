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
    this.rarity = d[3];
    this.level = (this.rarity - 1) * 5;
    this.type = d[2];
    this.toRemove = false;
    this.base = {
        atk: d[5],
        mag: d[6],
        acc: d[7],
        def: d[8],
        res: d[9],
        eva: d[10],
        mnd: d[11]
    };
    this.max = {
        atk: d[12],
        mag: d[13],
        acc: d[14],
        def: d[15],
        res: d[16],
        eva: d[17],
        mnd: d[18]
    };
    this.synergy = {
        atk: d[19],
        mag: d[20],
        acc: d[21],
        def: d[22],
        res: d[23],
        eva: d[24],
        mnd: d[25]
    };

}

Item.prototype.betterThan = function (other) {
    var diff = 0;
    for (var i in this.synergizeStats) {
        diff += (this.synergizeStats[i] - other.synergizeStats[i]);
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