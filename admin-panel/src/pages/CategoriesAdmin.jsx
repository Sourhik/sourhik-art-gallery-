import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('bi-grid-fill');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, { name, icon, description, isFeatured });
      } else {
        await adminApi.createCategory({ name, icon, description, isFeatured });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setName('');
      setDescription('');
      fetchCategories();
    } catch {
      alert('Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category? Photos will be reclassified to Other.')) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch {
      alert('Error deleting category');
    }
  };

  return (
    <div className="categories-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Category & Tag Management</h2>
          <p className="text-muted small mb-0">Organize photo discovery taxonomy, featured tags, and icon classifications</p>
        </div>

        <button
          className="btn btn-primary rounded-pill px-4 fw-semibold shadow d-flex align-items-center gap-2"
          onClick={() => {
            setEditingCategory(null);
            setName('');
            setIcon('bi-grid-fill');
            setDescription('');
            setIsFeatured(false);
            setIsModalOpen(true);
          }}
        >
          <i className="bi bi-plus-lg"></i> Add Category
        </button>
      </div>

      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Icon & Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Photo Count</th>
                <th>Featured</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="p-2 rounded-3 bg-dark text-primary"><i className={`bi ${cat.icon || 'bi-grid-fill'}`}></i></span>
                      <strong className="text-white small">{cat.name}</strong>
                    </div>
                  </td>
                  <td className="small text-muted font-monospace">{cat.slug}</td>
                  <td className="small text-white-50 text-truncate" style={{ maxWidth: '240px' }}>{cat.description || '—'}</td>
                  <td>
                    <span className="badge bg-primary bg-opacity-20 text-primary fs-8">{cat.photoCount || 0} Photos</span>
                  </td>
                  <td>
                    <span className={`badge bg-${cat.isFeatured ? 'warning text-dark' : 'secondary'} fs-8`}>
                      {cat.isFeatured ? 'Featured' : 'Regular'}
                    </span>
                  </td>
                  <td className="pe-3 text-end">
                    <button
                      className="btn btn-sm btn-outline-info rounded-circle p-1.5 me-1.5"
                      onClick={() => {
                        setEditingCategory(cat);
                        setName(cat.name);
                        setIcon(cat.icon || 'bi-grid-fill');
                        setDescription(cat.description || '');
                        setIsFeatured(cat.isFeatured || false);
                        setIsModalOpen(true);
                      }}
                      title="Edit Category"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                      onClick={() => handleDelete(cat._id)}
                      title="Delete Category"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-admin-card border-admin rounded-4 shadow-xl">
              <div className="modal-header border-admin p-4 pb-2">
                <h5 className="modal-title fw-bold text-white mb-0">{editingCategory ? 'Edit Category' : 'Create Category'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Category Name</label>
                    <input
                      type="text"
                      className="form-control bg-admin-input border-admin text-white"
                      placeholder="e.g. Wildlife, Street, Astrophotography"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Bootstrap Icon Class</label>
                    <input
                      type="text"
                      className="form-control bg-admin-input border-admin text-white"
                      placeholder="e.g. bi-camera-fill, bi-tree-fill"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Description</label>
                    <textarea
                      className="form-control bg-admin-input border-admin text-white"
                      rows="2"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="featCheck"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <label className="form-check-label text-muted small" htmlFor="featCheck">
                      Feature on Homepage Category Navigation Bar
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-admin p-4 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-semibold">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesAdmin;
