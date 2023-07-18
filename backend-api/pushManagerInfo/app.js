// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

//database connection

const mysql = require('mysql');

var config = require('./config.json');
var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});


var con = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password
});

// check if connection is successful
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


// Take in as input a payload storeID, SKU, quantity
//
// {"body": "{\"userID\": \"71a9de60-1e16-465d-8\", \"email\": \"monday@test.com\"}"}
//
// ===>  { "action" : "push_manager_info",
//          "statusCode": 200,
//          "userID" : 'xxxxxxx',
//          "result": "Successfully get store"
//}
//
// return response via callback(null, {response})
exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

   // ready to go for CORS. To make this a completed HTTP response, you only need to add a statusCode and a body.
   response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    }; // response
    
    response.action = "push_manager_info";
    
    let insertUser = (userID, email) => {
   
        return new Promise((resolve, reject) => {
            
            pool.query("INSERT INTO users VALUES (?, ?)", [userID, email], (error, rows) => {
                if (rows){
                    return resolve(rows);
                } else {
                    return reject(error);
                }
            });
        });
    };
    
 try {
    
    console.log(event);
    console.log(response);
    let data = JSON.parse(event.body);
    let inputUserId = data.userID;
    let inputEmail = data.email;
    
    console.log(inputUserId);
    console.log(inputEmail);
    
    await insertUser(inputUserId, inputEmail);
    response.result = `Successfully added manager ${inputUserId} to the database`;
    response.statusCode = 200;
    
    
 } catch (error) {
     //if error...
     response.result = "Something bad happens: " + error;
     response.statusCode = 400;
 }

    return response;
};