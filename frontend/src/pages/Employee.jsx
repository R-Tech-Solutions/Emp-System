"use client";

import { useState, useRef, useEffect } from "react";
import { PlusCircle, Trash2, Upload, User, Plus, Edit2, ChevronDown, Eye, X, Download } from "lucide-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees, deleteEmployee } from "../redux/employeeSlice";
import DotSpinner from "../loaders/Loader"; // Import the loader
import { backEndURL } from "../Backendurl";
import { hasPermission } from '../utils/auth';

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
            if (name === "profileImages" && files[0]) {
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
                if (formData.profileImages instanceof File) {
                    updatedFormData.profileImages = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64 string
                        reader.onerror = reject;
                        reader.readAsDataURL(formData.profileImages);
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
            profileImages: null,
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
            profileImages: null, // Reset profileImage for new upload
            bankName: employee.bankName || "", // Populate bank name
            bankBranch: employee.bankBranch || "", // Populate bank branch
            bankNumber: employee.bankNumber || "", // Populate bank number
        });

        if (employee.profileImages) {
            setPreviewImage(employee.profileImages); // Use the profileImage URL for preview
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
        <div className="min-h-screen bg-background text-text-primary">
            {/* Overlay for viewing employee details */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="relative w-full max-w-5xl mx-4 p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] bg-surface">
                        <button
                            onClick={closeOverlay}
                            className="absolute top-4 right-4 p-2 rounded-full bg-primary-light hover:bg-primary text-text-primary"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-4xl font-extrabold mb-8 text-center tracking-tight text-text-primary">Employee Profile</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Header */}
                            <div className="md:col-span-2 flex items-center gap-6 border-b border-border pb-6 mb-6">
                                {selectedEmployee.profileImages && (
                                    <img
                                        src={selectedEmployee.profileImages}
                                        alt="Profile"
                                        className="w-28 h-28 rounded-full border-4 border-primary shadow-md"
                                    />
                                )}
                                <div>
                                    <h3 className="text-2xl font-semibold text-text-primary">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                                    <p className="text-sm text-text-secondary">Employee ID: {selectedEmployee.employeeId}</p>
                                    {selectedEmployee.resume && (
                                        <button
                                            onClick={() => handleDownloadResume(selectedEmployee.resume, `${selectedEmployee.firstName}_resume.pdf`)}
                                            className="mt-2 inline-flex items-center text-primary hover:text-primary-dark font-medium"
                                        >
                                            <Download className="h-5 w-5 mr-1" /> Download Resume
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div><span className="font-medium text-text-primary">Email:</span> <span className="text-text-secondary">{selectedEmployee.email}</span></div>
                            <div><span className="font-medium text-text-primary">Phone:</span> <span className="text-text-secondary">{selectedEmployee.phoneNumber}</span></div>
                            <div><span className="font-medium text-text-primary">Date of Birth:</span> <span className="text-text-secondary">{selectedEmployee.dateOfBirth}</span></div>
                            <div><span className="font-medium text-text-primary">Gender:</span> <span className="text-text-secondary">{selectedEmployee.gender}</span></div>
                            <div><span className="font-medium text-text-primary">Nationality:</span> <span className="text-text-secondary">{selectedEmployee.nationality}</span></div>
                            <div><span className="font-medium text-text-primary">NIC/Passport:</span> <span className="text-text-secondary">{selectedEmployee.nicPassport}</span></div>
                            <div><span className="font-medium text-text-primary">Marital Status:</span> <span className="text-text-secondary">{selectedEmployee.maritalStatus}</span></div>
                            <div><span className="font-medium text-text-primary">Country:</span> <span className="text-text-secondary">{selectedEmployee.country}</span></div>
                            <div className="md:col-span-2"><span className="font-medium text-text-primary">Address:</span> <span className="text-text-secondary">{selectedEmployee.address}</span></div>

                            {/* Job Info */}
                            <div><span className="font-medium text-text-primary">Join Date:</span> <span className="text-text-secondary">{selectedEmployee.joinDate}</span></div>
                            <div><span className="font-medium text-text-primary">Position:</span> <span className="text-text-secondary">{selectedEmployee.position}</span></div>
                            <div><span className="font-medium text-text-primary">Department:</span> <span className="text-text-secondary">{selectedEmployee.department}</span></div>
                            <div><span className="font-medium text-text-primary">Work Location:</span> <span className="text-text-secondary">{selectedEmployee.workLocation}</span></div>
                            <div className="md:col-span-2"><span className="font-medium text-text-primary">Work Address:</span> <span className="text-text-secondary">{selectedEmployee.workAddress}</span></div>
                            <div><span className="font-medium text-text-primary">Employment Type:</span> <span className="text-text-secondary">{selectedEmployee.employmentType}</span></div>
                            <div><span className="font-medium text-text-primary">Contract Period:</span> <span className="text-text-secondary">{selectedEmployee.contractPeriod}</span></div>
                            <div><span className="font-medium text-text-primary">Employment Status:</span> <span className="text-text-secondary">{selectedEmployee.employmentStatus}</span></div>
                            <div><span className="font-medium text-text-primary">Pay Method:</span> <span className="text-text-secondary">{selectedEmployee.payMethod}</span></div>
                            <div><span className="font-medium text-text-primary">Hourly Rate:</span> <span className="text-text-secondary">{selectedEmployee.hourlyRate}</span></div>
                            <div><span className="font-medium text-text-primary">Overtime Rate:</span> <span className="text-text-secondary">{selectedEmployee.overtimeHourlyRate}</span></div>
                            <div><span className="font-medium text-text-primary">Monthly Salary:</span> <span className="text-text-secondary">{selectedEmployee.monthlySalary}</span></div>
                            <div><span className="font-medium text-text-primary">EPF/ETF:</span> <span className="text-text-secondary">{selectedEmployee.hasEpfEtf}</span></div>
                            {selectedEmployee.hasEpfEtf === "Yes" && (
                                <div><span className="font-medium text-text-primary">EPF Number:</span> <span className="text-text-secondary">{selectedEmployee.epfNumber}</span></div>
                            )}

                            {/* Emergency Contacts */}
                            <div className="md:col-span-2 border-t border-border pt-6">
                                <h4 className="font-semibold mb-2 text-text-primary">Emergency Contacts:</h4>
                                <ul className="list-disc ml-6 space-y-1 text-text-secondary">
                                    {selectedEmployee.emergencyContacts.map((contact, index) => (
                                        <li key={index}>{contact.contactName} - {contact.contactNumber}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Education */}
                            <div className="md:col-span-2 border-t border-border pt-6">
                                <h4 className="font-semibold mb-2 text-text-primary">Education Details:</h4>
                                <ul className="list-disc ml-6 space-y-1 text-text-secondary">
                                    {selectedEmployee.educationDetails.map((education, index) => (
                                        <li key={index}>
                                            {education.certificateLevel} in {education.fieldOfStudy} from {education.schoolUniversity}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bank Details */}
                            <div className="md:col-span-2 border-t border-border pt-6">
                                <h4 className="font-semibold mb-2 text-text-primary">Bank Details:</h4>
                                <div><span className="font-medium text-text-primary">Bank Name:</span> <span className="text-text-secondary">{selectedEmployee.bankName}</span></div>
                                <div><span className="font-medium text-text-primary">Bank Branch:</span> <span className="text-text-secondary">{selectedEmployee.bankBranch}</span></div>
                                <div><span className="font-medium text-text-primary">Account Number:</span> <span className="text-text-secondary">{selectedEmployee.bankNumber}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Employee Management System</h1>
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search by ID or Name"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="px-4 py-2 rounded-md bg-surface text-text-primary border border-border"
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
                            className="flex items-center px-4 py-2 rounded-md bg-primary hover:bg-primary-dark text-white transition"
                        >
                            {isEditMode ? "Cancel Edit" : showAddForm ? "Cancel" : "Add Employee"}
                            {!showAddForm && !isEditMode && <Plus className="ml-2 h-4 w-4" />}
                        </button>
                        {showAddForm && (
                            <button
                                onClick={handleRemoveAllFields}
                                className="flex items-center px-4 py-2 rounded-md bg-accent hover:bg-primary text-text-primary transition"
                            >
                                Remove All Fields
                            </button>
                        )}
                    </div>
                </div>

                {(showAddForm || isEditMode) && (
                    <div className="mb-8 rounded-lg shadow-lg bg-surface border border-border">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-2xl font-bold text-text-primary">
                                {isEditMode ? "Edit Employee" : "Add New Employee"}
                            </h2>
                            <p className="text-text-secondary mt-1">
                                {isEditMode ? "Update employee information" : "Fill in the details to add a new employee to the system"}
                            </p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Tabs */}
                                <div className="border-b border-border">
                                    <div className="flex space-x-8">
                                        {["basic", "employment", "personal", "additional"].map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                className={`py-2 px-1 font-medium text-sm border-b-2 ${
                                                    activeTab === tab
                                                        ? "border-primary text-primary"
                                                        : "border-transparent text-text-secondary hover:text-text-primary"
                                                }`}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)} Info
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Form fields will be updated in the next edit */}
                            </form>
                        </div>
                    </div>
                )}

                {/* Employee Table */}
                <div className="rounded-lg shadow-lg bg-surface border border-border">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-text-primary">Employee Details</h2>
                        <p className="text-text-secondary mt-1">Manage your employees and their information</p>
                    </div>
                    <div className="p-6">
                        {status === 'loading' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '10px', justifyContent: 'center' }}>
                                <DotSpinner />
                            </div>
                        ) : error ? (
                            <p className="text-text-muted">Error: {error}</p>
                        ) : filteredEmployees.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-primary-light">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Profile
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Employee ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                NIC/Passport
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Position
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Department
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredEmployees.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className="border-b border-border hover:bg-primary-light/30"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
                                                        {employee.profileImages ? (
                                                            <img
                                                                src={employee.profileImages}
                                                                alt={`${employee.firstName || ''} ${employee.lastName || ''}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-medium text-text-primary">
                                                                {(employee.firstName?.charAt(0) || '') + (employee.lastName?.charAt(0) || '')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-text-primary">
                                                    {employee.employeeId}
                                                </td>
                                                <td className="px-4 py-4 text-text-secondary">
                                                    {`${employee.firstName} ${employee.lastName}`}
                                                </td>
                                                <td className="px-4 py-4 text-text-secondary">
                                                    {employee.email}
                                                </td>
                                                <td className="px-4 py-4 text-text-secondary">
                                                    {employee.nicPassport}
                                                </td>
                                                <td className="px-4 py-4 text-text-secondary">
                                                    {employee.position}
                                                </td>
                                                <td className="px-4 py-4 text-text-secondary">
                                                    {employee.department}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            employee.employmentStatus === "Active"
                                                                ? "bg-primary-light text-primary"
                                                                : employee.employmentStatus === "Inactive"
                                                                    ? "bg-accent text-primary"
                                                                    : employee.employmentStatus === "On Leave"
                                                                        ? "bg-secondary text-primary"
                                                                        : "bg-primary-light text-primary"
                                                        }`}
                                                    >
                                                        {employee.employmentStatus}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewEmployee(employee)}
                                                            className="p-1 rounded-md bg-primary-light hover:bg-primary text-primary hover:text-white transition"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        
                                                        {/* Only show edit button if user has employees permission */}
                                                        {hasPermission('employees') && (
                                                            <button
                                                                onClick={() => handleEditEmployee(employee)}
                                                                className="p-1 rounded-md bg-secondary hover:bg-primary text-primary hover:text-white transition"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        
                                                        {/* Only show delete button if user has employees permission */}
                                                        {hasPermission('employees') && (
                                                            <button
                                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                                className="p-1 rounded-md bg-accent hover:bg-primary text-primary hover:text-white transition"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-text-muted">
                                <User className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                                <h3 className="text-lg font-medium text-text-primary mb-1">No employees yet</h3>
                                <p>Click the "Add Employee" button to add your first employee.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

