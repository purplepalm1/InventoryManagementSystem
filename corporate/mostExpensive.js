import CustomAppBar from "../components/AppBar";
import Footer from "../components/Footer";
import * as React from 'react';

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Typography, Box } from "@mui/material";
import { useParams } from 'react-router-dom';


var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var most_expensive_item_url = base_url + "mostExpensive";



const columns_shelf = [
    {
        field: "SKU",
        headerName: "SKU",
        type: "number",
        width: 120
    },
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


export default function CorporateExpensive() {
    //row id generator helper for constructing data grid
    const rowIdGenerator_shelf = generateRowId();

    //set states for shelfStock and overStock
    const [expensiveRows, setExpensiveRows] = React.useState([]);

    const storeId = useParams().storeId;
    let data = {};
    data['storeID'] = storeId;

    // //building up the payload; ffirst starting from data, then build a body
    let body = {};
    body['body'] = JSON.stringify(data);

    console.log(body);

    let js = JSON.stringify(body);

    React.useEffect(() => {
        fetch(most_expensive_item_url,
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
                let newExpensiveStockRows = data.items;
                setExpensiveRows(newExpensiveStockRows);
            })
            .catch((error) => {
                console.log('Error: ', error);
                alert(error);
            })
    }, [])


    return (
        <div>
            <CustomAppBar />
            <div>
                {/* View store #3 for example */}
                <Typography variant="h5" align="center"> Most Expensive Item </Typography>
                {/* TODO: To show data in tbular format instead of a JSON, need quality selection + buy functionality*/}
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        getRowId={() => rowIdGenerator_shelf.next().value}
                        rows={expensiveRows}
                        columns={columns_shelf}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                    />
                </Box>
            </div>

            <Footer />
        </div >
    )
}