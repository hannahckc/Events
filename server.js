var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser')
var fs = require("fs");
var path = require("path")
var connect = require('connect');
var url = require('url');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var ip = require("ip")
app.use(cookieParser())
var eventful = require('eventful-node');
var client = new eventful.Client("fVSNkjKXfxtxDpsk");


//HOMEPAGE
app.use('/static',express.static(path.join(__dirname, 'public')))
app.get('/events2017/home.html', function(req,res){
res.sendFile(__dirname+"/public/home.html")})

//LIST VENUES
app.get('/events2017/venues',function(req,res){
fs.readFile( __dirname + "/public/venues.json", "utf8", function(err,data) 
{
var venues1 = JSON.parse(data);
res.send(JSON.stringify(venues1));
})
})

//LIST EVENTS
app.get('/events2017/events',function(req,res){
fs.readFile( __dirname + "/public/events.json", "utf8", function(err,data) 
{
var events1 = JSON.parse(data);
//console.log(JSON.stringify(events1))
res.send(JSON.stringify(events1));
})
})

//SEARCH EVENT TITLE/DATE
app.get('/events2017/events/search', function(req,res){
var search = req.query.search;
var date = req.query.date;
console.log(search)
console.log(Date.parse(date));
resultlist=[];
fs.readFile( __dirname + "/public/events.json", function(err,data){
var events1 = JSON.parse(data);
if(search == undefined && date == undefined){res.send(events1)}
else{
console.log(events1);
for(i=0; i < (events1.events).length; i++)
{
var d1 = Date.parse (new Date(events1.events[i]["date"]));
var d2 = Date.parse(date);
console.log(d1);
console.log(d2);
if
(events1.events[i]["title"].indexOf(search)>-1 || (d1 == d2)) 
{resultlist.push(events1.events[i])}}
//console.log(resultlist)
if(resultlist.length == 0){res.send(events1)}
else
{var list2 = {}
list2["events"] = resultlist;
console.log(list2);
res.send(list2)}}})})

//GET EVENT BY ID
app.get('/events2017/events/get/:event_id', function(req,res){
fs.readFile( __dirname + "/public/events.json", function(err,data){
res.setHeader('Content-Type', 'application/json');
var events1 = JSON.parse(data);
if(err) {var result = JSON.stringify({"error": "no such event"})}

var idlist = []
for(i=0; i < (events1.events).length; i++)
{
idlist.push(events1.events[i]["event_id"]);
}
for(i=0; i < (events1.events).length; i++)
{
if (events1.events[i]["event_id"] == req.params.event_id)
{
var result = (events1.events[i]);
//res.setHeader('Content-Type', 'text/html')
res.send(result)
}
}
if(idlist.every(function(item,index,array){return item !==req.params.event_id}) == true)
{var result = JSON.stringify({"error": "no such event"});
res.write(result)}
res.end})})

//ADD VENUE
app.post('/events2017/venues/add', function(req,res){

if(req.body.auth_token !== "concertina" || req.body.auth_token==undefined || req.body.auth_token == ""){
res.status(400);
res.send(JSON.stringify({"error":"not authorised, wrong token"}))}
else if(req.body.name == undefined || req.body.name==""){
res.status(400);
res.send(JSON.stringify({"error": "Not all required parameters are present"}))}
else if(req.body.auth_token == "concertina" && req.body.name !== undefined && req.body.name !== ""){
fs.readFile(__dirname + "/public/venues.json", function(err,data) {
var venues1 = JSON.parse(data);
var name1 = req.body.name;
var postcode1 = req.body.postcode;
var town1 = req.body.town;
var url1 = req.body.url;
var icon1 = req.body.icon;
//res.setHeader('Content-Type', 'application/json') ;
number = Date.now()
var vid1 = JSON.stringify(number);
var vid = "v_" + vid1 ;
var venue = {};
venue["name"] = name1;
venue["postcode"] = postcode1;
venue["town"] = town1;
venue["url"] = url1;
venue["icon"] = icon1;
venues1.venues[vid] = venue
console.log(venue)
fs.writeFileSync(__dirname+"/public/venues.json", JSON.stringify(venues1), 'utf8')
res.send(JSON.stringify("Venue Successfully Added"))})}})


//ADD EVENT
app.post('/events2017/events/add', function(req,res){
var event_id1 = req.body.event_id;
var title1 = req.body.title;
var venue_id1 = req.body.venue_id;
var date1 = req.body.date
var url1 = req.body.url;
var blurb1 = req.body.blurb;
if(req.body.auth_token !== "concertina" || req.body.auth_token==undefined || req.body.auth_token == ""){
res.status(400);
res.send(JSON.stringify({"error":"not authorised, wrong token"}))}
else if(event_id1 == undefined || event_id1 =="" || title1 == undefined || title1 == "" || venue_id1 == undefined || venue_id1 ==""
|| date1 == undefined || date1 ==""){
res.status(400);
res.send(JSON.stringify({"error": "Not all required parameters are present"}))}
else if(event_id1 !== undefined && event_id1 !=="" && title1 !== undefined && title1 !== "" && venue_id1 !== undefined && venue_id1 !==""
&& date1 !== undefined && date1 !=="" && req.body.auth_token == "concertina"){
var event = {}
event["event_id"] = event_id1;
event["title"] = title1;
event["date"] = date1;
event["url"] = url1;
event["blurb"] = blurb1;
fs.readFile(__dirname + "/public/venues.json", function(err, data){
var venues1 = JSON.parse(data);
fs.readFile(__dirname + "/public/events.json", function(err,data) {
var events1 = JSON.parse(data);
//for(i=0; i < (venues1.venues.length); i++)
event["venue"]= venues1.venues[venue_id1];
events1.events.push(event);
fs.writeFileSync(__dirname +"/public/events.json", JSON.stringify(events1), 'utf8')})})
res.send("Event Successfully Added")}})

