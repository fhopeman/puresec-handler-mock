var express = require("express");
var bodyParser = require('body-parser');
var logger = require('winston');
var puresecMicroservice = require("puresec-microservice-js");

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://localhost:3000";
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[3] || 5;
var port = process.env.PORT || process.argv[4] || 3002;

var app = express();
var master = puresecMicroservice.master(urlMaster);
var utils = puresecMicroservice.utils();
var webApp = puresecMicroservice.webApp();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

webApp.registerHealthCheckEndpoint(app, function() {
    logger.debug("health: UP");
});

webApp.registerNotificationEndpoint(app, function(req, res) {
    logger.info("\nnotification received ..");
    logger.info(req.body);
});

app.listen(port, function() {
    var registerOptions = {
        name: "Mock Handler 1",
        description: "Mock implementation of handler",
        type: "handler",
        address: utils.currentAddress(port),
        onSuccess: function(jsonBody) {
            logger.info("registration result: ", jsonBody);
        },
        onError: function(error) {
            logger.error("error during registration", error, "\nretry ..");
            setTimeout(function() {
                master.register(registerOptions);
            }, registrationInterval * 1000);
        }
    };

    // register
    logger.info("try to register ..");
    master.register(registerOptions);
});
