var app = angular.module('ffrk-io', ['ngSanitize', 'pascalprecht.translate', 'ngRoute']);

app.config(function ($translateProvider, $routeProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'locale/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    //$translateProvider.useSanitizeValueStrategy('ffrk-io');

    $routeProvider.
        when('/inventory', {
            templateUrl: 'templates/inventory.html',
            controller : 'InventoryController as app'
        }).
        when('/abilities', {
            templateUrl: 'templates/abilities.html',
            controller : 'AbilitiesController as app'
        }).
        otherwise({
            redirectTo: '/inventory'
        });
});

app.service('Main', ['$http', '$translate', Main]);
app.controller('MenuController', ['Main', '$location', MenuController]);
app.controller('InventoryController', ['Main', '$scope', '$sce', InventoryController]);
app.controller('AbilitiesController', ['Main', '$scope', AbilitiesController]);
