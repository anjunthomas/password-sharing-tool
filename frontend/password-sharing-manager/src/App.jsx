import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordShare from "./pages/PasswordShare";
import './styles/App.css'

export default function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup /> } />
          <Route path="/passwordShare" element={<PasswordShare />} />
        </Routes>
      </Router>
  );
}


