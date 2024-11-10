import logo from './logo.svg';
import './App.css';
import "./styles/styles.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import SigninScreen from './screens/SigninScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from "./screens/SearchScreen";

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/signup" element={<SigninScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/search" element={<SearchScreen />} />c
        </Routes>
      </Router>
  );
}

export default App;
