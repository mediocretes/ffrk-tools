function InventoryController($http, $scope, $sce, $translate) {
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

    this.orders = [];

    this.box = null;
    this.importArea = '';
    this.exportArea = '';

    this.loadLang();
    this.locales = {};

    this.completed = 2;
    var date = new Date();
    var d = date.getMonth() + '-' + date.getFullYear();
    this.$http.get('/data/en.csv?d=' + d).
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

InventoryController.prototype.refreshLocales = function () {
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

InventoryController.prototype.complete = function () {
    this.nbLoaded++;
    if (this.nbLoaded >= this.completed) {
        this.loaded = true;
        for (var i in this.csvData) {
            this.csvParse(this.csvData[i]);
        }
    }
};

InventoryController.prototype.csvParse = function (csvData) {
    var lines = csvData.split("\n");
    this.items = [];
    this.itemNames = [];
    for (var i in lines) {
        var infos = lines[i].split(',');

        var name = infos[0];
        var translatedName = this.locales[name] ? this.locales[name] : name;

        this.items.push(lines[i]);
        this.itemNames.push(new Name(this, name, translatedName));
    }

    if (this.afterRefreshLocales) this.afterRefreshLocales();
};

InventoryController.prototype.findSuggestions = function (ev) {
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

        this.addItem(new Item(this, this.suggested[this.selected].name));

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

InventoryController.prototype.chooseSuggest = function (suggest) {
    this.addItem(new Item(this, suggest.name));
    return false;
};

InventoryController.prototype.buildRegex = function () {
    var regex;
    regex = this.typingName.split('');
    regex = regex.join('.*');
    regex = new RegExp(regex, 'i');
    return regex;
};

InventoryController.prototype.optimize = function () {

    var organized = {};
    for (var i in this.inventory) {
        var item = this.inventory[i];
        if (item.type == 'Accessory') {
            continue;
        }
        item.toRemove = false;
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

InventoryController.prototype.showBox = function (name) {
    this.box = name;
    if (name == 'import') {
        this.importArea = '';
    }
    return false;
};

InventoryController.prototype.closeBox = function () {
    this.box = null;
    return false;
};

InventoryController.prototype.import = function () {
    this.loadInventory(this.importArea);
    this.saveInventory();
    this.closeBox();
    return false;
};

InventoryController.prototype.export = function () {
    this.showBox('export');
    this.exportArea = localStorage.inventory;
    return false;
};

InventoryController.prototype.reset = function () {
    if (confirm('Are you sure?')) {
        localStorage.clear();
        this.inventory = [];
        this.suggested = [];
    }
    return false;
};

InventoryController.prototype.addItem = function (item) {
    this.inventory.push(item);
    this.refreshOrder();
    this.saveInventory();
};

InventoryController.prototype.removeItem = function (item) {
    _.remove(this.inventory, item);
    this.saveInventory();
    return false;
};

InventoryController.prototype.changeOrder = function (field) {
    var order = _.find(this.orders, {field: field});
    if (order && order.asc) {
        order.asc = false;
    }
    else if (order && !order.asc) {
        _.remove(this.orders, order);
    }
    else if (!order) {
        this.orders.push({field: field, asc: true});
    }
    this.saveOrder();
    this.refreshOrder();
};

InventoryController.prototype.refreshOrder = function (field) {
    var fields = [];
    for (var i in this.orders) {
        var order = this.orders[i];
        fields.push((function (order) {
            return function (item) {
                var customField;
                var parts = order.field.split(':');
                if (parts.length == 1) {
                    if (order.field == 'name') {
                        customField = item.name.translated;
                    } else {
                        customField = item[order.field];
                    }
                } else {
                    customField = item[parts[0]](parts[1]);
                }
                return customField;
            }
        })(order));
    }

    var ascs = _.pluck(this.orders, 'asc');

    if (fields.length > 0) {
        this.inventory = _.sortByOrder(this.inventory, fields, ascs);
    } else {
        this.inventory = _.sortBy(this.inventory, function (x) {
            return x.name.translated;
        });
    }
};

InventoryController.prototype.loadOrder = function () {
    if (localStorage.orders) {
        this.orders = JSON.parse(localStorage.orders);
        this.refreshOrder();
    }
};

InventoryController.prototype.saveOrder = function () {
    localStorage.orders = JSON.stringify(this.orders);
};

InventoryController.prototype.isOrder = function (field, asc) {
    var order = _.find(this.orders, {field: field});
    return (order) ? (order.asc == asc) : false;
};

InventoryController.prototype.changeLang = function (lang) {

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

InventoryController.prototype.loadInventory = function (data) {

    data = data ? data : localStorage.inventory;

    if (!data && !localStorage.inventory) {
        return;
    }

    var items = JSON.parse(data);

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
    this.loadOrder();
};

InventoryController.prototype.saveInventory = function () {

    var items = [];
    for (var i in this.inventory) {
        var item = this.inventory[i];
        items.push({n: item.name.original, l: item.level});
    }

    localStorage.inventory = JSON.stringify(items);
};

InventoryController.prototype.loadLang = function () {
    if (localStorage.lang) {
        this.lang = localStorage.lang;
    } else {
        this.lang = this.$translate.preferredLanguage();
    }
    this.$translate.use(this.lang);
};

InventoryController.prototype.saveLang = function () {
    localStorage.lang = this.lang;
};