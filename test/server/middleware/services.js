var connect = require('connect');
var expect = require('chai').expect;
var request = require('supertest');
var services = require('../../../lib/server/middleware/services');

describe('services middleware', function () {
  var app;
  
  beforeEach(function () {
    app = connect();
  });
  
  describe('skipping middleware', function () {
    
    beforeEach(function () {
      var serviceList = {
        service1: 'test'
      };
      
      app.use(services(serviceList, '__'));
    });
    
    it('skips if the route is not a service request', function (done) {
      request(app)
        .get('/')
        .expect(404)
        .end(done);
    });
    
    it('skips if the service does not exist', function (done) {
      request(app)
        .get('/__/no-service')
        .expect(404)
        .end(done);
    });
    
    it('skips if the requesting app is not configured to use the middleware', function (done) {
      request(app)
        .get('/__/service1/test')
        .expect(404)
        .end(done);
    });
    
  });
  
  describe('running services', function () {
    var service1Ran = false;
    var service2Ran = false;
    
    beforeEach(function () {
      service1Ran = false;
      service2Ran = false;
      
      var serviceList = {
        service2: function (req, res, next) {
          service2Ran = true;
          res.writeHead(200);
          res.write('service2');
          res.end();
        }
      };
      
      app.use(setConfig);
      app.use(services(serviceList, '__'));  
    });
    
    it('runs the service if it is configured in the app config', function (done) {
      request(app)
        .get('/__/service2/test2')
        .expect(200)
        .expect('service2')
        .expect(function () {
          expect(service2Ran).to.equal(true);
        })
        .end(done);
    });
    
    it('runs the service if the service provides and passes a request matcher method', function (done) {
      var testService = function (req, res, next) {
        res.writeHead(200);
        res.end('triggered');
      };
      
      testService.matchesRequest = doesMatchRequest;
      
      var app = connect()
        .use(function (req, res, next) {
          req.config = {testService: true};
          next();
        })
        .use(services({testService: testService}, '__'));
      
      request(app)
        .get('/__/triggering')
        .expect(200)
        .expect('triggered')
        .end(done);
    });
    
    it('matching service name is case insensitive', function (done) {
      var casesensitive = function (req, res, next) {
        res.writeHead(200);
        res.end('case sensitive');
      };
      casesensitive.matchesRequest = doesMatchRequest;
      
      var app = connect()
        .use(function (req, res, next) {
          req.config = {CaseSensitive: true};
          next();
        })
        .use(services({casesensitive: casesensitive}, '__'))
      
      request(app)
        .get('/__/case/sensitive')
        .expect(200)
        .expect('case sensitive')
        .end(done);
    });
    
    it('passes the specific configuration to each service in the request stack', function (done) {
      var service1Config = {};
      var service2Config = {};
      
      var service1 = function (req, res, next) {
        service1Config = req.service;
        next();
      };
      service1.matchesRequest = doesMatchRequest;
      
      var service2 = function (req, res, next) {
        service2Config = req.service;
        next();
      };
      service2.matchesRequest = doesMatchRequest;
      
      var app = connect()
        .use(function (req, res, next) {
          req.config = {
            service1: 'service1',
            service2: 'service2'
          };
          next();
        })
        .use(services({
          service1: service1,
          service2: service2
        }, '__'));
      
      request(app)
        .get('/__/test')
        .expect(function () {
          expect(service1Config).to.eql({
            name: 'service1',
            config: 'service1',
            path: '/test'
          });
          
          expect(service2Config).to.eql({
            name: 'service2',
            config: 'service2',
            path: '/test'
          });
        })
        .end(done);
    });
    
  });
  
  function setConfig (req, res, next) {
    req.config = {
      service2: {
        test2: {}
      }
    };
    
    next();
  }
  
  function doesMatchRequest (req, done) {
    done(true);
  }
  
});