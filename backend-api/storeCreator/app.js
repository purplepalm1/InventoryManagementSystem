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
// {"body":"[{\\"Name\\":\\"Test Store\\",\\"Latitude\\":\\"42.38892338562119\\",\\"Longitude\\":\\"-71.12340089392961\\",\\"storeId\\":\\"d988cdaf-615b-4f62-bcef-42f37bd7f125\\"}]"}
//
// ===>  { "action" : "create_stores",
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
    
    
    let stores = event.body;
    
    for (let i = 0; i < stores.length; i++) {
        // console.log(i);
        // console.log(stores[i]);
        let store_row = stores[i];
        
        // get available manager IDs
        let available_ID_sql = "select users.userID \
            from users \
            left outer join store as store \
            on users.userID = store.storeManagerID \
            where store.storeManagerID is null; \
            ";
            
            
        let available_store_IDs = await new Promise((resolve, reject) => {
                pool.query("SELECT storeID FROM store;", (error, rows) => {
                if (error) {return reject(error)};
                if (rows){
                    console.log("New Store Creation Successful!")
                    return resolve(JSON.parse(JSON.stringify(rows))); 
                } else {
                    return reject(error);
                }
            })
        })
        
        let final_available_store_IDs = available_store_IDs.map(function (el) { return el.storeID; });
        let newId = Math.max.apply(null, final_available_store_IDs.map(function(e) {return parseInt(e)})) + 1;
        console.log(newId);
            
        function available_IDs() {
            return new Promise((resolve, reject) => {
                pool.query(available_ID_sql, function(err, result, fields){
            if (!err) resolve(JSON.parse(JSON.stringify(result))); // Hacky solution
            else reject(err);
        });
            })
        }
        
        
        let [userIDs] = await available_IDs();
        newManagerID = userIDs.userID;
        
        console.log(newManagerID);
        console.log(userIDs.length);
        
        // console.log(available_IDs());
        let name = store_row.Name;
        let long = store_row.Longitude;
        let lat = store_row.Latitude;
        
        post_store_row = "INSERT INTO store values ('" + name + "', '" + newId + "', '" + newManagerID + "', " + long + ", " + lat + ");"
        console.log(post_store_row);
        
        await new Promise((resolve, reject) => {
            pool.query(post_store_row, (error, rows) => {
                if (error) {return reject(error)};
                if (rows){
                    console.log("New Store Creation Successful!")
                    return resolve(rows); 
                } else {
                    return reject(error);
                }
            })
        })
    }

    try {
        response.result = "Stores Created!";
        console.log(response.result);
        response.statusCode = 200;
        // console.log(event);
        
    } catch (error){
        response.error = error;
        console.log(error);
    }
    return response;
};