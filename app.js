var express = require("express");
var bodyParser = require('body-parser');
var logger = require('winston');
var puresecMicroservice = require("puresec-microservice-js");

var app = express();
var pmsUtils = puresecMicroservice.utils();

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://localhost:3000";
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[3] || 5;
var port = process.env.PORT || process.argv[4] || 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

pmsUtils.addHealthCheck(app, function() {
    logger.info("health: UP");
});

pmsUtils.addNotifyEndpoint(app, function() {
    logger.info("\nnotification received ..");
    logger.info(req.body);
});

app.listen(port, function() {
    var urlClient = pmsUtils.currentAddress() + ":" + port;
    var master = puresecMicroservice.master(urlMaster);

    var registerOptions = {
        name: "Mock Handler 1",
        description: "Mock implementation of handler",
        type: "handler",
        address: urlClient,
        onSuccess: function(jsonBody) {
            logger.info("registration result: ", jsonBody);
        },
        onError: function(error) {
            logger.info("error during registration", error, "\nretry ..");
            setTimeout(function() {
                master.register(registerOptions);
            }, registrationInterval * 1000);
        }
    };

    // register
    logger.info("try to register ..");
    master.register(registerOptions);
});
