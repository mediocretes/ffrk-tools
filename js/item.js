function Item(app, name) {
    this.app = app;

    var infos = _.find(app.main.items, function (x) {
        return x.indexOf(name.original) === 0;
    });

    if (!infos) throw new Error('No item found!');

    var d = infos.split(',');

    var re = /\((.*)\)/;
    var str = name.translated;
    var origins = re.exec(str);

    this.index = _.uniqueId();
    this.name = name;
    this.origin = origins ? origins[1] : '';
    this.type = d[1];
    this.rarity = parseInt(d[2]);

    this.levelMax1 = (this.rarity > 1) ? (this.rarity - 1) * 5 : 3;
    this.levelMax2 = (this.rarity > 1) ? this.levelMax1 + 5 : this.levelMax1 + 2;
    this.levelMax3 = this.levelMax2 + 5;

    this.level = this.levelMax1;

    this.toRemove = false;

    this.base = {
        atk: parseInt(d[3]) || 0,
        mag: parseInt(d[4]) || 0,
        acc: parseInt(d[5]) || 0,
        def: parseInt(d[6]) || 0,
        res: parseInt(d[7]) || 0,
        eva: parseInt(d[8]) || 0,
        mnd: parseInt(d[9]) || 0
    };
    this.max = {
        atk: parseInt(d[10]) || 0,
        mag: parseInt(d[11]) || 0,
        acc: parseInt(d[12]) || 0,
        def: parseInt(d[13]) || 0,
        res: parseInt(d[14]) || 0,
        eva: parseInt(d[15]) || 0,
        mnd: parseInt(d[16]) || 0
    };
    this.synergy = {
        atk: this.getSynergy('atk'),
        mag: this.getSynergy('mag'),
        acc: this.getSynergy('acc'),
        def: this.getSynergy('def'),
        res: this.getSynergy('res'),
        eva: this.getSynergy('eva'),
        mnd: this.getSynergy('mnd')
    };

}

Item.prototype.getSynergy = function(stat) {
    var start = this.base[stat];
    var end = this.max[stat];
    var rarity = this.rarity;
    return Math.ceil(((end - start) / ((5 * (rarity + 1)) - 1)) * (((5 * (rarity + 1)) + (10 * (rarity + 2))) - 1) + start);
};

Item.prototype.betterThan = function (other) {
    var diff = 0;
    for (var i in this.synergy) {
        diff += (this.curr(i) - other.curr(i));
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

    if(this.type == "Accessory") {
        // This was correct for every accessory I tested - about a dozen in all, of all rarities
        return Math.round(start * 1.5);
    }



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

Item.prototype.realm = function(stat) {
    return (this.app.realm == this.origin) ? this.syn(stat): this.curr(stat);
};

Item.prototype.formatted = function() {
    var name = this.name.translated;
    if(this.level == this.levelMax2) {
        name = name + ' +';
    } else if(this.level == this.levelMax3) {
        name = name + ' ++';
    }
    return name;
};
