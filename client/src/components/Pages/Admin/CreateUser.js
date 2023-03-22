import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Input,
  Button,
  CircularProgress
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const Alert1 = React.forwardRef(function Alert1(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CreateUser = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/users/new", { email, name }).then((res) => {
        setLoading(false);
        setOpen(true);
        setError(false);
        setTimeout(() => {
          navigate("/admin/ViewUsers");
        }, 2000);
      });
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setErrorMessage(err.message);
      }
      console.log(err);
      setError(true);
      setLoading(false);
      setErrorMessage(err.response.data);
    }
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  return (
    <>
      <div className="Wrapper">
        <div className="cardWrapper">
          <h1 className="headWrapper">Register employee</h1>

          <div className="formWrapper">
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error">{errorMessage}</Alert>}
              <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
                <InputLabel htmlFor="standard-adornment-username">
                  Full Name
                </InputLabel>
                <Input
                  required
                  id="standard-adornment-username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
                <InputLabel htmlFor="standard-adornment-email">
                  Email
                </InputLabel>
                <Input
                  required
                  id="standard-adornment-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                style={{
                  background: "#2E8B57",
                  color: "white",
                  position: "relative",
                  top: 20,
                  borderRadius: 7
                }}
                fullWidth
              >
                Create User
              </Button>
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
            </form>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert1
                onClose={handleClose}
                severity="success"
                sx={{ width: "100%" }}
              >
                User created Successfully
              </Alert1>
            </Snackbar>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateUser;
