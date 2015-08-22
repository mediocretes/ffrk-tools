/**
 *
 * @param main
 * @param $http
 * @param $scope
 * @constructor
 */
function AbilitiesController(main, $scope) {

    this.main = main;
    this.$scope = $scope;

    // ability input
    this.input = '';

    // selected abilities from input
    this.abilities = [];

    // selected characters by abilities
    this.characters = [];

    // ... and here we go
    this.load();

}

AbilitiesController.prototype.load = function () {
    var self = this;

    self.main.AbilitiesController = this;
    self.main.load(function() {
        self.autocomplete();
    });
};

AbilitiesController.prototype.autocomplete = function () {
    var self = this;

    UIkit.ready(function () {

        UIkit.autocomplete($('#abilityForm'), {
            source  : function (release) {

                var regex  = new RegExp(self.input, 'i'),
                    result = self.main.abilities.filter(function (e) {
                        return regex.test(e.name);
                    });

                release(result); // release the data back to the autocompleter

            },
            template: '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">\
                        {{~items}}\
                            <li data-value="{{ $item.name }}">\
                                <a>\
                                    {{ $item.name }}, {{ $item.type }}, {{ $item.rarity }}*\
                                </a>\
                            </li>\
                        {{/items}}\
                    </ul>'
        });

        UIkit.$('#abilityForm').on('selectitem.uk.autocomplete', function (e, data, ac) {
            self.addAbility(data.value);
            self.$scope.$apply();
            ac.input.val('');
            data.value = null;
        });

    });

};

AbilitiesController.prototype.addAbility = function (value) {

    // stop if it's already in abilities
    var b = _.find(this.abilities, {name: value});
    if (b) throw new Error('Ability already added!');

    // search ability data
    var a = _.find(this.main.abilities, {name: value});
    if (!a) throw new Error('Ability not found!');

    var ability = new Ability(this, a);
    this.abilities.push(ability);

    for (var i in this.main.characters) {
        var c = this.main.characters[i];
        if (c.abilities[a.type] && a.rarity <= c.abilities[a.type]) {
            var character = _.find(this.characters, {name: c.name});

            // add character if not
            if (!character) {
                character = new Character(this, c);
                this.characters.push(character);
            }

            character.addLinkedAbility(ability);

        }
    }
};

AbilitiesController.prototype.removeAbility = function (ability) {

    _.remove(this.abilities, {name: ability.name});

    for (var i in this.characters) {
        var character = this.characters[i];
        _.remove(character.abilities, {name: ability.name});
    }

    this.cleanCharacters();

};

AbilitiesController.prototype.cleanCharacters = function () {

    _.remove(this.characters, function (c) {
        return (c.abilities.length == 0 && c.selected.length == 0);
    });

};


/**
 *
 * @constructor
 */
function Character(ctrl, data) {

    // controller instance
    this.ctrl = ctrl;

    // shortcut
    this.name = data.name;

    // data from json
    this.data = data;

    // suggested abilities
    this.abilities = [];

    // character can have many abilities
    // but they can select 2 max
    this.selected = [];
}

/**
 * Add the ability for the character
 * @param {Ability} a
 */
Character.prototype.addLinkedAbility = function (a) {
    this.abilities.push(
        new LinkedAbility(this, a)
    );
};

/**
 *
 * @param character
 * @param ability
 * @constructor
 */
function LinkedAbility(character, ability) {
    this.character = character;

    // extends ability
    this.name = ability.name;
    this.data = ability.data;
}

/**
 * Deplace from abilities to selected
 */
LinkedAbility.prototype.select = function () {
    _.remove(this.character.abilities, {name: this.name});
    this.character.selected.push(this);
    this.character.ctrl.removeAbility(this);
};

/**
 * Remove from selected
 */
LinkedAbility.prototype.unselect = function () {
    _.remove(this.character.selected, this);

    this.character.ctrl.cleanCharacters([this.character.name]);
};

/**
 * Select the LinkedAbility
 */
LinkedAbility.prototype.canBeSelected = function () {
    return (this.character.selected.length < 2);
};

/**
 *
 * @param ctrl
 * @param data
 * @constructor
 */
function Ability(ctrl, data) {
    this.ctrl = ctrl;

    this.name = data.name;
    this.data = data;
}