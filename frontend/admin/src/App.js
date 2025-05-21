import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Panel</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
          Welcome to Admin Panel!
        </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;