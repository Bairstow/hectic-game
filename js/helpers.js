// data object for holding helper functions
var helpers = {
  elt: function(name, className, id) {
    var newElt = document.createElement(name);
    if (className) {
      newElt.setAttribute('class', className);
    }
    if (id) {
      newElt.setAttribute('id', id);
    }
    return newElt;
  },
  eltNS: function(name, className, id) {
    // element creation assist
    var elt = document.createElementNS("http://www.w3.org/2000/svg",name);
    if (className) {
      elt.setAttribute('class', className);
    }
    if (id) {
      elt.setAttribute('id', id);
    }
    return elt;
  },
  setAtts: function(elt) {
    for (var i = 1; i < arguments.length; i++) {
      elt.setAttribute(arguments[i][0], arguments[i][1]);
    }
  },
};
