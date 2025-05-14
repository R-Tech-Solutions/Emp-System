import { useState, useEffect, useRef } from "react"
import { ChevronDown, Eye, Pencil, Trash2, Plus, X, Check } from "lucide-react"
import axios from "axios"
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroups, fetchAnnouncements, addGroup, updateGroup, addAnnouncement } from '../redux/groupSlice';
import DotSpinner from "../loaders/Loader"; // Import the loader
import { backEndURL } from "../Backendurl";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { groups: reduxGroups, announcements, isLoading: reduxIsLoading } = useSelector((state) => state.groups);

  const [localIsLoading, setIsLoading] = useState(true); // Ensure loader remains visible until all data is fetched
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState(["All Positions"]);
  const [departments, setDepartments] = useState(["All Departments"]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Start loader
        await Promise.all([
          dispatch(fetchGroups()).unwrap(), // Fetch groups
          dispatch(fetchAnnouncements()).unwrap(), // Fetch announcements
          axios.get(`${backEndURL}/api/employees`).then((response) => {
            const employeesData = response.data.data;

            // Extract unique positions and departments
            const uniquePositions = [
              "All Positions",
              ...new Set(employeesData.map((emp) => emp.position)),
            ];
            const uniqueDepartments = [
              "All Departments",
              ...new Set(employeesData.map((emp) => emp.department)),
            ];

            setEmployees(employeesData);
            setPositions(uniquePositions);
            setDepartments(uniqueDepartments);
          }),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Stop loader
      }
    };

    fetchData();
  }, [dispatch]);


  // State for groups and announcements
  const [groups, setGroups] = useState(reduxGroups || [

  ])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/announcements`);
        // setAnnouncements(response.data.data); // Removed
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch employees from the backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/employees`);
        setEmployees(response.data.data); // Ensure employees are fetched and set correctly
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // State for active tab
  const [activeTab, setActiveTab] = useState("groups")

  // State for dialogs
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false)
  const [sendAnnouncementDialogOpen, setSendAnnouncementDialogOpen] = useState(false)
  const [viewGroupDialogOpen, setViewGroupDialogOpen] = useState(false)
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false)
  const [viewAnnouncementDialogOpen, setViewAnnouncementDialogOpen] = useState(false)
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false)
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false)

  // State for form inputs
  const [newGroup, setNewGroup] = useState({
    title: "",
    description: "",
    selectedPosition: "All Positions",
    selectedDepartment: "All Departments",
    members: [],
  })

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    selectedGroups: [],
    informByEmail: false, // New state for email notification
  })

  const [currentGroup, setCurrentGroup] = useState(null)
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState([])

  // Refs for dropdown click outside detection
  const positionDropdownRef = useRef(null)
  const departmentDropdownRef = useRef(null)

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target)) {
        setPositionDropdownOpen(false)
      }
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setDepartmentDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter employees based on position and department
  const filterEmployees = () => {
    let filtered = [...employees]

    if (newGroup.selectedPosition !== "All Positions" && newGroup.selectedDepartment !== "All Departments") {
      filtered = filtered.filter(
        (emp) => emp.position === newGroup.selectedPosition && emp.department === newGroup.selectedDepartment,
      )
    } else if (newGroup.selectedPosition !== "All Positions") {
      filtered = filtered.filter((emp) => emp.position === newGroup.selectedPosition)
    } else if (newGroup.selectedDepartment !== "All Departments") {
      filtered = filtered.filter((emp) => emp.department === newGroup.selectedDepartment)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEmployees(filtered)
  }

  useEffect(() => {
    filterEmployees()
  }, [searchTerm, newGroup.selectedPosition, newGroup.selectedDepartment])

  // Handle adding employee to group
  const addEmployeeToGroup = (employee) => {
    if (!newGroup.members.some((mem) => mem.employeeId === employee.employeeId)) {
      setNewGroup({
        ...newGroup,
        members: [
          ...newGroup.members,
          {
            employeeId: employee.employeeId,
            firstName: employee.firstName, // Added
            lastName: employee.lastName,   // Added
            email: employee.email,
            position: employee.position,
            department: employee.department,
          },
        ],
      });
    }
  };

  // Handle removing employee from group
  const removeEmployeeFromGroup = (employeeId) => {
    setNewGroup({
      ...newGroup,
      members: newGroup.members.filter((mem) => mem.employeeId !== employeeId),
    });
  };

  // Configure SweetAlert with a dark theme
  const showAlert = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      background: "#1a202c", // Dark background
      color: "#fff", // White text
      confirmButtonColor: "#3182ce", // Blue button
    });
  };

  // Fetch groups from the backend
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/groups`);
        setGroups(response.data.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  // Handle creating a new group
  const handleCreateGroup = async () => {
    try {
      const payload = {
        title: newGroup.title,
        description: newGroup.description,
        position: newGroup.selectedPosition,
        department: newGroup.selectedDepartment,
        members: newGroup.members,
      };

      console.log('Creating group with payload:', payload); // Log the payload

      const response = await axios.post(`${backEndURL}/api/groups`, payload);

      setGroups([...groups, { id: response.data.groupId, ...response.data }]);
      setNewGroup({
        title: "",
        description: "",
        selectedPosition: "All Positions",
        selectedDepartment: "All Departments",
        members: [],
      });
      setAddGroupDialogOpen(false);
      showAlert("Success", "Group created successfully!", "success");
    } catch (error) {
      console.error("Error creating group:", error.response?.data || error.message);
      showAlert("Error", "Failed to create group.", "error");
    }
  };

  // Handle sending a new announcement
  const handleSendAnnouncement = async () => {
    setIsSending(true); // Start loader
    try {
      const payload = {
        title: newAnnouncement.title || "Untitled Announcement",
        content: newAnnouncement.content || "No content provided.",
        groups: newAnnouncement.selectedGroups.map((groupTitle) => {
          const group = reduxGroups.find((g) => g.title === groupTitle);
          return group ? group.id : null;
        }).filter(Boolean),
        members: selectedGroupMembers.map((member) => ({
          name: `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Employee",
          email: member.email || "No email",
          isSelected: member.isSelected || false,
        })),
        informByEmail: newAnnouncement.informByEmail,
      };

      const response = await axios.post(`${backEndURL}/api/announcements`, payload);
      dispatch(addAnnouncement(response.data));

      setNewAnnouncement({
        title: "",
        content: "",
        selectedGroups: [],
        informByEmail: false,
      });
      setSendAnnouncementDialogOpen(false);
      showAlert("Success", "Announcement sent successfully!", "success");
    } catch (error) {
      console.error("Error sending announcement:", error);
      showAlert("Error", "Failed to send announcement.", "error");
    } finally {
      setIsSending(false); // Stop loader
    }
  };


  // Handle viewing a group
  const handleViewGroup = (group) => {
    setCurrentGroup(group)
    setViewGroupDialogOpen(true)
  }

  // Handle editing a group
  const handleEditGroup = (group) => {
    setCurrentGroup(group)
    setNewGroup({
      title: group.title,
      description: group.description,
      selectedPosition: "All Positions",
      selectedDepartment: "All Departments",
      members: [...group.members],
    })
    setEditGroupDialogOpen(true)
  }

  // Handle updating a group
  const handleUpdateGroup = async () => {
    try {
      await axios.put(`${backEndURL}/api/groups/${currentGroup.id}`, {
        title: newGroup.title,
        description: newGroup.description,
        position: newGroup.selectedPosition,
        department: newGroup.selectedDepartment,
        members: newGroup.members,
      });

      const updatedGroups = groups.map((group) =>
        group.id === currentGroup.id
          ? { ...group, title: newGroup.title, description: newGroup.description, members: newGroup.members }
          : group
      );

      setGroups(updatedGroups);
      setEditGroupDialogOpen(false);
      showAlert("Success", "Group updated successfully!", "success");
    } catch (error) {
      console.error("Error updating group:", error);
      showAlert("Error", "Failed to update group.", "error");
    }
  };

  // Handle deleting a group
  const handleDeleteGroup = async (groupId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the group permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e", // Red button
      cancelButtonColor: "#4a5568", // Gray button
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${backEndURL}/api/groups/${groupId}`);
          setGroups(groups.filter((group) => group.id !== groupId));
          showAlert("Deleted!", "The group has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting group:", error);
          showAlert("Error", "Failed to delete group.", "error");
        }
      }
    });
  };

  // Handle viewing an announcement
  const handleViewAnnouncement = (announcement) => {
    const selectedEmployees = announcement.members.filter((member) => member.isSelected); // Filter employees with isSelected: true
    setCurrentAnnouncement({ ...announcement, selectedEmployees }); // Add filtered employees to currentAnnouncement
    setViewAnnouncementDialogOpen(true);
  };

  // Toggle group selection for announcements
  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.some((g) => g.id === group.id);
    let updatedGroups;

    if (isSelected) {
      updatedGroups = selectedGroups.filter((g) => g.id !== group.id);
    } else {
      updatedGroups = [...selectedGroups, group];
    }

    setSelectedGroups(updatedGroups);

    // Update members based on selected groups
    const allMembers = updatedGroups.flatMap((g) => g.members.map((member) => ({ ...member, isSelected: false })));
    setSelectedGroupMembers(allMembers);
    setSelectAllMembers(false);
  };


  // Handle position selection
  const handlePositionSelect = (position) => {
    setNewGroup({
      ...newGroup,
      selectedPosition: position,
    })
    setPositionDropdownOpen(false)
  }

  // Handle department selection
  const handleDepartmentSelect = (department) => {
    setNewGroup({
      ...newGroup,
      selectedDepartment: department,
    })
    setDepartmentDropdownOpen(false)
  }

  const toggleEmployeeSelection = (employee) => {
    const isAdded = newGroup.members.some((mem) => mem.employeeId === employee.employeeId);
    if (isAdded) {
      removeEmployeeFromGroup(employee.employeeId);
    } else {
      addEmployeeToGroup(employee);
    }
  };

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [selectAllMembers, setSelectAllMembers] = useState(false);

  const handleGroupClick = (group) => {
    setSelectedGroupMembers(group.members.map((member) => ({ ...member, isSelected: false })));
    setSelectAllMembers(false);
  };

  const toggleMemberSelection = (index) => {
    const updatedMembers = [...selectedGroupMembers];
    updatedMembers[index].isSelected = !updatedMembers[index].isSelected;
    setSelectedGroupMembers(updatedMembers);
  };

  const toggleSelectAllMembers = () => {
    const updatedMembers = selectedGroupMembers.map((member) => ({
      ...member,
      isSelected: !selectAllMembers,
    }));
    setSelectedGroupMembers(updatedMembers);
    setSelectAllMembers(!selectAllMembers);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8 px-4">
        {reduxIsLoading || localIsLoading ? ( // Use `reduxIsLoading` instead of `isLoading`
          <div className="flex justify-center items-center h-screen">
            <DotSpinner /> {/* Show spinner while loading */}
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 justify-start">
              <button
                onClick={() => setAddGroupDialogOpen(true)}
                className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Groups
              </button>

              <button
                onClick={() => setSendAnnouncementDialogOpen(true)}
                className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md"
              >
                <Plus className="mr-2 h-4 w-4" /> Send Announcement
              </button>
            </div>

            {/* Tabs for Groups and Announcements */}
            <div className="mb-6">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("groups")}
                  className={`px-4 py-2 ${activeTab === "groups" ? "border-b-2 border-white font-medium" : "text-gray-400 hover:text-white"
                    }`}
                >
                  Groups
                </button>
                <button
                  onClick={() => setActiveTab("announcements")}
                  className={`px-4 py-2 ${activeTab === "announcements" ? "border-b-2 border-white font-medium" : "text-gray-400 hover:text-white"
                    }`}
                >
                  Announcements
                </button>
              </div>
            </div>

            {/* Groups Tab */}
            {activeTab === "groups" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups && groups.length > 0 ? (
                  groups.map((group) => (
                    <div key={group.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{group.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{group.description}</p>
                      </div>
                      <div className="px-4 pb-2">
                        <p className="text-sm text-gray-400">{group.members?.length || 0} members</p>
                        {/* <div className="flex flex-wrap gap-2 mt-2">
                          {group.members?.slice(0, 3).map((member) => (
                            <div key={member.employeeId} className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                              <img
                                src={`data:image/png;base64,${member.profileImage}`}
                                alt={member.firstname}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {group.members?.length > 3 && (
                            <span className="text-xs text-gray-400">+{group.members.length - 3} more</span>
                          )}
                        </div> */}
                      </div>
                      <div className="px-4 py-3 bg-gray-700 flex justify-end gap-2">
                        <button
                          onClick={() => handleViewGroup(group)}
                          className="p-1 rounded-md hover:bg-gray-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="p-1 rounded-md hover:bg-gray-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-1 rounded-md hover:bg-gray-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <table className="w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                      <thead>
                        <tr>
                          <th className="text-left p-4 text-gray-400 flex items-center">
                            No Groups Available
                            {reduxIsLoading && ( // Use reduxIsLoading instead of isLoading
                              <div className="ml-2 flex items-center justify-center w-[50px] h-[50px]">
                              </div>
                            )}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                )}
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-700"><th className="text-left p-4">Title</th><th className="text-left p-4">Date</th><th className="text-left p-4">Employees</th><th className="text-right p-4">Actions</th></tr></thead>
                  <tbody>{announcements && announcements.length > 0 ? (announcements.map((announcement) => (<tr key={announcement.id} className="border-b border-gray-700 hover:bg-gray-700"><td className="p-4 font-medium">{announcement.title}</td><td className="p-4">{new Date(announcement.date || announcement.createdAt).toLocaleDateString()}</td><td className="p-4"><div className="flex flex-wrap gap-1">{announcement.members && announcement.members.length > 0 ? (<span className="text-xs text-gray-400">{announcement.members.filter((member) => member.isSelected).length}</span>) : (<span className="text-xs text-gray-400">No employees</span>)}</div></td><td className="p-4 text-right"><button onClick={() => handleViewAnnouncement(announcement)} className="p-1 rounded-md hover:bg-gray-600" title="View"><Eye className="h-4 w-4" /></button></td></tr>))) : (<tr><td colSpan="4" className="p-4 text-center text-gray-400">No announcements available.</td></tr>)}</tbody>
                </table>
              </div>
            )}

            {/* Add Group Dialog */}
            {addGroupDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Add New Group</h2>
                      <button onClick={() => setAddGroupDialogOpen(false)} className="p-1 rounded-md hover:bg-gray-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="group-title" className="block text-sm font-medium mb-1">
                          Group Title
                        </label>
                        <input
                          id="group-title"
                          type="text"
                          value={newGroup.title}
                          onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
                          placeholder="Enter group title"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="group-description" className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <textarea
                          id="group-description"
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                          placeholder="Enter group description"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          rows={3}
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative" ref={positionDropdownRef}>
                          <label className="block text-sm font-medium mb-1">Position</label>
                          <button
                            type="button"
                            onClick={() => setPositionDropdownOpen(!positionDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                          >
                            <span>{newGroup.selectedPosition}</span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {positionDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                              {positions.map((position) => (
                                <div
                                  key={position} // Add unique key
                                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex items-center"
                                  onClick={() => handlePositionSelect(position)}
                                >
                                  {position === newGroup.selectedPosition && (
                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                  )}
                                  <span className={position === newGroup.selectedPosition ? "ml-2" : "ml-6"}>
                                    {position}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="relative" ref={departmentDropdownRef}>
                          <label className="block text-sm font-medium mb-1">Department</label>
                          <button
                            type="button"
                            onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                          >
                            <span>{newGroup.selectedDepartment}</span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {departmentDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                              {departments.map((department) => (
                                <div
                                  key={department} // Add unique key
                                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex items-center"
                                  onClick={() => handleDepartmentSelect(department)}
                                >
                                  {department === newGroup.selectedDepartment && (
                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                  )}
                                  <span className={department === newGroup.selectedDepartment ? "ml-2" : "ml-6"}>
                                    {department}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium">Employees</label>
                          <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 w-[200px]"
                          />
                        </div>

                        <div className="border border-gray-600 rounded-md h-[200px] overflow-y-auto">
                          {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => {
                              const isAdded = newGroup.members.some((mem) => mem.employeeId === employee.employeeId);
                              return (
                                <div
                                  key={employee.employeeId} // Add unique key
                                  className={`flex items-center justify-between p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0 cursor-pointer ${isAdded ? "bg-gray-700" : ""
                                    }`}
                                  onClick={() => toggleEmployeeSelection(employee)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <p className="text-sm font-medium">{employee.firstName}{employee.lastName}</p>
                                      <p className="text-xs text-gray-400">
                                        {employee.employeeId} - {employee.position} ({employee.department})
                                      </p>
                                      <p className="text-xs text-gray-400">{employee.email}</p>
                                    </div>
                                  </div>
                                  <button
                                    className={`p-1 rounded-md ${isAdded ? "bg-green-600" : "bg-red-600 hover:bg-red-700"}`}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering the row click
                                      toggleEmployeeSelection(employee);
                                    }}
                                    disabled={isAdded}
                                  >
                                    {isAdded ? (
                                      <Check className="h-4 w-4 text-white" title="Added" />
                                    ) : (
                                      <X className="h-4 w-4 text-white" title="Remove" />
                                    )}
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center text-gray-400 p-4">
                              {newGroup.selectedPosition !== "All Positions" ||
                                newGroup.selectedDepartment !== "All Departments"
                                ? "No employees match the selected criteria"
                                : "Please select a position or department"}
                            </p>
                          )}
                        </div>
                      </div>

                      {newGroup.members.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Selected Employees</label>
                          <div className="border border-gray-600 rounded-md h-[200px] overflow-y-auto">
                            {newGroup.members.map((member) => (
                              <div
                                key={member.employeeId}
                                className="flex items-center justify-between p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                              >
                                <div className="flex items-center gap-2">
                                  {/* <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600">
                                    <img
                                      src={`data:image/png;base64,${member.profileImage}`}
                                      alt={member.firstName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div> */}
                                  <div>
                                    <p className="text-sm font-medium">{member.firstName}{member.lastName}</p>
                                    <p className="text-xs text-gray-400">
                                      {member.employeeId} - {member.position} ({member.department})
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {member.email}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  className="p-1 rounded-md bg-red-600 hover:bg-red-700"
                                  onClick={() => removeEmployeeFromGroup(member.employeeId)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => setAddGroupDialogOpen(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                      >
                        Cancel
                      </button>
                      <button onClick={handleCreateGroup} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
                        Create Group
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Send Announcement Dialog */}
            {sendAnnouncementDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Send Announcement</h2>
                      <button
                        onClick={() => setSendAnnouncementDialogOpen(false)}
                        className="p-1 rounded-md hover:bg-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="announcement-title" className="block text-sm font-medium mb-1">
                          Announcement Title
                        </label>
                        <input
                          id="announcement-title"
                          type="text"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                          placeholder="Enter announcement title"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="announcement-content" className="block text-sm font-medium mb-1">
                          Announcement Content
                        </label>
                        <textarea
                          id="announcement-content"
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                          placeholder="Enter announcement content"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          rows={5}
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Select Groups</label>
                        <div className="border border-gray-600 rounded-md h-[200px] overflow-y-auto">
                          {groups.map((group) => (
                            <div
                              key={group.id}
                              className="flex items-center space-x-2 p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={selectedGroups.some((g) => g.id === group.id)}
                                onChange={() => toggleGroupSelection(group)}
                                className="rounded bg-gray-700 border-gray-500 text-blue-600 focus:ring-blue-600"
                              />
                              <label className="cursor-pointer">{group.title} ({group.members.length} members)</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedGroupMembers.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Group Members</label>
                          <div className="border border-gray-600 rounded-md h-[200px] overflow-y-auto">
                            <div className="flex items-center space-x-2 p-2 border-b border-gray-600">
                              <input
                                type="checkbox"
                                checked={selectAllMembers}
                                onChange={toggleSelectAllMembers}
                                className="rounded bg-gray-700 border-gray-500 text-blue-600 focus:ring-blue-600"
                              />
                              <label className="cursor-pointer">Select All</label>
                            </div>
                            {selectedGroupMembers.map((member, index) => (
                              <div
                                key={member.employeeId || index} // Add unique key
                                className="flex items-center space-x-2 p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                              >
                                <input
                                  type="checkbox"
                                  checked={member.isSelected}
                                  onChange={() => toggleMemberSelection(index)}
                                  className="rounded bg-gray-700 border-gray-500 text-blue-600 focus:ring-blue-600"
                                />
                                <label className="cursor-pointer">
                                  {member.name} ({member.email})
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1">Inform via Email</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newAnnouncement.informByEmail}
                            onChange={(e) =>
                              setNewAnnouncement({ ...newAnnouncement, informByEmail: e.target.checked })
                            }
                            className="rounded bg-gray-700 border-gray-500 text-blue-600 focus:ring-blue-600"
                          />
                          <label className="cursor-pointer">Send this announcement via email</label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => setSendAnnouncementDialogOpen(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendAnnouncement}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center justify-center min-w-[180px]"
                        disabled={isSending}
                      >
                        {isSending ? <DotSpinner /> : "Send Announcement"}
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Group Dialog */}
            {viewGroupDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">{currentGroup?.title}</h2>
                      <button onClick={() => setViewGroupDialogOpen(false)} className="p-1 rounded-md hover:bg-gray-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-gray-400 mb-4">{currentGroup?.description}</p>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Group Members</h3>
                      <div className="border border-gray-600 rounded-md h-[300px] overflow-y-auto">
                        {currentGroup?.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              {/* <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                                <img
                                  src={`data:image/png;base64,${member.profileImage}`}
                                  alt={member.Firstname}
                                  className="w-full h-full object-cover"
                                />
                              </div> */}
                              <div>
                                <p className="text-sm font-medium">{member.firstName}{member.lastName}</p>
                                <p className="text-xs text-gray-400">
                                  {member.email}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {member.employeeId} - {member.position} ({member.department})
                                </p>

                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setViewGroupDialogOpen(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Group Dialog */}
            {editGroupDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Edit Group</h2>
                      <button onClick={() => setEditGroupDialogOpen(false)} className="p-1 rounded-md hover:bg-gray-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="edit-group-title" className="block text-sm font-medium mb-1">
                          Group Title
                        </label>
                        <input
                          id="edit-group-title"
                          type="text"
                          value={newGroup.title}
                          onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-group-description" className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <textarea
                          id="edit-group-description"
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          rows={3}
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative" ref={positionDropdownRef}>
                          <label className="block text-sm font-medium mb-1">Position</label>
                          <button
                            type="button"
                            onClick={() => setPositionDropdownOpen(!positionDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                          >
                            <span>{newGroup.selectedPosition}</span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {positionDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                              {positions.map((position) => (
                                <div
                                  key={position} // Add unique key
                                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                                  onClick={() => handlePositionSelect(position)}
                                >
                                  {position}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="relative" ref={departmentDropdownRef}>
                          <label className="block text-sm font-medium mb-1">Department</label>
                          <button
                            type="button"
                            onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                          >
                            <span>{newGroup.selectedDepartment}</span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {departmentDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                              {departments.map((department) => (
                                <div
                                  key={department} // Add unique key
                                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                                  onClick={() => handleDepartmentSelect(department)}
                                >
                                  {department}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium">Employees</label>
                          <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 w-[200px]"
                          />
                        </div>
                        <div className="border border-gray-600 rounded-md h-[200px] overflow-y-auto">
                          {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => {
                              const isAdded = newGroup.members.some((mem) => mem.employeeId === employee.employeeId);
                              return (
                                <div
                                  key={employee.employeeId} // Add unique key
                                  className={`flex items-center justify-between p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0 cursor-pointer ${isAdded ? "bg-gray-700" : ""
                                    }`}
                                  onClick={() => toggleEmployeeSelection(employee)}
                                >
                                  <div className="flex items-center gap-2">
                                    {/* <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                                      <img
                                        src={`data:image/png;base64,${employee.profileImage}`} // Use Base64 string to display the image
                                        alt={employee.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div> */}
                                    <div>
                                      <p className="text-sm font-medium">{employee.name}</p>
                                      <p className="text-xs text-gray-400">
                                        {employee.employeeId} - {employee.position}
                                      </p>
                                      <p className="text-xs text-gray-400">{employee.email}</p>
                                    </div>
                                  </div>
                                  <button
                                    className={`p-1 rounded-md  ${isAdded ? "bg-green-600" : "bg-red-600 hover:bg-red-700"}`}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering the row click
                                      toggleEmployeeSelection(employee);
                                    }}
                                    disabled={isAdded}
                                  >
                                    {isAdded ? (
                                      <Check className="h-4 w-4 text-white" title="Added" />
                                    ) : (
                                      <X className="h-4 w-4 text-white" title="Remove" />
                                    )}
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center text-gray-400 p-4">
                              {newGroup.selectedPosition !== "All Positions" ||
                                newGroup.selectedDepartment !== "All Departments"
                                ? "No employees match the selected criteria"
                                : "Please select a position or department"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Current Members</label>
                        <div className="border border-gray-600 rounded-md h-[200px] overflow-y-auto">
                          {newGroup.members.map((member) => (
                            <div
                              key={member.employeeId}
                              className="flex items-center justify-between p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                {/* <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600">
                                  <img
                                    src={`data:image/png;base64,${member.profileImage}`} // Use Base64 string to display the image
                                    alt={member.firstname}
                                    className="w-full h-full object-cover"
                                  />
                                </div> */}
                                <div>
                                  <p className="text-sm font-medium">{member.firstname}{member.lastname}</p>
                                  <p className="text-xs text-gray-400">
                                    {member.email}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {member.employeeId} - {member.position} ({member.department})
                                  </p>
                                </div>
                              </div>
                              <button
                                className="p-1 rounded-md hover:bg-gray-600"
                                onClick={() => removeEmployeeFromGroup(member.employeeId)}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => setEditGroupDialogOpen(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                      >
                        Cancel
                      </button>
                      <button onClick={handleUpdateGroup} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
                        Update Group
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Announcement Dialog */}
            {viewAnnouncementDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">{currentAnnouncement?.title}</h2>
                      <button
                        onClick={() => setViewAnnouncementDialogOpen(false)}
                        className="p-1 rounded-md hover:bg-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-gray-400 mb-4">
                      Sent on {new Date(currentAnnouncement?.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-1">Content</h3>
                      <p className="text-sm bg-gray-700 p-3 rounded-md">{currentAnnouncement?.content}</p>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-1">Sent to Groups</h3>
                      <div className="flex flex-wrap gap-1">
                        {currentAnnouncement?.groups && currentAnnouncement.groups.length > 0 ? (
                          currentAnnouncement.groups.map((group) => (
                            <span key={group.id || group} className="inline-block px-2 py-1 text-xs bg-gray-700 rounded-full">
                              {group.title || group}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No groups</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Selected Employees</h3>
                      <div className="border border-gray-600 rounded-md h-[300px] overflow-y-auto">
                        {currentAnnouncement?.selectedEmployees && currentAnnouncement.selectedEmployees.length > 0 ? (
                          currentAnnouncement.selectedEmployees.map((employee) => (
                            <div
                              key={employee.email}
                              className="flex items-center justify-between p-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                            >
                              <div>
                                <p className="text-sm font-medium">{employee.name}</p>
                                <p className="text-xs text-gray-400">{employee.email}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-400 p-4">No employees selected</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setViewAnnouncementDialogOpen(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div >
  )
}