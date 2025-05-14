import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaSpinner} from "react-icons/fa";
import axios from "axios";
import { motion, } from "framer-motion";
import { backEndURL } from "../Backendurl";
import DotSpinner from "../loaders/Loader"; // Import the loader

export default function HRMSystem() {
  const [departments, setDepartments] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [employmentStatus, setEmploymentStatus] = useState([]);
  const [certificateLevels, setCertificateLevels] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Departments");
  const [monthlyWorkHours, setMonthlyWorkHours] = useState([]); // State for Monthly Work Hours

  const fetchData = () => {
    setLoading(true); 
    Promise.all([
      axios.get(`${backEndURL}/api/departments`),
      axios.get(`${backEndURL}/api/employment-types`),
      axios.get(`${backEndURL}/api/employment-status`),
      axios.get(`${backEndURL}/api/certificate-levels`),
      axios.get(`${backEndURL}/api/positions`),
      axios.get(`${backEndURL}/api/monthly-work-hours`) // Fetch Monthly Work Hours
    ])
      .then(([departmentsRes, employmentTypesRes, employmentStatusRes, certificateLevelsRes, positionsRes, monthlyWorkHoursRes]) => {
        setDepartments(departmentsRes.data);
        setEmploymentTypes(employmentTypesRes.data);
        setEmploymentStatus(employmentStatusRes.data);
        setCertificateLevels(certificateLevelsRes.data);
        setPositions(positionsRes.data);
        setMonthlyWorkHours(monthlyWorkHoursRes.data); // Set Monthly Work Hours
      })
      .catch(error => console.error("Error fetching data:", error))
      .finally(() => setLoading(false)); // Stop loading
  };

  useEffect(() => {
    fetchData(); // Fetch data on initial load
  }, []);

  const tabs = ["Departments", "Employment Types", "Employment Status", "Certificate Levels", "Positions", "Monthly Work Hours"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-full overflow-hidden">
      <div
        className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar"
        role="tablist"
        aria-label="Advanced tab list"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeTab === tab
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="tabHighlight"
                className="absolute inset-0 rounded-xl bg-blue-700/20 z-[-1]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>

      <div className="p-10">
        {/* Render only the active section */}
        {activeTab === "Departments" && (
          <Section
            title="Departments"
            data={departments}
            setData={setDepartments}
            keys={["name"]}
            fetchData={fetchData}
          />
        )}
        {activeTab === "Employment Types" && (
          <Section
            title="Employment Types"
            data={employmentTypes}
            setData={setEmploymentTypes}
            keys={["type"]}
            fetchData={fetchData}
          />
        )}
        {activeTab === "Employment Status" && (
          <Section
            title="Employment Status"
            data={employmentStatus}
            setData={setEmploymentStatus}
            keys={["status"]}
            fetchData={fetchData}
          />
        )}
        {activeTab === "Certificate Levels" && (
          <Section
            title="Certificate Levels"
            data={certificateLevels}
            setData={setCertificateLevels}
            keys={["level"]}
            fetchData={fetchData}
          />
        )}
        {activeTab === "Positions" && (
          <Section
            title="Positions"
            data={positions}
            setData={setPositions}
            keys={["title"]}
            fetchData={fetchData}
          />
        )}
        {activeTab === "Monthly Work Hours" && (
          <MonthlyWorkHoursSection
            data={monthlyWorkHours}
            setData={setMonthlyWorkHours}
          />
        )}
      </div>
    </div>
  );
}

