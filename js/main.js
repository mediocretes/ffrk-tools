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
            self.refreshItemsNames();
            self.refreshAbilitiesNames();
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

    var date = new Date();
    var d = date.getMonth() + '-' + date.getFullYear();

    this.$http.get('/data/en.csv?d=' + d).
        then(function (r) {
            self.items = r.data.split("\n");

            self.$http.get('/data/extra.csv?d=' + d).
                then(function (r) {
                    var items = r.data.split("\n");
                    for (var i in items) {
                        self.items.unshift(items[i]);
                    }
                    self.complete(callback);
                });
        });

    this.$http.get('/data/abilities.json?d=' + d).
        then(function (r) {
            self.abilities = r.data;
            self.complete(callback);
        });

    this.$http.get('/data/characters.json?d=' + d).
        then(function (r) {
            self.characters = r.data;
            self.complete(callback);
        });
};

/**
 *
 */
Main.prototype.refreshItemsNames = function () {

    this.names.items = [];

    for (var i in this.items) {
        var infos = this.items[i].split(',');

        var name = infos[0];
        var translatedName = this.getTranslatedName('items', name);

        this.names.items.push(new Name(null, name, translatedName));
    }
};

/**
 *
 */
Main.prototype.refreshAbilitiesNames = function () {

    this.names.abilities = [];

    for (var i in this.abilities) {

        var name = this.abilities[i].name;
        var translatedName = this.getTranslatedName('abilities', name);

        this.names.abilities.push(new Name(null, name, translatedName));
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

    var date = new Date();
    var d = date.getMonth() + '-' + date.getFullYear();

    this.$http.get('/locale/items-' + this.lang + '.json?d=' + d).
        success(function (data) {
            self.locales[self.lang]['items'] = data;
            self.complete(callback);
        });

    this.$http.get('/locale/abilities-' + this.lang + '.json?d=' + d).
        success(function (data) {
            self.locales[self.lang]['abilities'] = data;
            self.refreshAbilitiesNames();
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
    var self = this, ability;

    this.lang = lang;
    this.$translate.use(lang);

    this.loadLocales(function () {

        if (self.InventoryController) {

            // change items names
            for (var i in self.InventoryController.inventory) {
                var item = self.InventoryController.inventory[i];
                item.name.refreshTranslated();
            }

            // change autocomplete names
            self.refreshItemsNames();
        }

        if (self.AbilitiesController) {

            // change abilities names
            for (var j in self.AbilitiesController.abilities) {
                ability = self.AbilitiesController.abilities[j];
                ability.name.refreshTranslated();
            }

            // change linked abilities names
            for (var k in self.AbilitiesController.characters) {
                var character = self.AbilitiesController.characters[k];
                for (var l in character.abilities) {
                    ability = character.abilities[l];
                    ability.name.refreshTranslated();
                }
            }

            // change autocomplete names
            self.refreshAbilitiesNames();

        }

    });

    this.saveLang();
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