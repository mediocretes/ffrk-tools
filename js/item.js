function Item(app, name) {
    var infos = _.find(app.items, function(x) {
        return x.indexOf(name.original) == 0;
    });

    if (!infos) throw new Error('No item found!');

    var d = infos.split(',');

    this.name = name;
    this.origin = d[1];
    this.rarity = d[2];
    this.type = d[3];
    this.toRemove = false;
    this.baseStats = {
        atk: d[4],
        mag: d[5],
        acc: d[6],
        def: d[7],
        res: d[8],
        eva: d[9],
        mnd: d[10]
    };
    this.maxedStats = {
        atk: d[11],
        mag: d[12],
        acc: d[13],
        def: d[14],
        res: d[15],
        eva: d[16],
        mnd: d[17]
    };
    this.synergizeStats = {
        atk: d[18],
        mag: d[19],
        acc: d[20],
        def: d[21],
        res: d[22],
        eva: d[23],
        mnd: d[24]
    };

}

Item.prototype.betterThan = function(other) {
    var diff = 0;
    for (var i in this.synergizeStats) {
        diff += (this.synergizeStats[i] - other.synergizeStats[i]); 
    }
    return (diff > 0);
};