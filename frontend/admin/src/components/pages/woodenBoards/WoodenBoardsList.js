import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const WoodenBoardsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual API call
  const { data: woodenBoards, isLoading, error } = useQuery('woodenBoards', async () => {
    // Simulate API call
    return [
      { 
        id: '1', 
        title: 'Pine Board 20x100x1000mm', 
        wood_type: 'Pine',
        wood_type_id: '1',
        length: 1000,
        width: 100,
        thickness: 20,
        price: 5.50,
        in_stock: 150
      },
      { 
        id: '2', 
        title: 'Oak Board 25x150x2000mm', 
        wood_type: 'Oak',
        wood_type_id: '2',
        length: 2000,
        width: 150,
        thickness: 25,
        price: 18.75,
        in_stock: 75
      },
      { 
        id: '3', 
        title: 'Birch Board 15x100x1500mm', 
        wood_type: 'Birch',
        wood_type_id: '3',
        length: 1500,
        width: 100,
        thickness: 15,
        price: 8.25,
        in_stock: 120
      },
    ];
  });

  // Filter wooden boards based on search term
  const filteredWoodenBoards = woodenBoards?.filter(board => 
    board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.wood_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center p-6">Loading wooden boards...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading wooden boards: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wooden Boards</h1>
        <Link 
          to="/wooden-boards/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Board
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or wood type..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Wooden Boards Table */}
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wood Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions (mm)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price ($)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWoodenBoards?.length > 0 ? (
              filteredWoodenBoards.map((board) => (
                <tr key={board.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{board.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/wood-types/${board.wood_type_id}`} className="text-blue-500 hover:underline">
                      {board.wood_type}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {board.thickness} x {board.width} x {board.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${board.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      board.in_stock > 100 ? 'bg-green-100 text-green-800' :
                      board.in_stock > 50 ? 'bg-yellow-100 text-yellow-800' :
                      board.in_stock > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {board.in_stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link to={`/wooden-boards/${board.id}`} className="text-blue-500 hover:text-blue-700">
                        <FiEye />
                      </Link>
                      <Link to={`/wooden-boards/edit/${board.id}`} className="text-yellow-500 hover:text-yellow-700">
                        <FiEdit />
                      </Link>
                      <button className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  {searchTerm ? 'No wooden boards found matching your search.' : 'No wooden boards found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WoodenBoardsList;
