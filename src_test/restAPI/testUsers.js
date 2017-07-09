/* eslint-env mocha*/
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import _debug from 'debug';
import chai from 'chai';
import chaiHttp from 'chai-http';
import sqlite3Wrapper from '../../bin/database/sqlite3Wrapper';
import server from '../../bin/www';

const debug = _debug('test:testUsers');

chai.should();
chai.use(chaiHttp);

describe('Table Users is empty', () => {
  beforeEach(
        async () => {
            // before each test delete all entries in Users table
          await sqlite3Wrapper.getConnection()
                .then(
                    (db) => {
                      db.run('DELETE FROM Users', () => {
                        debug('Delete all entries from Users table');
                      });
                    })
                .catch(
                    (err) => {
                      debug(err);
                      throw err;
                    },
                );
        });

  describe('POST /users', () => {
    it('it should POST a user',
            (done) => {
              const newUser = {
                username: 'mimi',
                email: 'mimi@gmail.com',
                password: 'secret',
              };
              chai.request(server)
                    .post('/users')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                        throw err;
                      }
                      res.should.have.status(200);
                      res.body.should.be.a('object');
                      res.body.should.have.property('user_id');
                      res.body.should.have.property('user_name');
                      res.body.should.have.property('email');
                      res.body.should.not.have.property('password');
                      done();
                    });
            });

    it('it should not POST a user without username field',
            (done) => {
              const newUser = {
                email: 'test@gmail.com',
                password: 'secret',
              };
              chai.request(server)
                    .post('/users')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                      }
                      res.should.have.status(400);
                      res.body.should.be.a('object');
                      res.body.should.have.property('code').eql('InvalidInputError');
                      res.body.should.have.property('errorMessage').eql('username is not defined!');
                      done();
                    });
            });

    it('it should not POST a user without email field',
            (done) => {
              const newUser = {
                username: 'magic',
                password: 'secretmagic',
              };
              chai.request(server)
                    .post('/users')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                      }
                      res.should.have.status(400);
                      res.body.should.be.a('object');
                      res.body.should.have.property('code').eql('InvalidInputError');
                      res.body.should.have.property('errorMessage').eql('email is not defined!');
                      done();
                    });
            });

    it('it should not POST a user without password field',
            (done) => {
              const newUser = {
                username: 'magic',
                email: 'magic@gmail.com',
              };
              chai.request(server)
                    .post('/users')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                      }
                      res.should.have.status(400);
                      res.body.should.be.a('object');
                      res.body.should.have.property('code').eql('InvalidInputError');
                      res.body.should.have.property('errorMessage').eql('password is not defined!');
                      done();
                    });
            });
  });

  describe('GET /users', () => {
    it('it should GET an empty array of users', (done) => {
      chai.request(server)
                .get('/users')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                    throw err;
                  }
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  res.body.length.should.be.eql(0);
                  done();
                });
    });
  });
});

