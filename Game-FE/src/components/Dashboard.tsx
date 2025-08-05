import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <a href="#" className="navbar-brand">
              Game Management
            </a>
            <div className="d-flex align-items-center justify-content-between">
              <span className="navbar-text me-3">
                {/* Welcome, {user?.fullName} */}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <div className="content-card">
            <h2>Welcome to Game Management!</h2>
            <p>
              This is your dashboard. You can start managing games from here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
