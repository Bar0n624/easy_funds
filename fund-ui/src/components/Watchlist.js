import React from "react";
import { useNavigate } from "react-router-dom";

const RED = "rgb(240, 125, 100)";
const GREEN = "rgb(0, 178, 135)";

const WatchlistItem = ({ data, uid }) => {
  const navigate = useNavigate();

  const handleFundClick = (fundId) => {
    navigate("/fund", { state: { fundId, uid } });
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
            <div style={{ color: "gray" }}>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistItem;
