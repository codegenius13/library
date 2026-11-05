import { Route, Routes } from "react-router-dom";
import "./App.css";
/** Public */
import Home from "./pages/Home/Home";

/** Exercises */
import ExerciseOne from "./pages/Exercises/ExerciseOne";
import MoveTop from "./components/MoveTop/MoveTop";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
   

function App() {

  return (
    <div className="app-container">
       <ScrollToTop />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />

        {/* Exercise Pages */}
        <Route path="/exercise-one" element={<ExerciseOne />} />
      </Routes>
      <MoveTop />
    </div>
  );
}

export default App;
