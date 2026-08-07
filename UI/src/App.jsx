import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Businesses from "./pages/Businesses";
import Activities from "./pages/Activities";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import BusinessDetails from "./components/BusinessDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/businesses"
          element={
            <ProtectedRoute>
              <Businesses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <Activities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />
      <Route path="/business/:id" element={<BusinessDetails />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;