/**
 *
 * @constructor
 */
function Main($http, $translate) {
    this.$http = $http;
    this.$translate = $translate;

    this.items = [];
    this.abilities = [];
    this.characters = [];

    // for autocomplete
    this.names = {};

    this.loadLang();
    this.locales = {};

}

/**
 *
 * @param callback
 */
Main.prototype.load = function (callback) {
    var self = this;

    self.loadData(function () {
        self.loadLocales(function () {
            if (callback) callback();
        });
    });
};

/**
 *
 * @param callback
 */
Main.prototype.loadData = function (callback) {
    var self = this;

    this.setComplete(3);

    this.$http.get('/data/en.csv').
        then(function (r) {
            self.csvParse(r.data);
            self.complete(callback);
        });

    this.$http.get('/data/abilities.json').
        then(function (r) {
            self.abilities = r.data;
            self.complete(callback);
        });

    this.$http.get('/data/characters.json').
        then(function (r) {
            self.characters = r.data;
            self.complete(callback);
        });
};

/**
 *
 * @param csvData
 */
Main.prototype.csvParse = function (csvData) {

    this.items = csvData.split("\n");

    this.refreshNames('items');
};

/**
 *
 * @param type
 */
Main.prototype.refreshNames = function (type) {

    this.names[type] = [];

    for (var i in this[type]) {
        var infos = this[type][i].split(',');

        var name = infos[0];
        var translatedName = this.getTranslatedName(type, name);

        this.names[type].push(new Name(null, name, translatedName));
    }
};

/**
 *
 * @param max
 */
Main.prototype.setComplete = function (max) {
    this.completes = 0;
    this.maxCompletes = max;
};

/**
 *
 * @param callback
 */
Main.prototype.complete = function (callback) {
    this.completes++;
    if (this.completes == this.maxCompletes) {
        callback();
    }
};

/**
 *
 * @param callback
 */
Main.prototype.loadLocales = function (callback) {
    var self = this;

    // nothing to do if it's en lang
    if (this.lang == 'en') {
        callback();
        return;
    }

    // maybe we have already do this?
    if (this.locales[this.lang]) {
        callback();
        return;
    }

    this.locales[self.lang] = {};

    this.setComplete(2);

    this.$http.get('/locale/items-' + this.lang + '.json').
        success(function (data) {
            self.locales[self.lang]['items'] = data;
            self.complete(callback);
        });

    this.$http.get('/locale/abilities-' + this.lang + '.json').
        success(function (data) {
            self.locales[self.lang]['abilities'] = data;
            self.complete(callback);
        });
};

/**
 *
 * @param type
 * @param name
 * @returns {*}
 */
Main.prototype.getTranslatedName = function (type, name) {

    if (!this.locales[this.lang]) {
        return name;
    }

    if (!this.locales[this.lang][type][name]) {
        return name;
    }

    return this.locales[this.lang][type][name];
};

/**
 *
 * @param lang
 */
Main.prototype.changeLang = function (lang) {
    var self = this;

    this.lang = lang;
    this.$translate.use(lang);

    this.loadLocales(function () {

        // change items names
        for (var i in self.InventoryController.inventory) {
            var item = self.InventoryController.inventory[i];
            item.name.refreshTranslated();
        }

        self.refreshNames('items');
        //console.log(self.itemNames);

        // todo change abilities names

    });

    this.saveLang();
};

/**
 *
 * @param name
 * @returns {boolean}
 */
Main.prototype.showBox = function (name) {
    this.box = name;
    if (name == 'import') {
        this.importArea = '';
    }
    return false;
};

/**
 *
 * @returns {boolean}
 */
Main.prototype.closeBox = function () {
    this.box = null;
    return false;
};

/**
 *
 * @returns {boolean}
 */
Main.prototype.import = function () {
    this.loadInventory(this.importArea);
    this.saveInventory();
    this.closeBox();
    return false;
};

/**
 *
 * @returns {boolean}
 */
Main.prototype.export = function () {
    this.showBox('export');
    this.exportArea = localStorage.inventory;
    return false;
};

/**
 *
 * @returns {boolean}
 */
Main.prototype.reset = function () {
    if (confirm('Are you sure?')) {
        localStorage.clear();
        this.inventory = [];
    }
    return false;
};

/**
 *
 */
Main.prototype.loadLang = function () {
    if (localStorage.lang) {
        this.lang = localStorage.lang;
    } else {
        this.lang = this.$translate.preferredLanguage();
    }
    this.$translate.use(this.lang);
};

/**
 *
 */
Main.prototype.saveLang = function () {
    localStorage.lang = this.lang;
};