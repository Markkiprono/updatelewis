import "./App.css";
import "./components/Auth/auth.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Attendance from "./components/Pages/Admin/Attendance";
import ViewUsers from "./components/Pages/Admin/ViewUsers";
import Salary from "./components/Pages/Admin/Salary";
import CreateUser from "./components/Pages/Admin/CreateUser";
import CheckIN from "./components/Pages/Employee/CheckIN";
import Auth from "./components/Auth";
import SideBar from "./components/Pages/Components/SideBar";
import Redirect from "./components/Auth/Redirect";
import UpdateProfile from "./components/Pages/Employee/UpdateProfile";
import Profile from "./components/Pages/Employee/Profile";
import ViewUserImage from "./components/Pages/Admin/ViewUserImage";
import Location from "./components/Pages/Admin/Location";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/Login" element={<Auth />} />
          <Route element={<Redirect />}>
            <Route element={<SideBar />}>
              <Route path="/admin" element={<Attendance />} />
              <Route path="/images" element={<ViewUserImage />} />
              <Route path="/ViewUsers" element={<ViewUsers />} />
              <Route path="/location" element={<Location />} />
              <Route path="/Salary" element={<Salary />} />
              <Route path="/CreateUser" element={<CreateUser />} />
            </Route>
            <Route path="*" element={<h1>404 Not Found</h1>} />
            <Route path="/" element={<Profile />} />
            <Route path="/Profile/update" element={<UpdateProfile />} />
            <Route path="/CheckIn" element={<CheckIN />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
