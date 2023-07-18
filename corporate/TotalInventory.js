import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import CustomAppBar from "../components/AppBar";
import Footer from "../components/Footer";
import { AlertError } from '../components/AlertError';
import { AlertSuccess } from '../components/AlertSuccess';

var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var store_report = base_url + "corporateTotalInventoryReportGenerator"


/*
{
    “total_inventory”:
    "action" : "generate_total_inventory_report",
    "statusCode": 200,
    "headers": {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "GET" // Allow GET request
        },
    "stores" : "[
        {“store”: {
            “name”: string,
            “longitude”: float,
            “latitude”: float,
            "total_store_valuation" : int,
            "total_store_items" : int,
            “items”: "[
                {"name": "name1", "description": "description1", "price": "5.3", "SKU": "sdfdf", "available quantity": "20", "item_valuation": "34545"},
                { ... },
            ...]"
        },
        { ... }
    ]",
    “total_stores”: int,
    “total_items”: int,
    “total_valuation”: int,
    “success”: boolean
}
**/

// column format definition here
const columns = [
    { field: "store", headerName: "Store", width: 130 },
    { field: "store_name", headerName: "Name", width: 130 },
    { field: "latitude", headerName: "Latitude", width: 130 },
    { field: "longitude", headerName: "Longitude", width: 130 },
    { field: "total_store_valuation", headerName: "Total Valuation", width: 130 },
    { field: "total_store_items", headerName: "Total Number of Items", width: 130 }
]

const store_items = [
    { field: "storeId", headerName: "Store ID", width: 130 },
    { field: "SKU", headerName: "SKU", width: 130 },
    { field: "name", headerName: "Item Name", width: 130 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "price", headerName: "Price", width: 130 },
    { field: "quantity", headerName: "Available Quantity", width: 150 },
    { field: "item_val", headerName: "Item Valuation", width: 150 }
]

const valuation_columns = [
    { field: "total_stores", headerName: "Total Number of Stores", width: 130 },
    { field: "total_valuation", headerName: "Total Valuation", width: 250 },
    { field: "total_items", headerName: "Total Number of Items", width: 250 }
]

function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}


export default function CorporateTotalInventory() {
    //row id generator helper for constructing data grid
    const rowIdGenerator_store = generateRowId();

    //set states for shelfStock and overStock
    const [storeInfoRows, setStoreInfoRows] = useState([]);
    const [storeItemRows, setStoreItemRows] = useState([]);
    const [valuationRows, setValuationRows] = useState([]);

    let data = {};

    // success, error state for user feedback

    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');

    useEffect(() => {
        fetch(store_report,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((response) => response.json())
            .then((data) => {
                setSuccess(true);
                setSuccessText(data.result);
                //set new rows as the rows of items fetched from the server
                let newstoreInfoRows = data.stores.map(store => {
                    let temp_store = {
                        "store": store.storeID,
                        "store_name": store.name,
                        "latitude": store.latitude,
                        "longitude": store.longitude,
                        "total_store_valuation": store.total_store_valuation,
                        "total_store_items": store.total_store_items
                    };
                    return temp_store;
                });

                console.log(data);

                let newItemInfoRows = [];
                data.stores.map(store => {
                    let this_store_items = store.items;
                    let this_store_id = store.storeID;

                    let temp_items = this_store_items.map(item => {
                        let new_temp_items = Object.assign(item, { "storeId": this_store_id, "item_val" : item.quantity * item.price });
                        return new_temp_items;
                    })
                    newItemInfoRows = newItemInfoRows.concat(temp_items);
                });
                setStoreItemRows(newItemInfoRows);

                console.log(newItemInfoRows);

                let newvaluationRows = [];
                let valuationRow = { 'total_stores': data.total_stores, 'total_valuation': '$' + data.total_valuation, 'total_items': data.total_items };
                newvaluationRows.push(valuationRow);
                setValuationRows(newvaluationRows);

                newstoreInfoRows.forEach(store => store.total_store_valuation = '$' + store.total_store_valuation);
                newItemInfoRows.forEach(item => item.item_val = '$' + item.item_val);
                newItemInfoRows.forEach(item => item.price = '$' + item.price);

                setStoreInfoRows(newstoreInfoRows);

                //reset success state back to false to ready for the next invocation
                setTimeout(() => {
                    setSuccess(false);
                }, 2000)
            })
            .catch((error) => {
                console.log('Error: ', error);
                setError(true);
                setErrorText(error.message);
            })
    }, [])


    return (
        <div>
            <CustomAppBar />

            {success ? <AlertSuccess showValue={success} alertTitle="Success" alertMessage={successText} /> : null}
            {error ? <AlertError alertText={errorText} alertTitle="Error" error={errorText} handleCloseError={() => setError(false)} /> : null}

            <div>
                <h1 style={{ textAlign: 'center' }} >Stores</h1>
            </div>
            <div>
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        getRowId={() => rowIdGenerator_store.next().value}
                        rows={storeInfoRows} // to change to storeInfoRows
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                    />
                </Box>
            </div>
            <div>
                <h1 style={{ textAlign: 'center' }} >Store Items</h1>
            </div>
            <div>
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        getRowId={() => rowIdGenerator_store.next().value}
                        rows={storeItemRows} // to change to storeInfoRows
                        columns={store_items}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                    // components={{
                    //     Toolbar: GridToolbar,
                    // }}
                    />
                </Box>
            </div>
            <div>
                <h1 style={{ textAlign: 'center' }} >Total Stores Valuation</h1>
            </div>
            <div>
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        getRowId={() => rowIdGenerator_store.next().value}
                        rows={valuationRows} // to change to storeInfoRows
                        columns={valuation_columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                    // components={{
                    //     Toolbar: GridToolbar,
                    // }}
                    />
                </Box>
            </div>
        </div>

    );
}