import {
    Alert,
    CircularProgress,
    Snackbar,
   
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
    console.log(avatar,12)
  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem('user'))
    setUser(user.user)
  },[])
    const newProfile = async (e) => {
      e.preventDefault();

      const formData= new FormData()
formData.append("image",avatar)
      setloading(true);
      try {
        await axios.put(`/api/users/employee/${user._id}`, formData ).then((res) => {
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
         
            <input
              required
              id="standard-adornment-username"
              accept=".png, .jpg, .jpeg"
              type='file'
              onChange={(e) => setAvatar(e.target.files[0])}
            />
   
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
  
