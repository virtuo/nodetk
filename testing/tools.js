var assert = require('nodetk/testing/custom_assert')
  , querystring = require('querystring')
  ;


exports.get_expected_res = function(expected_status_code) {
  /* Returns a res object making 3 asserts. 
   * Check the status code is the one expected,
   * content-type is text/plain and body is not empty.
   */
  var body = '';
  return {
    writeHead: function(status_code, headers) {
      assert.equal(status_code, expected_status_code);
      assert.deepEqual(headers, {'Content-Type': 'text/plain'});
    }
  , end: function(body_) {
      body += body_;
      assert.ok(body);
    }
  , write: function(body_) {
      body += body_;
    }
  };
};


exports.get_expected_redirect_res = function(location_) {
  /* Idem for redirect. 2 asserts are done. */
  return {
    writeHead: function(status_code, headers) {
     assert.equal(status_code, 303);
     assert.equal(headers['Location'], location_);
    }
  , end: function(){}
  }
};


exports.get_fake_post_request = function(url, data, error) {
  /* Returns fake request object that can be parsed by formidable. */
  var req = {method: 'POST', url: url};
  req.headers = {'content-type': 'application/x-www-form-urlencoded'};
  req.on = function(event_type, callback) {
    if(event_type == 'data') process.nextTick(function() {
      callback(querystring.stringify(data));
    });
    else if(event_type == 'error' && error) process.nextTick(function() {
      callback(error);
    });
    else if(event_type == 'end' && !error) process.nextTick(callback);
    return req
  };
  return req;
};
