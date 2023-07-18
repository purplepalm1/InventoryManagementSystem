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


// Input payload
//
// {"body":"{}"}
//
// ===>  { "action" : "show_available_managers",
//          "statusCode": 200,
//          "managers": [manager1, manager2, manager3....]      
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
            "Access-Control-Allow-Methods": "GET" // Allow GET request
        }
    }; // response
    
    

        // get available manager IDs
    let available_ID_sql = "select users.userID \
            from users \
            left outer join store as store \
            on users.userID = store.storeManagerID \
            where store.storeManagerID is null; \
            ";
            
            
    let getAvailableManagers = () => {
        return new Promise((resolve, reject) => {
            pool.query(available_ID_sql, (error, rows) => {
                if (error) {
                    console.log("Something went wrong!", error);
                    return reject(error);
                } else {
                    return resolve(rows);
                }
            })
        })
    }
    
    response.action = "show_available_managers";
 
    try {
     
    const returnedManagers = await getAvailableManagers();
    
    response.managers = [];
    
    
    if (returnedManagers){
         for (let manager of returnedManagers) {
             response.managers.push(manager);
         }
         response.statusCode = 200;
         response.result = "Successfully fetched a list of available managers"
     }
 } catch (error) {
     //if error...
     response.result = "Something bad happens!!"
     response.statusCode = 400
 }

    return response;
};