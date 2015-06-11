function Name(app, name, translatedName) {
    this.app = app;
    this.original = name;
    this.translated = translatedName;
}

Name.prototype.formatted = function (regex) {
    var res = this.translated.replace(regex, function (x) {
        return '<b>' + x + '</b>';
    });
    return this.app.$sce.trustAsHtml(res);
};

Name.prototype.refreshTranslated = function () {
    this.translated = this.app.locales[this.original] ? this.app.locales[this.original] : this.original;
};