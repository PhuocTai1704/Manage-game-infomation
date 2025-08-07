import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { gameAPI, categoryAPI } from "../../services/api";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";

interface Game {
  gameId: number;
  keyId: string;
  category: {
    categoryId: number;
    name: string;
  };
  defaultLanguage: string;
  gameNames: {
    gameNameId: number;
    language: string;
    value: string;
  }[];
}

interface Category {
  categoryId: number;
  name: string;
}

const columnHelper = createColumnHelper<Game>();

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("size") || "10", 10);
  const sortBy = searchParams.get("sortBy") || "keyId";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const [filters, setFilters] = useState({
    keyId: searchParams.get("keyId") || "",
    gameName: searchParams.get("gameName") || "",
    categoryId: searchParams.get("categoryId") || "",
    defaultLanguage: searchParams.get("defaultLanguage") || "",
  });

  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  // Thêm state để lưu thông tin game sẽ xóa
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  // Tạo sorting state cho React Table
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: sortBy,
      desc: sortOrder === "desc",
    },
  ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("gameId", {
        header: "#",
        cell: (info) => (currentPage - 1) * pageSize + info.row.index + 1,
        enableSorting: false,
      }),
      columnHelper.accessor("keyId", {
        header: "Key ID",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => info.getValue().name,
        enableSorting: true,
      }),
      columnHelper.accessor("defaultLanguage", {
        header: "Default Language",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("gameNames", {
        header: "Game Names",
        cell: (info) => (
          <>
            {info.getValue().map((name) => (
              <div key={name.gameNameId}>
                {name.language}: {name.value}
              </div>
            ))}
          </>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <>
            <Link
              to={`/games/create-or-edit?id=${info.row.original.gameId}`}
              className="btn btn-sm btn-outline-primary me-2"
            >
              Edit <i className="fas fa-edit"></i>
            </Link>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDeleteClick(info.row.original)}
            >
              Delete <i className="fas fa-trash-alt"></i>
            </button>
          </>
        ),
      }),
    ],
    [currentPage, pageSize]
  );

  const table = useReactTable({
    data: games,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);

      if (newSorting.length > 0) {
        const sort = newSorting[0];
        const newSortBy = sort.id;
        const newSortOrder = sort.desc ? "desc" : "asc";

        setSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          sortBy: newSortBy,
          sortOrder: newSortOrder,
          page: "1",
        });
      }
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchGames();
  }, [currentPage, pageSize, sortBy, sortOrder, filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll(0, 100);
      setCategories(response.content);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const apiPage = currentPage;
      const response = await gameAPI.getAll(
        apiPage,
        pageSize,
        sortBy,
        sortOrder,
        {
          keyId: filters.keyId,
          gameName: filters.gameName,
          categoryId: filters.categoryId
            ? parseInt(filters.categoryId)
            : undefined,
          defaultLanguage: filters.defaultLanguage,
        }
      );
      setGames(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch games");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      [name]: value,
      page: "1",
    });
  };

  const handleCategoryChange = (option: any) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: option ? String(option.value) : "",
    }));
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      categoryId: option ? String(option.value) : "",
      page: "1",
    });
  };

  const handleDeleteClick = (game: Game) => {
    setDeleteId(game.gameId);
    setGameToDelete(game); // Lưu toàn bộ thông tin game
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await gameAPI.delete(deleteId);
      fetchGames();
      setShowConfirm(false);
      setDeleteId(null);
      setGameToDelete(null); // Reset game to delete
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
    setGameToDelete(null); // Reset game to delete
  };

  const handlePageChange = (page: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      page: page.toString(),
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      page: "1",
      size: newPageSize.toString(),
    });
  };

  const categoryOptions = categories.map((category) => ({
    value: category.categoryId,
    label: category.name,
  }));

  // Render pagination giống Categories (giữ nguyên như cũ)
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Game Management</h2>
        <div>
          <Link to="/dashboard" className="btn btn-danger me-2">
            Cancel
          </Link>
          <Link to="/games/create-or-edit" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Add Game
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <Form className="mb-4 shadow-sm p-3 bg-white rounded">
        {/* <h5 className="mb-3 fw-bold text-primary">Filter Games</h5> */}
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Label>Key ID</Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                placeholder="Search by Key ID"
                name="keyId"
                value={filters.keyId}
                onChange={handleFilterChange}
                style={{ paddingRight: "2.5rem" }}
              />
              <FaSearch
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#aaa",
                  pointerEvents: "none",
                }}
              />
            </div>
          </Col>
          <Col md={3}>
            <Form.Label>Game Name</Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                placeholder="Search by Game Name"
                name="gameName"
                value={filters.gameName}
                onChange={handleFilterChange}
                style={{ paddingRight: "2.5rem" }}
              />
              <FaSearch
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#aaa",
                  pointerEvents: "none",
                }}
              />
            </div>
          </Col>
          <Col md={3}>
            <Form.Label>Category</Form.Label>
            <Select
              options={categoryOptions}
              value={categoryOptions.find(
                (opt) => opt.value === Number(filters.categoryId)
              )}
              onChange={handleCategoryChange}
              placeholder="All Categories"
              isClearable
            />
          </Col>
          <Col md={3}>
            <Form.Label>DefaultLanguage</Form.Label>
            <Form.Select
              name="defaultLanguage"
              value={filters.defaultLanguage}
              onChange={handleFilterChange}
            >
              <option value="">All Languages</option>
              <option value="EN">English</option>
              <option value="KO">Korean</option>
              <option value="JA">Japanese</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No games found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            style={{
                              cursor: header.column.getCanSort()
                                ? "pointer"
                                : "default",
                            }}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " ↑",
                              desc: " ↓",
                            }[header.column.getIsSorted() as string] ?? null}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {renderPagination()}
            </>
          )}
        </div>
      </div>

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
                  <h5 className="modal-title mb-0">Confirm Delete Game</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCancelDelete}
                ></button>
              </div>

              {/* Body - chỉ hiển thị Key ID */}
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <i
                    className="fas fa-trash-alt text-danger"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h6 className="mt-3 text-muted">
                    Are you sure you want to delete this game?
                  </h6>
                  <p className="text-muted small">
                    This action cannot be undone.
                  </p>
                </div>

                {gameToDelete && (
                  <div className="text-center">
                    <div className="d-inline-block bg-light rounded px-3 py-2">
                      <i className="fas fa-key me-2 text-muted"></i>
                      <span className="text-muted">Key ID:</span>{" "}
                      <span className="fw-bold text-dark">
                        {gameToDelete.keyId}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer với layout flex */}
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
                  Delete Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
