/**
 *
 * @param main
 * @param $location
 * @constructor
 */
function MenuController(main, $location) {
    this.main = main;
    this.$location = $location;
}

MenuController.prototype.isActive = function (route) {
    return route === this.$location.path();
};

MenuController.prototype.changeLang = function (lang) {
    this.main.changeLang(lang);
};