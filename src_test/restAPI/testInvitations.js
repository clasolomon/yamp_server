/* eslint-env mocha*/
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import _debug from 'debug';
import chai from 'chai';
import chaiHttp from 'chai-http';
import sqlite3Wrapper from '../../bin/database/sqlite3Wrapper';
import server from '../../bin/www';

const debug = _debug('test:testInvitations');

chai.should();
chai.use(chaiHttp);

describe('Table Invitations is empty; There is one user and one meeting in database.',

    () => {
      before(
            async () => {
              const db = await sqlite3Wrapper.getConnection();
              try {
                const statement1 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (22, 'happy', 'happy@gmail.com', 'happysecret')";

                const statement2 = 'INSERT INTO Meetings(meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times) VALUES (101, \'first\', \'first meeting\', \'22\', \'[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]\')';

                db.run('DELETE FROM Invitations', () => {
                  debug('Delete all entries from Invitations table');
                });

                db.run('DELETE FROM Meetings', () => {
                  debug('Delete all entries from Meetings table');
                });

                db.run('DELETE FROM Users', () => {
                  debug('Delete all entries from Users table');
                });

                db.run(statement1, () => {
                  debug('Add user 22 in database.');
                });

                db.run(statement2, () => {
                  debug('Add first meeting.');
                });
              } catch (err) {
                debug(err);
                throw err;
              }
            });

      beforeEach(
            async () => {
                // before each test delete all entries in Invitations table
              const db = await sqlite3Wrapper.getConnection();
              try {
                db.run('DELETE FROM Invitations', () => {
                  debug('Delete all entries from Invitations table');
                });
              } catch (err) {
                debug(err);
                throw err;
              }
            });

      describe('POST /invitations',
            () => {
              it('it should POST an invitation',
                    (done) => {
                      const newInvitation = {
                        meetingId: '101',
                        attendantEmail: 'koko@gmail.com',
                        acceptedDatesAndTimes: [],
                      };
                      chai.request(server)
                            .post('/invitations')
                            .send(newInvitation)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('invitation_id');
                              res.body.should.have.property('meeting_id').eql('101');
                              res.body.should.have.property('attendant_email').eql('koko@gmail.com');
                              res.body.should.have.property('accepted_dates_and_times');
                              done();
                            });
                    });

              it('it should not POST an invitation without meetingId field',
                    (done) => {
                      const newInvitation = {
                        attendantEmail: 'koko@gmail.com',
                        acceptedDatesAndTimes: [],
                      };
                      chai.request(server)
                            .post('/invitations')
                            .send(newInvitation)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                              }
                              res.should.have.status(400);
                              res.body.should.be.a('object');
                              res.body.should.have.property('code').eql('InvalidInputError');
                              res.body.should.have.property('errorMessage').eql('meetingId is not defined!');
                              done();
                            });
                    });

              it('it should not POST an invitation without attendantEmail field',
                    (done) => {
                      const newInvitation = {
                        meetingId: '101',
                        acceptedDatesAndTimes: [],
                      };
                      chai.request(server)
                            .post('/invitations')
                            .send(newInvitation)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                              }
                              res.should.have.status(400);
                              res.body.should.be.a('object');
                              res.body.should.have.property('code').eql('InvalidInputError');
                              res.body.should.have.property('errorMessage').eql('attendantEmail is not defined!');
                              done();
                            });
                    });

              it('it should not POST an invitation without acceptedDatesAndTimes field',
                    (done) => {
                      const newInvitation = {
                        meetingId: '101',
                        attendantEmail: 'koko@gmail.com',
                      };
                      chai.request(server)
                            .post('/invitations')
                            .send(newInvitation)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                              }
                              res.should.have.status(400);
                              res.body.should.be.a('object');
                              res.body.should.have.property('code').eql('InvalidInputError');
                              res.body.should.have.property('errorMessage').eql('acceptedDatesAndTimes is not defined!');
                              done();
                            });
                    });

              it('it should not POST an invitation if the meetingId is not in database',
                    (done) => {
                      const newInvitation = {
                        meetingId: '234',
                        attendantEmail: 'koko@gmail.com',
                        acceptedDatesAndTimes: [],
                      };
                      chai.request(server)
                            .post('/invitations')
                            .send(newInvitation)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                              }
                              res.should.have.status(400);
                              res.body.should.be.a('object');
                              res.body.should.have.property('code').eql('InvalidInputError');
                              res.body.should.have.property('errorMessage').eql('invalid meetingId!');
                              done();
                            });
                    });
            });

      describe('GET /invitations',
            () => {
              it('it should GET an empty array of invitations',
                    (done) => {
                      chai.request(server)
                            .get('/invitations')
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

      describe('GET /invitations/:invitationId',
            () => {
              it('it should throw error when trying to get non-existent invitation',
                    (done) => {
                      chai.request(server)
                            .get('/invitations/5001')
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
    });


describe('Table invitations has 5 entries in it. There are 2 users and 2 meetings in database',
    () => {
      before(
            async () => {
              const db = await sqlite3Wrapper.getConnection();
              try {
                const statement1 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (55, 'fifi', 'fifi@gmail.com', 'fifisecret')";

                const statement2 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (77, 'cici', 'cici@gmail.com', 'cicisecret')";

                const statement3 = 'INSERT INTO Meetings(meeting_id, meeting_name, meeting_description, initiated_by,  proposed_dates_and_times) VALUES (100, \'first\', \'first meeting\', \'55\', \'[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]\')';

                const statement4 = 'INSERT INTO Meetings(meeting_id, meeting_name, meeting_description, initiated_by,  proposed_dates_and_times) VALUES (500, \'second\', \'second meeting\', \'77\', \'[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]\')';

                const statement5 = 'INSERT INTO Invitations(invitation_id, meeting_id, attendant_email, accepted_dates_and_times) VALUES (1, 100, \'a1@gmail.com\', \'[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]\')';

                const statement6 = 'INSERT INTO Invitations(invitation_id, meeting_id, attendant_email, accepted_dates_and_times) VALUES (2, 100, \'a2@gmail.com\', \'[]\')';

                const statement7 = 'INSERT INTO Invitations(invitation_id, meeting_id, attendant_email, accepted_dates_and_times) VALUES (3, 500, \'a3@gmail.com\', \'[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]\')';

                const statement8 = 'INSERT INTO Invitations(invitation_id, meeting_id, attendant_email, accepted_dates_and_times) VALUES (4, 500, \'a4@gmail.com\', \'[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]\')';

                const statement9 = 'INSERT INTO Invitations(invitation_id, meeting_id, attendant_email, accepted_dates_and_times) VALUES (5, 500, \'a5@gmail.com\', \'[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]\')';

                db.run('DELETE FROM Invitations', () => {
                  debug('Delete all entries from Invitations table');
                });
                db.run('DELETE FROM Meetings', () => {
                  debug('Delete all entries from Meetings table');
                });
                db.run('DELETE FROM Users', () => {
                  debug('Delete all entries from Users table');
                });
                db.run(statement1, () => {
                  debug('Add user 55 in database.');
                });
                db.run(statement2, () => {
                  debug('Add user 77 in database.');
                });
                db.run(statement3, () => {
                  debug('Add first meeting.');
                });
                db.run(statement4, () => {
                  debug('Add second meeting.');
                });
                db.run(statement5, () => {
                  debug('Add meeting invitation.');
                });
                db.run(statement6, () => {
                  debug('Add meeting invitation.');
                });
                db.run(statement7, () => {
                  debug('Add meeting invitation.');
                });
                db.run(statement8, () => {
                  debug('Add meeting invitation.');
                });
                db.run(statement9, () => {
                  debug('Add meeting invitation.');
                });
              } catch (err) {
                debug(err);
                throw err;
              }
            });

      describe('GET /invitations',
            () => {
              it('it should GET an array with all the invitations in database',
                    (done) => {
                      chai.request(server)
                            .get('/invitations')
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('array');
                              res.body.length.should.be.eql(5);
                              done();
                            });
                    });
            });

      describe('GET /invitations/invitationId',
            () => {
              it('it should GET the invitation with the corresponding invitationId',
                    (done) => {
                      chai.request(server)
                            .get('/invitations/4')
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('invitation_id').eql('4');
                              res.body.should.have.property('meeting_id').eql('500');
                              res.body.should.have.property('attendant_email').eql('a4@gmail.com');
                              res.body.should.have.property('accepted_dates_and_times');
                              done();
                            });
                    });

              it('it should throw an error because invitationId=333 is not in the database',
                    (done) => {
                      chai.request(server)
                            .get('/invitations/333')
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

      describe('GET /invitations?meetingId',
            () => {
              it('it should GET an array with all the invitations to meeting with meetingId=500',
                    (done) => {
                      chai.request(server)
                            .get('/invitations?meetingId=500')
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

              it('it should GET an array with all the invitations to meeting with meetingId=100',
                    (done) => {
                      chai.request(server)
                            .get('/invitations?meetingId=100')
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('array');
                              res.body.length.should.be.eql(2);
                              done();
                            });
                    });

              it('it should GET an empty array because there is no meeting with meetingId=400',
                    (done) => {
                      chai.request(server)
                            .get('/invitations?meetingId=400')
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

      describe('PUT /invitations/:inivitationId',
            () => {
              it('it should update the invitation with invitationId=1',
                    (done) => {
                      const newData = {
                        meetingId: '500',
                        attendantEmail: 'mary@gmail.com',
                        acceptedDatesAndTimes: [{ startDate: new Date(), endDate: new Date() },
                              { startDate: new Date(), endDate: new Date() }],
                      };
                      chai.request(server)
                            .put('/invitations/1')
                            .send(newData)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('invitation_id').eql('1');
                              res.body.should.have.property('meeting_id').eql('500');
                              res.body.should.have.property('attendant_email').eql('mary@gmail.com');
                              res.body.should.have.property('accepted_dates_and_times').eql(JSON.stringify(newData.acceptedDatesAndTimes));
                              done();
                            });
                    });

              it('it should not update meetingId if the meeting does not exist in the database',
                    (done) => {
                      const newData = {
                        meetingId: '555',
                        attendantEmail: 'tim@gmail.com',
                        acceptedDatesAndTimes: [{ startDate: new Date(), endDate: new Date() },
                              { startDate: new Date(), endDate: new Date() }],
                      };
                      chai.request(server)
                            .put('/invitations/4')
                            .send(newData)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                              }
                              res.should.have.status(400);
                              res.body.should.be.a('object');
                              res.body.should.have.property('code').eql('InvalidInputError');
                              res.body.should.have.property('errorMessage').eql('invalid meetingId!');
                              done();
                            });
                    });

              it('it should update only the meeting_id field for invitationId=3',
                    (done) => {
                      const newData = {
                        meetingId: '100',
                      };
                      chai.request(server)
                            .put('/invitations/3')
                            .send(newData)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('invitation_id').eql('3');
                              res.body.should.have.property('meeting_id').eql('100');
                              res.body.should.have.property('attendant_email').eql('a3@gmail.com');
                              res.body.should.have.property('accepted_dates_and_times');
                              done();
                            });
                    });

              it('it should update only the attendant_email field for invitationId=3',
                    (done) => {
                      const newData = {
                        attendantEmail: 'donald@gmail.com',
                      };
                      chai.request(server)
                            .put('/invitations/3')
                            .send(newData)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('invitation_id').eql('3');
                              res.body.should.have.property('meeting_id').eql('100');
                              res.body.should.have.property('attendant_email').eql('donald@gmail.com');
                              res.body.should.have.property('accepted_dates_and_times');
                              done();
                            });
                    });

              it('it should update only the proposed_dates_and_times field for meetingId=102',
                    (done) => {
                      const newData = {
                        acceptedDatesAndTimes: [{ startDate: new Date(), endDate: new Date() },
                              { startDate: new Date(), endDate: new Date() }],
                      };
                      chai.request(server)
                            .put('/invitations/3')
                            .send(newData)
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('invitation_id').eql('3');
                              res.body.should.have.property('meeting_id').eql('100');
                              res.body.should.have.property('attendant_email').eql('donald@gmail.com');
                              res.body.should.have.property('accepted_dates_and_times').eql(JSON.stringify(newData.acceptedDatesAndTimes));
                              done();
                            });
                    });

              it('it should throw error when no update data is provided',
                    (done) => {
                      const newData = {
                      };
                      chai.request(server)
                            .put('/invitations/3')
                            .send(newData)
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

              it('it should throw error when trying to update non existent invitation',
                    (done) => {
                      const newData = {
                        attendantEmail: 'notauser@gmail.com',
                      };
                      chai.request(server)
                            .put('/invitations/38881')
                            .send(newData)
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

      describe('DELETE /invitations/:invitationId',
            () => {
              it('it should delete the invitation with invitationId=3',
                    (done) => {
                      chai.request(server)
                            .delete('/invitations/3')
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('message').eql('Invitation 3 was deleted successfully!');
                              done();
                            });
                    });
            });

      describe('DELETE /invitations?meetingId',
            () => {
              it('it should delete all invitations to meeting with meetingId=500',
                    (done) => {
                      chai.request(server)
                            .delete('/invitations?meetingId=500')
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('message').eql('All invitations to meeting 500 have been deleted!');
                              done();
                            });
                    });
            });

      describe('DELETE /invitations',
            () => {
              it('it should delete all invitations',
                    (done) => {
                      chai.request(server)
                            .delete('/invitations')
                            .end((err, res) => {
                              if (err) {
                                debug(err);
                                throw err;
                              }
                              res.should.have.status(200);
                              res.body.should.be.a('object');
                              res.body.should.have.property('message').eql('All invitations have been deleted!');
                              done();
                            });
                    });
            });
    });
