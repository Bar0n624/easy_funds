import React from 'react';

const FundList = ({ title, funds, onFundClick }) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
            <ul className="space-y-2">
                {funds.map(([id, name, value]) => (
                    <li
                        key={id}
                        onClick={() => onFundClick(id)}
                        className="p-4 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-300 cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
                    >
                        {name} - {value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FundList;