import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SmallFundList from '../components/SmallFundList';
import SideBar from "../components/SideBar";
import SearchBar from "../components/SearchBar";

const CompanyScreen = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const uid = location.state?.uid;
    const companyId = location.state?.companyId;
    const name = location.state?.name;

    useEffect(() => {
        if (!companyId) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/search/company?c_id=${companyId}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId, navigate]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredFunds = data?.results.filter(fund =>
        fund[1].toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <SideBar uid={uid} username={name}/>
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4 p-3 text-center">{data?.company_name}</h1>
                    <div className="flex justify-center mb-8">
                        <SearchBar query={searchQuery} onChange={handleSearchChange}/>
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
                        data && <SmallFundList data={{results: filteredFunds}} uid={uid} name={name}/>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CompanyScreen;