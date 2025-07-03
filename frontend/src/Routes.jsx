import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./auth/Signin";
import SignUp from "./auth/Signup";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
