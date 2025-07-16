import React from 'react';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to PressPass Desktop
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your digital press credentials management system
        </p>
        <div className="space-x-4">
          <a
            href="/signin"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
