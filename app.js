var express = require("express");
var master = require("./master.js");
var network = require("./network.js");

var app = express();

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://192.168.178.23:3000";
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[3] || 5;
var port = process.env.PORT || process.argv[4] || 3002;

app.get("/health", function(req, res) {
    console.log("\nhealth: OK");
    res.send("OK");
});

app.post("/notify", function(req, res) {
    console.log("\nnotification received ..")
    // console.log(req);
    res.send("OK");
});

app.listen(port, function() {
    var url = network.currentCallbackAddress() + ":" + port;
    console.log("trigger dummy microservice listening at '%s'", url);

    master.register(url, urlMaster, registrationInterval);
});
