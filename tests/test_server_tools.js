var assert = require('nodetk/testing/custom_assert');
var server_tools = require('nodetk/server_tools');


var MUST_NOT_BE_CALLED = function() {assert.ok(false)};
var MUST_BE_CALLED = function() {assert.ok(true)};


exports.tests = [

['test get_connector_from_str_routes 200', 1, function() {
  var connector = server_tools.get_connector_from_str_routes({
    'GET': {
      '/a': MUST_NOT_BE_CALLED,
      '/toto': MUST_BE_CALLED,
    }
  });
  var req = {url: 'http://domain.com/toto', method: 'GET'}
  connector(req, null, MUST_NOT_BE_CALLED);
}],

['test get_connector_from_str_routes 404', 1, function() {
  var connector = server_tools.get_connector_from_str_routes({
    'GET': {
      '/a': MUST_NOT_BE_CALLED,
      '/toto': MUST_NOT_BE_CALLED,
    }
  });
  var req = {url: 'http://domain.com/titi', method: 'GET'}
  connector(req, null, MUST_BE_CALLED);
}],

['test get_connector_from_regexp_routes 200', 2, function() {
  var connector = server_tools.get_connector_from_regexp_routes({
    'GET': [
      ['/a', MUST_NOT_BE_CALLED],
      ['/toto', function(req, res, match) {assert.equal(match.length, 1)}],
      [/titi\/(\w+)/, function(req, res, match) {assert.equal(match[1], 'some_id')}]
    ]
  });
  var req = {url: 'http://domain.com/toto', method: 'GET'};
  connector(req, null, MUST_NOT_BE_CALLED);
  var req = {url: 'http://domain.com/titi/some_id', method: 'GET'};
  connector(req, null, MUST_NOT_BE_CALLED);
}],

['test get_connector_from_regexp_routes 404', 1, function() {
  var connector = server_tools.get_connector_from_regexp_routes({
    'GET': [
      ['/a', MUST_NOT_BE_CALLED],
      ['/toto', MUST_NOT_BE_CALLED],
    ]
  });
  var req = {url: 'http://domain.com/titi', method: 'GET'}
  connector(req, null, MUST_BE_CALLED);
}],

];

