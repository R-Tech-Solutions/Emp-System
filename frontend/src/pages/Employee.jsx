"use client";

import { useState, useRef, useEffect } from "react";
import { PlusCircle, Trash2, Upload, User, Plus, Edit2, ChevronDown, Eye, X, Download } from "lucide-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees, deleteEmployee } from "../redux/employeeSlice";
import DotSpinner from "../loaders/Loader"; // Import the loader
import { backEndURL } from "../Backendurl";

export default function Employee() {
    const dispatch = useDispatch();
    const { employees, status, error } = useSelector((state) => state.employees);

    const [isDarkMode] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editEmployeeId, setEditEmployeeId] = useState(null);
    const [activeTab, setActiveTab] = useState("basic");
    const [dropdownOpen, setDropdownOpen] = useState({});
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [employmentStatuses, setEmploymentStatuses] = useState([]);
    const [certificateLevels, setCertificateLevels] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // State for selected employee
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [positions, setPositions] = useState([]); // Add state for positions
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [payMethods] = useState(["Hourly", "Monthly"]); // Add state for pay methods

    const [formData, setFormData] = useState({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        joinDate: "",
        position: "",
        department: "",
        address: "",
        resume: null,
        workAddress: "",
        workLocation: "",
        nicPassport: "",
        nationality: "",
        gender: "",
        dateOfBirth: "",
        country: "",
        emergencyContacts: [{ contactName: "", contactNumber: "" }],
        educationDetails: [{ certificateLevel: "", fieldOfStudy: "", schoolUniversity: "" }],
        guardianName: "",
        guardianNumber: "",
        maritalStatus: "",
        employmentType: "",
        contractPeriod: "",
        employmentStatus: "",
        profileImage: null,
        payMethod: "", // Add pay method field
        hasEpfEtf: "", // Add EPF/ETF field
        hourlyRate: "", // Add hourly rate field
        overtimeHourlyRate: "", // Add overtime hourly rate field
        monthlySalary: "", // Add monthly salary field
        epfNumber: "", // Add EPF number field
        bankName: "", // Add bank name field
        bankBranch: "", // Add bank branch field
        bankNumber: "", // Add bank number field
    });

    const [errors, setErrors] = useState({});
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        // Apply dark mode to document body
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${backEndURL}/api/departments`);

                setDepartments(response.data.map(department => department.name));
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchDepartments();
    }, []);

    useEffect(() => {
        const fetchEmploymentTypes = async () => {
            try {
                const response = await axios.get(`${backEndURL}/api/employment-types`);
            
                setEmploymentTypes(response.data.map(type => type.type || type.Type)); // Adjust mapping based on actual field name
            } catch (error) {
                console.error("Error fetching employment types:", error);
            }
        };

        fetchEmploymentTypes();
    }, []);

    useEffect(() => {
        const fetchEmploymentStatuses = async () => {
            try {
                const response = await axios.get(`${backEndURL}/api/employment-status`);
                setEmploymentStatuses(response.data.map(status => status.status)); // Map only the 'status' field
            } catch (error) {
                console.error("Error fetching employment statuses:", error);
            }
        };

        fetchEmploymentStatuses();
    }, []);

    useEffect(() => {
        const fetchCertificateLevels = async () => {
            try {
                const response = await axios.get(`${backEndURL}/api/certificate-levels`);
                setCertificateLevels(response.data.map(level => level.level)); // Map only the 'level' field
            } catch (error) {
                console.error("Error fetching certificate levels:", error);
            }
        };

        fetchCertificateLevels();
    }, []);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchEmployees());
        }
    }, [status, dispatch]);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await axios.get(`${backEndURL}/api/positions`);
                setPositions(response.data.map(position => position.title)); // Map to position titles
            } catch (error) {
                console.error("Error fetching positions:", error);
            }
        };

        fetchPositions();
    }, []);

    const generateEmployeeId = () => {
        if (!employees.length) return 'EMP001';

        const maxId = employees
            .map(emp => parseInt(emp.employeeId.replace('EMP', '')))
            .reduce((max, current) => Math.max(max, current), 0);

        return `EMP${String(maxId + 1).padStart(3, '0')}`;
    };

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchEmployees());
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (!isEditMode && showAddForm) {
            setFormData(prevData => ({
                ...prevData,
                employeeId: generateEmployeeId()
            }));
        }
    }, [showAddForm, isEditMode, employees]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        // Prevent manual editing of employeeId
        if (name === 'employeeId') return;

        if (type === "file") {
            if (name === "profileImage" && files[0]) {
                setPreviewImage(URL.createObjectURL(files[0]));
            }

            setFormData({
                ...formData,
                [name]: files[0],
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleEmergencyContactChange = (index, field, value) => {
        const updatedContacts = [...formData.emergencyContacts];
        updatedContacts[index] = {
            ...updatedContacts[index],
            [field]: value,
        };

        setFormData({
            ...formData,
            emergencyContacts: updatedContacts,
        });
    };

    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...formData.educationDetails];
        updatedEducation[index] = {
            ...updatedEducation[index],
            [field]: value,
        };

        setFormData({
            ...formData,
            educationDetails: updatedEducation,
        });
    };

    const addEmergencyContact = () => {
        setFormData({
            ...formData,
            emergencyContacts: [...formData.emergencyContacts, { contactName: "", contactNumber: "" }],
        });
    };

    const removeEmergencyContact = (index) => {
        const updatedContacts = [...formData.emergencyContacts];
        updatedContacts.splice(index, 1);
        setFormData({
            ...formData,
            emergencyContacts: updatedContacts,
        });
    };

    const addEducationDetail = () => {
        setFormData({
            ...formData,
            educationDetails: [
                ...formData.educationDetails,
                { certificateLevel: "", fieldOfStudy: "", schoolUniversity: "" },
            ],
        });
    };

    const removeEducationDetail = (index) => {
        const updatedEducation = [...formData.educationDetails];
        updatedEducation.splice(index, 1);
        setFormData({
            ...formData,
            educationDetails: updatedEducation,
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        if (formData.hasEpfEtf === "Yes" && !formData.epfNumber) {
            newErrors.epfNumber = "EPF number is required if EPF/ETF is Yes";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true); // Set loading to true
            try {
                const updatedFormData = { ...formData };

                // Convert profile image to Base64 if it exists and is a valid File object
                if (formData.profileImage instanceof File) {
                    updatedFormData.profileImage = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64 string
                        reader.onerror = reject;
                        reader.readAsDataURL(formData.profileImage);
                    });
                }

                // Convert resume to Base64 if it exists and is a valid File object
                if (formData.resume instanceof File) {
                    updatedFormData.resume = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64 string
                        reader.onerror = reject;
                        reader.readAsDataURL(formData.resume);
                    });
                }

                if (isEditMode) {
                    await axios.put(`${backEndURL}/api/employees/${editEmployeeId}`, updatedFormData);
                    dispatch(fetchEmployees()); // Refresh employees from Redux after update
                    setIsEditMode(false);
                    setEditEmployeeId(null);
                } else {
                    await axios.post(`${backEndURL}/api/employees`, updatedFormData);
                    dispatch(fetchEmployees()); // Refresh employees from Redux after creation
                    resetForm(); // Reset the form fields
                    setShowAddForm(false); // Close the form
                    window.location.reload(); // Refresh the page
                }
            } catch (error) {
                console.error("Error submitting form:", error.response);
            } finally {
                setIsLoading(false); // Set loading to false
            }
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
            joinDate: "",
            position: "",
            department: "",
            address: "",
            resume: null,
            workAddress: "",
            workLocation: "",
            nicPassport: "",
            nationality: "",
            gender: "",
            dateOfBirth: "",
            country: "",
            emergencyContacts: [{ contactName: "", contactNumber: "" }],
            educationDetails: [{ certificateLevel: "", fieldOfStudy: "", schoolUniversity: "" }],
            guardianName: "",
            guardianNumber: "",
            maritalStatus: "",
            employmentType: "",
            contractPeriod: "",
            employmentStatus: "",
            profileImage: null,
            payMethod: "", // Add pay method field
            hasEpfEtf: "", // Add EPF/ETF field
            hourlyRate: "", // Add hourly rate field
            overtimeHourlyRate: "", // Add overtime hourly rate field
            monthlySalary: "", // Add monthly salary field
            epfNumber: "", // Add EPF number field
            bankName: "", // Reset bank name field
            bankBranch: "", // Reset bank branch field
            bankNumber: "", // Reset bank number field
        });
        setPreviewImage(null);
        setErrors({});
        setShowAddForm(false); // Close the form
    };

    const handleRemoveAllFields = () => {
        resetForm(); // Reset the form
    };

    const handleEditEmployee = (employee) => {
        setIsEditMode(true);
        setEditEmployeeId(employee.id);
        setShowAddForm(true);
        setActiveTab("basic");

        setFormData({
            ...employee,
            profileImage: null, // Reset profileImage for new upload
            bankName: employee.bankName || "", // Populate bank name
            bankBranch: employee.bankBranch || "", // Populate bank branch
            bankNumber: employee.bankNumber || "", // Populate bank number
        });

        if (employee.profileImage) {
            setPreviewImage(employee.profileImage); // Use the profileImage URL for preview
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            dispatch(deleteEmployee(employeeId));
        }
    };

    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee); // Set the selected employee to display all details
    };

    const closeOverlay = () => {
        setSelectedEmployee(null);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const toggleDropdown = (name) => {
        setDropdownOpen({
            ...dropdownOpen,
            [name]: !dropdownOpen[name],
        });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredEmployees = employees.filter(
        (employee) =>
            employee.employeeId.toLowerCase().includes(searchQuery) ||
            `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery)
    );

    const countries = [
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
        "Germany",
        "France",
        "India",
        "China",
        "Japan",
        "Brazil",
        "South Africa",
    ];

    const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

    // Custom dropdown component 
    const CustomDropdown = ({ name, value, options, placeholder, onChange }) => {
        const isOpen = dropdownOpen[name] || false;

        return (
            <div className="relative">
                <div
                    className={`flex justify-between items-center px-3 py-2 border rounded-md cursor-pointer ${isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
                        }`}
                    onClick={() => toggleDropdown(name)}
                >
                    <span className={!value ? "text-gray-500 dark:text-gray-400" : ""}>{value || placeholder}</span>
                    <ChevronDown className="h-4 w-4" />
                </div>

                {isOpen && (
                    <div
                        className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                            }`}
                    >
                        <ul className="py-1 max-h-60 overflow-auto">
                            {options.map((option, index) => (
                                <li
                                    key={`${name}-${index}`} // Add a unique key
                                    className={`px-3 py-2 cursor-pointer ${isDarkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                    onClick={() => {
                                        onChange(name, option);
                                        toggleDropdown(name);
                                    }}
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    // Custom radio button component
    const CustomRadio = ({ id, name, value, checked, onChange, label }) => {
        return (
            <div className="flex items-center space-x-2">
                <input
                    id={id}
                    type="radio"
                    name={name}
                    value={value}
                    checked={checked}
                    onChange={() => onChange(name, value)}
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            </div>
        );
    };

    const handleDownloadResume = (base64String, fileName) => {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${base64String}`;
        link.download = fileName || "resume.pdf";
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Overlay for viewing employee details */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className={`relative w-full max-w-5xl mx-4 p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] transition-all duration-300 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
                        <button
                            onClick={closeOverlay}
                            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-4xl font-extrabold mb-8 text-center tracking-tight">Employee Profile</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Header */}
                            <div className="md:col-span-2 flex items-center gap-6 border-b pb-6 mb-6">
                                {selectedEmployee.profileImage && (
                                    <img
                                        src={selectedEmployee.profileImage}
                                        alt="Profile"
                                        className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-md"
                                    />
                                )}
                                <div>
                                    <h3 className="text-2xl font-semibold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID: {selectedEmployee.employeeId}</p>
                                    {selectedEmployee.resume && (
                                        <button
                                            onClick={() => handleDownloadResume(selectedEmployee.resume, `${selectedEmployee.firstName}_resume.pdf`)}
                                            className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            <Download className="h-5 w-5 mr-1" /> Download Resume
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div><span className="font-medium">Email:</span> {selectedEmployee.email}</div>
                            <div><span className="font-medium">Phone:</span> {selectedEmployee.phoneNumber}</div>
                            <div><span className="font-medium">Date of Birth:</span> {selectedEmployee.dateOfBirth}</div>
                            <div><span className="font-medium">Gender:</span> {selectedEmployee.gender}</div>
                            <div><span className="font-medium">Nationality:</span> {selectedEmployee.nationality}</div>
                            <div><span className="font-medium">NIC/Passport:</span> {selectedEmployee.nicPassport}</div>
                            <div><span className="font-medium">Marital Status:</span> {selectedEmployee.maritalStatus}</div>
                            <div><span className="font-medium">Country:</span> {selectedEmployee.country}</div>
                            <div className="md:col-span-2"><span className="font-medium">Address:</span> {selectedEmployee.address}</div>

                            {/* Job Info */}
                            <div><span className="font-medium">Join Date:</span> {selectedEmployee.joinDate}</div>
                            <div><span className="font-medium">Position:</span> {selectedEmployee.position}</div>
                            <div><span className="font-medium">Department:</span> {selectedEmployee.department}</div>
                            <div><span className="font-medium">Work Location:</span> {selectedEmployee.workLocation}</div>
                            <div className="md:col-span-2"><span className="font-medium">Work Address:</span> {selectedEmployee.workAddress}</div>
                            <div><span className="font-medium">Employment Type:</span> {selectedEmployee.employmentType}</div>
                            <div><span className="font-medium">Contract Period:</span> {selectedEmployee.contractPeriod}</div>
                            <div><span className="font-medium">Employment Status:</span> {selectedEmployee.employmentStatus}</div>
                            <div><span className="font-medium">Pay Method:</span> {selectedEmployee.payMethod}</div>
                            <div><span className="font-medium">Hourly Rate:</span> {selectedEmployee.hourlyRate}</div>
                            <div><span className="font-medium">Overtime Rate:</span> {selectedEmployee.overtimeHourlyRate}</div>
                            <div><span className="font-medium">Monthly Salary:</span> {selectedEmployee.monthlySalary}</div>
                            <div><span className="font-medium">EPF/ETF:</span> {selectedEmployee.hasEpfEtf}</div>
                            {selectedEmployee.hasEpfEtf === "Yes" && (
                                <div><span className="font-medium">EPF Number:</span> {selectedEmployee.epfNumber}</div>
                            )}

                            {/* Emergency Contacts */}
                            <div className="md:col-span-2 border-t pt-6">
                                <h4 className="font-semibold mb-2">Emergency Contacts:</h4>
                                <ul className="list-disc ml-6 space-y-1">
                                    {selectedEmployee.emergencyContacts.map((contact, index) => (
                                        <li key={index}>{contact.contactName} - {contact.contactNumber}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Education */}
                            <div className="md:col-span-2 border-t pt-6">
                                <h4 className="font-semibold mb-2">Education Details:</h4>
                                <ul className="list-disc ml-6 space-y-1">
                                    {selectedEmployee.educationDetails.map((education, index) => (
                                        <li key={index}>
                                            {education.certificateLevel} in {education.fieldOfStudy} from {education.schoolUniversity}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bank Details */}
                            <div className="md:col-span-2 border-t pt-6">
                                <h4 className="font-semibold mb-2">Bank Details:</h4>
                                <div><span className="font-medium">Bank Name:</span> {selectedEmployee.bankName}</div>
                                <div><span className="font-medium">Bank Branch:</span> {selectedEmployee.bankBranch}</div>
                                <div><span className="font-medium">Account Number:</span> {selectedEmployee.bankNumber}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Management System</h1>
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search by ID or Name"
                            value={searchQuery}
                            onChange={handleSearch}
                            className={`px-4 py-2 rounded-md ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"}`}
                        />
                        <button
                            onClick={() => {
                                if (isEditMode) {
                                    setIsEditMode(false);
                                    setEditEmployeeId(null);
                                    resetForm();
                                } else {
                                    setShowAddForm(!showAddForm);
                                }
                            }}
                            className={`flex items-center px-4 py-2 rounded-md ${isDarkMode
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            {isEditMode ? "Cancel Edit" : showAddForm ? "Cancel" : "Add Employee"}
                            {!showAddForm && !isEditMode && <Plus className="ml-2 h-4 w-4" />}
                        </button>
                        {showAddForm && (
                            <button
                                onClick={handleRemoveAllFields}
                                className={`flex items-center px-4 py-2 rounded-md ${isDarkMode
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                    }`}
                            >
                                Remove All Fields
                            </button>
                        )}
                    </div>
                </div>

                {(showAddForm || isEditMode) && (
                    <div
                        className={`mb-8 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                            }`}
                    >
                        <div className="p-6 border-b dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEditMode ? "Edit Employee" : "Add New Employee"}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {isEditMode ? "Update employee information" : "Fill in the details to add a new employee to the system"}
                            </p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative w-32 h-32 mb-4 cursor-pointer group" onClick={triggerFileInput}>
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-900 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                            {previewImage ? (
                                                <img
                                                    src={previewImage || "/placeholder.svg"}
                                                    alt="Profile Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        id="profileImage"
                                        name="profileImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload profile image</span>
                                    {errors.profileImage && (
                                        <p className="text-red-500 text-sm mt-1">{errors.profileImage}</p>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="border-b dark:border-gray-700">
                                    <div className="flex space-x-8">
                                        {["basic", "employment", "personal", "additional"].map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                className={`py-2 px-1 font-medium text-sm border-b-2 ${activeTab === tab
                                                    ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                    }`}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)} Info
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Basic Info Tab */}
                                {activeTab === "basic" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label
                                                htmlFor="employeeId"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Employee ID
                                            </label>
                                            <input
                                                id="employeeId"
                                                name="employeeId"
                                                value={formData.employeeId}
                                                onChange={handleChange}
                                                readOnly
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border cursor-not-allowed`}
                                            />
                                            {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="firstName"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                First Name
                                            </label>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } ${errors.firstName ? "border-red-500" : "border"}`}
                                            />
                                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="lastName"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Last Name
                                            </label>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } ${errors.lastName ? "border-red-500" : "border"}`}
                                            />
                                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } ${errors.email ? "border-red-500" : "border"}`}
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        {!isEditMode && (
                                            <>
                                                <div>
                                                    <label
                                                        htmlFor="password"
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                    >
                                                        Password (Min 8 characters)
                                                    </label>
                                                    <div className="flex">
                                                        <input
                                                            id="password"
                                                            name="password"
                                                            type={passwordVisible ? "text" : "password"}
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            className={`w-full px-3 py-2 rounded-l-md ${isDarkMode
                                                                ? "bg-gray-700 border-gray-600 text-white"
                                                                : "bg-white border-gray-300 text-gray-700"
                                                                } ${errors.password ? "border-red-500" : "border"}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={`px-3 rounded-r-md border-l-0 ${isDarkMode
                                                                ? "bg-gray-600 border-gray-600 text-gray-200 hover:bg-gray-500"
                                                                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                                                                } border`}
                                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                                        >
                                                            {passwordVisible ? "Hide" : "Show"}
                                                        </button>
                                                    </div>
                                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="confirmPassword"
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                    >
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-white border-gray-300 text-gray-700"
                                                            } ${errors.confirmPassword ? "border-red-500" : "border"}`}
                                                    />
                                                    {errors.confirmPassword && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label
                                                htmlFor="phoneNumber"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Phone Number
                                            </label>
                                            <input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                placeholder="07x xxx xxxx"
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } ${errors.phoneNumber ? "border-red-500" : "border"}`}
                                            />
                                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="joinDate"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Join Date
                                            </label>
                                            <input
                                                id="joinDate"
                                                name="joinDate"
                                                type="date"
                                                value={formData.joinDate}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Employment Tab */}
                                {activeTab === "employment" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label
                                                htmlFor="position"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Position
                                            </label>
                                            <CustomDropdown
                                                name="position"
                                                value={formData.position}
                                                options={positions}
                                                placeholder="Select position"
                                                onChange={handleSelectChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Department
                                            </label>
                                            <CustomDropdown
                                                name="department"
                                                value={formData.department}
                                                options={departments}
                                                placeholder="Select department"
                                                onChange={handleSelectChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Employment Type
                                            </label>
                                            <CustomDropdown
                                                name="employmentType"
                                                value={formData.employmentType}
                                                options={employmentTypes}
                                                placeholder="Select type"
                                                onChange={handleSelectChange}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="contractPeriod"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Contract Period (Months)
                                            </label>
                                            <input
                                                id="contractPeriod"
                                                name="contractPeriod"
                                                type="number"
                                                value={formData.contractPeriod}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Employment Status
                                            </label>
                                            <CustomDropdown
                                                name="employmentStatus"
                                                value={formData.employmentStatus}
                                                options={employmentStatuses}
                                                placeholder="Select status"
                                                onChange={handleSelectChange}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="workLocation"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Work Location
                                            </label>
                                            <input
                                                id="workLocation"
                                                name="workLocation"
                                                value={formData.workLocation}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label
                                                htmlFor="workAddress"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Work Address
                                            </label>
                                            <textarea
                                                id="workAddress"
                                                name="workAddress"
                                                value={formData.workAddress}
                                                onChange={handleChange}
                                                rows="3"
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label
                                                htmlFor="address"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Home Address
                                            </label>
                                            <textarea
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows="3"
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="resume"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Resume (PDF/DOC/DOCX, Max 5MB)
                                            </label>
                                            <input
                                                id="resume"
                                                name="resume"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Pay Method
                                            </label>
                                            <CustomDropdown
                                                name="payMethod"
                                                value={formData.payMethod}
                                                options={payMethods}
                                                placeholder="Select pay method"
                                                onChange={handleSelectChange}
                                            />
                                        </div>

                                        {formData.payMethod === "Hourly" && (
                                            <div>
                                                <label
                                                    htmlFor="hourlyRate"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                >
                                                    Hourly Rate (Amount per Hour)
                                                </label>
                                                <input
                                                    id="hourlyRate"
                                                    name="hourlyRate"
                                                    type="number"
                                                    value={formData.hourlyRate}
                                                    onChange={handleChange}
                                                    placeholder="Enter hourly rate"
                                                    className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                        ? "bg-gray-700 border-gray-600 text-white"
                                                        : "bg-white border-gray-300 text-gray-700"
                                                        } border`}
                                                />
                                            </div>
                                        )}

                                        {(formData.payMethod === "Hourly" || formData.payMethod === "Monthly") && (
                                            <div>
                                                <label
                                                    htmlFor="overtimeHourlyRate"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                >
                                                    Overtime Hourly Rate
                                                </label>
                                                <input
                                                    id="overtimeHourlyRate"
                                                    name="overtimeHourlyRate"
                                                    type="number"
                                                    value={formData.overtimeHourlyRate}
                                                    onChange={handleChange}
                                                    placeholder="Enter overtime hourly rate"
                                                    className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                        ? "bg-gray-700 border-gray-600 text-white"
                                                        : "bg-white border-gray-300 text-gray-700"
                                                        } border`}
                                                />
                                            </div>
                                        )}

                                        {formData.payMethod === "Monthly" && (
                                            <div>
                                                <label
                                                    htmlFor="monthlySalary"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                >
                                                    Monthly Salary
                                                </label>
                                                <input
                                                    id="monthlySalary"
                                                    name="monthlySalary"
                                                    type="number"
                                                    value={formData.monthlySalary}
                                                    onChange={handleChange}
                                                    placeholder="Enter monthly salary"
                                                    className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                        ? "bg-gray-700 border-gray-600 text-white"
                                                        : "bg-white border-gray-300 text-gray-700"
                                                        } border`}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                EPF/ETF
                                            </label>
                                            <div className="flex space-x-4 mt-2">
                                                <CustomRadio
                                                    id="epfEtfYes"
                                                    name="hasEpfEtf"
                                                    value="Yes"
                                                    checked={formData.hasEpfEtf === "Yes"}
                                                    onChange={handleSelectChange}
                                                    label="Yes"
                                                />
                                                <CustomRadio
                                                    id="epfEtfNo"
                                                    name="hasEpfEtf"
                                                    value="No"
                                                    checked={formData.hasEpfEtf === "No"}
                                                    onChange={handleSelectChange}
                                                    label="No"
                                                />
                                            </div>
                                        </div>

                                        {formData.hasEpfEtf === "Yes" && (
                                            <div>
                                                <label
                                                    htmlFor="epfNumber"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                >
                                                    EPF Number
                                                </label>
                                                <input
                                                    id="epfNumber"
                                                    name="epfNumber"
                                                    value={formData.epfNumber}
                                                    onChange={handleChange}
                                                    placeholder="Enter EPF number"
                                                    className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                        ? "bg-gray-700 border-gray-600 text-white"
                                                        : "bg-white border-gray-300 text-gray-700"
                                                        } ${errors.epfNumber ? "border-red-500" : "border"}`}
                                                />
                                                {errors.epfNumber && <p className="text-red-500 text-sm mt-1">{errors.epfNumber}</p>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Personal Tab */}
                                {activeTab === "personal" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                            <div className="flex space-x-4 mt-2">
                                                <CustomRadio
                                                    id="male"
                                                    name="gender"
                                                    value="Male"
                                                    checked={formData.gender === "Male"}
                                                    onChange={handleSelectChange}
                                                    label="Male"
                                                />
                                                <CustomRadio
                                                    id="female"
                                                    name="gender"
                                                    value="Female"
                                                    checked={formData.gender === "Female"}
                                                    onChange={handleSelectChange}
                                                    label="Female"
                                                />
                                                <CustomRadio
                                                    id="other"
                                                    name="gender"
                                                    value="Other"
                                                    checked={formData.gender === "Other"}
                                                    onChange={handleSelectChange}
                                                    label="Other"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="dateOfBirth"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Date of Birth
                                            </label>
                                            <input
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="nicPassport"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                NIC or Passport
                                            </label>
                                            <input
                                                id="nicPassport"
                                                name="nicPassport"
                                                value={formData.nicPassport}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="nationality"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Nationality
                                            </label>
                                            <input
                                                id="nationality"
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="country"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Country
                                            </label>
                                            <input
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Marital Status
                                            </label>
                                            <CustomDropdown
                                                name="maritalStatus"
                                                value={formData.maritalStatus}
                                                options={maritalStatuses}
                                                placeholder="Select status"
                                                onChange={handleSelectChange}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="bankName"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Bank Name
                                            </label>
                                            <input
                                                id="bankName"
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="bankBranch"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Bank Branch
                                            </label>
                                            <input
                                                id="bankBranch"
                                                name="bankBranch"
                                                value={formData.bankBranch}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="bankNumber"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                            >
                                                Bank Number
                                            </label>
                                            <input
                                                id="bankNumber"
                                                name="bankNumber"
                                                value={formData.bankNumber}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-700"
                                                    } border`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Additional Tab */}
                                {activeTab === "additional" && (
                                    <div className="space-y-6">
                                        {/* Family Status */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Family Status</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label
                                                        htmlFor="guardianName"
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                    >
                                                        Guardian Name (Optional)
                                                    </label>
                                                    <input
                                                        id="guardianName"
                                                        name="guardianName"
                                                        value={formData.guardianName}
                                                        onChange={handleChange}
                                                        className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-white border-gray-300 text-gray-700"
                                                            } border`}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="guardianNumber"
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                    >
                                                        Guardian Number (Optional)
                                                    </label>
                                                    <input
                                                        id="guardianNumber"
                                                        name="guardianNumber"
                                                        value={formData.guardianNumber}
                                                        onChange={handleChange}
                                                        placeholder="07x xxx xxxx"
                                                        className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-white border-gray-300 text-gray-700"
                                                            } border`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Contacts */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Emergency Contacts</h3>
                                                <button
                                                    type="button"
                                                    onClick={addEmergencyContact}
                                                    className={`flex items-center px-3 py-1 text-sm rounded-md ${isDarkMode
                                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                                                        }`}
                                                >
                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                    Add Contact
                                                </button>
                                            </div>

                                            {formData.emergencyContacts.map((contact, index) => (
                                                <div
                                                    key={index}
                                                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-gray-50 border border-gray-200"
                                                        }`}
                                                >
                                                    <div>
                                                        <label
                                                            htmlFor={`contactName-${index}`}
                                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                        >
                                                            Contact Name
                                                        </label>
                                                        <input
                                                            id={`contactName-${index}`}
                                                            value={contact.contactName}
                                                            onChange={(e) => handleEmergencyContactChange(index, "contactName", e.target.value)}
                                                            className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                                ? "bg-gray-600 border-gray-500 text-white"
                                                                : "bg-white border-gray-300 text-gray-700"
                                                                } border`}
                                                        />
                                                    </div>

                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <label
                                                                htmlFor={`contactNumber-${index}`}
                                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                            >
                                                                Contact Number
                                                            </label>
                                                            <input
                                                                id={`contactNumber-${index}`}
                                                                value={contact.contactNumber}
                                                                onChange={(e) => handleEmergencyContactChange(index, "contactNumber", e.target.value)}
                                                                placeholder="07x xxx xxxx"
                                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                                    ? "bg-gray-600 border-gray-500 text-white"
                                                                    : "bg-white border-gray-300 text-gray-700"
                                                                    } border`}
                                                            />
                                                        </div>

                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEmergencyContact(index)}
                                                                className={`p-2 rounded-md ${isDarkMode
                                                                    ? "bg-red-900 hover:bg-red-800 text-red-200"
                                                                    : "bg-red-100 hover:bg-red-200 text-red-700"
                                                                    }`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Education Details */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Education Details</h3>
                                                <button
                                                    type="button"
                                                    onClick={addEducationDetail}
                                                    className={`flex items-center px-3 py-1 text-sm rounded-md ${isDarkMode
                                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                                                        }`}
                                                >
                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                    Add Education
                                                </button>
                                            </div>

                                            {formData.educationDetails.map((education, index) => (
                                                <div
                                                    key={index}
                                                    className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-md ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-gray-50 border border-gray-200"
                                                        }`}
                                                >
                                                    <div>
                                                        <label
                                                            htmlFor={`certificateLevel-${index}`}
                                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                        >
                                                            Certificate Level
                                                        </label>
                                                        <CustomDropdown
                                                            name={`certificateLevel-${index}`}
                                                            value={education.certificateLevel}
                                                            options={certificateLevels}
                                                            placeholder="Select level"
                                                            onChange={(_, value) => handleEducationChange(index, "certificateLevel", value)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor={`fieldOfStudy-${index}`}
                                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                        >
                                                            Field of Study
                                                        </label>
                                                        <input
                                                            id={`fieldOfStudy-${index}`}
                                                            value={education.fieldOfStudy}
                                                            onChange={(e) => handleEducationChange(index, "fieldOfStudy", e.target.value)}
                                                            className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                                ? "bg-gray-600 border-gray-500 text-white"
                                                                : "bg-white border-gray-300 text-gray-700"
                                                                } border`}
                                                        />
                                                    </div>

                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <label
                                                                htmlFor={`schoolUniversity-${index}`}
                                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                            >
                                                                School/University
                                                            </label>
                                                            <input
                                                                id={`schoolUniversity-${index}`}
                                                                value={education.schoolUniversity}
                                                                onChange={(e) => handleEducationChange(index, "schoolUniversity", e.target.value)}
                                                                className={`w-full px-3 py-2 rounded-md ${isDarkMode
                                                                    ? "bg-gray-600 border-gray-500 text-white"
                                                                    : "bg-white border-gray-300 text-gray-700"
                                                                    } border`}
                                                            />
                                                        </div>

                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducationDetail(index)}
                                                                className={`p-2 rounded-md ${isDarkMode
                                                                    ? "bg-red-900 hover:bg-red-800 text-red-200"
                                                                    : "bg-red-100 hover:bg-red-200 text-red-700"
                                                                    }`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${isDarkMode
                                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                                        : "bg-purple-600 hover:bg-purple-700 text-white"
                                        }`}
                                    disabled={isLoading} // Disable button while loading
                                >
                                    {isLoading ? <DotSpinner /> : isEditMode ? "Update Employee" : "Add Employee"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Employee Table */}
                <div
                    className={`rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                        }`}
                >
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Details</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your employees and their information</p>
                    </div>
                    <div className="p-6">
                        {status === 'loading' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '10px', justifyContent: 'center' }}>
                                <DotSpinner />
                            </div>
                        ) : error ? (
                            <p>Error: {error}</p>
                        ) : filteredEmployees.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-100"}>
                                        <tr>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Profile
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Employee ID
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Name
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Email
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                NIC/Passport
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Position
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Department
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Status
                                            </th>
                                            <th
                                                className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredEmployees.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className={`border-b ${isDarkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                        {employee.profileImage ? (
                                                            <img
                                                                src={employee.profileImage} // Use the profileImage URL directly
                                                                alt={`${employee.firstName || ''} ${employee.lastName || ''}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                                {(employee.firstName?.charAt(0) || '') + (employee.lastName?.charAt(0) || '')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-4 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                    {employee.employeeId}
                                                </td>
                                                <td className={isDarkMode ? "px-4 py-4 text-gray-300" : "px-4 py-4 text-gray-700"}>
                                                    {`${employee.firstName} ${employee.lastName}`}
                                                </td>
                                                <td className={isDarkMode ? "px-4 py-4 text-gray-300" : "px-4 py-4 text-gray-700"}>
                                                    {employee.email}
                                                </td>
                                                <td className={isDarkMode ? "px-4 py-4 text-gray-300" : "px-4 py-4 text-gray-700"}>
                                                    {employee.nicPassport}
                                                </td>
                                                <td className={isDarkMode ? "px-4 py-4 text-gray-300" : "px-4 py-4 text-gray-700"}>
                                                    {employee.position}
                                                </td>
                                                <td className={isDarkMode ? "px-4 py-4 text-gray-300" : "px-4 py-4 text-gray-700"}>
                                                    {employee.department}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${employee.employmentStatus === "Active"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : employee.employmentStatus === "Inactive"
                                                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                                : employee.employmentStatus === "On Leave"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}
                                                    >
                                                        {employee.employmentStatus}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewEmployee(employee)}
                                                            className={`p-1 rounded-md ${isDarkMode ? "bg-green-900 hover:bg-green-800 text-green-200" : "bg-green-100 hover:bg-green-200 text-green-700"}`}
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditEmployee(employee)}
                                                            className={`p-1 rounded-md ${isDarkMode
                                                                ? "bg-blue-900 hover:bg-blue-800 text-blue-200"
                                                                : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                                                                }`}
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEmployee(employee.id)}
                                                            className={`p-1 rounded-md ${isDarkMode
                                                                ? "bg-red-900 hover:bg-red-800 text-red-200"
                                                                : "bg-red-100 hover:bg-red-200 text-red-700"
                                                                }`}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <User className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No employees yet</h3>
                                <p>Click the "Add Employee" button to add your first employee.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

