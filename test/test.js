var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');
var app = require('../src/server.js');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("GET /", () => {
  it("should get index view", (done) => {
    chai.request(app)
        .get('/')
        .end((err, res) => {
          if (err) done(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
  });
});

describe("GET /api/timestamp", () => {
  it("should get current timestamp", (done) => {
    chai.request(app)
        .get('/api/timestamp')
        .end((err, res) => {
          if (err) done(err);
          res.body.unix.should.gt(0);
          res.body.utc.should.equal(new Date().toUTCString());
          done();
        });
  });

  it("should return formatted timestamp", (done) => {
    chai.request(app)
        .get('/api/timestamp/2021-12-31')
        .end((err, res) => {
          if (err) done(err);
          res.body.unix.should.equal(1640908800000);
          res.body.utc.should.equal("Fri, 31 Dec 2021 00:00:00 GMT");
          done();
        });
  });

  it("should return invalid Date msg", (done) => {
    chai.request(app)
        .get('/api/timestamp/hello~~~')
        .end((err, res) => {
          if (err) done(err);
          res.body.error.should.equal("Invalid Date");
          done();
        });
  });
});

describe("GET /api/whoami", () => {
  it("should get IP, lang, software headers", (done) => {
    chai.request(app)
        .get('/api/whoami')
        .set("accept-language", "en-US")
        .end((err, res) => {
          if (err) done(err);
          res.body.should.include.keys("ipaddress");
          res.body.language.should.equal("en-US");
          res.body.software.should.equal("node-superagent/3.8.3");
          done();
        });
  });
});

const sha1 = require("js-sha1");
describe("GET /api/shorturl/", function () {

  const test_url = 'https://www.google.com/';
  const short_url = sha1(test_url).slice(0, 5);

  it("should add new short URL", (done) => {
    chai.request(app)
        .post('/api/shorturl/new')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ url: test_url })
        .end((err, res) => {
          if (err) done(err);
          res.body.original_url.should.equal(test_url);
          res.body.short_url.length.should.equal(5);
          done();
        });
  });

  it("should return invalid URL msg", (done) => {
    const invalid_url = 'https://sajgkhkgsajhkjgsa';
    chai.request(app)
        .post('/api/shorturl/new')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ url: invalid_url })
        .end((err, res) => {
          if (err) done(err);
          res.body.error.should.equal('invalid url');
          done();
        });
  });

  it("should redirect to original URL", (done) => {
    chai.request(app)
        .get('/api/shorturl/' + short_url)
        .redirects(0)
        .end((err, res) => {
          if (err) done(err);
          res.should.redirectTo(test_url);
          res.should.not.redirectTo("https://alibuda");
          done();
        });
  });
});

describe("GET /api/exercise/", () => {
  const name = 'Roronoa Zoro';
  it("should add new user", (done) => {
    chai.request(app)
        .post('/api/exercise/new-user')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ username: name })
        .end((err, res) => {
          if (err) done(err);
          res.body.username.should.equal(name);
          done();
        });
  });

  it("should get all users", (done) => {
    chai.request(app)
        .get('/api/exercise/users')
        .end((err, res) => {
          if (err) done(err);
          res.body.should.be.an("array");
          done();
        });
  });

  it("should get specific user", (done) => {
    chai.request(app)
        .get('/api/exercise/user/' + name)
        .end((err, res) => {
          if (err) done(err);
          res.body.should.have.all.keys("_id", "username", "log");
          res.body.log.should.be.an("array");
          done();
        });
  });

  it("should not get the user", (done) => {
    chai.request(app)
        .get('/api/exercise/user/thereisnosuchuser')
        .end((err, res) => {
          if (err) done(err);
          res.text.should.equal("There is no such user.");
          done();
        });
  });

  it("should add the exercise log", (done) => {
    const params = {
      userId: name,
      description: "katana training",
      duration: 120,
      date: "2021-01-31"
    };
    chai.request(app)
        .post('/api/exercise/add')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(params)
        .end((err, res) => {
          if (err) done(err);
          console.log(res.body);
          res.body.should.deep.equal({
            username: name,
            _id: params.userId,
            description: params.description,
            duration: params.duration,
            date: params.date
          });
        });
  });

  it("should get the exercise log", (done) => {
    chai.request(app)
        .get(`/api/exercise/log?userId=${name}&from=2021-01-31&to=2021-02-01&limit=1`)
        .end((err, res) => {
          if (err) done(err);
          res.body.count.should.equal(1);
          res.body.should.have.key("log");
          done();
        });
  });

  it("should not find userId", (done) => {
    chai.request(app)
        .get('/api/exercise/log?userId=alibuda')
        .end((err, res) => {
          if (err) done(err);
          res.text.should.equal("Cannot find userId");
          done();
        });
  });

  it("should get no userId", (done) => {
    chai.request(app)
        .get('/api/exercise/log')
        .end((err, res) => {
          if (err) done(err);
          res.text.should.equal("No userId specified");
          done();
        });
  });
})