/*USE CASE FOR CUSTOMER TO LIST STORES BY PARTIALLY MATCHING ITEM NAME, SKU, OR DESCRIPTION*/

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
// {"body": "{\"text\": \"Beyond Burger\"}"}
// ===>  { "action" : "search_store_by_item",
//          "statusCode": 200}
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
    +-----+----------------+---------+-------------+-----------+----------+
    | SKU | name           | storeID | name        | longitude | latitude |
    +-----+----------------+---------+-------------+-----------+----------+
    | ABC | Beyond Burger  | 2       | Worcester   |     45.34 |    35.67 |
    | QWE | Beyond Chicken | 1       | Trader Joes |     23.34 |    34.67 |
    +-----+----------------+---------+-------------+-----------+----------+
    */
  
    let getStores = (searchText) => {
        return new Promise((resolve, reject) => {
            pool.query(`SELECT DISTINCT s.SKU, item.name as item_name, s.storeID, store.name as store_name, store.longitude, store.latitude \
                          FROM shelfStockLocation as s, store, item \
                          WHERE s.storeID = store.storeID\
                          AND s.SKU = item.SKU
                          AND s.SKU in \
                                    (SELECT SKU \
                                    FROM item \
                                    WHERE SKU = "${searchText}"\
                                    OR name LIKE "%${searchText}%"\
                                    OR description LIKE "%${searchText}%")`,  (error, rows) => {
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
        
        // {"body": "{\"text\": \"Beyond Burger\"}"}
        
        console.log(event);
        let info = JSON.parse(event.body);
        
        // parsing arguments from request body
        const searchText = info.text;
        console.log("Search text  is ", searchText);
        
        let returnedStores = await getStores(searchText); 
        
        console.log(returnedStores);
        
        response.stores = [];
        if (returnedStores.length === 0) {
            response.statusCode = 200;
            response.result = "Execution completed! No stores carry item you are looking for!!!";
        } else {
            response.result = "Successfully fetched stores that carry the item you are looking for!!!";
            response.statusCode = 200;
            for (let row of returnedStores){
                response.stores.push(row);
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