import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./auth/Signin";
import SignUp from "./auth/Signup";
import Home from './pages/Homepage/Home';
import DiceGame from "./pages/Games/DiceGame/DiceGame";
import Earning from './pages/type_of_game/Earning'; // Add others if needed

import Layout from "./components/Layout"; // ✅ Create this next

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* No Navbar on Auth pages */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Layout with Navbar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/games/dicegame" element={<DiceGame />} />
        <Route path="/earning" element={<Earning />} />
        {/* Add more pages as needed */}
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
