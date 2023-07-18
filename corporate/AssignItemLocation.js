
import { TextField, Typography, Grid, Paper, Container, Card, CardHeader, CardContent, DataGrid, Stack } from "@mui/material";
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useState } from "react";
import Footer from "../components/Footer";
import ShowCorporateItems from "./ShowItems";
import CustomAppBar from "../components/AppBar";
import { AlertError } from '../components/AlertError';
import { AlertSuccess } from '../components/AlertSuccess';


var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var assign_item_location_url = base_url + "itemLocationAssigner";
var show_items_url = base_url + "itemsGetter";

// nice component to format paper 
const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    maxWidth: 400,
    color: theme.palette.text.primary,
}));

export default function CorporateAssignItemLocation() {

    const ariaLabel = { 'aria-label': 'description' };
    const [sku, setSKU] = useState("");
    const [shelf, setShelf] = useState("");
    const [aisle, setAisle] = useState("");
    const [rows, setRows] = useState([]);

    // success, error state for user feedback

    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [success, setSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');

    const submitHandler = (event) => {
        event.preventDefault();

        if (sku && shelf && aisle) {
            //can submit to server
            let data = {};
            data['SKU'] = sku;
            data['aisle'] = aisle;
            data['shelf'] = shelf;

            //building up the payload; ffirst starting from data, then build a body
            let body = {};
            body['body'] = JSON.stringify(data);

            console.log(body);

            let js = JSON.stringify(body);

            //send the data using a fetch request
            fetch(assign_item_location_url, {
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

            //reset form data to earlier state regardless of fetch outcomes
            setSKU("");
            setAisle("");
            setShelf("");

            // } else {
            //     alert("Please make sure you fill out all the required fields!")
            // }

        }
    }

    const viewClickHandler = (event) => {

        if (rows.length === 0) {
            //if the card is not showing any rows, clicking the button will fetch data from server
            fetch(show_items_url, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    setSuccess(true);
                    setSuccessText(data.result);

                    //set new rows as the rows of items fetched from the server
                    setRows(data.items);

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
            setRows([]);
        }
    }
    return (
        <div>
            <CustomAppBar />
            {success ? <AlertSuccess showValue={success} alertTitle="Success" alertMessage={successText} /> : null}
            {error ? <AlertError alertText={errorText} alertTitle="Error" error={errorText} handleCloseError={() => setError(false)} /> : null}
            <Typography variant="h4" align="center" gutterBottom>Corporate Assign Item Location</Typography>
            <Container>
                <Grid container spacing={6} >
                    <Grid item sx={12} md={6}>
                        <Card raised>
                            <CardHeader
                                title="Enter SKU, Aisle, and Shelf Numbers to Assign Item Location"
                                titleTypographyProps={{ variant: 'h5', align: 'center' }}
                            />
                            <CardContent style={{ height: 400, width: "100%" }}>
                                <form nonvalidate autoComplete="off"
                                    onSubmit={submitHandler}
                                >
                                    <Grid container direction={"column"} spacing={1}>
                                        <Grid item>
                                            <TextField
                                                onChange={(e) => setSKU(e.target.value)}
                                                value={sku}
                                                label="SKU"
                                                variant="outlined"
                                                color="secondary"
                                                required
                                                style={{ width: 525 }}
                                                marginRight="100px"
                                            />
                                        </Grid>

                                        <Grid item>
                                            <TextField
                                                onChange={(e) => setAisle(e.target.value)}
                                                value={aisle}
                                                label="Aisle"
                                                variant="outlined"
                                                color="secondary"
                                                required
                                                style={{ width: 525 }}
                                            />
                                        </Grid>

                                        <Grid item>
                                            <TextField
                                                onChange={(e) => setShelf(e.target.value)}
                                                value={shelf}
                                                label="Shelf"
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
                                                Assign Location
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
                                title="View Corporate Items"
                                titleTypographyProps={{ variant: 'h5', align: 'center' }}
                            />
                            <CardContent style={{ height: 400, width: "100%" }}>
                                <Button
                                    variant="contained"
                                    align='center'
                                    onClick={viewClickHandler}
                                > View/ Hide </Button>
                                <ShowCorporateItems rows={rows} />
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