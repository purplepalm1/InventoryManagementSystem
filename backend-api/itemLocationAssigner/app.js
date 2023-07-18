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
// {"body": "{\"SKU\": \"DRJ297831\", \"aisle\": \"1\", \"shelf\": \"2\" }"}
//
// ===>  { "action" : "assign_item_location",
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
 
    let checkSKU = (SKU) => {
        if (SKU && SKU != '') {
            return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM item WHERE SKU=?", [SKU], (error, rows) => {
                    if (error) {
                    	console.log("Something went wrong!", error);
                    	return reject(error);
                    } else {
                    	if (rows && rows.length >= 1){
                    		console.log("already have")
                    		return resolve(true);
                    	} else {
                    		console.log("we dont have it");
                    		return resolve(false); 
                    	}
                    }
                }
            );
        })
    };
    };
 
 
 
    let insertData = (SKU, aisle, shelf ) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO itemLocation (SKU, aisle, shelf) VALUES (?, ?, ?)", [SKU, aisle, shelf], (error, rows) =>
            {
                if (error) {return reject(error) };
                if (rows) {
                    console.log(`Assigned item ${SKU} successfully to shelf ${shelf} - aisle ${aisle}`);
                    return resolve(rows);
                } else {
                    console.log("Error: ", error);
                    return reject(error);
                }
            })
        })
    }
 
    try {
 
    	const inputSKU = JSON.parse(event.body).SKU;
    	const inputShelf = JSON.parse(event.body).shelf;
    	const inputAisle = JSON.parse(event.body).aisle;
    	console.log("SKU input", inputSKU);
    	console.log("Aisle input", inputAisle);
    	console.log("Shelf input", inputShelf);
 
    	if (!inputSKU || !inputAisle || !inputShelf){
    		response.statusCode = 400;
    		response.result = `Invalid Input !!! You entered ${inputSKU} for SKU, ${inputShelf} for Shelf, ${inputAisle} for Aisle`
    	}
 
 
    	const doesExist = await checkSKU(inputSKU); //return false or true;
 
    	if (doesExist) {
    		//if the item does exist, we can assign location for it
    		response.statusCode = 200;
    		await insertData(inputSKU, inputAisle, inputShelf);
    		response.result = `Successfully assigned item ${inputSKU} successfully to shelf ${inputShelf} - aisle ${inputAisle}`;
 
    	} else {
    	    //if not, fire an error and remind user to create item first
    	    response.result = "Cannot assign an item if it hasn't been created!! Please create it first!!!";
            console.log(response.result);
            response.statusCode = 400;
    	}
 
 
    } catch (error){
        response.error = error;
        console.log(error);
    }
    return response;
};