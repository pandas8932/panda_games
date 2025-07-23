import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./auth/LandingPage"; // Your animated landing page
import AuthTransition from "./auth/AuthTransition"; // ✅ New shared auth layout
import Home from './pages/Homepage/Home';
import DiceGame from "./pages/Games/DiceGame/DiceGame";
import Earning from './pages/type_of_game/Earning';
import Layout from "./components/Layout";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Standalone Pages */}
      <Route path="/" element={<LandingPage />} />

      {/* ✅ NEW: Shared animated route for signup/signin */}
      <Route path="/auth" element={<AuthTransition />} />

      {/* Routes with layout wrapper */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/games/dicegame" element={<DiceGame />} />
        <Route path="/earning" element={<Earning />} />
        {/* Add more routes here */}
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
