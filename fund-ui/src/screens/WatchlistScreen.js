import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import WatchlistItem from "../components/Watchlist";

const WatchlistScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const uid = location.state?.uid;
  const name = location.state?.name;

  useEffect(() => {
    if (!uid) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.post(
          `http://localhost:5000/watchlist/list`,
          { user_id: uid }
        );
        setData(response.data);
      } catch (err) {
        console.error("Error fetching data: ", err);
        setError("Failed to load data. Please try again later");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, navigate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredFunds = data?.results.filter((fund) =>
    fund[1].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (fundId) => {
    setData((prevData) => ({
      ...prevData,
      results: prevData.results.filter((fund) => fund[0] !== fundId),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar uid={uid} username={name} />
      <main className="ml-64 p-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 p-3 text-center">
            Your Watchlist
          </h1>
          <div className="mb-8">
            <SearchBar query={searchQuery} onChange={handleSearchChange} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            data && (
              <WatchlistItem data={{ results: filteredFunds }} uid={uid} onDelete={handleDelete} name={name} />
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default WatchlistScreen;
