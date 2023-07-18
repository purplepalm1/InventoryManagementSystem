/**USE CASE FOR CORPORATE TO DELETE A STORE. THIS IS A BACKUP SOLUTION FOR STOREREMOVER*/

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
/*
{ "action" : "delete_store",
	"statusCode": 200,
	"headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
    "deletedStore": "storeID_ABC_XYZ",
    "result": `Successfully deleted store ${storeID_ABC_XYZ}`
}
*/
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
    To delete a store; delete shelfStockLocation; delete overStock; delete from store;
    */
    
    let delete_from_shelf_sql = "DELETE FROM shelfStockLocation WHERE storeID = ?;";
    let delete_from_overstock_sql = "DELETE FROM overStock WHERE storeID = ?;";
    let delete_from_store_sql = "DELETE FROM store WHERE storeID = ?;";
    
    let deleteFromShelf = (storeID) => {
        return new Promise((resolve, reject) => {
            pool.query(delete_from_shelf_sql, [storeID], (error, rows) => {
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    let deleteFromTable = (sql, storeID) => {
        return new Promise((resolve, reject) => {
            pool.query(sql, [storeID], (error, rows) => {
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
        response.action = 'delete_store';
        console.log(event);
        let info = JSON.parse(event.body);
        
        // parsing arguments from request body
        const inputStore = info.storeID;
        console.log("Input StoreID is: ", inputStore);
        
        await deleteFromTable(delete_from_shelf_sql, inputStore);
        await deleteFromTable(delete_from_overstock_sql, inputStore);
        await deleteFromTable(delete_from_store_sql, inputStore);
        
        response.result = `Successfully deleted store ${inputStore}`;
        response.statusCode = 200;
        
    } catch (error) {
        error.message = "Something bad happens!!";
        console.log("ERROR: " + error.message);
        response.statusCode = 400;
        response.error = error;
    }
    
    return response;
};