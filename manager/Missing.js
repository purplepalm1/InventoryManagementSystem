import CustomAppBar from "../components/AppBar";
import * as React from 'react';
import Footer from "../components/Footer";
import { DataGrid, GridColDef, GridValueGetterParams, GridToolbar } from "@mui/x-data-grid";
import { Button, Typography, Box, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var generate_inventory_report_url = base_url + "inventoryReportGenerator";



const columns_missing = [
    {
        field: "name",
        headerName: "Item",
        width: 90
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

];

const rows = [];

function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}

export default function ManagerMissing() {
    //Do not delete two lines below since it extracts the storeID from the url.
    // const params = useParams();
    // const storeID = params.storeId;
    //row id generator helper for constructing data grid
    const rowIdGenerator_missing = generateRowId();

    //set states for shelfStock and overStock
    const [missingStockRows, setMIssingStockRows] = React.useState([]);

    const storeId = useParams().storeId;
    let data = {};
    data['storeID'] = storeId;

    // //building up the payload; ffirst starting from data, then build a body
    let body = {};
    body['body'] = JSON.stringify(data);

    console.log(body);

    let js = JSON.stringify(body);

    React.useEffect(() => {
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
                console.log("success: ", data);
                alert(data.result);
                //set new rows as the rows of items fetched from the server

                let newMissingStockRows = data.stock.missingStock;
                setMIssingStockRows(newMissingStockRows);
            })
            .catch((error) => {
                console.log('Error: ', error);
                alert(error);
            })
    }, [])



    return (
        <div>
            <CustomAppBar />
            <Typography variant="h4" align="center"> Missing Item In Store {storeId} </Typography>

            <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                    getRowId={() => rowIdGenerator_missing.next().value}
                    rows={missingStockRows}
                    columns={columns_missing}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                />
            </Box>

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