import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-green-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-green-800 mb-8">Buyer Dashboard</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
          Welcome, Valued Buyer!
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