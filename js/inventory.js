function InventoryController(main, $scope, $sce) {

    this.main = main;
    this.$scope = $scope;
    this.$sce = $sce;

    // ??
    this.loaded = false;

    // item input
    this.input = '';

    // Item[]
    this.inventory = [];

    // realm
    this.realm = null;
    this.realms = ['II'];

    // specific orders to sort the inventory
    this.orders = [];

    // export & import
    this.importArea = '';
    this.exportArea = '';

    // ... and here we go
    this.load();

}

InventoryController.prototype.load = function () {
    var self = this;

    self.main.InventoryController = this;
    self.main.load(function() {
        self.loadInventory();
        self.autocomplete();
    });
};

InventoryController.prototype.autocomplete = function () {
    var self = this;

    UIkit.ready(function () {

        UIkit.autocomplete($('#itemForm'), {
            source  : function (release) {

                var regex  = new RegExp(self.input, 'i'),
                    result = self.main.names.items.filter(function (e) {
                        return regex.test(e.translated);
                    });

                release(result); // release the data back to the autocompleter

            },
            template: '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">\
                        {{~items}}\
                            <li data-original="{{ $item.original }}" \
                                data-translated="{{ $item.translated }}">\
                                <a>\
                                    {{ $item.translated }}\
                                </a>\
                            </li>\
                        {{/items}}\
                    </ul>'
        });

        UIkit.$('#itemForm').on('selectitem.uk.autocomplete', function (e, data, ac) {
            self.addItem(new Item(self, new Name(self, data.original, data.translated)));
            self.$scope.$apply();
            ac.input.val('');
            data.value = null;
        });

    });

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

InventoryController.prototype.addItem = function (item) {
    this.inventory.push(item);
    this.refreshRealms();
    this.refreshOrder();
    this.saveInventory();
};

InventoryController.prototype.removeItem = function (item) {
    _.remove(this.inventory, item);
    this.refreshRealms();
    this.saveInventory();
    return false;
};

InventoryController.prototype.refreshRealms = function () {
    this.realms = _.uniq(_.pluck(this.inventory, 'origin'));
    this.realms.push(null);
    if ($.inArray(this.realm, this.realms) == -1) {
        this.realm = null;
        this.saveRealm();
    }
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

InventoryController.prototype.refreshOrder = function () {
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

InventoryController.prototype.loadRealm = function () {
    if (localStorage.realm) {
        this.realm = localStorage.realm;
    }
};

InventoryController.prototype.saveRealm = function () {
    localStorage.realm = this.realm;
};

InventoryController.prototype.isOrder = function (field, asc) {
    var order = _.find(this.orders, {field: field});
    return (order) ? (order.asc == asc) : false;
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
        var translatedName = this.main.getTranslatedName('items', n);
        var name = new Name(this, n, translatedName);
        var final = new Item(this, name);
        final.level = item.l;
        this.inventory.push(final);
    }
    this.loadRealm();
    this.refreshRealms();
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

/**
 *
 * @returns {boolean}
 */
InventoryController.prototype.import = function () {
    this.loadInventory(this.importArea);
    this.saveInventory();
    this.importArea = '';
};

/**
 *
 * @returns {boolean}
 */
InventoryController.prototype.export = function () {
    this.exportArea = localStorage.inventory;
};

/**
 *
 * @returns {boolean}
 */
InventoryController.prototype.reset = function () {
    if (confirm('Are you sure?')) {
        localStorage.clear();
        this.inventory = [];
    }
};