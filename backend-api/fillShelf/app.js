/** USE CASE FOR MANAGER TO FILL ALL SHELVES WITH PRODUCTS FROM OVERSTOCK*/

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

    
    //to get all overStock of SKUs
    
    /*
    SAMPLE output:
    +-----+---------+----------+
    | SKU | storeID | quantity |
    +-----+---------+----------+
    | A   | 1       |      370 |
    +-----+---------+----------+
    */
    
    let getAllOverStock = (storeID) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM overStock WHERE storeID = ?", [storeID], (error, rows) => {
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    // let getOneOverStock = (SKU, storeID) => {
    //     return new Promise((resolve, reject) => {
    //         pool.query("SELECT * FROM overStock WHERE SKU = ? AND storeID = ?", [storeID], (error, rows) => {
    //             if (rows){
    //                 return resolve(rows); 
    //             } else {
    //                 return reject(error);
    //             }
    //         })
    //     })
    // }
    
    /*
    SAMPLE Output:
    +-----+---------+----------+-------+-------+-------------+
    | SKU | storeID | quantity | aisle | shelf | maxQuantity |
    +-----+---------+----------+-------+-------+-------------+
    | A   | 1       |       20 |     1 |     2 |          20 |
    | A   | 1       |       20 |     1 |     3 |          20 |
    | A   | 1       |       10 |    10 |    20 |          20 |
    +-----+---------+----------+-------+-------+-------------+
    */
    
    // to get maxQty from item table, use this SELECT s.SKU, s.storeID, s.quantity, s.aisle, s.shelf, i.maxQuantity FROM shelfStockLocation as s, item as i  WHERE s.SKU = "A" AND s.storeID = "1" and i.SKU = "A"; 
    
    let get_rows_on_shelf_sql = "SELECT s.SKU, s.storeID, s.quantity, s.aisle, s.shelf, i.maxQuantity FROM shelfStockLocation as s, item as i  WHERE s.SKU = ? AND s.storeID = ? and i.SKU = ?;"
    
    let getRowsOnShelf = (SKU, storeID) => {
        return new Promise((resolve, reject) => {
            pool.query(get_rows_on_shelf_sql, [SKU, storeID, SKU], (error, rows) => {
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    /*
    Helper method to update shelfStockLocation
    
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
    
    /*
    Helper method to update overStock for a particular SKU
    */
    
    
    let updateOverstock = async (SKU, storeID, quantity) => {
        
        // let rowsInOverStock = await getAllOverStock(storeID); // return rows with SKU, maxQuantity, quantity
        
        // console.log(`rowsInOverStock for ${SKU}, ${storeID}, and ${quantity}`, rowsInOverStock);
        // console.log("number of rows in overStock", rowsInOverStock.length);
        
        // let newQuantity;
        
        // if (rowsInOverStock.length > 0) { // the item is currently present in overStock table
        //     // since overStock doesn't store aisle and shelf value, we can guarantee that each row contains a unique item SKU. here I'm using rowsInOverStock[0] just to get a value out of an array of length 1
        //     newQuantity = rowsInOverStock[0].quantity + quantity; //quantity currently in overstock + new quantity
        // } else {
        //     newQuantity = quantity;
        // }
        //update the value in the overstock; what to return 
        return new Promise((resolve, reject) => {
            pool.query("REPLACE INTO overStock (SKU, storeID, quantity) VALUES (?, ?, ?)", [SKU, storeID, quantity], (error, rows) => {
                if (error) {return reject(error)};
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    
    //Get all the locations that the item has been assigned to, including the maxQuantity.
    /*
    
    SAMPLE output
    +-----+-------+-------+-------------+
    | SKU | aisle | shelf | maxQuantity |
    +-----+-------+-------+-------------+
    | A   |     1 |     2 |          20 |
    | A   |     1 |     3 |          20 |
    | A   |    10 |    20 |          20 |
    +-----+-------+-------+-------------+
    */
    
    
    let getItemLocations = (SKU) => {
        return new Promise ((resolve, reject) => {
            pool.query("SELECT l.SKU, l.aisle, l.shelf, i.maxQuantity FROM itemLocation as l, item as i WHERE l.SKU = ? AND i.SKU = ?;", [SKU, SKU], (error, rows) => {
                if (rows){
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }
    
    
    /*
    Update quantity for rows that are already onshelf, regardless of whether the shelf is full or not
    @params: rows: rows returned from calling getRowsOnShelf; rows should have attributes such as  SKU | storeID | quantity | aisle | shelf | maxQuantity
    @params: incomingQty comes from overStock
    */
    
    let updateIfOnShelf = async (rows, storeID, incomingQty) => {
        for (let row of rows){
            if (row.maxQuantity > row.quantity && incomingQty >= 0){
                let delta = Math.min(row.maxQuantity - row.quantity, incomingQty);
                row.quantity += delta;
                incomingQty -= delta; //this is valid since incomingQty > delta
                await updateShelfStockLocation(row.SKU, storeID, row.quantity, row.aisle, row.shelf);
            }
        }
        //what is left of incomingQty goes back to overStock
        // since rows contained all the same SKUs, I can use rows[0] without an issue.
        await updateOverstock(rows[0].SKU, storeID, incomingQty);
    }
    
    /*
    
    */
    
    let queryDifference = async (SKU, storeID) => {
        let query = "SELECT r.SKU, r.aisle, r.shelf, item.maxQuantity \
                    FROM (Select * from itemLocation as l \
                        WHERE NOT EXISTS (select * from shelfStockLocation as s Where s.SKU = l.SKU and s.aisle = l.aisle and s.shelf = l.shelf AND s.storeID = ?)) as r, item  \
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
    Update quantity shelf that have never been populated. In this case, we need to get the locations from itemLocation, then populate each row
    @params: rows: rows returned from calling getItemLocations; each row should have attributes such as SKU | aisle | shelf | maxQuantity
    
    */
    
    let updateIfNotOnShelf = async (rows, storeID, incomingQty) => {
        for (let row of rows){
            if (incomingQty >= 0){ //there is no actual quantity so we are just check incomingQty
                let delta = Math.min(row.maxQuantity, incomingQty);
                row.quantity = delta;
                incomingQty -= delta; //this is valid since incomingQty > delta
                await updateShelfStockLocation(row.SKU, storeID, row.quantity, row.aisle, row.shelf);
            }
        }
        //what is left of incomingQty goes back to overStock
        // since rows contained all the same SKUs, I can use rows[0] without an issue.
        await updateOverstock(rows[0].SKU, storeID, incomingQty);
    }
    
    
    let updateCombine = async (SKU, storeID, incomingQty) => {
        let rowsInShelves = await getRowsOnShelf(SKU, storeID); //  Output is rows, each has SKU | maxQuantity | quantity | aisle | shelf 
        let rowsInItemLocation = await getItemLocations(SKU); // Output is rows, each has SKU | maxQuantity | aisle | shelf
        console.log(rowsInShelves.length);
        console.log(rowsInItemLocation.length);
        // let aRowInOverStock = await getOneOverStock(SKU, storeID); // call rows[0].quantity to get quantity;
        // console.log(aRowInOverStock.length);
        
        
        if (rowsInShelves.length === 0) { // the item does not exist on shelves
            await updateIfNotOnShelf(rowsInItemLocation, storeID, incomingQty); //pass in all rows for the item in itemLocation;
        } else if (rowsInShelves.length === rowsInItemLocation.length) { //all locations associated with the item has some quantity of the item on shelve
            await updateIfOnShelf(rowsInShelves, storeID, incomingQty); // pass in all rows in shelf
        } else if (rowsInShelves.length < rowsInItemLocation.length) { //not all locations associated with the item are populated to shelves
            // update rows that are already in shelf first;
            await updateIfOnShelf(rowsInShelves, storeID, incomingQty);
            //then update the difference and get rows that were NOT present on shelf
            let difference = await queryDifference(SKU, storeID); // output are rows, each has  SKU | aisle | shelf | maxQuantity |
            //since the difference does NOT exist on shelf
            await updateIfNotOnShelf(difference, storeID, incomingQty);
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
        
        response.action = "fill_shelves";
        
        // later on to replace impactedStore with the loop
        
        //{"body": "{\"store\": \"1\"}"}
        
        console.log(event);
        let actual_event = event.body;
        let info = JSON.parse(actual_event);
        
        // parsing arguments from request body
        const inputStore = info.store;
        console.log("input Store  is ", inputStore);
        
        let rowsInOverStock = await getAllOverStock(inputStore); //sample output: [RowDataPacket { SKU: 'A', storeID: '1', quantity: 370 }, RowDataPacket { SKU: 'B', storeID: '1', quantity: 20 }]
        
        console.log(rowsInOverStock);
        
        if (rowsInOverStock.length > 0){
            // if there are items in overStock
            for (let row of rowsInOverStock){
                let inputSKU = row.SKU;
                let incomingQty = row.quantity;
                //main call with updateCombine
                await updateCombine(inputSKU, inputStore, incomingQty);
            }
            
        } else {
            response.statusCode = 200;
            response.result = "The over stock is empty, therefor can't fill shelves!";
        }
        
        //clean up script to remove rows with quantity = 0; 
        await removeEmptyQtyOverStock();
        await removeEmptyQtyShelfStockLocation();
        
    } catch (error) {
        error.message = "Something bad happens!!";
        console.log("ERROR: " + error.message);
        response.statusCode = 400;
        response.error = error;
    }
    
    return response;
};