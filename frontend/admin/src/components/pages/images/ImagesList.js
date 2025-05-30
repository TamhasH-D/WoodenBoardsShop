import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../../apiService';
import DataTable from '../../common/DataTable';
import config from '../../../config';

const ImagesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const fetchImages = async (page, limit, search) => {
    const response = await apiService.getImages({ page, per_page: limit, search });
    return response.data; // Assuming API returns { items: [], total: number, page: number, per_page: number, pages: number }
  };

  const { data: imagesData, isLoading, error, refetch } = useQuery(
    ['images', currentPage, perPage, searchTerm],
    () => fetchImages(currentPage, perPage, searchTerm),
    { keepPreviousData: true }
  );

  useEffect(() => {
    refetch();
  }, [currentPage, perPage, searchTerm, refetch]);

  const deleteImageMutation = useMutation(
    (imageId) => apiService.deleteImage(imageId),
    {
      onSuccess: () => {
        toast.success('Image deleted successfully!');
        queryClient.invalidateQueries(['images', currentPage, perPage, searchTerm]);
      },
      onError: (err) => {
        toast.error(`Error deleting image: ${err.message}`);
      },
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImageMutation.mutate(id);
    }
  };

  const columns = [
    {
      Header: 'Thumbnail',
      accessor: 'url',
      Cell: ({ value, row }) => (
        <img 
          src={`${config.api.baseURL.replace('/api/v1', '')}${value}`}
          alt={row.original.title} 
          className="h-16 w-16 object-cover rounded" 
          onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/64?text=No+Image'; }}
        />
      ),
    },
    {
      Header: 'Title',
      accessor: 'title',
    },
    {
      Header: 'Type',
      accessor: 'type',
      Cell: ({ value }) => value === 'wood_type' ? 'Wood Type' : value === 'product' ? 'Product' : 'Unknown',
    },
    {
      Header: 'Related Item',
      accessor: 'related_name',
      Cell: ({ value, row }) => {
        if (row.original.type === 'wood_type' && row.original.wood_type) {
          return row.original.wood_type.name;
        }
        if (row.original.type === 'product' && row.original.product) {
          return row.original.product.name;
        }
        return value || 'N/A';
      }
    },
    {
      Header: 'File Size',
      accessor: 'file_size',
      Cell: ({ value }) => value ? `${(value / 1024).toFixed(1)} KB` : 'N/A',
    },
    {
      Header: 'Created At',
      accessor: 'created_at',
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: 'Actions',
      accessor: 'id',
      Cell: ({ value }) => (
        <div className="flex space-x-2">
          <Link to={`/images/edit/${value}`} className="text-yellow-500 hover:text-yellow-700">
            <FiEdit />
          </Link>
          <button onClick={() => handleDelete(value)} className="text-red-500 hover:text-red-700">
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    toast.error(`Error loading images: ${error.message}`);
    return <div className="text-center p-6 text-red-500">Error loading images. Check console for details.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Images</h1>
        <Link 
          to="/images/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Image
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={imagesData?.items || []}
        isLoading={isLoading || deleteImageMutation.isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={imagesData?.page || 1}
        setCurrentPage={setCurrentPage}
        totalPages={imagesData?.pages || 1}
        perPage={imagesData?.per_page || 10}
        setPerPage={setPerPage}
        totalItems={imagesData?.total || 0}
        onDelete={handleDelete} // Pass handleDelete to DataTable if it supports a global delete button or similar
        entityName="Image"
      />
    </div>
  );
};

export default ImagesList;
