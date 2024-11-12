import React, { useState, useEffect } from "react";
import axios from "axios";

const FundInfo = ({ info, uid, watchlist }) => {
  const [boughtOn, setBoughtOn] = useState("");
  const [boughtFor, setBoughtFor] = useState("");
  const [numberPurchased, setNumberPurchased] = useState("");
  const [investedAmount, setInvestedAmount] = useState("");
  const [soldOn, setSoldOn] = useState("");
  const [soldFor, setSoldFor] = useState("");
  const [returnAmount, setReturnAmount] = useState("");
  const [selectedRange, setSelectedRange] = useState("1W");
  const [percChange, setPercChange] = useState(0.0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    switch (selectedRange) {
      case "1W":
        if(info.one_week == null)
            setPercChange(0.0);
        else
          setPercChange(info.one_week.toFixed(2));
        break;
      case "1M":
        if(info.one_month == null)
          setPercChange(0.0);
        else
          setPercChange(info.one_month.toFixed(2));
        break;
      case "3M":
        if(info.three_month == null)
          setPercChange(0.0);
        else
          setPercChange(info.three_month.toFixed(2));
        break;
      case "6M":
        if(info.six_month == null)
          setPercChange(0.0);
        else
          setPercChange(info.six_month.toFixed(2));
        break;
      case "1Y":
        if(info.one_year == null)
          setPercChange(0.0);
        else
          setPercChange(info.one_year.toFixed(2));
        break;
      case "All":
        if(info.lifetime == null)
          setPercChange(0.0);
        else
          setPercChange(info.lifetime.toFixed(2));
        break;
      default:
        setPercChange(0.0);
        break;
    }
  }, [selectedRange, info]);

  const fetchPrice = async (date, setPrice) => {
    try {
      const response = await axios.get(`http://localhost:5000/fund/date?f_id=${info.fund_id}&date=${date} 00:00:00`);
      if (response.status === 200) {
        setPrice(response.data.price);
      }
    } catch (error) {
      console.error("Error fetching price:", error);
      setPrice("");
    }
  };

  const handleBoughtOnChange = async (date) => {
    setBoughtOn(date);
    await fetchPrice(date, setBoughtFor);
  };

  const handleSoldOnChange = async (date) => {
    setSoldOn(date);
    await fetchPrice(date, setSoldFor);
  };

  useEffect(() => {
    if (boughtFor && numberPurchased) {
      setInvestedAmount((boughtFor * numberPurchased).toFixed(2));
    }
  }, [boughtFor, numberPurchased]);

  useEffect(() => {
    if (soldFor && numberPurchased) {
      setReturnAmount((soldFor * numberPurchased).toFixed(2));
    } else {
      setReturnAmount("");
    }
  }, [soldFor, numberPurchased]);

  const addToWatchlist = async () => {
    try {
      await axios.post("http://localhost:5000/watchlist/addone", {
        user_id: uid,
        fund_id: info.fund_id,
      });
      alert("Fund added to watchlist");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  const addToPortfolio = async () => {
    if (!boughtOn || boughtOn === "0000-00-00" || !boughtFor || !numberPurchased) {
      setErrorMessage("Please fill in all required fields: Bought On (valid date), Bought For, and Number Purchased.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/portfolio/add", {
        user_id: uid,
        fund_id: info.fund_id,
        bought_on: `${boughtOn} 00:00:00`,
        bought_for: parseFloat(boughtFor),
        invested_amount: parseFloat(investedAmount),
        sold_on: soldOn ? `${soldOn} 00:00:00` : null,
        sold_for: soldFor ? parseFloat(soldFor) : null,
        return_amount: returnAmount ? parseFloat(returnAmount) : null,
      });
      alert("Fund added to portfolio");
      setErrorMessage(""); // Clear error message on successful submission
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      setErrorMessage("Failed to add fund to portfolio. Please try again later.");
    }
  };

  const netProfitLoss = returnAmount - investedAmount;
  const netProfitLossPercentage = ((netProfitLoss / investedAmount) * 100).toFixed(2);
  const profitLossColor = netProfitLoss >= 0 ? "text-green-500" : "text-red-500";

  return (
      <div className="mb-8 bg-white p-12 rounded-lg shadow-md">
        <h1 className="text-5xl font-bold text-gray-800 mb-8">{info.fund_name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <span>
          <p className="font-bold text-xl">Category</p>
          <p className="font-semibold text-l">{info.category_name}</p>
        </span>
          <span>
          <p className="font-bold text-xl">Company</p>
          <p className="font-semibold text-l">{info.company_name}</p>
        </span>
          <span>
          <p className="font-bold text-xl">NAV</p>
          <p className="font-semibold text-l">{info.value.toFixed(2)}</p>
        </span>
          <span>
          <p className="font-bold text-xl">Standard deviation</p>
          <p className="font-semibold text-l">{info.standard_deviation.toFixed(2)}</p>
        </span>
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-2">
            {["1W", "1M", "3M", "6M", "1Y", "All"].map((range) => (
                <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`text-sm font-semibold px-4 py-1 rounded ${
                        selectedRange === range ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {range}
                </button>
            ))}
          </div>
          <span
              className="text-right font-bold text-xl"
              style={{
                color: percChange > 0 ? "rgb(0, 178, 135)" : "rgb(240, 125, 100)",
              }}
          >
          {percChange > 0 ? "+" : ""}
            {percChange}%
        </span>
        </div>
        {!watchlist && (
            <button
                onClick={addToWatchlist}
                className="mt-8 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Add to Watchlist
            </button>
        )}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add to Portfolio</h2>
          {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errorMessage}
              </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700">Bought On</label>
                <input
                    type="date"
                    value={boughtOn}
                    onChange={(e) => handleBoughtOnChange(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700">Bought For</label>
                <input
                    type="number"
                    value={boughtFor}
                    onChange={(e) => setBoughtFor(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700">Number Purchased</label>
                <input
                    type="number"
                    value={numberPurchased}
                    onChange={(e) => setNumberPurchased(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Sold On</label>
                <input
                    type="date"
                    value={soldOn}
                    onChange={(e) => handleSoldOnChange(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700">Sold For</label>
                <input
                    type="number"
                    value={soldFor}
                    onChange={(e) => setSoldFor(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Invested Amount</label>
                <input
                    type="number"
                    value={investedAmount}
                    readOnly
                    className="mt-1 block w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700">Return Amount</label>
                <input
                    type="number"
                    value={returnAmount}
                    readOnly
                    className="mt-1 block w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
            </div>
            {boughtFor && soldFor && (
                <div className={`mt-4 ${profitLossColor}`}>
                  <p>Net {netProfitLoss >= 0 ? "Profit" : "Loss"}: ₹{Math.abs(netProfitLoss).toFixed(2)} ({netProfitLossPercentage}%)</p>
                </div>
            )}
          </div>
          <button
              onClick={addToPortfolio}
              className="mt-4 bg-green-500 text-white py-2 px-4 mt-8 rounded hover:bg-green-700 transition-colors"
          >
            Add to Portfolio
          </button>
        </div>
      </div>
  );
};

export default FundInfo;