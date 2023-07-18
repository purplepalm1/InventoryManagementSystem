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
// {"body" : "{ \"SKU\" : \"ABC12345\", \"name\" : \"bananas\", \"description\" : \"test bananas from xyz\", \"price\" : \"5\", \"maxQuantity\" : \"50\"}"}
//
// ===>  { "action" : "create_item",
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
 
    let checkSKU = (SKU) => {
        if (SKU && SKU != '') {
            return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM item WHERE SKU=?", [SKU], (error, rows) => {
                    // if (error) { 
                    // 	console.log(error)
                    // 	return resolve('No existing item, good') 
                    // } else {
                    //     if ((rows) && (rows.length == 1)) {
                    //     console.log("already an item with same SKU in database")
                    //     return reject(rows);
                    // }
                    if (error) {
                    	console.log("Something bad happens!", error);
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
 
 
 
    let insertData = (SKU, name, description, price, maxQuantity) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO item (SKU, name, description, price, maxQuantity) VALUES (?, ?, ?, ?, ?)", [SKU, name, description, price, maxQuantity], (error, rows) =>
            {
                if (error) {return reject(error) };
                if (rows) {
                    console.log("Item Inserted Successfully")
                    return resolve(rows);
                } else {
                    return reject(error);
                }
            })
        })
    }
 
    try {
 
    	const inputSKU = JSON.parse(event.body).SKU;
 
    	if (!inputSKU ){
    		response.statusCode = 400;
    		response.result = "Invalid Input!!!"
    	}
 
 
    	const doesExist = await checkSKU(inputSKU); //return false or true;
 
    	if (doesExist) {
    		//do nothing, dont insert
    		response.statusCode = 400;
    		response.result = "Item already exists"
 
    	} else {
    		const inputName = JSON.parse(event.body).name;
    		const inputDescription = JSON.parse(event.body).description;
    		const inputPrice = JSON.parse(event.body).price;
    		const inputMaxQuantity = JSON.parse(event.body).maxQuantity;
    		await insertData(inputSKU, inputName, inputDescription, inputPrice, inputMaxQuantity);
            response.result = "Item Created Successfully";
            console.log(response.result);
            response.statusCode = 200;
    	}
 
 
    } catch (error){
        response.error = error;
        console.log(error);
    }
    return response;
};