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


// 	{ "action" : "generate_a_store_inventory_report",
// 		"statusCode": 200,
// 		"headers": {
// 	            "Access-Control-Allow-Headers": "Content-Type",
// 	            "Access-Control-Allow-Origin": "*", // Allow from anywhere
// 	            "Access-Control-Allow-Methods": "POST" // Allow POST request
// 	"storeID": "storeID_ABC_XYZ",
// 	"items: "[ 
// 						{"name": "name1", "description": "description1", "price": "5.3", "SKU": "sdfdf", "available quantity": "20", 
// 						"item_valuation": "34545"},
// 						{"name": "name2", "description": "description2", "price": "5.3", "SKU": "sdfdf", "available quantity": "20",
// 					  "item_valuation": "34545"},
// 						{"name": "name3", "description": "description3", "price": "5.3", "SKU": "sdfdf", "available quantity": "20",
// 	           "item_valuation": "34545"}
// 					]"
// 	"total_valuation": "$$$_sum_of_all_items*quantity"
// 	}
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
    
    const shelfstock_sql = "SELECT i.name, i.description, i.price, s.SKU, s.quantity \
                             FROM shelfStockLocation as s, item as i \
                             WHERE storeID = ? and s.SKU = i.SKU;" 
    
    const overstock_sql = "SELECT o.SKU, i.name, i.description, i.price,  o.quantity \
                           FROM overStock as o, item as i \
                           WHERE storeID = ? and o.SKU = i.SKU;"
    
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
 
 
 response.action = "generate_inventory_report";
 const data = JSON.parse(event.body);
 const inputStoreID = data.storeID;
 response.storeID = inputStoreID;
 console.log(inputStoreID);
 
 //placeholder for response['stock'] value
 let temp_stock = [];
 /*response.stock["shelfStock"] = [];
 response.stock["overStock"] = [];*/
 

if (!inputStoreID || inputStoreID === ""){
    response.statusCode = 400;
    response.result = "Failed to fetch! Invalid input...";
}

try {
    console.log('test!')
    const shelfStock = await getStock(shelfstock_sql, inputStoreID);
    const overStock = await getStock(overstock_sql, inputStoreID);
    
    if (shelfStock){
        for (let item of shelfStock) {
            temp_stock.push(item);
            
        }
    }
    
    if (overStock){
        for (let item of overStock) {
            temp_stock.push(item);
        }
    }
    
//    console.log(response.stock);

    // Summarized result
    var grouped_stock = [];
    temp_stock.reduce(function(res, value) {
      if (!res[value.SKU]) {
        res[value.SKU] = { "name":value.name,"description":value.description,"price":value.price,"SKU":value.SKU,"quantity":0 };
        grouped_stock.push(res[value.SKU])
      }
      res[value.SKU].quantity += value.quantity;
      return res;
    }, {});
    
    response.stock = grouped_stock;
    
    // Total valuation
    let total_val = 0;
    for (let item of response.stock) {
        total_val += item.price * item.quantity;
    }
    response['total_valuation'] = total_val;
    response['total_num_items'] = response.stock.map(x => x['quantity']).reduce((a, b) => a + b, 0)
    
    response.result = `Successfully fetched inventory for store # ${inputStoreID}`;
    response.statusCode = 200;
    
} catch (error) {
    //if error
    response.result = "Something bad happens!!!";
    response.statusCode = 400;
}

    return response;
};