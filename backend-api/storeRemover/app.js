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
// {"body" : "{ \"storeID\" : \"1\"}"}
//
// ===>  { "action" : "remove_store",
//          "statusCode": 200}
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
 
 
    let data = JSON.parse(event.body);
 
    let checkStore = (storeID) => {
        if (storeID && storeID != '') {
            return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM store WHERE storeID=?", [storeID], (error, rows) => {
                    if (error) {
                        console.log("Something Bad", error);
                        return reject(error);
                    } else {
                        if (rows && rows.length === 1){
                            console.log("Store is in the system")
                            return resolve(true);
                        } else {
                            console.log("No Store with that Store ID in the system");
                            return resolve(false);
                        }
                    }
                        
                    }
                )
        });
    };
    };
 
 
    let deleteData = (storeID) => {
        return new Promise((resolve, reject) => {
            pool.query("DELETE FROM store WHERE storeID=?", [storeID], (error, rows) => {
                if (error) {return reject(error)}
                if (rows){
                    console.log("Deleted the store successfully");
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            });
        });
    };


 
    try {
 
    	const inputStoreID = JSON.parse(event.body).storeID;
 
    	if (!inputStoreID){
    		response.statusCode = 400;
    		response.result = "Invalid Input!!!"
    	}
 
 
    	const doesExist = await checkStore(inputStoreID); //return false or true;
 
    	if (!doesExist) {
    		//do nothing, dont delete
    		response.statusCode = 400;
    		response.result = "No store to delete from"
 
    	} else {
    		await deleteData(inputStoreID);
            response.result = "Store Deleted Successfully";
            console.log(response.result);
            response.statusCode = 200;
    	}
 
 
    } catch (error){
        response.error = error;
        console.log(error);
    }
    return response;
};