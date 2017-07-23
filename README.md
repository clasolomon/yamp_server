# YAMP (Yet Another Meeting Planner)
This is a private project created with the sole purpose of learning.

**Yamp** is a meeting planner. It gives the user the possibility to plan a meeting (describe the purpose of the meeting and the possible dates when it may take place) and to poll the interested parties on what are the best dates the meeting can take place. Each invitee will receive an email, in which he/she can vote for the dates on which he/she can attend the meeting.

An user also has the possibility to register and in this way he will have access to the history of all his meetings each time he logs in.

This is the **backend of Yamp**.   
It is created with **Express.js**. It exposes a **REST API**.

The following dependencies where used:

* [Express](https://expressjs.com/) - web framework
* [Passport](http://passportjs.org/) - authentification
* [SQlite3](https://github.com/mapbox/node-sqlite3/wiki/API) - database
* [UUID](https://github.com/kelektiv/node-uuid) - to generate unique identifiers
* [Babel](https://babeljs.io/) - Javascript compiler 
* [Nodemailer](https://www.npmjs.com/package/nodemailer) - send emails 
* [Debug](visionmedia/debug) - debug utility 
* [ESLint](https://github.com/eslint/eslint) - code linter
* [Morgan](https://github.com/expressjs/morgan) - HTTP logger 
* [SwaggerUI](https://github.com/swagger-api/swagger-ui) - documentation
* [Swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) - documentation 

For testing the REST API the following dependencies were used:

* [Mocha](https://mochajs.org/) - test framework 
* [Chai](https://github.com/chaijs/chai) - BDD/TDD assertion library 
* [Chai-http](https://github.com/chaijs/chai-http) - HTTP response assertions 

**STARTING THE SERVER**

When starting the server, the **start** script expects three node environment variables to be defined:
* **NODEMAILER_SERVICE**: the email service used (ex. Gmail)
* **NODEMAILER_USER**: the email used to send emails
* **NODEMAILER_PASS**: the password for the email
