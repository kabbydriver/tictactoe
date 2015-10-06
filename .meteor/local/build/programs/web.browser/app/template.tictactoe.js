(function(){
Template.body.addContent((function() {
  var view = this;
  return [ HTML.H1("Welcome, Player ", Blaze.View("lookup:getPlayer", function() {
    return Spacebars.mustache(view.lookup("getPlayer"));
  })), "\n	", Spacebars.include(view.lookupTemplate("board")), "\n	", Spacebars.include(view.lookupTemplate("gameStatus")), "\n	", Spacebars.include(view.lookupTemplate("reset")) ];
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("board");
Template["board"] = new Template("Template.board", (function() {
  var view = this;
  return HTML.TABLE("\n	", Blaze.Each(function() {
    return Spacebars.call(view.lookup("rows"));
  }, function() {
    return [ " \n		", Spacebars.include(view.lookupTemplate("row")), "\n	" ];
  }), "\n");
}));

Template.__checkName("row");
Template["row"] = new Template("Template.row", (function() {
  var view = this;
  return HTML.TR("\n		", Blaze.Each(function() {
    return Spacebars.call(view.lookup("columns"));
  }, function() {
    return [ "	\n			", Spacebars.include(view.lookupTemplate("cell")), "\n		" ];
  }), "\n	");
}));

Template.__checkName("cell");
Template["cell"] = new Template("Template.cell", (function() {
  var view = this;
  return HTML.TD(Blaze.View("lookup:getImage", function() {
    return Spacebars.mustache(view.lookup("getImage"));
  }));
}));

Template.__checkName("gameStatus");
Template["gameStatus"] = new Template("Template.gameStatus", (function() {
  var view = this;
  return HTML.P(Blaze.View("lookup:whoseTurn", function() {
    return Spacebars.mustache(view.lookup("whoseTurn"));
  }));
}));

Template.__checkName("reset");
Template["reset"] = new Template("Template.reset", (function() {
  var view = this;
  return HTML.Raw("<button>Reset</button>");
}));

}).call(this);