describe('Users already exists in table Users', () => {
  before(
        async () => {
          const db = await sqlite3Wrapper.getConnection();
          try {
            db.run('DELETE FROM Users', () => {
              debug('Delete all entries from Users table');
            });
            const statement1 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (1, 'mimi', 'mimi@gmail.com','secret')";
            const statement2 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (2, 'fifi', 'fifi@gmail.com','secret')";
            const statement3 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (3, 'gigi', 'gigi@gmail.com','secret')";
            db.run(statement1, () => {
              debug('Add first user in database.');
            });
            db.run(statement2, () => {
              debug('Add second user in database.');
            });
            db.run(statement3, () => {
              debug('Add third user in database.');
            });
          } catch (err) {
            debug(err);
            throw err;
          }
        });

  describe('GET /users', () => {
    it('it should GET all users', (done) => {
      chai.request(server)
                .get('/users')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                    throw err;
                  }
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  res.body.length.should.be.eql(3);
                  done();
                });
    });
  });

  describe('GET /users?email', () => {
    it('it should GET a user by email', (done) => {
      chai.request(server)
                .get('/users?email=fifi@gmail.com')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                    throw err;
                  }
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('user_id').eql('2');
                  res.body.should.have.property('user_name').eql('fifi');
                  res.body.should.have.property('email').eql('fifi@gmail.com');
                  done();
                });
    });

    it('it should throw error if the user with the specific email is not in the database', (done) => {
      chai.request(server)
                .get('/users?email=notInDatabase@gmail.com')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                  }
                  res.should.have.status(404);
                  res.body.should.be.a('object');
                  res.body.should.have.property('code').eql('NotFoundError');
                  res.body.should.have.property('errorMessage').eql('Resource not found!');
                  done();
                });
    });
  });

  describe('GET /users/:userId', () => {
    it('it should GET a user by id', (done) => {
      chai.request(server)
                .get('/users/1')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                    throw err;
                  }
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('user_id').eql('1');
                  res.body.should.have.property('user_name').eql('mimi');
                  res.body.should.have.property('email').eql('mimi@gmail.com');
                  done();
                });
    });

    it('it should throw error if the user is not in the database', (done) => {
      chai.request(server)
                .get('/users/782')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                  }
                  res.should.have.status(404);
                  res.body.should.be.a('object');
                  res.body.should.have.property('code').eql('NotFoundError');
                  res.body.should.have.property('errorMessage').eql('Resource not found!');
                  done();
                });
    });
  });

  describe('POST /users', () => {
    it('it should not POST a user if another user with the same email already exists in database',
            (done) => {
              const secondUser = {
                username: 'second',
                email: 'mimi@gmail.com', // same email address as another user in database
                password: 'secondsecret',
              };

              chai.request(server)
                    .post('/users')
                    .send(secondUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                      }
                      res.should.have.status(400);
                      res.body.should.be.a('object');
                      res.body.should.have.property('code').eql('DuplicateError');
                      res.body.should.have.property('errorMessage').eql('Resource already exists!');
                      done();
                    });
            });
  });

  describe('PUT /users/:userId', () => {
    it('it should update a user',
            (done) => {
              const newUser = {
                username: 'maximus',
                email: 'maximus@gmail.com',
                password: 'maximussecret',
              };

              chai.request(server)
                    .put('/users/1')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                        throw err;
                      }
                      res.should.have.status(200);
                      res.body.should.be.a('object');
                      res.body.should.have.property('user_id').eql('1');
                      res.body.should.have.property('user_name').eql('maximus');
                      res.body.should.have.property('email').eql('maximus@gmail.com');
                      res.body.should.not.have.property('password');
                      res.body.should.have.property('message').eql('Password changed successfully!');
                      done();
                    });
            });

    it('it should update only the username',
            (done) => {
              const newUser = {
                username: 'perseu',
              };

              chai.request(server)
                    .put('/users/1')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                        throw err;
                      }
                      res.should.have.status(200);
                      res.body.should.be.a('object');
                      res.body.should.have.property('user_id').eql('1');
                      res.body.should.have.property('user_name').eql('perseu');
                      res.body.should.have.property('email').eql('maximus@gmail.com');
                      res.body.should.not.have.property('password');
                      res.body.should.not.have.property('message');
                      done();
                    });
            });

    it('it should update only the email',
            (done) => {
              const newUser = {
                email: 'perseu@gmail.com',
              };

              chai.request(server)
                    .put('/users/1')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                        throw err;
                      }
                      res.should.have.status(200);
                      res.body.should.be.a('object');
                      res.body.should.have.property('user_id').eql('1');
                      res.body.should.have.property('user_name').eql('perseu');
                      res.body.should.have.property('email').eql('perseu@gmail.com');
                      res.body.should.not.have.property('password');
                      res.body.should.not.have.property('message');
                      done();
                    });
            });

    it('it should update only the password',
            (done) => {
              const newUser = {
                password: 'perseusecret',
              };

              chai.request(server)
                    .put('/users/1')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                        throw err;
                      }
                      res.should.have.status(200);
                      res.body.should.be.a('object');
                      res.body.should.have.property('user_id').eql('1');
                      res.body.should.have.property('user_name').eql('perseu');
                      res.body.should.have.property('email').eql('perseu@gmail.com');
                      res.body.should.not.have.property('password');
                      res.body.should.have.property('message').eql('Password changed successfully!');
                      done();
                    });
            });

    it('it should throw error when no update data is provided',
            (done) => {
              const newUser = {
              };

              chai.request(server)
                    .put('/users/1')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                      }
                      res.should.have.status(400);
                      res.body.should.be.a('object');
                      res.body.should.have.property('code').eql('InvalidInputError');
                      res.body.should.have.property('errorMessage').eql('Invalid input!');
                      done();
                    });
            });

    it('it should throw error when trying to update non existent user',
            (done) => {
              const newUser = {
                email: 'notauser@gmail.com',
              };

              chai.request(server)
                    .put('/users/1231')
                    .send(newUser)
                    .end((err, res) => {
                      if (err) {
                        debug(err);
                      }
                      res.should.have.status(404);
                      res.body.should.be.a('object');
                      res.body.should.have.property('code').eql('NotFoundError');
                      res.body.should.have.property('errorMessage').eql('Resource not found!');
                      done();
                    });
            });
  });

  describe('DELETE /users/:userId', () => {
    it('it should DELETE user by id', (done) => {
      chai.request(server)
                .delete('/users/2')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                    throw err;
                  }
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('User 2 was deleted successfully!');
                  done();
                });
    });

    it('it should throw error when trying to delete non existing user', (done) => {
      chai.request(server)
                .delete('/users/291')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                  }
                  res.should.have.status(404);
                  res.body.should.be.a('object');
                  res.body.should.have.property('code').eql('NotFoundError');
                  res.body.should.have.property('errorMessage').eql('Resource not found!');
                  done();
                });
    });
  });

  describe('DELETE /users', () => {
    it('it should DELETE all users', (done) => {
      chai.request(server)
                .delete('/users')
                .end((err, res) => {
                  if (err) {
                    debug(err);
                    throw err;
                  }
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('All users have been deleted!');
                  done();
                });
    });
  });
});

