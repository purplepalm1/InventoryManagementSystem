import CustomAppBar from '../components/AppBar';
import Footer from '../components/Footer.js';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import { Typography, Paper, TextField, Button, Stack } from '@mui/material';
import StoresByDistance from './StoresByDistance';
import StoresByItem from './StoresByItem';

//import from OutputTextField;
import { AlertError } from '../components/AlertError';
import { AlertSuccess } from '../components/AlertSuccess';


var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var show_stores_url = base_url + "storesGetter";
var show_items_url = base_url + "itemsGetter";
var search_by_text_url = "https://gw41edkp6h.execute-api.us-east-1.amazonaws.com/Prod/searchByText";


function* generateButtonId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}

//helper function to calculate distance between two pairs of coordinates (using Haversine formulae) https://www.igismap.com/haversine-formula-calculate-geographic-distance-earth/
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 3961 // miles
    var dLat = toRad(lat2 - lat1)
    var dLon = toRad(lon2 - lon1)
    var lat1 = toRad(lat1)
    var lat2 = toRad(lat2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c
    return d
}
// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}


export default function Customer() {
    const [customerCoord, setCustomerCoord] = useState("");
    const [customerLongitude, setCustomerLongitude] = useState("");
    const [customerLatitude, setCustomerLatitude] = useState("");
    const [stores1, setStores1] = useState([]);
    const [stores2, setStores2] = useState([]);
    const [customerSearchItem, setCustomerSearchItem] = useState('');

    //error handling states
    const [errorStores1, setErrorStores1] = useState(false);
    const [errorStores2, setErrorStores2] = useState(false);
    const [errorStores1Text, setErrorStores1Text] = useState('');
    const [errorStores2Text, setErrorStores2Text] = useState('');

    //handling alert
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');

    const viewStoresByCoordHandler = () => {
        const textCoord = customerCoord;
        console.log(textCoord);

        if (textCoord === '') {
            alert('Please enter a valid input!!');
        } else {
            let [custLongitude, custLatitude] = textCoord.split(',');
            // data wrangling
            setCustomerLongitude(parseFloat(custLongitude.trim()));
            setCustomerLatitude(parseFloat(custLatitude.trim()));

            // if (stores1.length === 0) {
            fetch(show_stores_url, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("success: ", data);
                    //set success
                    setSuccess(true);
                    setSuccessText(data.result);
                    //set new rows as the rows of stores fetched from the server
                    data.stores.forEach(function (store) {
                        return store['distance'] = calcCrow(customerLatitude, customerLongitude, store.latitude, store.longitude);
                    })
                    let newStores1 = data.stores.sort(function (storeA, storeB) {
                        return storeA.distance > storeB.distance ? 1 : -1;
                    })
                    setStores1(newStores1);

                    //set success back to false to be ready for the next fetch.
                    setTimeout(() => {
                        setSuccess(false);
                    }, 2000)
                })
                .catch((error) => {
                    console.log('Error: ', error);
                    setErrorStores1(true);
                    setStores1([]);
                    setErrorStores1Text(error.message);
                })
            setCustomerCoord('');
        }
    }

    const viewStoresBySearchItemHandler = () => {
        let text = customerSearchItem;
        if (text === '') {
            alert("Please enter a valid input!!!");
        } else {
            if (customerLatitude === '' || customerLongitude === '') {
                setErrorStores2(true);
                setStores2([]);
                setErrorStores2Text("Please make sure you provide your longitude and latitude in the previous step!");
            } else {
                text = text.trim();

                // if (stores2.length === 0) { //show
                let data = {};
                data['text'] = text;
                //building up the payload; first starting from data, then build a body
                let body = {};
                body['body'] = JSON.stringify(data);
                console.log(body);
                let js = JSON.stringify(body);

                //send the data using a fetch request
                fetch(search_by_text_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: js,
                })
                    .then((response) => response.json())
                    .then((data) => {

                        //set success
                        setSuccess(true);
                        setSuccessText(data.result);
                        //set new rows as the rows of stores fetched from the server
                        data.stores.forEach(function (store) {
                            return store['distance'] = calcCrow(customerLatitude, customerLongitude, store.latitude, store.longitude);
                        })
                        let newStores2 = data.stores.sort(function (storeA, storeB) {
                            return storeA.distance > storeB.distance ? 1 : -1;
                        })
                        setStores2(newStores2);

                        //set success back to false to be ready for the next fetch.
                        setTimeout(() => {
                            setSuccess(false);
                        }, 2000)
                    })
                    .catch((error) => {
                        setErrorStores2(true);
                        setStores2([]);
                        setErrorStores2Text(error.message);
                    })
                //reset form data to earlier state regardless of fetch outcomes
                setCustomerSearchItem('');
            }
        }
    }

    const clearSearchResultHandler = (store) => {
        if (store === 1) {
            setStores1([]);
        } else if (store === 2) {
            setStores2([]);
        }
    }


    let idGenerator = generateButtonId();

    return (
        <div>
            <CustomAppBar />
            {success ? <AlertSuccess showValue={true} alertTitle="Success" alertMessage={successText} /> : null}
            <Typography variant="h3" align="center"> Customer Homepage</Typography>
            {errorStores1 ? <AlertError alertText={errorStores1Text} alertTitle="Error" error={errorStores1} handleCloseError={() => setErrorStores1(false)} /> : null}
            {errorStores2 ? <AlertError alertText={errorStores2Text} alertTitle="Error" error={errorStores2} handleCloseError={() => setErrorStores2(false)} /> : null}

            {/* <Welcome /> */}

            <Typography variant="subtitle2" align="center">
                Your Currently Saved Location is: Longitude {customerLongitude === '' ? "___" : customerLongitude} and Latitude {customerLatitude === '' ? "___" : customerLatitude}
            </Typography>
            <Grid container style={{ marginTop: 50, marginLeft: 100 }}>
                <Grid item xs={12} md={3}>
                    <TextField
                        onChange={(e) => setCustomerCoord(e.target.value)}
                        value={customerCoord}
                        label="Enter Your Longitude, Latitude"
                        variant="outlined"
                        color="secondary"
                        style={{ width: 300 }}
                    />
                </Grid>
                <Grid item sx={12} md={6}>
                    <Stack direction="row" spacing={2}>
                        <Button onClick={viewStoresByCoordHandler} variant="contained">View Stores</Button>
                        <Button onClick={() => clearSearchResultHandler(1)} variant="contained">Clear Search Result</Button>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={12}>
                    {stores1.length === 0 ? <p>Sorry! Please Enter A Different ZIP Code</p> : <StoresByDistance storeLists={stores1} />}
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        onChange={(e) => setCustomerSearchItem(e.target.value)}
                        value={customerSearchItem}
                        label="Enter Item Name, SKU, or Description"
                        variant="outlined"
                        color="secondary"
                        style={{ width: 300 }}
                    />
                </Grid>

                <Grid item sx={12} md={6}>
                    <Stack direction="row" spacing={2}>
                        <Button onClick={viewStoresBySearchItemHandler} variant="contained">View Stores</Button>
                        <Button onClick={() => clearSearchResultHandler(2)} variant="contained">Clear Search Result</Button>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={12}>
                    {stores2.length === 0 ? <p>Sorry! Please Enter A Different Item</p> : <StoresByItem storeLists={stores2} />}
                </Grid>
            </Grid>
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