// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

//database connection

const mysql = require('mysql');
const { v1: uuidv1, v4: uuidv4} = require('uuid');
// npm install uuid


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


// Take in as input a payload name, storeManagerID, longitude, and latitude. Note that we don't need input storeID since it will be generated via UUID() in the backend.
//
//{"body" : "{ \"name\" : \"Worcester\", \"storeManagerID\" : \"ddfcbe26-56fb-11ed-b\", \"longitude\" : \"42.2626\", \"latitude\" : \"-71.8023\"}"}
//
// ===>  { "action" : "create_store",
//          "statusCode": 200,
//          "result": "Created store...."}
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

    
    //check if the manager entered by the corporate is available
    
    
    //
    let valid_manager_id_sql = "SELECT * \
                                FROM \
                                    (select users.userID \
                                    from users \
                                    left outer join store as store \
                                    on users.userID = store.storeManagerID \
                                    where store.storeManagerID is null) AS u \
                                WHERE u.userID = ?";
 
    let checkValidManagerID = (storeManagerID) => {
        if (storeManagerID && storeManagerID != '') {
            return new Promise((resolve, reject) => {
                pool.query(valid_manager_id_sql, [storeManagerID], (error, rows) => {
                    if (error) {
                    	console.log("Something bad happens!", error);
                    	return reject(error);
                    } else {
                    	if (rows && rows.length == 1){
                    		console.log(`The manager ${storeManagerID} is available to be assigned!!`);
                    		return resolve(true);
                    	} else {
                    		console.log("The manager is not in the list of available managers. Therefore, cannot assign");
                    		return resolve(false); 
                    	}
                    }
                }
            );
        })
    };
    };
    
    let insertData = (name, storeID, storeManagerID, longitude, latitude) => { //note: no need storeID input from user since we will generate UUID() for store.
        return new Promise((resolve, reject) => {
            pool.query(`INSERT INTO store (name, storeID, storeManagerID, longitude, latitude) VALUES (?, ?, ?, ?, ?)`, [name, storeID, storeManagerID, longitude, latitude] , (error, rows) =>
            {
                if (error) {return reject(error) };
                if (rows) {
                    return resolve(rows);
                } else {
                    return reject(error);
                }
            })
        })
    }
 
    try {
        let data = JSON.parse(event.body);
    	const inputStoreName = data.name;
    	const inputStoreManagerID = data.storeManagerID;
    	const inputLongitude = data.longitude;
    	const inputLatitude = data.latitude;
        const inputStoreID = uuidv1(); //generate a uniique storeID
        console.log(inputStoreID);
 
    	if (!inputStoreName || !inputStoreManagerID || !inputLongitude || !inputLatitude){
    		response.statusCode = 400;
    		response.result = "Invalid Input!!!"
    	}
 
 
    	const managerIsValid = await checkValidManagerID(inputStoreManagerID); //return false or true;
 
    	if (managerIsValid) {
    	    // if the managerID is valid, then do insert
    	    await insertData(inputStoreName, inputStoreID, inputStoreManagerID, inputLongitude, inputLatitude);
            response.result = `Successfully created store ${inputStoreID}, managed by manager ${inputStoreManagerID}, at (lon: ${inputLongitude}, lat: ${inputLatitude})`
            
            response.statusCode = 200;
    	} else {
    	    //do nothing, dont insert
    		response.statusCode = 400;
    		response.result = "Manager has already been assigned to another store!! Please select another manager!!!"
    	}
 
    } catch (error){
        response.error = error;
        console.log(error);
    }
    return response;
};