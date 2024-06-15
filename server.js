var express = require("express")
const { getTodo, login } = require("./controller")
const moment = require("moment")
var app = express()

// consider / position 
// check <match url="api/*" /> in web.config

app.get("/", function (req, res) {
  res.send("Hello URL root :)")
})

app.get("/api", function (req, res) {
  res.send(`Hello, USER: ${process.env.USER} PASSWORD: ${process.env.PASSWORD} SERVER: ${process.env.SERVER} DATABASE: ${process.env.DATABASE} `)
})

app.get("/api/hello", function (req, res) {
  res.send("Hello Express :)")
})

app.get("/api/history/:vehicleID/:dateFrom/:dateTo", function (req, res) {
  var { vehicleID, dateFrom, dateTo } = req.params

  const mm = moment().format()
  const environ = process.env.node_env;
  const nodeProcessCountPerApplication = process.env.nodeProcessCountPerApplication;
  const str = `count: ${nodeProcessCountPerApplication} node_env: ${environ} Params vehicleID: ${vehicleID} dateFrom: ${dateFrom} dateTo: ${dateTo}, generate at: ${mm} `
  console.log(str)

  res.send(str)
})

app.get("/api/todos", function (req, res) {
  getTodo(req, res)
})

app.get("/api/login", function (req, res) {
  login(req, res)
})

app.get("*", function (req, res) {
  res.send(`URL: ${req.url} method: ${req.method}`)
  // res.send("This URL is not set :(")
})

var server = app.listen(process.env.PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log(`Server listening host: ${host} port: ${port} `)
})