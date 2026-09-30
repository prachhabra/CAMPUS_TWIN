import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MARKETPLACE_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Pagination from '../components/Pagination';
import { ShoppingBag, Plus, Search, Tag, Phone, Mail, Trash2, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

const StudentMarketplace = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books',
    condition: 'Good',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getProducts({
        page,
        limit: 9,
        category: selectedCategory,
        q: searchQuery
      });
      if (res.success) {
        setProducts(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || formData.price === '') {
      showError('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await marketplaceService.createProduct(formData);
      showSuccess('Product listing created successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Books',
        condition: 'Good',
        contactPhone: user?.phone || '',
        contactEmail: user?.email || ''
      });
      fetchProducts();
    } catch (err) {
      showError(err.message || 'Failed to list product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsSold = async (productId) => {
    try {
      await marketplaceService.updateProduct(productId, { status: 'sold' });
      showSuccess('Listing marked as Sold');
      fetchProducts();
      if (selectedProduct) setSelectedProduct(null);
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const handleDeleteListing = async (productId) => {
    try {
      await marketplaceService.deleteProduct(productId);
      showSuccess('Listing deleted');
      fetchProducts();
      if (selectedProduct) setSelectedProduct(null);
    } catch (err) {
      showError(err.message || 'Failed to delete listing');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <ShoppingBag size={24} color="var(--primary)" /> Campus Marketplace
          </h2>
          <p className="page-subtitle">
            Buy and sell secondhand textbooks, calculators, electronics, and dorm essentials
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> List an Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Product Grid */}
      {loading ? (
        <Loader message="Loading items listed on campus..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No products listed yet"
          description="Be the first to list a course textbook, dorm equipment, or electronic gadget!"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> List Your Item
            </button>
          }
        />
      ) : (
        <div className="grid-cols-3">
          {products.map((item) => {
            const isOwner = (item.seller?._id || item.seller)?.toString() === user?._id?.toString();

            return (
              <Card
                key={item._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 20
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}
                  >
                    <span className="status-badge student">{item.category}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginBottom: 6
                    }}
                  >
                    {item.title}
                  </h3>

                  <div
                    style={{
                      fontSize: '1.375rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      marginBottom: 10
                    }}
                  >
                    {formatCurrency(item.price)}
                  </div>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      marginBottom: 14,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </p>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Condition: <strong>{item.condition}</strong></span>
                    <span>Listed: {formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedProduct(item)}
                  >
                    Contact Seller
                  </button>

                  {isOwner && item.status === 'available' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleMarkAsSold(item._id)}
                    >
                      <CheckCircle2 size={14} /> Mark Sold
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={9}
        onPageChange={setPage}
      />

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="List an Item on Campus Marketplace"
      >
        <form onSubmit={handleCreateProduct}>
          <FormField label="Item Title" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Data Structures & Algorithms Textbook (CLRS)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Price (INR)" required>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 450"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Category" required>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {MARKETPLACE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Condition" required>
              <select
                className="form-select"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good Condition</option>
                <option value="Fair">Fair / Usable</option>
              </select>
            </FormField>

            <FormField label="Contact Phone">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Item Description" required>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe condition, edition, markings, or where to meet on campus..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Listing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Seller Contact / Details Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.title}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="status-badge student">{selectedProduct.category}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(selectedProduct.price)}
              </span>
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {selectedProduct.description}
            </p>

            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--background)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
                Seller Information
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                Name: <strong>{selectedProduct.seller?.name || 'Fellow Student'}</strong>
              </div>
              {selectedProduct.contactPhone && (
                <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} color="var(--primary)" /> Phone: <strong>{selectedProduct.contactPhone}</strong>
                </div>
              )}
              {selectedProduct.contactEmail && (
                <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="var(--primary)" /> Email: <strong>{selectedProduct.contactEmail}</strong>
                </div>
              )}
            </div>

            {((selectedProduct.seller?._id || selectedProduct.seller)?.toString() === user?._id?.toString() || user?.role === 'admin') && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteListing(selectedProduct._id)}
                >
                  <Trash2 size={14} /> Remove Listing
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentMarketplace;
