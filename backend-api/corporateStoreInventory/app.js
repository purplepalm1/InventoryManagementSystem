// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';

//Use case for corporate to view inventory and valuation of a particular store

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
{ "action" : "generate_a_store_inventory_report",
	"statusCode": 200,
	"headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
    "storeID": "storeID_ABC_XYZ",
    "items: "[ 
					{"name": "name1", "description": "description1", "price": "5.3", "SKU": "sdfdf", "available quantity": "20", 
					"item_valuation": "34545"},
					{"name": "name2", "description": "description2", "price": "5.3", "SKU": "sdfdf", "available quantity": "20",
				  "item_valuation": "34545"},
					{"name": "name3", "description": "description3", "price": "5.3", "SKU": "sdfdf", "available quantity": "20",
           "item_valuation": "34545"}
				]"
"total_valuation": "$$$_sum_of_all_items*quantity"
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
    SAMPLE OUTPUT
    SELECT u.SKU, item.name, item.price, SUM(u.quantity) as sum_qty, (item.price * SUM(u.quantity)) as valuation FROM ((select * from overStock where storeID = "1") UNION ALL (select SKU, storeID, quantity from shelfStockLocation where storeID = "1")) as u, item  WHERE u.SKU = item.SKU GROUP BY u.SKU ORDER BY sum_qty;
    +-----+----------------+-------+---------+-----------+
    | SKU | name           | price | sum_qty | valuation |
    +-----+----------------+-------+---------+-----------+
    | QWE | Beyond Chicken |     2 |      13 |        26 |
    | B   | lorem          |     2 |      62 |       124 |
    | A   | lorem          |     1 |     123 |       123 |
    +-----+----------------+-------+---------+-----------+
    */
    
    let get_store_inventory_sql = "SELECT u.SKU, item.name, item.price, SUM(u.quantity) as sum_qty, (item.price * SUM(u.quantity)) as valuation \
                            FROM (\
                                    (SELECT * FROM overStock WHERE storeID = ?) \
                                    UNION ALL \
                                    (SELECT SKU, storeID, quantity FROM shelfStockLocation WHERE storeID = ?)\
                                    ) as u, item \
                            WHERE u.SKU = item.SKU\
                            GROUP BY u.SKU \
                            ORDER BY sum_qty;" 
    
    let getStoreInventory = (storeID) => {
        return new Promise((resolve, reject) => {
            pool.query(get_store_inventory_sql, [storeID, storeID], (error, rows) => {
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
        let storeInventory = await getStoreInventory(inputStore);
        
        response.storeID = inputStore;
        response.items = [];
        response.totalValuation = 0;
        
        if (storeInventory.length === 0) {
            response.statusCode = 200;
            response.result = "Execution completed! The Store Is Out Of Stock!!!";
        } else {
            response.result = "Successfully fetched store inventory";
            response.statusCode = 200;
            for (let row of storeInventory){
                response.totalValuation += row.valuation;
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