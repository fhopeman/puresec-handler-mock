var express = require("express");
var bodyParser = require('body-parser');
var puresecMicroservice = require("puresec-microservice-js");

var app = express();

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://localhost:3000";
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[3] || 5;
var port = process.env.PORT || process.argv[4] || 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/health", function(req, res) {
    console.log("\nhealth: OK");
    res.send("OK");
});

app.post("/notify", function(req, res) {
    console.log("\nnotification received ..");
    console.log(req.body);
    res.send("OK");
});

app.listen(port, function() {
    var urlClient = puresecMicroservice.utils().currentAddress() + ":" + port;
    var master = puresecMicroservice.master(urlMaster);

    var registerOptions = {
        name: "Mock Handler 1",
        description: "Mock implementation of handler",
        type: "handler",
        address: urlClient,
        onSuccess: function(jsonBody) {
            console.log("registration result: ", jsonBody);
        },
        onError: function(error) {
            console.log("error during registration", error, "\nretry ..");
            setTimeout(function() {
                master.register(registerOptions);
            }, registrationInterval * 1000);
        }
    };

    // register
    console.log("try to register ..");
    master.register(registerOptions);
});
