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
// {"body": "{\"store\": \"1\", \"items\": [{\"item\": \"A\", \"quantity\": \"70\" }, { \"item\": \"B\", \"quantity\": \"2\" }]}"}
//
// ===>  { "action" : "process_shipment",
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

    
    //To check if the item exists on shelf
    let queryShelfStockLocation = "select s.SKU, i.maxQuantity, s.quantity, s.aisle, s.shelf \
                                    from item as i, shelfStockLocation as s WHERE s.SKU = ? and s.storeID = ? and i.SKU = ?";
    let queryIfNotExists = "SELECT item.SKU,  maxQuantity, aisle, shelf FROM item, itemLocation as l WHERE item.SKU = ? and l.SKU = ?"; //need to add itemLocation.SKU = "A" to eliminate SKU != A from itemLocation
    
    
    //get current raw quantity value from shelf and maxQty of item with SKU = "A". This could return no row or many rows.

    /*
    
    @params SKU and storeID
    SAMPLE OUTPUT QUERY
    MySQL [storeInfo]> select s.SKU, i.maxQuantity, s.quantity, s.aisle, s.shelf from item as i, shelfStockLocation as s WHERE s.SKU = "A" and s.storeID = "1" and i.SKU = "A";
    +-----+-------------+----------+-------+-------+
    | SKU | maxQuantity | quantity | aisle | shelf |
    +-----+-------------+----------+-------+-------+
    | A   |          20 |       20 |     1 |     2 |
    | A   |          20 |       12 |     1 |     3 |
    +-----+-------------+----------+-------+-------+
    */
    
    let getRowsFromShelf = (SKU, storeID) => {
            return new Promise((resolve, reject) => {
                pool.query(queryShelfStockLocation, [SKU, storeID, SKU], (error, rows) => {
                    if (error) {return reject(error)};
                    if (rows){
                        return resolve(rows); 
                    } else {
                        return reject(error);
                    }
                })
            })
        }
        
    /*
    * get item location when the item is not on shelf (i.e. the shelfStockLocation table does not have any rows)
      in this situation, we have to look up the itemLocation table instead
      @params: SKU
      
      
      SAMPLE OUTPUT:
      MySQL [storeInfo]> SELECT item.SKU,  maxQuantity, aisle, shelf FROM item, itemLocation as l WHERE item.SKU = "A"  and l.SKU = "A";
    +-----+-------------+-------+-------+
    | SKU | maxQuantity | aisle | shelf |
    +-----+-------------+-------+-------+
    | A   |          20 |     1 |     2 |
    | A   |          20 |     1 |     3 |
    +-----+-------------+-------+-------+
    */
    
    
     let getItemLocations = (SKU) => { //SKU is already a string
            return new Promise((resolve, reject) => {
                pool.query(queryIfNotExists, [SKU, SKU], (error, rows) => {
                    if (error) {return reject(error)};
                    if (rows){
                        return resolve(rows);
                    } else {
                        return reject(error);
                    }
                })
            })
        }
        

    /*
    Check over stock and return rows in overstock
    
    
    SAMPLE OUTPUT:
    +-----+----------+
    | SKU | quantity |
    +-----+----------+
    | A   |       44 |
    +-----+----------+
    */
    
    //  let checkInOverStockQuery = "SELECT i.SKU,  i.maxQuantity, o.quantity \
    //                              FROM item as i, overStock as o \
    //                              WHERE i.SKU = ? AND o.storeID = ? AND o.SKU = ?";
    
    let checkInOverStockQuery = "SELECT SKU, quantity \
                                 FROM overStock WHERE SKU = ? AND storeID = ?";
    
    let CheckInOverStock = (SKU, storeID) =>  {
        return new Promise((resolve, reject) => {
            pool.query(checkInOverStockQuery, [SKU, storeID], (error, rows) => {
                if (error) {return reject(error)};
                    if (rows){
                        return resolve(rows); 
                    } else {
                        return reject(error);
                    }
            })
        })
    }
    
    /*
    update the row in overStock table with new quantity. First we have to look up if the item is already in stock
    Note: overStock table guarantee unique row for each SKU and storeID pair
    
    
    Scenario 1: If the item is present in overStock, we have to get the current quantity value and then add the new quantity.
    Scenario 2: If the item is not present in overStock, there will be no row associated with the item so we will have to insert a new row with the new quantity.
    */

    let updateOverstock = async (SKU, storeID, quantity) => {
        
        let rowsInOverStock = await CheckInOverStock(SKU, storeID); // return rows with SKU, maxQuantity, quantity
        
        console.log(`rowsInOverStock for ${SKU}, ${storeID}, and ${quantity}`, rowsInOverStock);
        console.log("number of rows in overStock", rowsInOverStock.length);
        
        let newQuantity;
        
        if (rowsInOverStock.length > 0) { // the item is currently present in overStock table
            // since overStock doesn't store aisle and shelf value, we can guarantee that each row contains a unique item SKU. here I'm using rowsInOverStock[0] just to get a value out of an array of length 1
            newQuantity = rowsInOverStock[0].quantity + quantity; //quantity currently in overstock + new quantity
        } else {
            newQuantity = quantity;
        }
        //update the value in the overstock; what to return 
        return new Promise((resolve, reject) => {
            pool.query("REPLACE INTO overStock (SKU, storeID, quantity) VALUES (?, ?, ?)", [SKU, storeID, newQuantity], (error, rows) => {
                if (error) {return reject(error)};
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    /*
    // Update the shelfStockLocation table with SKU, storeID, quantity, aisle, shelf
    */
    
    let updateShelfStockLocation = (SKU, storeID, quantity, aisle, shelf) => {
   
        return new Promise((resolve, reject) => {
            
            pool.query("REPLACE INTO shelfStockLocation (SKU, storeID, quantity, aisle, shelf) VALUES (?, ?, ?, ?, ?)", [SKU, storeID, quantity, aisle, shelf], (error, rows) => {
                if (error) {return reject(error)};
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    
    
    //helper method to update shipment when the items already on a shelf:
    /*
    one parameter is `rows` having fields such as SKU,  maxQuantity, quantity, aisle, shelf
    */
    let updateIfExists = async (rows, storeID, incomingQty) => {
        
        for (let row of rows){
            if (row.maxQuantity > row.quantity){
                let delta = Math.min(row.maxQuantity - row.quantity, incomingQty); //get the difference between the maxQty and the actual one
                row.quantity += delta;
                incomingQty -= delta; //this is valid since incomingQty > delta;
                await updateShelfStockLocation(row.SKU, storeID, row.quantity, row.aisle, row.shelf);
            }
        }
        
        if (incomingQty > 0){
            //push all the surpluses to overstock;
            // since rows contained all the same SKUs, I can use rows[0] without an issue.
            await updateOverstock(rows[0].SKU, storeID, incomingQty);
        }
    };
    
    
    /*
        helper method to update shipment when the items NOT already on a shelf
        one parameter is `rows` having fields such as SKU,  maxQuantity, quantity, aisle, shelf
    
    */
    let updateIfNOTExists = async (rows, storeID, incomingQty) => { //may change this to updateifnotfullshelve then pass in rows so this can be reused with the difference situation
        
        // let itemLocations = await getItemLocations(SKU);
        // let intQty = incomingQty;
        
        for (let row of rows){
            let delta = Math.min(row.maxQuantity, incomingQty); // there is no actual one so just using maxQty.
            row.quantity = delta;
            // console.log("delta for row " + row.quantity);
            incomingQty -= delta; //this is valid since incomingQty > delta;
            // console.log("incomingQty for row: " + incomingQty);
            await updateShelfStockLocation(row.SKU, storeID, row.quantity, row.aisle, row.shelf);
        }
        
        if (incomingQty > 0){
            //push all the surpluses to overstock;
            await updateOverstock(rows[0].SKU, storeID, incomingQty);

        }
    };
    
    
    /*query difference;
    
    sample output:
    MySQL [storeInfo]> SELECT r.SKU, r.aisle, r.shelf, item.maxQuant  FROM (Select * from itemLocation as l
    WHERE NOT EXISTS (select * from shelfStockLocation as s Where s.SKU = l.SKU and s.aisle = l.aisle and s.shelf = l.shelf)) as r, item
    WHERE r.SKU = "A" and item.SKU = r.SKU;
    +-----+-------+-------+-------------+
    | SKU | aisle | shelf | maxQuantity |
    +-----+-------+-------+-------------+
    | A   |    10 |    20 |          20 |
    +-----+-------+-------+-------------+
    */
    
    let queryDifference = async (SKU, storeID) => {
        let query = "SELECT r.SKU, r.aisle, r.shelf, item.maxQuantity \
                    FROM (Select * from itemLocation as l \
                        WHERE NOT EXISTS (select * from shelfStockLocation as s Where s.SKU = l.SKU and s.aisle = l.aisle and s.shelf = l.shelf and s.storeID = ?)) as r, item  \
                        WHERE r.SKU = ? and item.SKU = r.SKU"
        return new Promise((resolve, reject) => {
            pool.query(query, [storeID, SKU], (error, rows) => {
                if (error) {return reject(error)};
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    /*
     Update conbine. Consider all three scenarios that can happen to shelfStockLocation
     
    */
    
    let updateCombine = async (SKU, storeID, incomingQty) => {
        let rowsInShelves = await getRowsFromShelf(SKU, storeID); //  Output is rows, each has SKU | maxQuantity | quantity | aisle | shelf 
        let rowsInItemLocation = await getItemLocations(SKU); // Output is rows, each has SKU | maxQuantity | aisle | shelf
        console.log(rowsInShelves.length);
        console.log(rowsInItemLocation.length);
        
        if (rowsInShelves.length === 0) { // the item does not exist on shelves
            await updateIfNOTExists(rowsInItemLocation, storeID, incomingQty); //pass in all rows for the item in itemLocation;
        } else if (rowsInShelves.length === rowsInItemLocation.length) { //all locations associated with the item has some quantity of the item on shelve
            await updateIfExists(rowsInShelves, storeID, incomingQty); // pass in all rows in shelf
        } else if (rowsInShelves.length < rowsInItemLocation.length) { //not all locations associated with the item are populated to shelves
            // update rows that are already in shelf first;
            await updateIfExists(rowsInShelves, storeID, incomingQty);
            //then update the difference and get rows that were NOT present on shelf
            let difference = await queryDifference(SKU); // output are rows, each has  SKU | aisle | shelf | maxQuantity |
            //since the difference does NOT exist on shelf
            await updateIfNOTExists(difference, storeID, incomingQty);
            }
        }
    
    /*
    clean up script to delete from shelfStockLocation the rows with quantity = 0; 
    The upserting function logic may have caused redundant rows with quantity = 0 for the logics to continue to work, we need to delete these rows.
    */
    let removeEmptyQtyShelfStockLocation = () => {
   
        return new Promise((resolve, reject) => {
            
            pool.query("DELETE FROM shelfStockLocation WHERE quantity = ?", [0], (error, rows) => {
                if (error) {return reject(error)}
                if (rows){
                    console.log("Deleted rows with quantity = 0 from shelfStockLocation succesful!");
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            });
        });
    };
    
    /*
    Similar to removeEmptyQtyShelfStockLocation
    clean up script to delete from overStock the rows with quantity = 0; 
    The upserting function logic may have caused redundant rows with quantity = 0 for the logics to continue to work, we need to delete these rows.
    */
    let removeEmptyQtyOverStock = () => {
   
        return new Promise((resolve, reject) => {
            
            pool.query("DELETE FROM overStock WHERE quantity = ?", [0], (error, rows) => {
                if (error) {return reject(error)}
                if (rows){
                    console.log("Deleted rows with quantity = 0 from overStock succesful!");
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            });
        });
    };
    
    
    // __main__ function
    try {
        
        // later on to replace impactedStore with the loop
        
        //{"body": "{\"store\": \"1\", \"items\": [{\"item\": \"DRJ297831\", \"quantity\": \"20\" }, { \"item\": \"JK199283\", \"quantity\": \"2\" }]}"}
        
        console.log(event);
        console.log(response);
        let actual_event = event.body;
        let info = JSON.parse(actual_event);
        console.log("inputStore" + JSON.stringify(info.store)); //  info.store //inputStore"1"
        console.log(typeof(info.items)); //info.items //inputItems[{"item":"DRJ297831","quantity":"20"},{"item":"JK199283","quantity":"2"}] //type object
        
        // parsing arguments from request body
        
        const inputItems = info.items;
        const inputStore = info.store;
        console.log("input Store  is ", inputStore);
    
        if (inputItems.length === 0) {
            response.statusCode = 400;
            response.error = "Nothing to process!!!"
        } else {
            // otherwise valid request and ready to process shipment
            for (let item of inputItems) {
                let SKU = item.item;
                let incomingQty = parseInt(item.quantity);
                // Main call with updateCombine
                await updateCombine(SKU, inputStore, incomingQty);
            }
            //set statusCode in the case of SUCCESS!
            response.statusCode = 200;
            response.result = "Successfully placed items!";
        }
        
        
        //clean up script to remove rows with quantity = 0; 
        await removeEmptyQtyOverStock();
        await removeEmptyQtyShelfStockLocation();
        
    } catch (error) {
        error.message = "An Item hasn't been assigned location by the corporate, therefore, unable to place item on shelf";
        console.log("ERROR: " + error.message);
        response.statusCode = 400;
        response.error = error;
    }
    
    return response;
};
