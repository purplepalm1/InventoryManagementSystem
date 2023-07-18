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
// {"body": "{}"}
//
// ===>  { "action" : "get_all_corporate_items",
//          "statusCode": 200,
//          "items" : [item1, item2, ....],
//          "result": "Successfully fetched items"
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
            "Access-Control-Allow-Methods": "GET" // Allow POST request
        }
    }; // response
    
    let getItems = () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM item", (error, rows) => {
                if (error) {
                    console.log("Something went wrong!", error);
                    return reject(error);
                } else {
                    return resolve(rows);
                }
            })
        })
    }
 
 
 
 response.action = "get_all_corporate_items";
 
 try {
     
    const returnedItems = await getItems();
    response.items = [];
    
    
    if (returnedItems){
         for (let item of returnedItems) {
             response.items.push(item);
         }
         response.statusCode = 200;
         response.result = "Successfully fetched Items"
     }
 } catch (error) {
     //if error...
     response.result = "Something bad happens!!"
     response.statusCode = 400
 }

    return response;
};