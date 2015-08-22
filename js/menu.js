/**
 *
 * @param main
 * @constructor
 */
function MenuController(main) {
    this.main = main;
}

MenuController.prototype.changeLang = function (lang) {
    this.main.changeLang(lang);
};