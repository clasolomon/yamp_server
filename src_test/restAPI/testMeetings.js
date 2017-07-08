import _debug from 'debug';
import chai from 'chai';
import chaiHttp from 'chai-http';
import sqlite3Wrapper from '../../bin/database/sqlite3Wrapper';
import server from '../../bin/www';

const debug = _debug('test:testMeetings');
let should = chai.should();

chai.use(chaiHttp);

describe('Table Meetings is empty; There is one user in database.',
    () => {
        before(
            async () => { 
                const db = await sqlite3Wrapper.getConnection();
                try{
                    db.run("DELETE FROM Users", (err)=>{
                        debug("Delete all entries from Users table");
                    });
                    const statement1 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (22, 'happy', 'happy@gmail.com', 'happysecret')";
                    db.run(statement1, (err)=>{
                        debug("Add user 22 in database.");
                    });
                }catch(err){
                    debug(err);
                    throw err;
                }
            });

        beforeEach(
            async () => { 
                // before each test delete all entries in Meetings table
                const db = await sqlite3Wrapper.getConnection();
                try{
                    db.run("DELETE FROM Meetings", (err)=>{
                        debug("Delete all entries from Meetings table");
                    });
                }catch(err){
                    debug(err);
                    throw err;
                }
            });

        describe('POST /meetings', 
            () => {
                it('it should POST a meeting', 
                    (done) => {
                        let newMeeting = {
                            meetingName: 'Cookies&Tea',
                            meetingDescription: 'Cookies, Tea and good time',
                            initiatedBy: 22,
                            proposedDatesAndTimes: [{startDate: new Date(), endDate: new Date()}, {startDate: new Date(), endDate: new Date()}],
                        }
                        chai.request(server)
                            .post('/meetings')
                            .send(newMeeting)
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('meeting_id');
                                res.body.should.have.property('meeting_name').eql('Cookies&Tea');
                                res.body.should.have.property('meeting_description').eql('Cookies, Tea and good time');
                                res.body.should.have.property('initiated_by').eql(22);
                                res.body.should.have.property('proposed_dates_and_times');
                                done();
                            });
                    });

                it('it should not POST a meeting without meetingName field', 
                    (done) => {
                        let newMeeting = {
                            meetingDescription: 'Cookies, Tea and good time',
                            initiatedBy: 22,
                            proposedDatesAndTimes: [{startDate: new Date(), endDate: new Date()}, {startDate: new Date(), endDate: new Date()}],
                        }
                        chai.request(server)
                            .post('/meetings')
                            .send(newMeeting)
                            .end((err, res) => {
                                res.should.have.status(400);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('InvalidInputError');
                                res.body.should.have.property('errorMessage').eql('meetingName is not defined!');
                                done();
                            });
                    });

                it('it should not POST a meeting without initiatedBy field', 
                    (done) => {
                        let newMeeting = {
                            meetingName: 'Cookies&Tea',
                            meetingDescription: 'Cookies, Tea and good time',
                            proposedDatesAndTimes: [{startDate: new Date(), endDate: new Date()}, {startDate: new Date(), endDate: new Date()}],
                        }
                        chai.request(server)
                            .post('/meetings')
                            .send(newMeeting)
                            .end((err, res) => {
                                res.should.have.status(400);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('InvalidInputError');
                                res.body.should.have.property('errorMessage').eql('initiatedBy is not defined!');
                                done();
                            });
                    });

                it('it should not POST a meeting without proposedDatesAndTimes field', 
                    (done) => {
                        let newMeeting = {
                            meetingName: 'Cookies&Tea',
                            meetingDescription: 'Cookies, Tea and good time',
                            initiatedBy: 22,
                        }
                        chai.request(server)
                            .post('/meetings')
                            .send(newMeeting)
                            .end((err, res) => {
                                res.should.have.status(400);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('InvalidInputError');
                                res.body.should.have.property('errorMessage').eql('proposedDatesAndTimes is not defined!');
                                done();
                            });
                    });

            });

        describe('GET /meetings', 
            () => {
                it('it should GET an empty array of meetings', 
                    (done) => {
                        chai.request(server)
                            .get('/meetings')
                            .end((err, res) => {
                                if(err){
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

        describe('GET /meetings/:meetingId', 
            () => {
                it('it should throw error when trying to get non-existent meeting', 
                    (done) => {
                        chai.request(server)
                            .get('/meetings/34')
                            .end((err, res) => {
                                res.should.have.status(404);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('NotFoundError');
                                res.body.should.have.property('errorMessage').eql('Resource not found!');
                                done();
                            });
                    });
            });
    });

describe('Table Meetings has 4 entries in it.', 
    () => {
        before(
            async () => { 
                const db = await sqlite3Wrapper.getConnection();
                try{
                    db.run("DELETE FROM Users", (err)=>{
                        debug("Delete all entries from Users table");
                    });

                    const statement1 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (22, 'happy', 'happy@gmail.com', 'happysecret')";
                    db.run(statement1, (err)=>{
                        debug("Add user 22 in database.");
                    });

                    const statement2 = "INSERT INTO Users(user_id, user_name, email, password) VALUES (34, 'casio', 'casio@gmail.com', 'casiosecret')";
                    db.run(statement2, (err)=>{
                        debug("Add user 34 in database.");
                    });

                    db.run("DELETE FROM Meetings", (err)=>{
                        debug("Delete all entries from Meetings table");
                    });

                    const statement3 = `INSERT INTO Meetings(meeting_id, meeting_name, meeting_description, initiated_by,  proposed_dates_and_times) VALUES (101, 'first', 'first meeting', '22', '[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]')`;
                    const statement4 = `INSERT INTO Meetings(meeting_id, meeting_name, meeting_description, initiated_by,  proposed_dates_and_times) VALUES (102, 'second', 'second meeting', '22', '[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]')`;
                    const statement5 = `INSERT INTO Meetings(meeting_id, meeting_name, meeting_description, initiated_by,  proposed_dates_and_times) VALUES (103, 'third', 'third meeting', '34', '[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]')`;
                    const statement6 = `INSERT INTO Meetings(meeting_id, meeting_name, meeting_description, initiated_by,  proposed_dates_and_times) VALUES (104, 'fourth', 'fourth meeting', '22', '[{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"},{"startDate":"2017-07-04T12:18:20.048Z","endDate":"2017-07-04T12:18:20.048Z"}]')`;

                    db.run(statement3, (err)=>{
                        debug("Add first meeting.");
                    });
                    db.run(statement4, (err)=>{
                        debug("Add second meeting.");
                    });
                    db.run(statement5, (err)=>{
                        debug("Add third meeting.");
                    });
                    db.run(statement6, (err)=>{
                        debug("Add fourth meeting.");
                    });
                }catch(err){
                    debug(err);
                    throw err;
                }
            });

        describe('POST /meetings',
            ()=>{
                it('it should not POST a meeting if the initiatedBy field is not valid', 
                    (done) => {
                        let newMeeting = {
                            meetingName: 'No meeting',
                            meetingDescription: 'Not a meeting',
                            initiatedBy: 82882, // points to non existent user
                            proposedDatesAndTimes: [{startDate: new Date(), endDate: new Date()}, {startDate: new Date(), endDate: new Date()}],
                        }
                        chai.request(server)
                            .post('/meetings')
                            .send(newMeeting)
                            .end((err, res) => {
                                res.should.have.status(400);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('InvalidInputError');
                                res.body.should.have.property('errorMessage').eql('invalid initiatedBy!');
                                done();
                            });
                    });
            });

        describe('GET /meetings',
            () => {
                it('it should GET an array with all the  meetings in database',
                    (done) => {
                        chai.request(server)
                            .get('/meetings')
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('array');
                                res.body.length.should.be.eql(4);
                                done();
                            });
                    });
            });

        describe('GET /meetings/meetingId', () => {
            it('it should GET the meeting with the corresponding meetingId', 
                (done) => {
                    chai.request(server)
                        .get('/meetings/104')
                        .end((err, res) => {
                            if(err){
                                debug(err);
                                throw err;
                            }
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('meeting_id').eql('104');
                            res.body.should.have.property('meeting_name').eql('fourth');
                            done();
                        });
                });
            it('it should throw an error because meetingId=501 is not in the database', 
                (done) => {
                    chai.request(server)
                        .get('/meetings/501')
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a('object');
                            res.body.should.have.property('code').eql('NotFoundError');
                            res.body.should.have.property('errorMessage').eql('Resource not found!');
                            done();
                        });
                });

        });

        describe('GET /meetings?initiatedBy', 
            () => {
                it('it should GET an array with all the  meetings initiated by user_id=34', 
                    (done) => {
                        chai.request(server)
                            .get('/meetings?initiatedBy=34')
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('array');
                                res.body.length.should.be.eql(1);
                                done();
                            });
                    });

                it('it should GET an array with all the  meetings initiated by user_id=22', 
                    (done) => {
                        chai.request(server)
                            .get('/meetings?initiatedBy=22')
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('array');
                                res.body.length.should.be.eql(3);
                                done();
                            });
                    });

                it('it should GET an empty array because there is no meeting initiated by user_id=55',
                    (done) => {
                        chai.request(server)
                            .get('/meetings?initiatedBy=55')
                            .end((err, res) => {
                                if(err){
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

        describe('PUT /meetings/:meetingId', 
            () => {
                it('it should update the meeting with meetingId=102', 
                    (done) => {
                        let newData = {
                            meetingName: 'Scrum101',
                            meetingDescription: 'Learn Scrum',
                            initiatedBy: 34,
                            proposedDatesAndTimes: [{startDate: new Date(), endDate: new Date()}, {startDate: new Date(), endDate: new Date()}],
                        }
                        chai.request(server)
                            .put('/meetings/102')
                            .send(newData)
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('meeting_id').eql('102');
                                res.body.should.have.property('meeting_name').eql('Scrum101');
                                res.body.should.have.property('meeting_description').eql('Learn Scrum');
                                res.body.should.have.property('initiated_by').eql(34);
                                res.body.should.have.property('proposed_dates_and_times');
                                done();
                            });
                    });

                it('it should update only the meeting name for meetingId=102', 
                    (done) => {
                        let newData = {
                            meetingName: 'Scrum for beginners',
                        }
                        chai.request(server)
                            .put('/meetings/102')
                            .send(newData)
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('meeting_id').eql('102');
                                res.body.should.have.property('meeting_name').eql('Scrum for beginners');
                                res.body.should.have.property('meeting_description').eql('Learn Scrum');
                                res.body.should.have.property('initiated_by').eql(34);
                                res.body.should.have.property('proposed_dates_and_times');
                                done();
                            });
                    });

                it('it should update only the meeting description for meetingId=102', 
                    (done) => {
                        let newData = {
                            meetingDescription: 'First steps...',
                        }
                        chai.request(server)
                            .put('/meetings/102')
                            .send(newData)
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('meeting_id').eql('102');
                                res.body.should.have.property('meeting_name').eql('Scrum for beginners');
                                res.body.should.have.property('meeting_description').eql('First steps...');
                                res.body.should.have.property('initiated_by').eql(34);
                                res.body.should.have.property('proposed_dates_and_times');
                                done();
                            });
                    });

                it('it should update only the initiated_by field for meetingId=102', 
                    (done) => {
                        let newData = {
                            initiatedBy: '22',
                        }
                        chai.request(server)
                            .put('/meetings/102')
                            .send(newData)
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('meeting_id').eql('102');
                                res.body.should.have.property('meeting_name').eql('Scrum for beginners');
                                res.body.should.have.property('meeting_description').eql('First steps...');
                                res.body.should.have.property('initiated_by').eql(22);
                                res.body.should.have.property('proposed_dates_and_times');
                                done();
                            });
                    });

                it('it should throw error when trying to update initiatedBy field with a non existent userId', 
                    (done) => {
                        let newData = {
                            initiatedBy: '2002',
                        }

                        chai.request(server)
                            .put('/meetings/102')
                            .send(newData)
                            .end((err, res) => {
                                res.should.have.status(400);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('InvalidInputError');
                                res.body.should.have.property('errorMessage').eql('invalid initiatedBy!');
                                done();
                            });
                    });

                it('it should update only the proposed_dates_and_times field for meetingId=102', 
                    (done) => {
                        let newData = {
                            proposedDatesAndTimes: [{startDate: new Date(), endDate: new Date()}, {startDate: new Date(), endDate: new Date()}],
                        }
                        chai.request(server)
                            .put('/meetings/102')
                            .send(newData)
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('meeting_id').eql('102');
                                res.body.should.have.property('meeting_name').eql('Scrum for beginners');
                                res.body.should.have.property('meeting_description').eql('First steps...');
                                res.body.should.have.property('initiated_by').eql(22);
                                res.body.should.have.property('proposed_dates_and_times').eql(JSON.stringify(newData.proposedDatesAndTimes));
                                done();
                            });
                    });

                it('it should throw error when no update data is provided', 
                    (done) => {
                        let newData = {
                        }

                        chai.request(server)
                            .put('/meetings/102')
                            .send(newData)
                            .end((err, res) => {
                                res.should.have.status(400);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('InvalidInputError');
                                res.body.should.have.property('errorMessage').eql('Invalid input!');
                                done();
                            });
                    });

                it('it should throw error when trying to update non existent meeting', 
                    (done) => {
                        let newData = {
                            meetingName: 'Not a meeting',
                        }

                        chai.request(server)
                            .put('/meetings/8833')
                            .send(newData)
                            .end((err, res) => {
                                res.should.have.status(404);
                                res.body.should.be.a('object');
                                res.body.should.have.property('code').eql('NotFoundError');
                                res.body.should.have.property('errorMessage').eql('Resource not found!');
                                done();
                            });
                    });

            });

        describe('DELETE /meetings/:meetingId', 
            () => {
                it('it should delete the meeting with meetingId=101', 
                    (done) => {
                        chai.request(server)
                            .delete('/meetings/101')
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('message').eql('Meeting 101 was deleted successfully!');
                                done();
                            });
                    });
            });

        describe('DELETE /meetings', 
            () => {
                it('it should delete all meetings', 
                    (done) => {
                        chai.request(server)
                            .delete('/meetings')
                            .end((err, res) => {
                                if(err){
                                    debug(err);
                                    throw err;
                                }
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('message').eql('All meetings have been deleted!');
                                done();
                            });
                    });
            });

        describe('TODO', ()=>{
            it('NOT A TEST should not post a meeting if meetingId is already in database');
            it('should not post a meeting if initiatedBy does not correspond to an existing userId');
        });
    });


