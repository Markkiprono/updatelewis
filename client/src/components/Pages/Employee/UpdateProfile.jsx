import {
    Alert,
    CircularProgress,
    Snackbar,
    FormControl,
    InputLabel,
    Input,
    Button
  } from "@mui/material";
  import React, { useEffect, useState } from "react";
  import MuiAlert from "@mui/material/Alert";
  import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";
  
  const Alert1 = React.forwardRef(function Alert1(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  
  const UpdateProfile = () => {
    const [avatar, setAvatar] = useState("");
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setloading] = useState(false);
    const navigate=useNavigate()
const [user,setUser] =useState({
})  

    const handleClose = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
  
      setOpen(false);
    };
  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem('user'))
    setUser(user.user)
  },[])
    const newProfile = async (e) => {
      e.preventDefault();
      setloading(true);
      try {
        await axios.put(`/api/users/employee/${user._id}`, {avatar} ).then((res) => {
          setAvatar(res.data);

          setloading(false);
          setOpen(true);
          setTimeout(()=>{
           navigate("/Login")
           localStorage.removeItem('user') 
          },2000)

        });
      } catch (err) {
        console.log(err);
        setloading(false);
        setError(true);
      }
    };
    return (
      <>
        {error && <Alert severity="error">Error</Alert>}
        <div>UpdateProfile</div>
        <form onSubmit={newProfile}>
          <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
            <InputLabel htmlFor="standard-adornment-username">
              Copy link of profile picture
            </InputLabel>
            <Input
              required
              id="standard-adornment-username"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            style={{
              background: "black",
              color: "white",
              position: "relative",
              top: 20,
              borderRadius: 7
            }}
            
          >
            update
          </Button>
        </form>
        {loading && (
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <CircularProgress style={{ color: "black", marginTop: 10 }} />
          </div>
        )}
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert1 onClose={handleClose} severity="success" sx={{ width: "100%" }}>
            Updated Successfully
          </Alert1>
        </Snackbar>
      </>
    );
  };
  
  export default UpdateProfile;
  