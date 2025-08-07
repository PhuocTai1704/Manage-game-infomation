import React, { useState, useEffect } from "react";
import { categoryAPI } from "../../services/api";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

interface Category {
  categoryId: number;
  name: string;
}

interface CategoryFormData {
  name: string;
}

interface ApiResponse {
  content: Category[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10); // Bắt đầu từ 1
  const pageSize = parseInt(searchParams.get("size") || "10", 10);
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const [filters, setFilters] = useState({
    name: searchParams.get("name") || "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
  });

  // Pagination state
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Thêm state cho dialog xóa
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("Fetching categories with:", {
        currentPage,
        pageSize,
        sortBy,
        sortOrder,
      });

      const apiPage = currentPage;
      const response: ApiResponse = await categoryAPI.getAll(
        apiPage,
        pageSize,
        sortBy,
        sortOrder
      );

      console.log("API Response:", response);

      setCategories(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setError("");
      if (editingCategory) {
        await categoryAPI.update(editingCategory.categoryId, {
          name: formData.name,
        });
      } else {
        await categoryAPI.create({
          name: formData.name,
        });
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: "" });
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteId(category.categoryId);
    setCategoryToDelete(category);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await categoryAPI.delete(deleteId);
        fetchCategories();
        setShowConfirm(false);
        setDeleteId(null);
        setCategoryToDelete(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
    setCategoryToDelete(null);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "" });
    setError("");
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      [name]: value,
      page: "1", // Reset về trang 1 khi filter thay đổi
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      page: page.toString(), // page đã là 1-based
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      page: "1", // Reset về trang 1 (1-based)
      size: newPageSize.toString(),
    });
  };

  const handleSortChange = (newSortBy: string) => {
    let newSortOrder = "asc";
    if (sortBy === newSortBy && sortOrder === "asc") {
      newSortOrder = "desc";
    }
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      page: "1",
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    // Chuyển đổi từ 1-based sang 0-based cho tính toán
    const currentPageZeroBased = currentPage - 1;
    let startPage = Math.max(
      0,
      currentPageZeroBased - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="me-2">Show:</span>
          <select
            className="form-select form-select-sm me-3"
            style={{ width: "auto" }}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalElements)} of {totalElements}{" "}
            entries
          </span>
        </div>

        {totalPages > 1 && (
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {startPage > 0 && (
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                </li>
              )}

              {startPage > 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}

              {pages.map((page) => (
                <li
                  key={page}
                  className={`page-item ${
                    page === currentPageZeroBased ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </button>
                </li>
              ))}

              {endPage < totalPages - 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}

              {endPage < totalPages - 1 && (
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </li>
              )}

              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories Management</h2>
        <div>
          <Link to="/dashboard" className="btn btn-danger me-2">
            Cancel
          </Link>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <i className="fas fa-plus me-2"></i>
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {categories.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No categories found</p>
            </div>
          ) : (
            <>
              {/* Sorting Controls */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <label className="me-2">Sort by:</label>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      value={sortOrder}
                      onChange={(e) => handleSortChange(sortBy)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.categoryId}>
                        <td>{category.name}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(category)}
                          >
                            Edit <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(category)}
                          >
                            Delete <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalElements > 0 && (
                <div className="mt-3">{renderPagination()}</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xóa giống Games */}
      {showConfirm && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              {/* Header */}
              <div className="modal-header bg-danger text-white border-0">
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <h5 className="modal-title mb-0">Confirm Delete Category</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCancelDelete}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <i
                    className="fas fa-trash-alt text-danger"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h6 className="mt-3 text-muted">
                    Are you sure you want to delete this category?
                  </h6>
                  <p className="text-muted small">
                    This action cannot be undone.
                  </p>
                </div>

                {categoryToDelete && (
                  <div className="text-center">
                    <div className="d-inline-block bg-light rounded px-3 py-2">
                      <i className="fas fa-tag me-2 text-muted"></i>
                      <span className="text-muted">Category Name:</span>{" "}
                      <span className="fw-bold text-dark">
                        {categoryToDelete.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 bg-light d-flex justify-content-between">
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={handleCancelDelete}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-4"
                  onClick={handleConfirmDelete}
                >
                  <i className="fas fa-trash me-2"></i>
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
