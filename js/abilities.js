function AbilitiesController($http, $scope) {

    var self = this;

    // input
    self.input = '';

    // load abilities & characters json files
    self.$http = $http;
    self.$scope = $scope;

    self.abilities = [];
    $http.get('/data/abilities.json').
        then(function (r) {
            self.abilities = r.data;
            self.autocomplete(r.data);
        });

    self.characters = [];
    $http.get('/data/characters.json').
        then(function (r) {
            self.characters = r.data;
        });

    self.selectedAbilities = [];
    self.selectedCharacters = [];

}

AbilitiesController.prototype.autocomplete = function (data) {
    var self = this;

    UIkit.autocomplete($('#abilityForm'), {
        source  : function (release) {

            var regex  = new RegExp(self.input, 'i'),
                result = data.filter(function (e) {
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

};


AbilitiesController.prototype.addAbility = function (value) {

    // search for ability
    var ability = _.find(this.abilities, {name: value});

    // if any
    if (ability) {
        this.selectedAbilities.push(ability);
        for (var i in this.characters) {
            var character = this.characters[i];
            if (character.abilities[ability.type] && ability.rarity <= character.abilities[ability.type]) {
                if (character.choices) {
                    character.choices.push(ability);
                } else {
                    character.choices = [ability];
                }
                this.selectedCharacters.push(character);
            }
        }
    }
};


AbilitiesController.prototype.removeAbility = function (ability) {

    var removed;

    removed = _.remove(this.selectedAbilities, ability);

    if (removed.length > 0) {
        for (var i in this.characters) {
            var character = this.characters[i];

            if (!character.choices) continue;

            removed = _.remove(character.choices, ability);
            if (character.choices.length == 0) {
                _.remove(this.selectedCharacters, character);
            }
        }
    }

};

AbilitiesController.prototype.getAbilities = function (character) {
    var res = [];

    return res;
};