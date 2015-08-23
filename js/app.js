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
            redirectTo: '/abilities'
        });
});

app.service('Main', ['$http', '$translate', Main]);
app.controller('MenuController', ['Main', '$location', MenuController]);
app.controller('InventoryController', ['Main', '$scope', '$sce', InventoryController]);
app.controller('AbilitiesController', ['Main', '$scope', AbilitiesController]);

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

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});