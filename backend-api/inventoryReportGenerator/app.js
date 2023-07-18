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
//{"body" : "{ \"storeID\" : \"1\"}"}
//
// ===>  { "action" : `generate_inventory_report`,
//          "statusCode": 200,
//          "storeID" : "1",
//          "result": "Successfully fetched inventory report",
//          "stock" : {"shelfStock": "[item1, item2....], "overStock": "[item1, item2]". "missingStock": "[item1, item2]"}
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
            "Access-Control-Allow-Methods": "GET" // Allow GET request
        }
    }; // response
    
    const shelfstock_sql = "SELECT s.SKU, i.name, i.description, i.price, i.maxQuantity,  s.quantity, s.aisle, s.shelf \
                             FROM shelfStockLocation as s, item as i \
                             WHERE storeID = ? and s.SKU = i.SKU;" 
    
    const overstock_sql = "SELECT o.SKU, i.name, i.description, i.price, i.maxQuantity,  o.quantity \
                           FROM overStock as o, item as i \
                           WHERE storeID = ? and o.SKU = i.SKU;"
    
    let missing_sql = "SELECT item.sku, item.description, item.price FROM item \
                        LEFT JOIN \
                            ((SELECT shelfStockLocation.SKU FROM shelfStockLocation where storeID= ?) \
                            UNION \
                            (SELECT overStock.SKU FROM overStock where storeID= ?)) \
                            as d \
                        ON item.sku = d.sku \
                        WHERE d.sku is NULL;"
    
    let getStock = (sql_query, storeID) => {
        return new Promise((resolve, reject) => {
            pool.query(sql_query, [storeID] , (error, rows) => {
                if (error) {
                    console.log("Something went wrong while connecting to the database: ", error);
                    return reject(error);
                } else {
                    return resolve(rows);
                }
            })
        })
    }
    
    let getStock_missing = (sql_query, storeID1, storeID2) => {
        return new Promise((resolve, reject) => {
            pool.query(sql_query, [storeID1, storeID2], (error, rows) => {
                if (error) {
                    console.log("Something went wrong while connecting to the database: ", error);
                    return reject(error);
                } else {
                    return resolve(rows);
                }
            })
        })
    }
 
 
 response.action = "generate_inventory_report";
 const data = JSON.parse(event.body);
 const inputStoreID = data.storeID;
 response.storeID = inputStoreID;
 console.log(inputStoreID);
 
 //placeholder for response['stock'] value
 response.stock = {}
 response.stock["shelfStock"] = [];
 response.stock["overStock"] = [];
 response.stock["missingStock"] = [];
 

if (!inputStoreID || inputStoreID === ""){
    response.statusCode = 400;
    response.result = "Failed to fetch! Invalid input...";
}

try {
    const shelfStock = await getStock(shelfstock_sql, inputStoreID);
    const overStock = await getStock(overstock_sql, inputStoreID);
    const missingStock = await getStock_missing(missing_sql, inputStoreID);

    
    if (shelfStock){
        for (let item of shelfStock) {
            response.stock['shelfStock'].push(item);
        }
    }
    
    if (overStock){
        for (let item of overStock) {
            response.stock['overStock'].push(item);
        }
    }
    
    if (missingStock){
        for (let item of missingStock) {
            response.stock['missingStock'].push(item);
        }
    }
    
    response.result = `Successfully fetched inventory for store # ${inputStoreID}`;
    response.statusCode = 200;
    
} catch (error) {
    //if error
    response.result = "Something bad happens!!!";
    response.statusCode = 400;
}

    return response;
};