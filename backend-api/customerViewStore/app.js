
/**USE CASE FOR CUSTOMER TO SEARCH ITEM ON A PARTICULAR SHELF/AISLE IN A STORE*/

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

// Take in as input a payload storeID, SKU
//
// {"body": "{\"storeID\": \"1\"}"}
// ===>  { "action" : "customer_get_store",
//          "statusCode": 200,
//          "storeName": "ABC_XYZ",
//          "storeID": "234",
//          "items" : "[item1_object, item2_object]"
//}
//
// return response via callback(null, {response})
exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

   // ready to go for CORS. To make this a completed HTTP response, you only need to add a statusCode and a body.
    let response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    }; // response

    
    /*
    SAMPLE OUTPUT
    select s.SKU, s.storeID, store.name, i.name, i.description, i.price, s.quantity, s.aisle, s.shelf from shelfStockLocation as s, item as i, store  where s.storeID = "1" and s.SKU = i.SKU AND s.storeID = store.storeID;   
    +-----+---------+-------------+----------------+-------------+-------+----------+-------+-------+
    | SKU | storeID | name        | name           | description | price | quantity | aisle | shelf |
    +-----+---------+-------------+----------------+-------------+-------+----------+-------+-------+
    | A   | 1       | Trader Joes | lorem          | ipsum       |     1 |       20 |     1 |     2 |
    | A   | 1       | Trader Joes | lorem          | ipsum       |     1 |       20 |     1 |     3 |
    | A   | 1       | Trader Joes | lorem          | ipsum       |     1 |       20 |    10 |    20 |
    | B   | 1       | Trader Joes | lorem          | ipsum       |     2 |       15 |     1 |     3 |
    | B   | 1       | Trader Joes | lorem          | ipsum       |     2 |       15 |     2 |     3 |
    | QWE | 1       | Trader Joes | Beyond Chicken | Vegan       |     2 |       13 |     1 |     3 |
    +-----+---------+-------------+----------------+-------------+-------+----------+-------+-------+
    */
    
    let get_store_sql = "SELECT s.SKU, i.name, i.description, i.price, s.quantity, s.aisle, s.shelf \
                           FROM shelfStockLocation as s, item as i, store  \
                           WHERE s.storeID = ? \
                           AND s.SKU = i.SKU \
                           AND s.storeID = store.storeID;" 
    
    let getStores = (storeID) => {
        return new Promise((resolve, reject) => {
            pool.query(get_store_sql, [storeID], (error, rows) => {
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    let getStoreName = (storeID) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT name FROM store WHERE storeID=?", [storeID], (error, rows) => {
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    // __main__ function
    try {
        
        //{ "body": "{\"store\": \"2\"}"}
        
        console.log(event);
        let info = JSON.parse(event.body);
        
        // parsing arguments from request body
        const inputStore = info.storeID;
        console.log("Input StoreID is: ", inputStore);
        let storeInfo = await getStoreName(inputStore);
        
        response.storeName = storeInfo[0].name;
        response.storeID = inputStore;
        
        let returnedItemsInStore = await getStores(inputStore); 
        
        response.items = [];
        
        if (returnedItemsInStore.length === 0) {
            response.statusCode = 200;
            response.result = "Execution completed! The Store Is Out Of Stock!!!";
        } else {
            response.result = "Successfully fetched items in stores";
            response.statusCode = 200;
            for (let row of returnedItemsInStore){
                response.items.push(row);
            }
        }
        
    } catch (error) {
        error.message = "Something bad happens!!";
        console.log("ERROR: " + error.message);
        response.statusCode = 400;
        response.error = error;
    }
    
    return response;
};