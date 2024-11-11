import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyDisplay = ({ data, uid, name}) => {
    const navigate = useNavigate();

    const handleCompanyClick = (companyId) => {
        navigate('/company', { state: { companyId, uid, name} });
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.results.map((company) => (
                    <div
                        key={company[0]}
                        className="bg-white rounded-lg p-6 cursor-pointer shadow hover:shadow-md hover:bg-gray-300 transition-all transition- duration-200 hover:translate-y-[-2px]"
                        onClick={() => handleCompanyClick(company[0])}
                    >
                        <h2 className="text-xl font-semibold text-gray-800">{company[1]}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanyDisplay;