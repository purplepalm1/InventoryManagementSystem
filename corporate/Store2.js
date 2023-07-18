import CustomAppBar from '../components/AppBar';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid} from "@mui/x-data-grid";
import { Typography, Box, Paper } from "@mui/material";
import Footer from '../components/Footer';
import { AlertError } from '../components/AlertError';
import { AlertSuccess } from '../components/AlertSuccess';

// const data = { "headers": { "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST" }, "storeID": "1", "items": [{ "SKU": "QWE", "name": "Beyond Chicken", "price": 2, "sum_qty": 13, "valuation": 26 }, { "SKU": "B", "name": "lorem", "price": 2, "sum_qty": 62, "valuation": 124 }, { "SKU": "A", "name": "lorem", "price": 1, "sum_qty": 123, "valuation": 123 }], "totalValuation": 273, "result": "Successfully fetched store inventory", "statusCode": 200 }

var base_url = 'https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/';
var corporate_store_inventory_url = base_url + 'corporateStoreInventory';

const columns = [
    // { field: "id", headerName: "ID", width: 70 },
    {
        field: "SKU",
        headerName: "SKU",
        width: 120
    },
    {
        field: "name",
        headerName: "Item Name",
        width: 180
    },
    {
        field: "price",
        headerName: "price",
        width: 180
    },
    {
        field: "sum_qty",
        headerName: "Total Quantity",
        type: "number",
        width: 100
    },
    {
        field: "valuation",
        headerName: "Valuation ($)",
        type: "number",
        width: 100
    }
]

function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}

export default function CorporateStore() {
    const rowIdGenerator = generateRowId();
    const params = useParams();
    const [itemRows, setItemRows] = useState([]);
    const [totalValuation, setTotalValuation] = useState('');
    const [totalNumberItems, setTotalNumberItems] = useState('');

    // success, error state for user feedback

    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');

    useEffect(() => {
        let data = {};
        data['storeID'] = params.storeId;
        let body = {};
        body['body'] = JSON.stringify(data);
        console.log(body);
        let js = JSON.stringify(body);

        fetch(corporate_store_inventory_url, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            },
            body: js
        })
            .then((response) => response.json())
            .then((data) => {

                setSuccess(true);
                setSuccessText(data.result);

                //set new rows as the rows of items fetched from the server
                setItemRows(data.items);
                setTotalValuation(data.totalValuation);
                setTotalNumberItems(data.totalNumberItems);

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

            <Typography variant="h4" align="center">Inventory Report For Store {params.storeId}</Typography>
            <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                    getRowId={() => rowIdGenerator.next().value}
                    rows={itemRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </Box>
            <Typography variant="h6" align="center">Total store-wide valuation ${totalValuation}</Typography>
            <Typography variant="h6" align="center">Total store-wide number of items ${totalNumberItems}</Typography>
            <Paper sx={{
                marginTop: 'calc(10% + 60px)',
                position: 'fixed',
                bottom: 0,
                width: '100%'
            }} square variant="outlined">
                <Footer />
            </Paper>
        </div>
    )
}