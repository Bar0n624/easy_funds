import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiTrash
} from "react-icons/fi";


const RED = "rgb(240, 125, 100)";
const GREEN = "rgb(0, 178, 135)";
const nowatchlist=1;

const WatchlistItem = ({ data, uid, onDelete, name}) => {
  const navigate = useNavigate();

  const handleFundClick = (fundId) => {
    navigate("/fund", { state: { fundId, uid, name, nowatchlist} });
  };

  const handleDelete = async (fundId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/watchlist/deleteone`,
        { user_id: uid, fund_id: fundId }
      );
      if (response.status === 200) {
        onDelete(fundId);
      }
    } catch (err) {
      console.error("Error processing request: ", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.results.map((fund) => (
          <div
            key={fund[0]}
            className="bg-white rounded-lg p-6 cursor-pointer shadow hover:shadow-md hover:bg-gray-300 transition-all duration-200 hover:translate-y-[-2px]"
            onClick={() => handleFundClick(fund[0])}
          >
            <p className="text-lg font-semibold text-gray-800">{fund[1]}</p>
            <div
              style={{
                color: "gray",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                <p
                  style={{
                    display: "inline",
                    marginRight: "8px",
                    fontSize: "14px",
                  }}
                >
                  <span
                    style={{
                      color: fund[2] > 0 ? GREEN : RED,
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    {fund[2] > 0 ? "+" : ""}
                    {fund[2]}
                  </span>
                  {" 1Y"}
                  <span style={{ margin: "0 8px", fontSize: "18px" }}>|</span>
                  <span
                    style={{
                      color: fund[3] > 0 ? GREEN : RED,
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    {fund[3] > 0 ? "+" : ""}
                    {fund[3]}
                  </span>
                  {" 1D"}
                </p>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(fund[0]);
                }}
                style={{
                  color: "white",
                  backgroundColor: "rgb(230, 70, 70)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  border: "none",
                  display: "inline-block",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "red")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(230, 70, 70)")
                }
              >
                <FiTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistItem;
