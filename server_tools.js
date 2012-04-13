var URL = require("url");
var utils = require("nodetk/utils");


exports.get_connector_from_str_routes = function(routes) {
  /* Returns connect middleware from given routes.
   *
   * Arguments:
   *  - routes: hash looking like:
   *      {'GET': {"/toto": fct, "/titi": fct},
   *       'POST': {"/toto": fct},
   *       'DELETE': {"/tutu/tata/": fct}
   *       }
   *  
   *  The routes arg is used to search where to route the current req.
   *  If nothing found, next() is called.
   *
   *  NOTE: pathnames must be strings, no regexp.
   *
   */
  return function(req, res, next) {
    var url = URL.parse(req.url);
    var method = routes[req.method] && routes[req.method][url.pathname];
    if(method) method(req, res);
    else next();
  };
};

exports.get_connector_from_regexp_routes = function(routes) {
  /* Returns connect middleware from given routes.
   *
   * Arguments:
   *   - routes: hash looking like this:
   *      {'GET': [['/toto/(\\w+)'}, fct]],
   *       'POST': [['...', fct],
   *                ['...', fct]],
   *       }
   *
   * The given routes dictionnary is used to associate a route
   * to a fct to execute.
   *  - If a route doesn't match any route in the dictionnary,
   * next() is called.
   *  - If a route is matched, then the associated fct is called
   * with the match object as argument.
   *
   * NOTE: pathnames must be strings compilable to regexp or regexps.
   * String are modified as following to construct the regexps:
   *  - '^' is appended at beggining and '$' at end;
   *  - '/' ar escaped.
   * In case of strings, '/' are escaped.
   * Beginning/end of line chars will be added before compiling.
   *
   */
  // Copy routes and replace strings by regexps:
  routes = utils.deep_extend({}, routes);
  utils.each(routes, function(verb, actions) {
    for(var i; i=0; i<actions.length) {
      var route = actions[i][0];
      if (typeof(route) == 'string') {
        route = route.replace(/\//g, '\\/')
        actions[i][0] = new RegExp('^' + route + '$');
      }
    }
  });
  return function(req, res, next) {
    var url = URL.parse(req.url);
    var actions = routes[req.method] || [];
    for(var i=0; i<actions.length; i++) {
      var match = url.pathname.match(actions[i][0]);
      if (match) return actions[i][1](match);
    };
    next();
  };
}


exports.redirect = function(res, url) {
  /* Send redirection HTTP reply to result.
   *
   * Arguments:
   *  - res: nodejs result object.
   *  - url: where to redirect.
   *
   */
  res.writeHead(303, {'Location': url});
  res.end();
};


exports.server_error = function(res, err) {
  /* Send HTTP 500 result with details about error in body.
   * The content-type is set to text/plain.
   *
   * Arguments:
   *  - res: nodejs result object.
   *  - err: error object or string.
   *
   */
  res.writeHead(500, {'Content-Type': 'text/plain'});
  if(typeof err == "string") res.end(err);
  else {
    res.write('An error has occured: ' + err.message);
    res.write('\n\n');
    res.end(err.stack);
  }
};

