import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Typography, Box } from "@mui/material";


var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var delete_store_url = base_url + "deleteStore";


const deleteStore = (storeID) => {
    const data = {};
    data['storeID'] = storeID;

    let body = {};
    body['body'] = JSON.stringify(data);
    let js = JSON.stringify(body);
    fetch(delete_store_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: js,
    })
    .then(response => response.json())
    .then((data) => {
        alert(data.result);
    })
    .catch(err => {
        alert(err);
    })
    }


const columns = [
    // { field: "id", headerName: "ID", width: 70 },
    {
        field: "name",
        headerName: "Store Name",
        width: 120
    },
    {
        field: "storeID",
        headerName: "storeID",
        width: 180
    },
    {
        field: "storeManagerID",
        headerName: "Manager ID",
        width: 180
    },
    {
        field: "longitude",
        headerName: "Longitude",
        type: "number",
        width: 100
    },
    {
        field: "latitude",
        headerName: "latitude",
        type: "number",
        width: 100
    },
    {
        field: "Generate",
        width: 200,
        renderCell: (rowValues) => {
            return (
                <Link
                    to={`/corporate/all_stores/${rowValues.row.storeID}`}
                    style={{ textDecoration: "none" }}
                >
                    <Button variant="contained">Inventory Report</Button>
                </Link>
            )
        },
        width: 220
    },
    {
        field: "Action",
        width: 200,
        renderCell: (rowValues) => {
            return (
                <Button variant="contained"
                    onClick={() => {
                        alert(`Attempting to delete store ${rowValues.row.storeID}`)
                        deleteStore(rowValues.row.storeID)
                    }}
                >
                    Delete store
                </Button>
            )
        },
        width: 220
    }
]

function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}


export default function ShowStores(props) {

    const params = useParams();
    const rowIdGenerator = generateRowId();

    //filter based on storeid so we must get the storeid passed down from the landing page
    return (
        <div>
            <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                    getRowId={() => rowIdGenerator.next().value}
                    rows={props.stores}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </Box>
        </div>
    )
}
