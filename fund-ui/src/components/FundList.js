import React from "react";

const FundList = ({ title, funds, onFundClick }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <ul className="space-y-2">
        {funds.map(([id, name, value]) => (
          <li
            key={id}
            onClick={() => onFundClick(id)}
            className="px-8 py-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-4px] hover:scale-105 flex justify-between"
          >
            <span className="font-bold">{name}</span>
                <span
                className="text-right font-bold"
                style={{ color: value > 0 ? 'rgb(0, 178, 135)' : 'rgb(240, 125, 100)' }}
                >
                    {value > 0 ? "+" : ""}{value}{"%"}
                <span className="text-gray-400 text-sm">{" 1Y"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FundList;
