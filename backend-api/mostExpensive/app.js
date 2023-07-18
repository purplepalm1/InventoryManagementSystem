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
// ===>  { "action" : "get_most_expensive_item",
//          "statusCode": 200,
//          "items" : [item1, item2, ....],
//          "result": "Successfully fetched most expensive item"
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
    
    let getItem = () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT item.sku, item.name, item.description, item.price FROM item WHERE price = (SELECT MAX(price) FROM item)", (error, rows) => {
                if (error) {
                    console.log("Something is wrong", error);
                    return reject(error);
                } else {
                    return resolve(rows);
                }
            })
        })
    }
 
 
 
 response.action = "get_most_expensive_item";
 
 try {
     
    const returnedItem = await getItem();
    response.items = [];
    
    
    if (returnedItem){
         for (let item of returnedItem) {
             response.items.push(item);
         }
         response.statusCode = 200;
         response.result = "Successfully fetched Most Expensive Item"
     }
 } catch (error) {
     //if error...
     response.result = "Something is wrong!!"
     response.statusCode = 400
 }

    return response;
};
   
   