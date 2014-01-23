// Generated by CoffeeScript 1.6.3
var __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(['underscore', 'marionette', './row', 'tpl!templates/varify/tables/header.html'], function() {
  var Header, Marionette, row, templates, _, _ref;
  _ = arguments[0], Marionette = arguments[1], row = arguments[2], templates = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
  templates = _.object(['header'], templates);
  Header = (function(_super) {
    __extends(Header, _super);

    function Header() {
      _ref = Header.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Header.prototype.tagName = 'thead';

    Header.prototype.template = templates.header;

    Header.prototype.initialize = function() {
      this.data = {};
      if (!(this.data.view = this.options.view)) {
        throw new Error('view model required');
      }
    };

    return Header;

  })(Marionette.ItemView);
  return {
    Header: Header
  };
});
