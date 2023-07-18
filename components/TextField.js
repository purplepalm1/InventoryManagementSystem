import * as React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';


export default function ComposedTextField(props) {
  const [name, setName] = React.useState("");

  //to show if the button is clicked, if it is clicked then the content should be rendered
  const [isShown, setIsShown] = React.useState(false);

  const handleChange = (event) => {
    setName(event.target.value);
    console.log(name);
  };

  // submit the data and send an HTTP request to the server, then clear the input in the form;
  // TODO: if input is empty or "", then submit button does nothing
  // allow the list of stores to appear
  const handleSubmit = (event) => {
    setIsShown(!isShown);
    props.isSubmitClick(!isShown, event.target.id); // this passes the isShown data up to the parent, i.e. Customer Landing
    setName("");
  }

  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1 },
      }}
      noValidate
      autoComplete="off"
    >
      <FormControl variant="standard">
        <InputLabel htmlFor="component-helper">{props.inputLabel}</InputLabel>
        <Input
          id="component-helper"
          value={name}
          onChange={handleChange}
          aria-describedby="component-helper-text"
        />
        <FormHelperText id="component-helper-text">
          {props.formHelperText}
        </FormHelperText>
      </FormControl>
      <Button id={props.passedId} variant="contained" onClick={handleSubmit}>View Stores</Button>
    </Box>
  );
}
