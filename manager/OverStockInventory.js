import CustomAppBar from "../components/AppBar";
import Footer from "../components/Footer";
import { useEffect, useState } from 'react';

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Typography, Box, Paper } from "@mui/material";
import { useParams } from 'react-router-dom';
import { AlertError } from "../components/AlertError";
import { AlertSuccess } from "../components/AlertSuccess";

// returnedStock = {
//     "shelfStock": [{ "SKU": "DRJ297831", "name": "Soap", "description": "Liquid Soap", "price": 1.99, "maxQuantity": 40, "quantity": 20, "aisle": 1, "shelf": 2 }, { "SKU": "JK199283", "name": "Dove's Extra Care", "description": "Shampoo", "price": 4.99, "maxQuantity": 5, "quantity": 2, "aisle": 1, "shelf": 2 }],
//     "overStock": [{ "SKU": "DRJ297831", "name": "Soap", "description": "Liquid Soap", "price": 1.99, "maxQuantity": 40, "quantity": 10 }]
// };

var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var generate_inventory_report_url = base_url + "inventoryReportGenerator";


const columns_overstock = [
    {
        field: "SKU",
        headerName: "SKU",
        type: "number",
        width: 120
    },
    {
        field: "name",
        headerName: "Item",
        width: 130
    },
    {
        field: "description",
        headerName: "Description",
        width: 120
    },
    {
        field: "price",
        headerName: "Price",
        type: "number",
        width: 110
    },
    {
        field: "maxQuantity",
        headerName: "Max Shelf Quantity",
        type: "number",
        width: 200
    },
    {
        field: "quantity",
        headerName: "Actual Quantity",
        width: 200
    }
];

const rows = [];

function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}


export default function ManagerOverStock() {
    //row id generator helper for constructing data grid
    const rowIdGenerator_overstock = generateRowId();

    //set states for shelfStock and overStock
    const [overStockRows, setOverStockRows] = useState([]);

    // success and error message for user feedback
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');


    const storeId = useParams().storeId;
    let data = {};
    data['storeID'] = storeId;

    // //building up the payload; ffirst starting from data, then build a body
    let body = {};
    body['body'] = JSON.stringify(data);

    console.log(body);

    let js = JSON.stringify(body);

    useEffect(() => {
        fetch(generate_inventory_report_url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: js
            })
            .then((response) => response.json())
            .then((data) => {
                setSuccess(true);
                setSuccessText(data.result);
                //update display
                let newOverStockRows = data.stock.overStock;
                setOverStockRows(newOverStockRows);

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
                {/* View store #3 for example */}
                <Typography variant="h5" align="center" sx={{ mb: 4, mt: 4 }}> Overstock Items in Store {storeId} </Typography>
                {/* TODO: To show data in tbular format instead of a JSON, need quality selection + buy functionality*/}
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        getRowId={() => rowIdGenerator_overstock.next().value}
                        rows={overStockRows}
                        columns={columns_overstock}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                    />
                </Box>
            </div>

            <Paper sx={{
                marginTop: 'calc(10% + 60px)',
                position: 'fixed',
                bottom: 0,
                width: '100%'
            }} square variant="outlined">
                <Footer />
            </Paper>
        </div >
    )
}