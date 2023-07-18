import CustomAppBar from "../components/AppBar";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Footer from "../components/Footer";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Typography, Box, Paper } from "@mui/material";

//access token for mapbox geocoding

const MY_ACCESS_TOKEN = "pk.eyJ1IjoibWh0aHJvdzA5MDkwOSIsImEiOiJjbDlrYnN6bDcxdTVvM3dtbjRqMWJmc3NxIn0.8ZG33j9q4A_4waXCr6NPEg"

//TODO: fetch the real data and format it this way.

//TODO2: To fix the warning "No route matched Location", which happens when you have a link that points to a route that isn't defined in the router. 

const columns = [
    { field: "name", headerName: "Store Name", width: 70 },
    { field: "storeId", headerName: "Store ID", width: 130 },
    { field: "address", headerName: "Store Address", width: 130 },
    {
        field: "Route",
        renderCell: (rowValues) => {
            return <Link
                to={`${rowValues.row.storeId}`}
                style={{ textDecoration: "none" }}
            >
                <Button variant="contained">View Store &gt;</Button>
            </Link>
        },
        width: 160
    }
];

function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}



const data_rows = [
    { name: "Store1", storeId: "1", address: "Boston, MA" },
    { name: "Store2", storeId: "2", address: "Weston, MA" },
    { name: "Store3", storeId: "3", address: "Worcester, MA" },
    { name: "Store4", storeId: "4", address: "Providence, RI" },
    { name: "Store5", storeId: "5", address: "Nashua, NH" }
];

export default function CorporateStores() {
    const [stores, setStores] = React.useState([]);
    const params = useParams();

    useEffect(() => {
        fetch("http://localhost:8080/stores")
            .then(res => res.json())
            .then(data => {
                //data represents the array of all stores but we need to transform the "address" of the stores from lon-lat to address
                let newStoresData = data.map((store) => {
                    let newStore = { ...store };
                    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${store.address.longitude},${store.address.latitude}.json?access_token=${MY_ACCESS_TOKEN}`)
                        .then(res => res.json())
                        .then(data => {
                            newStore['address'] = data.features[3].place_name;
                        })
                    return newStore;
                })
                setStores(newStoresData);
            })
    }, [])

    return (
        <div style={{ height: 400, width: "100%" }}>
            <CustomAppBar />
            <Typography variant="h3"> View All Your Stores</Typography>
            <DataGrid
                getRowId={(row) => row.storeId}
                rows={stores}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />

            {/* TODO: to Link this button to the "Create" page     */}
            <Link
                to={"/corporate/create"}
                style={{ textDecoration: "none" }}
            >
                <Button variant="contained">Create a New Store</Button>
            </Link>

            <Paper sx={{
                marginTop: 'calc(10% + 60px)',
                position: 'fixed',
                bottom: 0,
                width: '100%'
            }} square variant="outlined">
                <Footer />
            </Paper>
        </div>
    );
}