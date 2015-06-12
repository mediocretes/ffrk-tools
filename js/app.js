var app = angular.module('ffrk-io', ['ngSanitize', 'pascalprecht.translate']);

app.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'locale/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    //$translateProvider.useSanitizeValueStrategy('ffrk-io');
});

app.controller('AppController', ['$http', '$scope', '$sce', '$translate', AppController]);

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

function AppController($http, $scope, $sce, $translate) {
    var self = this;

    this.$http = $http;
    this.$scope = $scope;
    this.$sce = $sce;
    this.$translate = $translate;

    this.nbLoaded = 0;
    this.loaded = false;

    this.csvData = [];

    // String[]
    // csv lines
    this.items = [];

    // String[]
    this.itemNames = [];

    // String[]
    this.suggested = [];

    // Item[]
    this.inventory = [];

    this.translatedNames = {};

    this.selected = 0;

    this.typingName = '';

    this.loadLang();
    this.locales = {};

    this.completed = 2;
    this.$http.get('/csv/en.csv').
        success(function (data) {
            self.csvData.push(data);
            self.complete();
        }).
        error(function (data, status, headers, config) {
            // todo handle error loading
        });

    this.afterRefreshLocales = function () {
        self.loadInventory();
    };
    this.refreshLocales();

}

AppController.prototype.refreshLocales = function () {
    var self = this;

    this.locale = {};

    if (this.lang == 'en') {
        this.locales = {};
        this.complete();
        return;
    }

    this.$http.get('/locale/items-' + this.lang + '.json').
        success(function (data) {
            self.locales = data;
            self.complete();
        }).
        error(function (data, status, headers, config) {
            // todo handle error loading
        });
};

AppController.prototype.complete = function () {
    this.nbLoaded++;
    if (this.nbLoaded >= this.completed) {
        this.loaded = true;
        for (var i in this.csvData) {
            this.csvParse(this.csvData[i]);
        }
    }
};

AppController.prototype.csvParse = function (csvData) {
    var lines = csvData.split("\n");
    lines.shift();
    lines.shift();
    this.items = [];
    this.itemNames = [];
    for (var i in lines) {
        var infos = lines[i].split(',');

        var name = infos[1];
        var translatedName = this.locales[name] ? this.locales[name] : name;

        this.items.push(lines[i]);
        this.itemNames.push(new Name(this, name, translatedName));
    }

    if (this.afterRefreshLocales) this.afterRefreshLocales();
};

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

        this.inventory.push(new Item(this, this.suggested[this.selected].name));
        this.saveInventory();

        eventCancel(ev);
    }

    if (this.typingName == '') {
        this.suggested = [];
    } else {
        this.suggested = [];
        // find the 15 first matches
        var i = 0;
        var nbr = 0;
        while (i < this.itemNames.length && nbr < 15) {
            var name = this.itemNames[i];
            var regex = this.buildRegex();
            if (name.translated.match(regex)) {
                this.suggested.push(new Suggest(this, name));
                nbr++;
            }
            i++;
        }
    }
};

AppController.prototype.buildRegex = function () {
    var regex;
    regex = this.typingName.split('');
    regex = regex.join('.*');
    regex = new RegExp(regex, 'i');
    return regex;
};

AppController.prototype.optimize = function () {

    var organized = {};
    for (var i in this.inventory) {
        var item = this.inventory[i];
        if (organized[item.type]) {
            if (organized[item.type][item.origin]) {
                var other = organized[item.type][item.origin];
                if (item.betterThan(other)) {
                    other.toRemove = true;
                    organized[item.type][item.origin] = item;
                } else {
                    item.toRemove = true;
                }
            } else {
                organized[item.type][item.origin] = item;
            }
        } else {
            organized[item.type] = [];
            organized[item.type][item.origin] = item;
        }
    }

    return false;

};

AppController.prototype.reset = function () {
    localStorage.clear();
    this.inventory = [];
    this.suggested = [];
    return false;
};

AppController.prototype.removeItem = function (item) {
    _.remove(this.inventory, item);
    this.saveInventory();
};

AppController.prototype.changeLang = function (lang) {

    this.lang = lang;
    this.$translate.use(lang);
    this.completed = 1;
    this.afterRefreshLocales =
        function () {
            // change suggests names
            for (var i in this.suggested) {
                var suggest = this.suggested[i];
                suggest.name.refreshTranslated();
            }

            // change inventory names
            for (var i in this.inventory) {
                var item = this.inventory[i];
                item.name.refreshTranslated();
            }
        };
    this.refreshLocales();
    this.saveLang();

    return false;

};

AppController.prototype.loadInventory = function () {

    if (!localStorage.inventory) {
        return;
    }

    var items = JSON.parse(localStorage.inventory);

    this.inventory = [];
    for (var i in items) {
        var item = items[i];
        var n = item.n;
        var translatedName = this.locales[n] ? this.locales[n] : n;
        var name = new Name(this, n, translatedName);
        var final = new Item(this, name);
        final.level = item.l;
        this.inventory.push(final);
    }
};

AppController.prototype.saveInventory = function () {

    var items = [];
    for (var i in this.inventory) {
        var item = this.inventory[i];
        items.push({n: item.name.original, l: item.level});
    }

    console.log(items);

    localStorage.inventory = JSON.stringify(items);
    console.log(localStorage.inventory);
};

AppController.prototype.loadLang = function () {
    if (localStorage.lang) {
        this.lang = localStorage.lang;
    } else {
        this.lang = this.$translate.preferredLanguage();
    }
    this.$translate.use(this.lang);
};

AppController.prototype.saveLang = function () {
    localStorage.lang = this.lang;
};