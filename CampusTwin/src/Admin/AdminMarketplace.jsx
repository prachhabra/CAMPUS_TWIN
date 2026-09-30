import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { ShoppingBag, Search, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

const AdminMarketplace = () => {
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getProducts({
        page,
        limit: 10,
        status: 'All',
        q: searchQuery
      });
      if (res.success) {
        setProducts(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await marketplaceService.deleteProduct(deleteTarget._id);
      showSuccess(`Product "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      showError(err.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Product Listing',
      accessor: 'title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            Seller: {row.seller?.name || 'Student'} ({row.seller?.email})
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="status-badge student">{row.category}</span>
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => <strong>{formatCurrency(row.price)}</strong>
    },
    {
      header: 'Condition',
      accessor: 'condition'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Listed On',
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteTarget(row)}
          title="Delete marketplace listing"
        >
          <Trash2 size={13} /> Delete
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <ShoppingBag size={24} color="var(--primary)" /> Campus Marketplace Moderation
          </h2>
          <p className="page-subtitle">
            Inspect, audit, and moderate peer-to-peer student marketplace listings
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search listings by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={products}
          loading={loading}
          emptyTitle="No listings to moderate"
          emptyMessage="No marketplace listings found."
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Confirm Listing Deletion"
        message={`Are you sure you want to delete listing "${deleteTarget?.title}"?`}
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};

export default AdminMarketplace;
