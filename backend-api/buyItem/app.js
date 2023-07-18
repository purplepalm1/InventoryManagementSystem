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
// {"body": "{\"SKU\": \"A\", \"storeID\": \"1\", \"quantity\": \"3\", \"aisle\": \"1\", \"shelf\": \"2\"}"}
// ===>  { "action" : "buy_an_item",
//          "statusCode": 200,
//          "purchaseDetails": event.body,
//          "result": "Success";
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
   MySQL [storeInfo]> select * from shelfStockLocation WHERE storeID = "1" and aisle=1 and shelf=2;
    +-----+---------+----------+-------+-------+
    | SKU | storeID | quantity | aisle | shelf |
    +-----+---------+----------+-------+-------+
    | A   | 1       |       20 |     1 |     2 |
    +-----+---------+----------+-------+-------+
    */
    
    let get_current_quantity_sql = "SELECT * \
                                    FROM shelfStockLocation\
                                    WHERE SKU = ? \
                                    AND storeID = ?\
                                    AND aisle = ? \
                                    AND shelf = ?;" 
    
    let getCurrentQuantity = (SKU, storeID, aisle, shelf) => {
        return new Promise((resolve, reject) => {
            pool.query(get_current_quantity_sql, [SKU, storeID, aisle, shelf], (error, rows) => {
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    
    let update_new_qty_sql = "REPLACE INTO shelfStockLocation VALUES (?, ?, ?, ?, ?);";
    let updateUponPurchase = (SKU, storeID, quantity, aisle, shelf) => {
        return new Promise((resolve, reject) => {
            pool.query(update_new_qty_sql, [SKU, storeID, quantity, aisle, shelf], (error, rows) => {
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
        console.log("Request params are: ", info);
        
        //assuming this row is unique
        let currentRow = await getCurrentQuantity(info.SKU, info.storeID, info.aisle, info.shelf);
        let purchasedQty = info.quantity;
        
        if (currentRow.length === 0 || info.quantity > currentRow[0].quantity) {
            response.statusCode = 200;
            response.result = `Sorry! You can't purchase ${purchasedQty} of ${info.SKU} from aisle ${info.aisle} - shelf ${info.shelf}`;
        } else {
            response.statusCode = 200;
            let newQty = currentRow[0].quantity - info.quantity;
            await updateUponPurchase(info.SKU, info.storeID, newQty, info.aisle, info.shelf);
            response.result = `Successfully purchased ${purchasedQty} of ${info.SKU} from aisle ${info.aisle} - shelf ${info.shelf}`;
        }
        
    } catch (error) {
        error.message = "Something bad happens!!";
        console.log("ERROR: " + error.message);
        response.statusCode = 400;
        response.error = error;
    }
    
    return response;
};