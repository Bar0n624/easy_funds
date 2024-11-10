import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLogOut, FiTrendingUp, FiList, FiBriefcase, FiDollarSign, FiStar, FiPieChart } from 'react-icons/fi';

const SideBar = ({ uid, username }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const handleSignOut = () => {
        // Add signout logic here
        navigate('/');
    };

    const menuItems = [
        { path: '/top-funds', label: 'Top Funds', icon: <FiTrendingUp /> },
        { path: '/all-categories', label: 'Categories', icon: <FiList /> },
        { path: '/all-companies', label: 'Companies', icon: <FiBriefcase /> },
        { path: '/all-funds', label: 'Funds', icon: <FiDollarSign /> },
        { path: '/watchlist', label: 'Watchlist', icon: <FiStar /> },
        { path: '/portfolio', label: 'Portfolio', icon: <FiPieChart /> },
    ];

    return (
        <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg flex flex-col justify-between">
            <div className="p-6">
                <Link
                    to="/home"
                    state={{ uid: uid, name: username }}
                    className="block mb-8 flex items-center"
                >
                    <span role="img" aria-label="chart" className="mr-2">📊</span>
                    <h2 className="text-2xl font-bold hover:text-blue-400 transition-colors">Easy Funds</h2>
                </Link>
                <ul className="space-y-4">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                state={{ uid: uid, name: username }}
                                className={`block py-2 px-4 rounded transition-colors flex items-center ${
                                    currentPath === item.path
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-700'
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-6">
                <p>Logged in as <span className="font-semibold">{username}</span></p>
                <button
                    onClick={handleSignOut}
                    className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <FiLogOut className="mr-2" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default SideBar;