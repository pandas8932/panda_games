import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./auth/Signin";
import SignUp from "./auth/Signup";
import LandingPage from "./auth/LandingPage"; // Your new animated landing page
import Home from './pages/Homepage/Home';
import DiceGame from "./pages/Games/DiceGame/DiceGame";
import Earning from './pages/type_of_game/Earning';
import Layout from "./components/Layout";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Standalone Pages (No Layout) */}
      <Route path="/" element={<LandingPage />} /> {/* New landing page as root */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes with Layout (Navbar, Footer, etc.) */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/games/dicegame" element={<DiceGame />} />
        <Route path="/earning" element={<Earning />} />
        {/* Add more authenticated routes here */}
      </Route>
      
      {/* Optional: 404 Page */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;