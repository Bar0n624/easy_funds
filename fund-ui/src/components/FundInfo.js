import React from 'react';

const FundInfo = ({ info }) => {
    return (
        <div className="mb-8 bg-white p-12 rounded-lg shadow-md">
            <h1 className="text-5xl font-bold text-gray-800 mb-8">{info.fund_name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <p className="text-lg text-gray-700"><strong>Category:</strong> {info.category_name}</p>
                <p className="text-lg text-gray-700"><strong>Company:</strong> {info.company_name}</p>
                <p className="text-lg text-gray-700"><strong>Value:</strong> {info.value.toFixed(2)}</p>
                <p className="text-lg text-gray-700"><strong>Lifetime:</strong> {info.lifetime.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>One Month:</strong> {info.one_month.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>One Week:</strong> {info.one_week.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>One Year:</strong> {info.one_year.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>Six Months:</strong> {info.six_month.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>Standard Deviation:</strong> {info.standard_deviation.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>Three Months:</strong> {info.three_month.toFixed(2)}%</p>
            </div>
        </div>
    );
};

export default FundInfo;