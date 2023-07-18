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
// {"body" : "{\"userID\": \"mg_e\"}"}
//
// ===>  { "action" : "get_store_with_manager_info",
//          "statusCode": 200,
//          "storeID" : 'xxxxxxx',
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
            "Access-Control-Allow-Methods": "POST" // Allow GET request
        }
    }; // response
    
    response.action = "get_store_with_manager_info";
    
    let getStore = (userID) => {
   
        return new Promise((resolve, reject) => {
            
            pool.query("SELECT storeID FROM store WHERE storeManagerID = ?", [userID], (error, rows) => {
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
    
    console.log(inputUserId);
    
    let store = await getStore(inputUserId);
    
    if (store.length === 0) {
        response.result = `Manager ${inputUserId} is not assigned to any store`;
        response.statusCode = 400;
    } else {
        response.result = "Successfully get the storeID";
        response.storeID = store[0].storeID;
        response.statusCode = 200;
    }
    
 } catch (error) {
     //if error...
     response.result = "Something bad happens: " + error;
     response.statusCode = 400;
 }
    return response;
};