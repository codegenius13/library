import { Route, Routes } from "react-router-dom";
import "./App.css";
/** Public */
import Home from "./pages/Home/Home";

/** Practices */
import PracticeOne from "./pages/Practices/PracticeOne";

/** Exercises */
import ExercisesOne from "./pages/Exercises/ExercisesOne";

function App() {

  return (
    <div className="app-container">
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />

        {/* Practice Pages */}
        <Route path="/practice-one" element={<PracticeOne />} />

        {/* Exercise Pages */}
        <Route path="/exercise-one" element={<ExercisesOne />} />
      </Routes>
    </div>
  );
}

export default App;
