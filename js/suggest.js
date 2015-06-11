function Suggest(app, name, regex) {
    this.app = app;
    this.name = name;
    this.copy = this.name.replace(regex, function(x) {
        return '<b>' + x + '</b>';
    });
    this.copy = app.$sce.trustAsHtml(this.copy);
}