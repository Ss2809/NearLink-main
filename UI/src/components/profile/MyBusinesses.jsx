import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Store,
  Plus,
  MapPin,
  Edit3,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import BusinessModal from "../business/BusinessModal";
import { BUSINESS_API_URL } from "../../config/api";

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusinessForEdit, setSelectedBusinessForEdit] = useState(null);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMyBusinesses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${BUSINESS_API_URL}/my-businesses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(res.data.businesses || []);
    } catch (error) {
      console.error("Fetch My Businesses error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load your businesses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBusinesses();
  }, []);

  const handleDelete = async (businessId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setDeleting(true);
      await axios.delete(`${BUSINESS_API_URL}/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Business deleted successfully");
      setBusinessToDelete(null);
      setBusinesses((prev) => prev.filter((b) => b._id !== businessId));
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to delete business"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-100">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <Store size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              My Businesses ({businesses.length})
            </h2>
            <p className="text-xs text-gray-500">
              Manage your registered local businesses and shops
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-2xs"
        >
          <Plus size={16} />
          Add New Business
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={24} className="animate-spin text-green-600 mb-2" />
          <p className="text-sm">Loading your businesses...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="py-12 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
          <Store size={32} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-base font-bold text-gray-700">No businesses registered</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            You have not added any businesses to NearLink yet. Register your business to reach local customers!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Plus size={15} />
            Register Business
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {businesses.map((business) => (
            <div
              key={business._id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <img
                    src={
                      business.image ||
                      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"
                    }
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                      business.isOpen
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {business.isOpen ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                    {business.category}
                  </span>

                  <h3 className="font-bold text-base text-gray-900 mt-2 truncate">
                    {business.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                    <MapPin size={13} className="shrink-0 text-gray-400" />
                    {business.address}, {business.city}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link
                  to={`/business/${business._id}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-gray-100 text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg border border-gray-200 transition shadow-2xs text-center"
                >
                  <ExternalLink size={13} />
                  View
                </Link>

                <button
                  onClick={() => setSelectedBusinessForEdit(business)}
                  className="p-2 text-slate-600 hover:text-green-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition"
                  title="Edit Business"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  onClick={() => setBusinessToDelete(business)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  title="Delete Business"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <BusinessModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchMyBusinesses();
          }}
        />
      )}

      {/* Edit Modal */}
      {selectedBusinessForEdit && (
        <BusinessModal
          business={selectedBusinessForEdit}
          onClose={() => setSelectedBusinessForEdit(null)}
          onSuccess={() => {
            fetchMyBusinesses();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {businessToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Delete this Business?</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Are you sure you want to delete <strong>"{businessToDelete.name}"</strong>?
              This will remove the listing and map marker.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setBusinessToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(businessToDelete._id)}
                disabled={deleting}
                className="px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
