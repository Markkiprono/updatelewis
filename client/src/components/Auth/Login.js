import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress
} from "@mui/material";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import { useLogin } from "../../hooks/useLogin";

const Alert1 = React.forwardRef(function Alert1(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Login = () => {
  const { login, loading, error, errorMessage, open, setOpen } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    login(email, password);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {error && <Alert severity="error">{errorMessage}</Alert>}
        <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
          <InputLabel htmlFor="standard-adornment-username">Email</InputLabel>
          <Input
            required
            id="standard-adornment-username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
          <InputLabel htmlFor="standard-adornment-password">
            Password
          </InputLabel>
          <Input
            required
            id="standard-adornment-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </IconButton>
              </InputAdornment>
            }
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
          disabled={loading}
          fullWidth
        >
          Login
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
        <Alert1 onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Login Successfully
        </Alert1>
      </Snackbar>
    </>
  );
};

export default Login;
