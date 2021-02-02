var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../src/server.js');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("GET /", () => {
  it("should get index view", async () => {
    const res = await chai.request(app).get('/');
    res.should.have.status(200);
    res.body.should.be.a('object');
  });
});

describe("GET /api/timestamp", () => {
  it("should get current timestamp", async () => {
    const res = await chai.request(app).get('/api/timestamp');
    res.body.unix.should.gt(0);
    res.body.utc.should.equal(new Date().toUTCString());
  });

  it("should return formatted timestamp", async () => {
    const res = await chai.request(app).get('/api/timestamp/2021-12-31');
    res.body.unix.should.equal(1640908800000);
    res.body.utc.should.equal("Fri, 31 Dec 2021 00:00:00 GMT");
  });

  it("should return invalid Date msg", async () => {
    const res = await chai.request(app).get('/api/timestamp/hello~~~');
    res.body.error.should.equal("Invalid Date");
  });
});

describe("GET /api/whoami", () => {
  it("should get IP, lang, software headers", async () => {
    const res = await chai.request(app).get('/api/whoami')
                          .set("accept-language", "en-US");

    res.body.should.include.keys("ipaddress");
    res.body.language.should.equal("en-US");
    res.body.software.should.equal("node-superagent/3.8.3");
  });
});

const sha1 = require("js-sha1");
describe("GET /api/shorturl/", function () {

  const test_url = 'https://www.google.com';
  const short_url = sha1(test_url).slice(0, 5);

  it("should add new short URL", async () => {
    const res = await chai.request(app).post('/api/shorturl/new')
                          .set('content-type', 'application/x-www-form-urlencoded')
                          .send({ url: test_url });
    res.body.original_url.should.equal(test_url);
    res.body.short_url.length.should.equal(5);
  });

  it("should return invalid URL msg", async () => {
    const invalid_url = 'https://sajgkhkgsajhkjgsa';
    const res = await chai.request(app).post('/api/shorturl/new')
                          .set('content-type', 'application/x-www-form-urlencoded')
                          .send({ url: invalid_url });
    res.body.error.should.equal('invalid url');
  });

  it("should redirect to original URL", async () => {
    const res = await chai.request(app).get(`/api/shorturl/${short_url}`)
                          .redirects(0);
    res.should.redirectTo(test_url);
  });
});

describe("GET /api/exercise/", () => {
  const name = 'Roronoa Zoro';
  it("should add new user", async () => {
    const res = await chai.request(app).post('/api/exercise/new-user')
                          .set('content-type', 'application/x-www-form-urlencoded')
                          .send({ username: name });
    res.body.username.should.equal(name);
  });

  it("should get all users", async () => {
    const res = await chai.request(app).get('/api/exercise/users');
    res.body.should.be.an("array");
  });

  it("should get specific user", async () => {
    const res = await chai.request(app).get(`/api/exercise/user/${name}`);
    res.body.should.have.all.keys("_id", "username", "log");
    res.body.log.should.be.an("array");
  });

  it("should not get the user", async () => {
    const res = await chai.request(app).get('/api/exercise/user/thereisnosuchuser');
    res.text.should.equal("There is no such user.");
  });

  it("should add the exercise log", async () => {
    const user = await chai.request(app).get(`/api/exercise/user/${name}`);
    const params = {
      userId: user.body._id,
      description: "katana training",
      duration: 120,
      date: "2021-01-31"
    };
    const res = await chai.request(app).post('/api/exercise/add')
                          .set('content-type', 'application/x-www-form-urlencoded')
                          .send(params);
    res.body.should.deep.equal({
      _id: params.userId,
      description: params.description,
      duration: params.duration,
      date: new Date(params.date).toDateString().toString(),
      username: name
    });
  });

  it("should get the exercise log", async () => {
    const user = await chai.request(app).get(`/api/exercise/user/${name}`);
    const res = await chai.request(app).get('/api/exercise/log')
                          .query({
                            userId: user.body._id,
                            from: '2021-01-31',
                            to: '2021-02-01',
                            limit: 1
                          });
    res.body.should.have.all.keys("_id", "username", "log", "count");
    res.body.count.should.equal(1);
  });

  it("should not find userId", async () => {
    const res = await chai.request(app).get('/api/exercise/log?userId=alibuda');
    res.text.should.equal("Cannot find userId");
  });

  it("should get no userId", async () => {
    const res = await chai.request(app).get('/api/exercise/log');
    res.text.should.equal("No userId specified");
  });
});
