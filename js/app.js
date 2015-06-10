var app = angular.module('ffrk-io', []);

app.controller('AppController', ['$http', '$scope', AppController]);

function AppController($http, $scope) {
    var self = this;

    this.$scope = $scope;

    this.loaded = false;

    this.items = [];

    this.inventory = [];

    this.suggested = [];

    this.selected = 0;

    this.typingName = '';

    $http.get('/csv/RS.1.Star.csv').
        success(function (data) {
            self.csvParse(data);
            self.loaded = true;
        }).
        error(function (data, status, headers, config) {
            // todo handle error loading
        });

}

AppController.prototype.csvParse = function (csvData) {
    var lines = csvData.split("\n");
    lines.shift();
    lines.shift();
    for (var i in lines) {
        var item = new Item(lines[i]);
        this.items.push(item);
    }
};

function eventCancel(e) {
    if (!e)
        if (window.event) e = window.event;
        else return;
    if (e.cancelBubble != null) e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    if (window.event) e.returnValue = false;
    if (e.cancel != null) e.cancel = true;
}

AppController.prototype.findSuggestions = function (ev) {
    if (ev.keyCode == 38) // top
    {
        if (this.suggested.length == 0) {
            eventCancel(ev);
        }

        this.selected--;
        if (this.selected < 0) {
            this.selected = this.suggested.length - 1;
        }

        eventCancel(ev);
    }
    if (ev.keyCode == 40) // bottom
    {
        if (this.suggested.length == 0) {
            eventCancel(ev);
        }

        this.selected++;
        if (this.selected >= this.suggested.length) {
            this.selected = 0;
        }

        eventCancel(ev);
    }
    if (ev.keyCode == 13) // enter
    {
        if (this.suggested.length == 0) {
            eventCancel(ev);
        }

        this.inventory.push(this.suggested[this.selected]);

        eventCancel(ev);
    }

    if (this.typingName == '') {
        this.suggested = [];
    } else {
        this.suggested = [];
        // find the 5 first matches
        var i = 0;
        var nbr = 0;
        while (i < this.items.length && nbr < 5) {
            var item = this.items[i];
            if (item.name.toLowerCase().indexOf(this.typingName) != -1) {
                this.suggested.push(item);
                nbr++;
            }
            i++;
        }
    }
};

function Item(itemData) {
    var d = itemData.split(",");
    this.name = d[0];
    this.origin = d[1];
    this.rarity = d[2];
    this.type = d[3];
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

Item.prototype.select = function () {
    this.selected = true;
};

Item.prototype.unselect = function () {
    this.selected = false;
};