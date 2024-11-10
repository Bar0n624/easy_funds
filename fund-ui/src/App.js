import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import SigninScreen from './screens/SigninScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from "./screens/SearchScreen";
import AllCategories from "./screens/AllCategories";
import './styles/styles.css'
import AllCompanies from "./screens/AllCompanies";
import AllFunds from "./screens/AllFunds";
import FundScreen from "./screens/FundScreen";
import CategoryScreen from "./screens/CategoryScreen";
import CompanyScreen from "./screens/CompanyScreen";
import TopFundsScreen from "./screens/TopFundsScreen";

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/signup" element={<SigninScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/all-categories" element={<AllCategories />} />
            <Route path="/all-companies" element={<AllCompanies />} />
            <Route path="/all-funds" element={<AllFunds />} />
            <Route path="/fund" element={<FundScreen />} />
            <Route path="/category" element={<CategoryScreen />} />
            <Route path="/company" element={<CompanyScreen />} />
            <Route path="/top-funds" element={<TopFundsScreen />} />
        </Routes>
      </Router>
  );
}

export default App;
