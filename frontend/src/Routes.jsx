import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./auth/Signin";
import SignUp from "./auth/Signup";
import Home from './pages/Homepage/Home';


const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home/>} />

    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
