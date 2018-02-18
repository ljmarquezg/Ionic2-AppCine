var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');

var allowInsecureHTTP = true;

var app1 = new ParseServer({
    databaseURI: 'mongodb://localhost:27017/movies',
    appId: 'Peliculas',
    restAPIKey: "restAPIKey",
    fileKey: 'myFileKey',
    masterKey: 'masterKey',
    serverURL: "http://localhost:8080/movies"
});

var pasreDashboardSettings = {
    "apps": [{
        "serverURL": "http://localhost:8080/movies",
        "appId": "Peliculas",
        "restAPIKey": "restAPIKey",
        "masterKey": "masterKey",
        "appName":"Movies"
    }],
    "users": [{
        "user": "admin",
        "pass": "12345",
        "masterKey": "masterKey",
        "apps": [{
            "appId": "Peliculas"
        }]
    }]
}
var dashboard = new ParseDashboard(pasreDashboardSettings, allowInsecureHTTP);

var app = express();

app.use('/movies', app1, function(req, res, next){
      return next();
});

app.use('/dashboard', dashboard);

var httpServer = require('http').createServer(app);
httpServer.listen(8080);