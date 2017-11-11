var request = require('supertest')
var app = require('../app')
var assert = require('assert')

let user = {
  username: 'obi-wan',
  email: 'jedi@jedi.com',
  password: 'kenobi',
}

let token = null

const authorize = request => request.set('Authorization', 'Bearer ' + token)

context('users CRUD', function () {

  it('should create a user', function (done) {
    request(app)
      .post('/api/users')
      .send(user)
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err)

        user.id = res.body.id

        done()
      })
  })
  it('should authenticate and receive jwt', function (done) {
    request(app)
      .post('/api/auth')
      .send({ username: user.username, password: user.password })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        let body = res.body

        assert.ok(body.jwt)

        token = body.jwt
        done()
      })
  })

  it('should read the same user', function (done) {
    authorize(request(app).get(`/api/users/${user.id}`))
      .expect(200)
      .end(function (err, result) {
        if (err) return done(err)

        let res = result.body

        assert.equal(user.username, res.username)
        assert.equal(user.email, res.email)

        done()
      })
  })

  it('should update the user', function (done) {
    user.email = 'oldjedi@jedi.com'
    authorize(request(app).put(`/api/users/${user.id}`))
      .send(user)
      .expect(200)
      .end(function (err, result) {
        if (err) return done(err)

        done()
      })
  })

  it('should delete the user', function (done) {
      authorize(request(app).delete(`/api/users/${user.id}`))
      .expect(200, done)
  })
})