//AUTHENTICATION
app.use('/static',express.static(path.join(__dirname, 'public')));
app.get('/events2017/login.html',function(req,res){
//console.log(ip.address())
res.sendFile(__dirname+"/public/login.html")})

app.get('/events2017/authorise', function(req,res){
res.sendFile(__dirname+"/public/login.html");
var ip1 = ip.address()
console.log("go");
var cookie = req.cookies
var ip3 = Object.keys(cookie)
var ip4 =""+ip3[0]
var token = cookie[ip4]
if(token == 'concertina' && ip3 == ip1)
{ res.send(JSON.stringify("Authorised"))}
else{
res.send(JSON.stringify("fail"))}
})

app.post('/events2017/login2', function(req,res){
username = req.body.username;
password = req.body.pword;
console.log(password)
if(username !== "hannahc" || password !== "password1"){
//res.setHeader('Content-Type', 'application/json')
console.log("no");
res.send("no")}
else if(username =="hannahc" && password == "password1"){
console.log("yes");
var ip1 = ip.address()
//console.log(ip1)
var ip2 = ""+ip1
//console.log(ip2)
res.send(JSON.stringify([ip2,'concertina']))}})



//INDEX.HTML
app.use(express.static('/static',express.static(path.join(__dirname, 'public'))));
app.get('/events2017/index.html', function(req,res){
res.sendFile(__dirname + "/public/index.html")})

app.post
('/events2017/results', function (req, res) {
   fs.readFile(__dirname + "/public/events.json", function(err,data){
   events1 = JSON.parse(data);
   console.log(events1)
   date1 = req.body.date1;
   keyword = req.body.keyword1;
   response = {keyword2:keyword, date2:date1};
   console.log(response);
var resultlist=[]
var d2 = new Date(date1)
//var d2= dd2.getTime()
//var d2 = dd2.toISOString()
for(i=0; i < (events1.events).length; i++)
{
var d1 = new Date(events1.events[i]["date"])
if(
(events1.events[i]["title"].indexOf(keyword)>-1 && keyword !=="")|| 
(d1.getFullYear() == d2.getFullYear() &&
d1.getMonth() == d2.getMonth() &&
d1.getDate() == d2.getDate()))
{console.log('yes');
resultlist.push(events1.events[i])}}
console.log(resultlist);
res.send(JSON.stringify(resultlist));
resultlist=[];
})})

//ADMIN.HTML
app.use('/static',express.static(path.join(__dirname, 'public')));
app.get('/events2017/admin.html', function(req,res){
res.sendFile(__dirname + "/public/admin.html")})

//Add venue with form
app.post('/events2017/addvenue',function(req,res){
var name1 = req.body.vname;
var postcode1 = req.body.vpcode;
var town1 = req.body.vtown;
var url1 = req.body.vurl;
var icon1 = req.body.vicon;
if (name1==undefined || name1==""){res.send("no")}
else{
//console.log(name1);
//res.setHeader('Content-Type', 'application/json') ;
number = Date.now()
var vid1 = JSON.stringify(number);
var vid = "v_" + vid1 ;
var venue = {};
venue["name"] = name1;
venue["postcode"] = postcode1;
venue["town"] = town1;
venue["url"] = url1;
venue["icon"] = icon1;
fs.readFile(__dirname + "/public/venues.json", function(err,data) {
var venues1 = JSON.parse(data);
venues1.venues[vid] = venue
fs.writeFileSync(__dirname + "/public/venues.json", JSON.stringify(venues1), 'utf8')})
console.log(venue);
res.send(JSON.stringify(venue))}})

//Add event with form
app.post('/events2017/addevent', function(req,res){
var event_id1 = req.body.eid;
var title1 = req.body.etitle;
var venue_id1 = req.body.evenue;
var date1 = req.body.edate
var url1 = req.body.eurl;
var blurb1 = req.body.eblurb;
if(title1 == undefined || title1 == "" || event_id1 == undefined || event_id1 == "" || date1 == undefined || date1 == ""){res.send("no")}
else{var event = {}
console.log(venue_id1)
event["event_id"] = event_id1
event["title"] = title1;
event["date"] = date1;
event["url"] = url1;
event["blurb"] = blurb1;
fs.readFile(__dirname + "/public/venues.json", function(err, data){
var venues1 = JSON.parse(data);
fs.readFile(__dirname + "/public/events.json", function(err,data) {
var events1 = JSON.parse(data);
//for(i=0; i < (venues1.venues.length); i++)
console.log(venue_id1)
event["venue"]= venues1.venues[venue_id1];
console.log(event)
events1.events.push(event);
console.log(events1)
fs.writeFileSync(__dirname + "/public/events.json", JSON.stringify(events1), 'utf8')})})
res.send("Event Successfully Added")}})


var server=app.listen(8090,function(){

var host=server.address().address
var port=server.address().port

console.log("EventsaAp listening at http://127.0.0.1:8090/events2017/home.html")})
   
