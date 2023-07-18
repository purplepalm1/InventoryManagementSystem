import { CardContent, CardHeader, Typography, Grid, Card, Button, Container, Stack, TextField, Box, Paper } from "@mui/material";
import CustomAppBar from "../components/AppBar";
import Footer from "../components/Footer";
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { AlertError } from "../components/AlertError";
import { AlertSuccess } from "../components/AlertSuccess";

// var base_url = "https://gw41edkp6h.execute-api.us-east-1.amazonaws.com/Prod/";
// var processShipment_url = base_url + "equal"; //to replace this one later

var base_url = 'https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/';
var processShipment_url = base_url + 'shipmentProcessor';
var fill_shelf_url = base_url + "fillShelf"

/*
{ "shipment": [
         { "item" : "sku-1" , "quantity" : "41" },
         { "item" : "sku-2" , "quantity" : "2" }
    ]
}
*/


// create a nice stylized Item component for a list

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

//generate rowsid
function* generateRowId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}

/** No longer needed: helper method to get the differlet isSameRow = (a, b) => a.rowId === b.rowId && a.item === b.item && a.quantity === b.quantity; */
// const onlyInLeft = (left, right, compareFunction) =>
//     left.filter(leftValue =>
//         !right.some(rightValue =>
//             compareFunction(leftValue, rightValue)));
//         !right.some(rightValue =>
//             compareFunction(leftValue, rightValue)));

export default function ManagerHome() {

    const storeId = useParams().storeId;

    const date = new Date();

    const shipment_columns = [
        { field: 'item', headerName: 'Item Name', width: 200 },
        { field: 'quantity', headerName: 'Quantity', width: 90 },
    ]


    // const [shipmentRows, setShipmentRows] = React.useState(shipment_rows);
    const [shipmentRows, setShipmentRows] = useState([]);
    const [shipmentText, setShipmentText] = useState("");

    //for user feedback in terms of error/ success
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');


    const enterShipmentHandler = () => {
        let newShipmentRows = JSON.parse(shipmentText).shipment;  // [{ "item" : "sku-1" , "quantity" : "41" },{ "item" : "sku-2" , "quantity" : "2" }]
        setShipmentRows(newShipmentRows);
        setShipmentText("");
    }


    // to send a request to server upon a click on button "process shipment"
    const processShipmentHandler = () => {
        //if shipment_rows is empty then can't process
        let data = {};
        data['items'] = shipmentRows;
        data['store'] = storeId;
        // console.log(data);

        //building up the payload; ffirst starting from data, then build a body
        let body = {};
        body['body'] = JSON.stringify(data);

        // console.log(body);

        let js = JSON.stringify(body);
        // console.log(js);

        //send the data using a fetch request
        fetch(processShipment_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: js,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.statusCode == 200) {
                    console.log("success: ", data);
                    setSuccess(true);
                    setSuccessText(data.result);

                    //reset success state back to false to ready for the next invocation
                    setTimeout(() => {
                        setSuccess(false);
                    }, 2000)

                } else {
                    setError(true);
                    setErrorText("Failure to process shipment!! Please check with Corporate to see if this item has been assigned a location!");
                }
            })
            .catch((error) => {
                console.log('Error: ', error);
                setError(true);
                setErrorText(error.message);
            })
        //clear entries in the shipment table:
        setShipmentRows([]);
    }

    const fillShelfHandler = () => {
        //if shipment_rows is empty then can't process
        let data = {};
        data['store'] = storeId;

        //building up the payload; ffirst starting from data, then build a body
        let body = {};
        body['body'] = JSON.stringify(data);

        // console.log(body);

        let js = JSON.stringify(body);
        // console.log(js);

        //send the data using a fetch request
        fetch(fill_shelf_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: js,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("success: ", data);
                setSuccess(true);
                setSuccessText(data.result);

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
    }

    const rowIdGenerator = generateRowId();


    return (
        <div>
            <CustomAppBar />
            {success ? <AlertSuccess showValue={success} alertTitle="Success" alertMessage={successText} /> : null}
            {error ? <AlertError alertText={errorText} alertTitle="Error" error={errorText} handleCloseError={() => setError(false)} /> : null}

            <Typography variant="h2" align="center">Manager Homepage</Typography>
            <Typography variant="h4" align="center" > Store # {storeId}</Typography>

            <Container>
                <Stack direction="row" spacing={2}>
                    <Item >
                        <Link
                            to={{ pathname: `/manager/${storeId}/inventory` }}
                            style={{ textDecoration: "none" }}
                        >
                            <Button variant="contained">Generate Shelf Inventory Report</Button>
                        </Link>
                    </Item>
                    <Item >
                        <Link
                            to={{ pathname: `/manager/${storeId}/overstock` }}
                            style={{ textDecoration: "none" }}
                        >
                            <Button variant="contained">Generate Overstock Inventory Report</Button>
                        </Link>
                    </Item>
                    <Item >
                        <Link
                            to={{ pathname: `/manager/${storeId}/missing` }}
                            style={{ textDecoration: "none" }}
                        >
                            <Button variant="contained">Show Missing Items</Button>
                        </Link>
                    </Item>
                    <Item >
                        <Button onClick={fillShelfHandler} variant="contained">Fill Shelves</Button>
                    </Item>
                    {/* <Button onClick={handleGetAuthenticated}>Get current Authenticated User</Button> */}
                </Stack>
                <Grid container spacing={6} >

                    <Grid item sx={12} md={6}>
                        <Card raised>
                            <CardHeader
                                title="Enter Shipment"
                            />
                            <CardContent style={{ height: 400, width: "100%" }}>
                                <TextField
                                    onChange={(e) => setShipmentText(e.target.value)}
                                    value={shipmentText}
                                    multiline
                                    label="Shipment Object"
                                    variant="outlined"
                                    color="secondary"
                                    required
                                    style={{ width: 525 }}
                                />
                                <Button variant="contained" onClick={enterShipmentHandler}>OK!!</Button>
                            </CardContent>

                        </Card>
                    </Grid>
                    <Grid item sx={12} md={6}>
                        <Card raised>
                            <CardHeader
                                title="Preview The Shipment You Are About To Process!"
                                subheader={`As of ${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`}
                            />
                            <CardContent style={{ height: 325, width: "100%" }}>
                                <DataGrid
                                    getRowId={() => rowIdGenerator.next().value}
                                    rows={shipmentRows}
                                    columns={shipment_columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                />

                            </CardContent>
                            <Button variant="contained" onClick={processShipmentHandler}>Process Shipment</Button>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

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