function Section({ title, data, setData, keys, fetchData }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state for actions
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAdd = () => {
    setIsFormOpen(true);
    setFormData({});
  };

  const handleEdit = (item) => {
    if (title === "Positions") {
      setFormData(item); // Directly edit the dummy data
      setIsFormOpen(true);
    } else {
      setIsFormOpen(true);
      setFormData(item);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    const apiUrl = `${backEndURL}/api/${title.toLowerCase().replace(" ", "-")}`;
    const request = formData.id
      ? axios.put(`${apiUrl}/${formData.id}`, formData) // Update existing position
      : axios.post(apiUrl, { ...formData }); // Add new position

    request
      .then(() => {
        fetchData(); // Refetch data after save
        setIsFormOpen(false);
      })
      .catch(error => console.error(`Error saving ${title.toLowerCase()}:`, error))
      .finally(() => setLoading(false)); // Stop loading
  };

  const handleDelete = (id) => {
    setLoading(true); // Start loading
    const apiUrl = `${backEndURL}/api/${title.toLowerCase().replace(" ", "-")}`;
    axios.delete(`${apiUrl}/${id}`)
      .then(() => {
        fetchData(); // Refetch data after delete
      })
      .catch(error => console.error(`Error deleting ${title.toLowerCase()}:`, error))
      .finally(() => setLoading(false)); // Stop loading
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      handleDelete(itemToDelete);
      setShowDeleteConfirm(false);
    }
  };

  // Filter data based on search term
  const filteredData = data.filter(item =>
    keys.some(key => 
      item[key]?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add {title}
          </button>
        </div>
      </div>

      {/* Enhanced table styling */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              {keys.map(key => <th key={key} className="border-b py-2">{key.toUpperCase()}</th>)}
              <th className="border-b py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b">
                {keys.map(key => <td key={key} className="py-2">{item[key]}</td>)}
                <td className="py-2 flex space-x-2">
                  <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(item)}><FaEdit /></button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(item.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{formData.id ? 'Edit' : 'Add'} {title}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {keys.filter(key => key !== "employeeCount").map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{key}</label>
                  <input
                    type="text"
                    placeholder={key}
                    className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    value={formData[key] || ""}
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700">
                  {loading ? <FaSpinner className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this item?</p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && <div className="text-yellow-500">Processing...</div>} {/* Show loading indicator */}
    </div>
  );
}

function MonthlyWorkHoursSection({ data, setData }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state for actions
  const [fetching, setFetching] = useState(true); // Add fetching state for initial data load

  const monthOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchMonthlyWorkHours = () => {
    setFetching(true);
    axios.get(`${backEndURL}/api/monthly-work-hours`)
      .then(response => {
        const workHoursData = Array.isArray(response.data?.data) ? response.data.data : [];
        const sortedData = workHoursData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
        setData(sortedData); // Ensure data is sorted by month
      })
      .catch(error => console.error("Error fetching monthly work hours:", error))
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    fetchMonthlyWorkHours(); // Fetch data on component mount
  }, []);

  const handleAdd = () => {
    setIsFormOpen(true);
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const request = formData.id
      ? axios.put(`${backEndURL}/api/monthly-work-hours/${formData.id}`, formData) // Update existing entry
      : axios.post(`${backEndURL}/api/monthly-work-hours`, formData); // Add new entry

    request
      .then(() => {
        fetchMonthlyWorkHours(); // Refetch data after save
        setIsFormOpen(false);
      })
      .catch(error => console.error("Error saving monthly work hours:", error))
      .finally(() => setLoading(false));
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      setLoading(true);
      axios.delete(`${backEndURL}/api/monthly-work-hours/${itemToDelete}`)
        .then(() => {
          fetchMonthlyWorkHours(); // Refetch data after delete
          setShowDeleteConfirm(false);
        })
        .catch(error => console.error("Error deleting monthly work hours:", error))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Monthly Work Hours</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Month
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="border-b py-2">MONTH</th>
              <th className="border-b py-2">WORK HOURS</th>
              <th className="border-b py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  <DotSpinner /> {/* Show loader while fetching */}
                </td>
              </tr>
            ) : (
              Array.isArray(data) && data.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.month}</td>
                  <td className="py-2">{item.workHours}</td>
                  <td className="py-2 flex space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => confirmDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{formData.id ? 'Edit' : 'Add'} Month</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <input
                  type="text"
                  placeholder="Month"
                  className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  value={formData.month || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Work Hours</label>
                <input
                  type="number"
                  placeholder="Work Hours"
                  className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
                  value={formData.workHours || ""}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this item?</p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
