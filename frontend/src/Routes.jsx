import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthTransition from "./auth/AuthTransition"; // ✅ New shared auth layout
import Home from './pages/Homepage/Home';
import DiceGame from "./pages/Games/DiceGame/DiceGame";
import MinesGame from "./pages/Games/MinesGame/MinesGame";
import SudokuPreGame from "./pages/Games/SudokuGame/SudokuPreGame";
import SudokuGame from "./pages/Games/SudokuGame/SudokuGame";
import Earning from './pages/type_of_game/Earning/Earning';
import Farming from './pages/type_of_game/Farming/Farming';
import RoomGames from './pages/type_of_game/RoomGames/RoomGames';
import GameHistory from './pages/GameHistory/GameHistory';
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
        <Route path="/games/minesgame" element={<MinesGame />} />
        <Route path="/games/sudoku-pregame" element={<SudokuPreGame />} />
        <Route path="/games/sudoku" element={<SudokuGame />} />
        <Route path="/earning" element={<Earning />} />
        <Route path="/farming" element={<Farming />} />
        <Route path="/roomgames" element={<RoomGames />} />
        <Route path="/history" element={<GameHistory />} />
        {/* Add more routes here */}
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
