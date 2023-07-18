
import { TextField, Typography, Grid, Paper, Container, Card, CardHeader, CardContent, DataGrid, Stack } from "@mui/material";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useState } from "react";
import Footer from "../components/Footer";
import ShowStores from './ShowStores';
import CustomAppBar from "../components/AppBar";
import { AlertError } from '../components/AlertError';
import { AlertSuccess } from '../components/AlertSuccess';

// url
var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var create_store_url = base_url + "storeCreatorAlternative";
var show_available_managers_url = base_url + "availableManagers";
var show_stores = base_url + "storesGetter"

// nice component to format paper
const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    maxWidth: 400,
    color: theme.palette.text.primary,
}));


export default function CorporateCreateStoreAlternative() {

    const ariaLabel = { 'aria-label': 'description' };
    const [name, setName] = useState("");
    const [storeManagerID, setStoreManagerID] = useState("");
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const [managerList, setManagerList] = useState([]);
    const [stores, setStores] = useState([]);

    // success, error state for user feedback

    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');


    const submitHandler = (event) => {
        event.preventDefault();

        if (name && storeManagerID && longitude && latitude) {
            //can submit to server
            let data = {};
            data['name'] = name;
            data['storeManagerID'] = storeManagerID;
            data['longitude'] = longitude;
            data['latitude'] = latitude;

            //building up the payload; ffirst starting from data, then build a body
            let body = {};
            body['body'] = JSON.stringify(data);
            console.log(body);
            let js = JSON.stringify(body);
            //send the data using a fetch request
            fetch(create_store_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: js,
            })
                .then((response) => response.json())
                .then((data) => {
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

            //reset the data field values
            setName("");
            setStoreManagerID("");
            setLongitude("");
            setLatitude("");
        } else {
            console.log('Error: ', error);
            setError(true);
            setErrorText("Please make sure you fill out all the required fields!");
        }
        console.log("clicked on submit!!!")
    }

    const viewClickHandler = (event) => {

        if (managerList.length === 0) {
            //if the card is not showing any managerID, clicking the button will fetch data from server
            fetch(show_available_managers_url, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    setSuccess(true);
                    setSuccessText(data.result);

                    //set new rows as the rows of items fetched from the server
                    setManagerList(data.managers);

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
        } else {
            //if rows have been displayed, a second click will hide the rows.
            setManagerList([]);
        }

        console.log("Clicked on view button!!")

    }


    const viewStoresClickHandler = (event) => {

        if (stores.length === 0) {
            //if the card is not showing any managerID, clicking the button will fetch data from server
            fetch(show_stores, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    setSuccess(true);
                    setSuccessText(data.result);

                    //set new rows as the rows of stores fetched from the server
                    setStores(data.stores);

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
        } else {
            //if rows have been displayed, a second click will hide the rows.
            setStores([]);
        }

        console.log("Clicked on view button!!")
    }

    return (
        <div>
            <CustomAppBar />
            {success ? <AlertSuccess showValue={success} alertTitle="Success" alertMessage={successText} /> : null}
            {error ? <AlertError alertText={errorText} alertTitle="Error" error={errorText} handleCloseError={() => setError(false)} /> : null}
            <Typography variant="h4" align="center" gutterBottom>Corporate Create Store</Typography>
            <Container>
                <Grid container spacing={6} >
                    <Grid item sx={12} md={6}>
                        <Card raised>
                            <CardHeader
                                title="Store Creation Form"
                                titleTypographyProps={{ variant: 'h5', align: 'center' }}
                            />
                            <CardContent style={{ height: 400, width: "100%" }}>
                                <form nonvalidate autoComplete="off"
                                    onSubmit={submitHandler}
                                >
                                    <Grid container direction={"column"} spacing={1}>
                                        <Grid item>
                                            <TextField
                                                onChange={(e) => setName(e.target.value)}
                                                value={name}
                                                label="Name"
                                                style={{ width: 525 }}
                                                variant="outlined"
                                                color="secondary"
                                                required
                                            />
                                        </Grid>

                                        <Grid item>
                                            <TextField
                                                onChange={(e) => setStoreManagerID(e.target.value)}
                                                value={storeManagerID}
                                                label="storeManagerID"
                                                variant="outlined"
                                                color="secondary"
                                                required
                                                style={{ width: 525 }}
                                            />
                                        </Grid>

                                        <Grid item>
                                            <TextField
                                                onChange={(e) => setLongitude(e.target.value)}
                                                value={longitude}
                                                label="Longitude"
                                                variant="outlined"
                                                color="secondary"
                                                required
                                                style={{ width: 525 }}
                                            />
                                        </Grid>

                                        <Grid item>
                                            <TextField
                                                onChange={(e) => setLatitude(e.target.value)}
                                                value={latitude}
                                                label="Latitude"
                                                variant="outlined"
                                                color="secondary"
                                                required
                                                style={{ width: 525 }}
                                            />
                                        </Grid>

                                        <Grid item>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                style={{ width: 525 }}
                                            >
                                                Create Store
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item sx={12} md={6}>

                        <Card raised>
                            <CardHeader
                                title="View Available Manager"
                                titleTypographyProps={{ variant: 'h5', align: 'center' }}
                            />

                            <CardContent style={{ height: 400, width: "100%" }}>
                                <Typography variant="body1"> Copy a manager ID then paste into "storeManagerID" field on the left</Typography>
                                <Button
                                    variant="contained"
                                    align='center'
                                    onClick={viewClickHandler}
                                > View/ Hide </Button>
                                {/* <ShowCorporateItems rows={rows} /> */}
                                {managerList.map(row => {
                                    return <p>{row.userID}</p>
                                }
                                )}

                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item sx={12} md={12}>

                        <Card raised>
                            <CardHeader
                                title="Show Stores"
                                titleTypographyProps={{ variant: 'h5', align: 'center' }}
                            />

                            <CardContent style={{ height: 400, width: "100%" }}>
                                <Typography variant="body1"> Click on "Go to Manager Home to visit store as a Manager</Typography>
                                <Button
                                    variant="contained"
                                    align='center'
                                    onClick={viewStoresClickHandler}
                                > View/ Hide </Button>

                                <ShowStores stores={stores} />

                            </CardContent>
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

        </div>
    );
}