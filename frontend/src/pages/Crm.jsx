import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  User,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Users,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  DollarSign,
} from "lucide-react";
import { backEndURL } from '../Backendurl';

// Utility function to conditionally join class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function generateSampleSalespeople() {
  return [
    {
      id: "sp-1",
      name: "Aanish",
      email: "Aanish@company.com",
      role: "Sales Manager",
    },
    {
      id: "sp-2",
      name: "Nihma",
      email: "Nihma@company.com",
      role: "Senior Sales Rep",
    },
    {
      id: "sp-3",
      name: "nashad",
      email: "nashad@company.com",
      role: "Sales Rep",
    },
  ];
}

function generateSampleContacts() {
  const companies = [
    "Acme Inc",
    "Globex Corp",
    "Initech",
    "Umbrella Corp",
    "Stark Industries",
  ];

  return [
    {
      id: "contact-1",
      name: "Nimasha",
      email: "alice.johnson@acme.com",
      phone: "(555) 123-4567",
      company: "Acme Inc",
      website: "https://acme.com",
      notes: "Key decision maker for enterprise accounts",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    },
    {
      id: "contact-2",
      name: "Bob Smith",
      email: "bob.smith@globex.com",
      phone: "(555) 234-5678",
      company: "Globex Corp",
      website: "https://globex.com",
      notes: "Prefers email communication",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    },
    {
      id: "contact-3",
      name: "Carol Davis",
      email: "carol.davis@initech.com",
      phone: "(555) 345-6789",
      company: "Initech",
      website: "https://initech.com",
      notes: "Looking for cost-effective solutions",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    },
    {
      id: "contact-4",
      name: "David Wilson",
      email: "david.wilson@umbrella.com",
      phone: "(555) 456-7890",
      company: "Umbrella Corp",
      website: "https://umbrella.com",
      notes: "Interested in premium features",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    },
  ];
}

function getSalespersonName(id) {
  const salespeople = {
    "sp-1": "John Doe",
    "sp-2": "Jane Smith",
    "sp-3": "nashad",
    "sp-4": "Emily Davis",
    "sp-5": "Michael Wilson",
  };

  return salespeople[id] || "";
}

function getRandomName() {
  const firstNames = [
    "Alex",
    "Taylor",
    "Jordan",
    "Casey",
    "Morgan",
    "Riley",
    "Jamie",
    "Quinn",
    "Avery",
    "Cameron",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
  ];

  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;
}

// Inside the LeadCard component, add these SVG graphics after the imports but before the component definition:
function SuccessGraffiti() {
  return (
    <div className="absolute -right-2 -top-2 rotate-12 z-10">
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M55 30C55 43.8071 43.8071 55 30 55C16.1929 55 5 43.8071 5 30C5 16.1929 16.1929 5 30 5C43.8071 5 55 16.1929 55 30Z"
          fill="#22c55e"
          fillOpacity="0.8"
        />
        <path
          d="M22 32L27 37L38 26"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 10L10 2M2 2L10 10"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M50 10L58 2M50 2L58 10"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10 50L18 42M10 42L18 50"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M50 50L58 42M50 42L58 50"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function SadGraffiti() {
  return (
    <div className="absolute -right-2 -top-2 rotate-12 z-10">
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M55 30C55 43.8071 43.8071 55 30 55C16.1929 55 5 43.8071 5 30C5 16.1929 16.1929 5 30 5C43.8071 5 55 16.1929 55 30Z"
          fill="#ef4444"
          fillOpacity="0.8"
        />
        <path
          d="M20 40C23.3333 36.6667 36.6667 36.6667 40 40"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="22" cy="25" r="3" fill="white" />
        <circle cx="38" cy="25" r="3" fill="white" />
        <path
          d="M2 10L10 2M2 2L10 10"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M50 10L58 2M50 2L58 10"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10 50L18 42M10 42L18 50"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M50 50L58 42M50 42L58 50"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Stage Transition Dialog Component
function StageTransitionDialog({
  isOpen,
  onClose,
  onConfirm,
  lead,
  currentStage,
  nextStage,
  validationErrors,
}) {
  const [notes, setNotes] = useState("");
  const [formData, setFormData] = useState({});
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setFormData({});
      setAttachments([]);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newAttachments = [...attachments];
      for (let i = 0; i < e.target.files.length; i++) {
        newAttachments.push({
          name: e.target.files[i].name,
          size: e.target.files[i].size,
          type: e.target.files[i].type,
        });
      }
      setAttachments(newAttachments);
    }
  };

  const handleSubmit = () => {
    onConfirm(nextStage, notes, formData, attachments);
  };

  if (!isOpen) return null;

  const renderStageSpecificFields = () => {
    switch (nextStage) {
      case "Qualified":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Contact Attempt Details
              </label>
              <textarea
                value={formData.contactDetails || ""}
                name="contactDetails"
                onChange={handleInputChange}
                placeholder="Describe your contact attempt (e.g., phone call, email)"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Qualification Criteria
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="hasBudget"
                    checked={formData.hasBudget || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Has budget</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="hasAuthority"
                    checked={formData.hasAuthority || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Has decision-making authority</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="hasNeed"
                    checked={formData.hasNeed || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Has identified need</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="hasTimeline"
                    checked={formData.hasTimeline || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Has timeline for purchase</span>
                </label>
              </div>
            </div>
          </div>
        );
      case "Proposal Sent":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Proposal Document
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center text-xs text-gray-500"
                    >
                      <FileText size={14} className="mr-1" />
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="proposalValue"
                className="block text-sm font-medium"
              >
                Proposal Value ($)
              </label>
              <input
                id="proposalValue"
                name="proposalValue"
                type="number"
                value={formData.proposalValue || ""}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
          </div>
        );
      case "Negotiation":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="followUpDate"
                className="block text-sm font-medium"
              >
                Next Follow-up Date *
              </label>
              <input
                id="followUpDate"
                name="followUpDate"
                type="date"
                value={formData.followUpDate || ""}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Client Feedback
              </label>
              <textarea
                value={formData.clientFeedback || ""}
                name="clientFeedback"
                onChange={handleInputChange}
                placeholder="What feedback did the client provide on the proposal?"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          </div>
        );
      case "Won":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="finalDealValue"
                className="block text-sm font-medium"
              >
                Final Deal Value ($) *
              </label>
              <input
                id="finalDealValue"
                name="finalDealValue"
                type="number"
                value={formData.finalDealValue || ""}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="closingDate"
                className="block text-sm font-medium"
              >
                Closing Date *
              </label>
              <input
                id="closingDate"
                name="closingDate"
                type="date"
                value={formData.closingDate || ""}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
          </div>
        );
      case "Lost":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lostReason" className="block text-sm font-medium">
                Lost Reason *
              </label>
              <select
                id="lostReason"
                name="lostReason"
                value={formData.lostReason || ""}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="">Select a reason</option>
                <option value="price">Price too high</option>
                <option value="competitor">Went with competitor</option>
                <option value="timing">Bad timing</option>
                <option value="needs">Needs not aligned</option>
                <option value="budget">Budget constraints</option>
                <option value="noDecision">No decision made</option>
                <option value="other">Other</option>
              </select>
            </div>
            {formData.lostReason === "competitor" && (
              <div className="space-y-2">
                <label
                  htmlFor="competitorInfo"
                  className="block text-sm font-medium"
                >
                  Competitor Information
                </label>
                <input
                  id="competitorInfo"
                  name="competitorInfo"
                  value={formData.competitorInfo || ""}
                  onChange={handleInputChange}
                  placeholder="Which competitor did they choose?"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="closingDate"
                className="block text-sm font-medium"
              >
                Closing Date *
              </label>
              <input
                id="closingDate"
                name="closingDate"
                type="date"
                value={formData.closingDate || ""}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (nextStage) {
      case "Qualified":
        return "Mark as Qualified";
      case "Proposal Sent":
        return "Submit Proposal";
      case "Negotiation":
        return "Begin Negotiation";
      case "Won":
        return "Close as Won";
      case "Lost":
        return "Close as Lost";
      default:
        return "Change Stage";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">{getDialogTitle()}</h3>

        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center">
              <AlertCircle size={16} className="mr-1" /> Cannot proceed
            </h4>
            <ul className="mt-1 text-xs text-red-700 dark:text-red-400 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {renderStageSpecificFields()}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this stage change"
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={validationErrors.length > 0}
            className={`px-4 py-2 text-white rounded-md text-sm font-medium ${validationErrors.length > 0
              ? "bg-gray-400 cursor-not-allowed"
              : nextStage === "Lost"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Action History Timeline Component
function ActionHistoryTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
        No history available
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2 max-h-[300px] overflow-y-auto">
      {history.map((item, index) => (
        <div key={index} className="relative pl-6">
          <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-blue-500"></div>
          {index !== history.length - 1 && (
            <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          )}
          <div className="mb-1">
            <span className="text-xs font-medium">{item.stage}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {new Date(item.date).toLocaleDateString()}{" "}
              {new Date(item.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {item.notes && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
              {item.notes}
            </p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            by {item.changedBy}
          </div>
        </div>
      ))}
    </div>
  );
}

// Validation Indicator Component
function ValidationIndicator({ lead, nextStage }) {
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    const errors = [];

    if (nextStage === "Qualified" && !lead.contactAttempts?.length) {
      errors.push("At least one contact attempt must be logged");
    }

    if (nextStage === "Proposal Sent" && !lead.proposalDocument) {
      errors.push("Proposal document must be attached");
    }

    if (nextStage === "Negotiation" && !lead.nextFollowUp) {
      errors.push("Follow-up date must be set");
    }

    if ((nextStage === "Won" || nextStage === "Lost") && !lead.dealValue) {
      errors.push("Deal value must be specified");
    }

    setValidationErrors(errors);
  }, [lead, nextStage]);

  if (validationErrors.length === 0) {
    return (
      <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
        <CheckCircle2 size={14} className="mr-1" />
        Ready to move
      </div>
    );
  }

  return (
    <div className="text-red-600 dark:text-red-400 text-xs">
      <div className="flex items-center">
        <AlertCircle size={14} className="mr-1" />
        <span>Missing requirements:</span>
      </div>
      <ul className="list-disc list-inside ml-4 mt-1">
        {validationErrors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}



// Notes Manager Component
function NotesManager({ notes = [], onAddNote, onEditNote, title = "Notes" }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  const handleAddClick = () => {
    setIsAdding(true);
    setNoteContent("");
  };

  const handleEditClick = (index) => {
    setIsEditing(true);
    setEditingNoteIndex(index);
    setNoteContent(notes[index].content);
  };

  const handleSaveNote = () => {
    if (noteContent.trim() === "") return;

    if (isEditing && editingNoteIndex !== null) {
      onEditNote(editingNoteIndex, noteContent);
    } else {
      onAddNote(noteContent);
    }

    setIsAdding(false);
    setIsEditing(false);
    setEditingNoteIndex(null);
    setNoteContent("");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingNoteIndex(null);
    setNoteContent("");
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h5 className="text-sm font-medium">{title}</h5>
        {!isAdding && !isEditing && (
          <button
            onClick={handleAddClick}
            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md flex items-center"
          >
            <Plus size={12} className="mr-1" /> Add Note
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="space-y-2">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Enter your note..."
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md"
            >
              <div className="flex justify-between items-start">
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {note.content}
                </div>
                <button
                  onClick={() => handleEditClick(index)}
                  className="ml-1 text-gray-500 hover:text-blue-500 dark:text-gray-400"
                >
                  <Edit size={12} />
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(note.date).toLocaleString()} • {note.createdBy}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          No notes yet
        </div>
      )}
    </div>
  );
}

// Lead Card Component
function LeadCard({ lead, onEdit, onStageTransition }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [leadNotes, setLeadNotes] = useState(lead.notes || []);

  const handleAddNote = (content) => {
    const newNote = {
      content: content,
      date: new Date().toISOString(),
      createdBy: "You", // Replace with actual user info
    };
    setLeadNotes([...leadNotes, newNote]);
  };

  const handleEditNote = (index, content) => {
    const updatedNotes = [...leadNotes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      content: content,
    };
    setLeadNotes(updatedNotes);
  };

  useEffect(() => {
    // Update the lead's notes when leadNotes change
    onEdit({ ...lead, notes: leadNotes });
  }, [leadNotes]);

  const getNextStage = (currentStage) => {
    const stageFlow = {
      New: "Qualified",
      Qualified: "Proposal Sent",
      "Proposal Sent": "Negotiation",
      Negotiation: ["Won", "Lost"],
    };

    return stageFlow[currentStage] || null;
  };

  const validateStageTransition = (lead, targetStage) => {
    const errors = [];

    // Only keep the stage skipping validation (if you want to prevent skipping stages)
    const stageOrder = [
      "New",
      "Qualified",
      "Proposal Sent",
      "Negotiation",
      "Won",
      "Lost",
    ];
    const currentIndex = stageOrder.indexOf(lead.stage);
    const targetIndex = stageOrder.indexOf(targetStage);

    if (targetStage !== "Lost" && targetIndex > currentIndex + 1) {
      errors.push(`Cannot skip from ${lead.stage} to ${targetStage}`);
    }

    return errors;
  };

  const renderStageActions = () => {
    if (lead.stage === "Won" || lead.stage === "Lost") {
      return null;
    }

    const nextStage = getNextStage(lead.stage);

    if (!nextStage) {
      return null;
    }

    if (Array.isArray(nextStage)) {
      return (
        <div className="flex gap-2 mt-3">
          <button
            className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
            onClick={() => onStageTransition(lead, "Won")}
          >
            <Check size={12} className="mr-1" /> Close Won
          </button>
          <button
            className="w-full text-xs h-8 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center"
            onClick={() => onStageTransition(lead, "Lost")}
          >
            <X size={12} className="mr-1" /> Close Lost
          </button>
        </div>
      );
    }

    const buttonText = {
      Qualified: "Mark as Qualified",
      "Proposal Sent": "Submit Proposal",
      Negotiation: "Begin Negotiation",
    };

    return (
      <button
        className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center mt-3"
        onClick={() => onStageTransition(lead, nextStage)}
      >
        <ArrowRight size={12} className="mr-1" /> {buttonText[nextStage]}
      </button>
    );
  };

  const renderStageIndicators = () => {
    const indicators = [];

    // Overdue follow-up
    if (lead.nextFollowUp) {
      const followUpDate = new Date(lead.nextFollowUp);
      const today = new Date();

      if (
        followUpDate < today &&
        lead.stage !== "Won" &&
        lead.stage !== "Lost"
      ) {
        indicators.push(
          <span
            key="overdue"
            className="border border-red-500 text-red-500 text-xs px-2 py-0.5 rounded-full flex items-center"
          >
            <Clock size={10} className="mr-1" /> Overdue
          </span>
        );
      }
    }

    // High-value deal
    if (lead.expectedRevenue > 10000) {
      indicators.push(
        <span
          key="high-value"
          className="border border-amber-500 text-amber-500 text-xs px-2 py-0.5 rounded-full flex items-center"
        >
          <DollarSign size={10} className="mr-1" /> High Value
        </span>
      );
    }

    // Stale lead (no activity in 14 days)
    if (lead.stageHistory && lead.stageHistory.length > 0) {
      const lastActivity = new Date(
        lead.stageHistory[lead.stageHistory.length - 1].date
      );
      const today = new Date();
      const daysSinceLastActivity = Math.floor(
        (today - lastActivity) / (1000 * 60 * 60 * 24)
      );

      if (
        daysSinceLastActivity > 14 &&
        lead.stage !== "Won" &&
        lead.stage !== "Lost"
      ) {
        indicators.push(
          <span
            key="stale"
            className="border border-gray-500 text-gray-500 text-xs px-2 py-0.5 rounded-full flex items-center"
          >
            <AlertCircle size={10} className="mr-1" /> Stale
          </span>
        );
      }
    }

    return indicators;
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border shadow-sm transition-all relative",
        expanded ? "ring-1 ring-blue-500" : "",
        lead.stage === "Won" &&
        "border-green-500 bg-green-50 dark:bg-green-900/20",
        lead.stage === "Lost" && "border-red-500 bg-red-50 dark:bg-red-900/20",
        lead.isExistingClient && "border-l-4 border-l-blue-500"
      )}
    >
      {lead.stage === "Won" && <SuccessGraffiti />}
      {lead.stage === "Lost" && <SadGraffiti />}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-sm">{lead.clientName}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
              {lead.opportunityName}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {lead.isExistingClient && (
              <span className="border border-blue-500 text-blue-500 text-xs px-2 py-0.5 rounded-full flex items-center">
                <User size={10} className="mr-1" /> Existing
              </span>
            )}
            <button
              className="h-6 w-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <Mail size={12} />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Phone size={12} />
          <span>{lead.phone}</span>
        </div>

        {/* Stage indicators */}
        {renderStageIndicators().length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {renderStageIndicators()}
          </div>
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-1 px-2 text-xs font-medium ${activeTab === "details"
                  ? "border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                className={`flex-1 py-1 px-2 text-xs font-medium ${activeTab === "actions"
                  ? "border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
                onClick={() => setActiveTab("actions")}
              >
                Actions
              </button>
              <button
                className={`flex-1 py-1 px-2 text-xs font-medium ${activeTab === "notes"
                  ? "border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
                onClick={() => setActiveTab("notes")}
              >
                Notes
              </button>
              <button
                className={`flex-1 py-1 px-2 text-xs font-medium ${activeTab === "history"
                  ? "border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
            </div>

            {activeTab === "details" && (
              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Expected Revenue:
                  </span>
                  <span className="font-medium">
                    ${lead.expectedRevenue?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Assigned To:
                  </span>
                  <span className="font-medium">{lead.assignedToName}</span>
                </div>
                {lead.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Company:
                    </span>
                    <span className="font-medium">{lead.company}</span>
                  </div>
                )}
                {lead.nextFollowUp && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Next Follow-up:
                    </span>
                    <span className="font-medium">
                      {new Date(lead.nextFollowUp).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {lead.lastContactDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Last Contact:
                    </span>
                    <span className="font-medium">
                      {new Date(lead.lastContactDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {lead.stage === "Won" && lead.dealValue && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Final Deal Value:
                    </span>
                    <span className="font-medium text-green-600">
                      ${lead.dealValue.toLocaleString()}
                    </span>
                  </div>
                )}
                {lead.stage === "Lost" && lead.lostReason && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Lost Reason:
                    </span>
                    <span className="font-medium text-red-600">
                      {lead.lostReason}
                    </span>
                  </div>
                )}
                {lead.stage === "Lost" && lead.competitorInfo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Competitor:
                    </span>
                    <span className="font-medium">{lead.competitorInfo}</span>
                  </div>
                )}

                {/* Internal notes display */}
                {lead.internalNotes && (
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-medium mb-1">
                      Internal Notes:
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {lead.internalNotes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "actions" && (
              <div className="space-y-3 pt-2">
                <div className="text-xs">
                  <h5 className="font-medium mb-1">Required Actions:</h5>
                  {lead.stage === "New" && (
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-2">
                      <li>Make initial contact</li>
                      <li>Assess qualification criteria</li>
                      <li>Schedule discovery call</li>
                    </ul>
                  )}
                  {lead.stage === "Qualified" && (
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-2">
                      <li>Prepare proposal document</li>
                      <li>Get internal approval</li>
                      <li>Send proposal to client</li>
                    </ul>
                  )}
                  {lead.stage === "Proposal Sent" && (
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-2">
                      <li>Follow up on proposal</li>
                      <li>Address client questions</li>
                      <li>Schedule negotiation call</li>
                    </ul>
                  )}
                  {lead.stage === "Negotiation" && (
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-2">
                      <li>Prepare contract</li>
                      <li>Get final approval</li>
                      <li>Send contract for signature</li>
                    </ul>
                  )}
                </div>

                {renderStageActions()}

                <button
                  className="w-full text-xs h-8 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                  onClick={() => onEdit(lead)}
                >
                  <Edit size={12} className="mr-1" /> Edit Lead
                </button>
              </div>
            )}

            {activeTab === "history" && (
              <div className="pt-2">
                <ActionHistoryTimeline history={lead.stageHistory || []} />
              </div>
            )}
            {activeTab === "notes" && (
              <NotesManager
                notes={lead.stageNotes?.[lead.stage] || []}
                onAddNote={(content) => {
                  const newNote = {
                    content,
                    date: new Date().toISOString(),
                    createdBy: lead.assignedToName || "User",
                    stage: lead.stage,
                  };

                  const existingStageNotes = lead.stageNotes || {};
                  const stageNotes = existingStageNotes[lead.stage] || [];

                  const updatedNotes = {
                    ...existingStageNotes,
                    [lead.stage]: [...stageNotes, newNote],
                  };

                  onEdit({
                    ...lead,
                    stageNotes: updatedNotes,
                  });
                }}
                onEditNote={(index, content) => {
                  const existingStageNotes = lead.stageNotes || {};
                  const stageNotes = [
                    ...(existingStageNotes[lead.stage] || []),
                  ];

                  stageNotes[index] = {
                    ...stageNotes[index],
                    content,
                    editedAt: new Date().toISOString(),
                  };

                  const updatedNotes = {
                    ...existingStageNotes,
                    [lead.stage]: stageNotes,
                  };

                  onEdit({
                    ...lead,
                    stageNotes: updatedNotes,
                  });
                }}
                title={`${lead.stage} Notes`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({
  id,
  title,
  color,
  leads,
  onEditLead,
  onStageTransition,
}) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col rounded-lg bg-gray-50 dark:bg-gray-900 border">
      <div className={`p-3 ${color} rounded-t-lg`}>
        <h3 className="font-medium text-white flex justify-between items-center">
          {title}
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </h3>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={onEditLead}
            onStageTransition={onStageTransition}
          />
        ))}
        {leads.length === 0 && (
          <div className="h-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  );
}

// Kanban Board Component
function KanbanBoard({ leads, onEditLead, onStageTransition }) {
  const stages = [
    { id: "New", name: "New", color: "bg-blue-500" },
    { id: "Qualified", name: "Qualified", color: "bg-purple-500" },
    { id: "Proposal Sent", name: "Proposal Sent ✅", color: "bg-amber-500" },
    { id: "Negotiation", name: "Negotiation ✅", color: "bg-orange-500" },
    { id: "Won", name: "Won", color: "bg-green-500" },
    { id: "Lost", name: "Lost", color: "bg-red-500" },
  ];

  const leadsByStage = useMemo(() => {
    const result = {};

    stages.forEach((stage) => {
      result[stage.id] = leads.filter((lead) => lead.stage === stage.id);
    });

    return result;
  }, [leads, stages]);

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {stages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          id={stage.id}
          title={stage.name}
          color={stage.color}
          leads={leadsByStage[stage.id] || []}
          onEditLead={onEditLead}
          onStageTransition={onStageTransition}
        />
      ))}
    </div>
  );
}

// Lead Form Component
function LeadForm({ lead, onSave, onCancel, salespeople, contacts, allEmployees = [] }) {
  const [formData, setFormData] = useState({
    opportunityName: "",
    clientName: "",
    email: "",
    phone: "",
    expectedRevenue: 0,
    assignedTo: "",
    internalNotes: "",
    company: "",
    website: "",
    leadSource: "",
    leadScore: 0,
    isExistingClient: false,
    contactId: "",
    // New fields
    lastContactDate: "",
    nextFollowUp: "",
    stageHistory: [],
    dealValue: 0,
  });

  const [clientType, setClientType] = useState("new");
  const [activeTab, setActiveTab] = useState("basic");
  const [departments, setDepartments] = useState([]);
  const [employeesByDepartment, setEmployeesByDepartment] = useState([]);

  useEffect(() => {
    if (lead) {
      setFormData(lead);
      setClientType(lead.isExistingClient ? "existing" : "new");
    } else {
      setFormData({
        opportunityName: "",
        clientName: "",
        email: "",
        phone: "",
        expectedRevenue: 0,
        assignedTo: "",
        internalNotes: "",
        company: "",
        website: "",
        leadSource: "",
        leadScore: 0,
        isExistingClient: false,
        contactId: "",
        // New fields
        lastContactDate: "",
        nextFollowUp: "",
        stageHistory: [],
        dealValue: 0,
      });
      setClientType("new");
    }
  }, [lead]);

  useEffect(() => {
    // Extract unique departments from allEmployees
    const uniqueDepartments = [
      ...new Set(allEmployees.map(emp => emp.department).filter(Boolean))
    ];
    setDepartments(uniqueDepartments);

    // If a department is already selected, update employeesByDepartment
    if (formData.assignedToDepartment) {
      const filtered = allEmployees.filter(
        emp => emp.department === formData.assignedToDepartment
      );
      setEmployeesByDepartment(filtered);
    } else {
      setEmployeesByDepartment([]);
    }
  }, [allEmployees, formData.assignedToDepartment]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    if (name === "assignedTo") {
      const emp = allEmployees.find((e) => e.id === value);
      setFormData((prev) => ({
        ...prev,
        assignedTo: value,
        assignedToName: emp ? `${emp.firstName} ${emp.lastName}` : "",
        AssighnedToEmail: emp ? emp.email : "", // <-- set email here
      }));
    } else if (name === "assignedToDepartment") {
      setFormData((prev) => ({
        ...prev,
        assignedToDepartment: value,
        assignedTo: "",
        assignedToName: "",
        AssighnedToEmail: "", // clear email when department changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClientTypeChange = (value) => {
    setClientType(value);
    setFormData((prev) => ({
      ...prev,
      isExistingClient: value === "existing",
      contactId: value === "existing" ? prev.contactId : "",
    }));
  };

  const handleContactSelect = (contactId) => {
    const selectedContact = contacts.find((c) => c.id === contactId);
    if (selectedContact) {
      setFormData((prev) => ({
        ...prev,
        contactId,
        clientName: selectedContact.name,
        email: selectedContact.email,
        phone: selectedContact.phone,
        company: selectedContact.company || "",
        website: selectedContact.website || "",
      }));
    }
  };

  // Helper function to save a new contact to the backend
  const saveContact = async (contactData) => {
    const res = await fetch(`${backEndURL}/api/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactData),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save contact");
    }
    return await res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Find the salesperson name based on the ID
    const assignedSalesperson = salespeople.find(
      (sp) => sp.id === formData.assignedTo
    );

    // Initialize stage history if it's a new lead
    let stageHistory = formData.stageHistory || [];
    if (!lead) {
      stageHistory = [
        {
          stage: "New",
          date: new Date().toISOString(),
          notes: "Lead created",
          changedBy: assignedSalesperson?.name || "System",
        },
      ];
    }

    try {
      if (clientType === "new") {
        const contactData = {
          name: formData.clientName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          website: formData.website,
          notes: "Created from lead form",
        };

        await saveContact(contactData);
      }

      // Proceed to save the lead
      onSave({
        ...formData,
        id: lead?.id || Date.now().toString(),
        stage: formData.stage || "New",
        assignedToName: assignedSalesperson?.name || "",
        isExistingClient: clientType === "existing",
        stageHistory,
      });
    } catch (error) {
      console.error("Error saving contact or lead:", error);
      alert("Failed to save new contact. Please try again.");
    }
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-auto mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {lead ? "Edit Lead" : "Add New Lead"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      <div className="max-h-[500px] max-w-[1000px] overflow-y-auto pr-2">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Client Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={clientType === "new"}
                    onChange={() => handleClientTypeChange("new")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>New Client</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={clientType === "existing"}
                    onChange={() => handleClientTypeChange("existing")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Existing Client</span>
                </label>
              </div>
            </div>

            {clientType === "existing" && (
              <div className="space-y-2">
                <label
                  htmlFor="contactId"
                  className="block text-sm font-medium"
                >
                  Select Existing Client
                </label>
                <select
                  id="contactId"
                  value={formData.contactId || ""}
                  onChange={(e) => handleContactSelect(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="">Select a client</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="opportunityName"
                className="block text-sm font-medium"
              >
                Opportunity Name *
              </label>
              <input
                id="opportunityName"
                name="opportunityName"
                value={formData.opportunityName || ""}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>

            {/* Update in the LeadForm component, modify the return statement containing the form */}
            {/* Inside LeadForm, modify the clientType section to always show the internal notes tab */}
            {
              <div>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === "basic"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500"
                      }`}
                    onClick={() => setActiveTab("basic")}
                  >
                    Basic Information
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === "notes"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500"
                      }`}
                    onClick={() => setActiveTab("notes")}
                  >
                    Internal Notes
                  </button>
                </div>

                {activeTab === "basic" && (
                  <div className="grid grid-cols-2 gap-4">
                    {clientType === "new" && (
                      <>
                        <div className="space-y-2">
                          <label
                            htmlFor="clientName"
                            className="block text-sm font-medium"
                          >
                            Client Name *
                          </label>
                          <input
                            id="clientName"
                            name="clientName"
                            value={formData.clientName || ""}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium"
                          >
                            Email *
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium"
                          >
                            Phone *
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="company"
                            className="block text-sm font-medium"
                          >
                            Company
                          </label>
                          <input
                            id="company"
                            name="company"
                            value={formData.company || ""}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="website"
                            className="block text-sm font-medium"
                          >
                            Website
                          </label>
                          <input
                            id="website"
                            name="website"
                            value={formData.website || ""}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="space-y-2">
                    <label
                      htmlFor="internalNotes"
                      className="block text-sm font-medium"
                    >
                      Internal Notes
                    </label>
                    <textarea
                      id="internalNotes"
                      name="internalNotes"
                      value={formData.internalNotes || ""}
                      onChange={handleChange}
                      rows={8}
                      placeholder="Add any internal notes or observations about this lead"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            }

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="expectedRevenue"
                  className="block text-sm font-medium"
                >
                  Expected Revenue ($)
                </label>
                <input
                  id="expectedRevenue"
                  name="expectedRevenue"
                  type="number"
                  value={formData.expectedRevenue || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="assignedToDepartment"
                  className="block text-sm font-medium"
                >
                  Department
                </label>
                <select
                  id="assignedToDepartment"
                  value={formData.assignedToDepartment || ""}
                  onChange={(e) =>
                    handleSelectChange("assignedToDepartment", e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="">Select the Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="assignedTo"
                  className="block text-sm font-medium"
                >
                  Assign to
                </label>
                <select
                  id="assignedTo"
                  value={formData.assignedTo || ""}
                  onChange={(e) =>
                    handleSelectChange("assignedTo", e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  // disabled={!formData.assignedToDepartment}
                >
                  <option value="">Select the employee</option>
                  {employeesByDepartment.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="AssighnedToEmail"
                  className="block text-sm font-medium"
                >
                  Assighned Email
                </label>
                <input
                  id="AssighnedToEmail"
                  name="AssighnedToEmail"
                  type="text"
                  value={formData.AssighnedToEmail || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  readOnly
                >
                </input>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="leadSource"
                  className="block text-sm font-medium"
                >
                  Lead Source
                </label>
                <input
                  id="leadSource"
                  name="leadSource"
                  type="text"
                  value={formData.leadSource || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                </input>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="leadScore"
                  className="block text-sm font-medium"
                >
                  Lead Score (0-100)
                </label>
                <input
                  id="leadScore"
                  name="leadScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.leadScore || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastContactDate"
                  className="block text-sm font-medium"
                >
                  Last Contact Date
                </label>
                <input
                  id="lastContactDate"
                  name="lastContactDate"
                  type="date"
                  value={formData.lastContactDate || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="nextFollowUp"
                  className="block text-sm font-medium"
                >
                  Next Follow-up Date
                </label>
                <input
                  id="nextFollowUp"
                  name="nextFollowUp"
                  type="date"
                  value={formData.nextFollowUp || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {lead ? "Update Lead" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Contact Form Component
function ContactForm({ contact, onSave, onCancel }) {
  const [formData, setFormData] = useState(contact || {});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const method = contact ? "PUT" : "POST";
      const url = contact
        ? `${backEndURL}/api/contacts/${contact.id}`
        : `${backEndURL}/api/contacts`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save contact");
      }
      const saved = await res.json();
      onSave(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10 max-w-3xl w-full min-h-[500px] mx-auto transition-all duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100">
          {contact ? "Edit Contact" : "Add New Contact"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { id: "name", label: "Name *", type: "text", required: true },
            { id: "email", label: "Email *", type: "email", required: true },
            { id: "phone", label: "Phone *", type: "text", required: true },
            { id: "company", label: "Company", type: "text" },
            { id: "website", label: "Website", type: "text" },
          ].map(({ id, label, type, required }) => (
            <div key={id} className="space-y-1">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
              <input
                id={id}
                name={id}
                type={type}
                required={required}
                value={formData[id] || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              />
            </div>
          ))}

          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about this contact"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            disabled={loading}
          >
            {contact ? "Update Contact" : "Add Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Contacts Table Component
function ContactsTable({ contacts, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`${backEndURL}/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete contact");
      }
      onDelete(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company &&
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Contacts</h2>
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            placeholder="Search contacts..."
            className="pl-8 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-sm">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contact.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contact.company || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(contact)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit size={16} />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        disabled={deletingId === contact.id}
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {searchTerm
                    ? "No contacts found matching your search."
                    : "No contacts found. Add your first contact!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Delete Confirmation Dialog Component
function DeleteConfirmationDialog({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          This will permanently delete this contact. This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between z-50`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white">
        <X size={16} />
      </button>
    </div>
  );
}

// Main CRM Application
export default function CrmPipeline() {
  const [leads, setLeads] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState(null);
  const [filterSalesperson, setFilterSalesperson] = useState(null);

  const [activeView, setActiveView] = useState("pipeline"); // "pipeline" or "contacts"
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  // New state for stage transition dialog
  const [isStageTransitionDialogOpen, setIsStageTransitionDialogOpen] =
    useState(false);
  const [transitioningLead, setTransitioningLead] = useState(null);
  const [targetStage, setTargetStage] = useState(null);
  const [stageValidationErrors, setStageValidationErrors] = useState([]);

  const [toast, setToast] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);

  useEffect(() => {
    // Initialize with sample data
    setSalespeople(generateSampleSalespeople());
    fetchContacts();
    fetchEmployees();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${backEndURL}/api/contacts`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      setContacts([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${backEndURL}/api/employees`);
      const data = await res.json();
      if (data.success) {
        setAllEmployees(data.data);
      }
    } catch (err) {
      setAllEmployees([]);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleAddLead = (lead) => {
    if (editingLead) {
      setLeads(leads.map((l) => (l.id === lead.id ? lead : l)));
      showToast(`${lead.opportunityName} has been updated.`);
    } else {
      setLeads([...leads, { ...lead, id: `lead-${Date.now()}`, stage: "New" }]);
      showToast(`${lead.opportunityName} has been added to the pipeline.`);
    }
    setIsLeadFormOpen(false);
    setEditingLead(null);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setIsLeadFormOpen(true);
  };

  const handleStageTransition = (lead, nextStage) => {
    // For simple transitions (New → Qualified, Qualified → Proposal Sent, etc.)
    if (nextStage !== "Won" && nextStage !== "Lost") {
      const now = new Date().toISOString();
      const assignedPerson = salespeople.find(
        (sp) => sp.id === lead.assignedTo
      );
      const assignedName = assignedPerson?.name || "System";

      // Create history entry
      const historyEntry = {
        stage: nextStage,
        date: now,
        notes: `Stage changed to ${nextStage}`,
        changedBy: assignedName,
      };

      // Update lead
      const updatedLead = {
        ...lead,
        stage: nextStage,
        stageHistory: [...(lead.stageHistory || []), historyEntry],
      };

      // Update state
      setLeads(leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
      showToast(`${lead.opportunityName} has moved to ${nextStage}.`);
    }
    // For Won/Lost, still show the dialog
    else {
      const errors = validateStageTransition(lead, nextStage);
      setStageValidationErrors(errors);
      setTransitioningLead(lead);
      setTargetStage(nextStage);
      setIsStageTransitionDialogOpen(true);
    }
  };

  const validateStageTransition = (lead, targetStage) => {
    const errors = [];

    // Cannot skip stages
    const stageOrder = [
      "New",
      "Qualified",
      "Proposal Sent",
      "Negotiation",
      "Won",
      "Lost",
    ];
    const currentIndex = stageOrder.indexOf(lead.stage);
    const targetIndex = stageOrder.indexOf(targetStage);

    if (targetStage !== "Lost" && targetIndex > currentIndex + 1) {
      errors.push(`Cannot skip from ${lead.stage} to ${targetStage}`);
    }

    // Stage-specific validations
    if (targetStage === "Qualified") {
      if (!lead.contactAttempts || lead.contactAttempts.length === 0) {
        if (!lead.lastContactDate) {
          errors.push("At least one contact attempt must be logged");
        }
      }
    }

    if (targetStage === "Proposal Sent") {
      if (!lead.proposalDocument) {
        errors.push("Proposal document must be attached");
      }
    }

    if (targetStage === "Negotiation") {
      if (!lead.nextFollowUp) {
        errors.push("Follow-up date must be set");
      }
    }

    if (targetStage === "Won" || targetStage === "Lost") {
      if (!lead.dealValue) {
        errors.push("Deal value must be specified");
      }
    }

    return errors;
  };

  const confirmStageTransition = (nextStage, notes, formData, attachments) => {
    const now = new Date().toISOString();
    const assignedPerson = salespeople.find(
      (sp) => sp.id === transitioningLead.assignedTo
    );
    const assignedName = assignedPerson?.name || "System";

    // Create history entry
    const historyEntry = {
      stage: nextStage,
      date: now,
      notes: notes,
      changedBy: assignedName,
    };

    // Update lead with stage-specific data
    let updatedLead = {
      ...transitioningLead,
      stage: nextStage,
      stageHistory: [...(transitioningLead.stageHistory || []), historyEntry],
    };

    // Add stage-specific data
    switch (nextStage) {
      case "Qualified":
        updatedLead = {
          ...updatedLead,
          lastContactDate: now,
          contactAttempts: [
            ...(updatedLead.contactAttempts || []),
            {
              date: now,
              details: formData.contactDetails,
              type: "qualification",
            },
          ],
        };
        break;
      case "Proposal Sent":
        updatedLead = {
          ...updatedLead,
          proposalSentDate: now,
          proposalDocument: attachments.length > 0 ? attachments[0].name : null,
          dealValue: formData.proposalValue || updatedLead.expectedRevenue,
        };
        break;
      case "Negotiation":
        updatedLead = {
          ...updatedLead,
          negotiationStartDate: now,
          nextFollowUp: formData.followUpDate,
          clientFeedback: formData.clientFeedback,
        };
        break;
      case "Won":
        updatedLead = {
          ...updatedLead,
          wonLostDate: formData.closingDate || now,
          dealValue: formData.finalDealValue || updatedLead.expectedRevenue,
        };
        break;
      case "Lost":
        updatedLead = {
          ...updatedLead,
          wonLostDate: formData.closingDate || now,
          lostReason: formData.lostReason,
          competitorInfo: formData.competitorInfo,
        };
        break;
    }

    // Update leads state
    setLeads(leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)));

    // Show toast
    if (nextStage === "Won") {
      showToast(
        `Congratulations! ${updatedLead.opportunityName} has been won.`,
        "success"
      );
    } else if (nextStage === "Lost") {
      showToast(
        `${updatedLead.opportunityName} has been marked as lost.`,
        "error"
      );
    } else {
      showToast(`${updatedLead.opportunityName} has moved to ${nextStage}.`);
    }

    // Close dialog
    setIsStageTransitionDialogOpen(false);
    setTransitioningLead(null);
    setTargetStage(null);
    setStageValidationErrors([]);
  };

  const handleAddContact = (contact) => {
    if (editingContact) {
      setContacts(contacts.map((c) => (c.id === contact.id ? contact : c)));
      showToast(`${contact.name} has been updated.`);
    } else {
      const newContact = {
        ...contact,
        id: `contact-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setContacts([...contacts, newContact]);
      showToast(`${contact.name} has been added to your contacts.`);
    }
    setIsContactFormOpen(false);
    setEditingContact(null);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setIsContactFormOpen(true);
  };

  const handleDeleteContact = (id) => {
    setContactToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteContact = () => {
    // Check if contact is used in any leads
    const isContactUsed = leads.some(
      (lead) => lead.contactId === contactToDelete
    );

    if (isContactUsed) {
      showToast("This contact is associated with one or more leads.", "error");
    } else {
      setContacts(contacts.filter((c) => c.id !== contactToDelete));
      showToast("The contact has been removed from your contacts.", "error");
    }

    setIsDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.opportunityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = filterStage === null || lead.stage === filterStage;

    const matchesSalesperson =
      filterSalesperson === null || lead.assignedTo === filterSalesperson;

    return matchesSearch && matchesStage && matchesSalesperson;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView("pipeline")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeView === "pipeline"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setActiveView("contacts")}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeView === "contacts"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
              >
                <Users size={16} className="mr-1" /> Contacts
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === "pipeline" && (
          <>
            {/* Top Controls */}
            <div className="mb-6 flex justify-between items-center">

              <button
                onClick={() => {
                  setEditingLead(null);
                  setIsLeadFormOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> New Lead
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <input
                  placeholder="Search leads..."
                  className="pl-8 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />
                <select
                  value={filterStage || ""}
                  onChange={(e) =>
                    setFilterStage(
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="">All Stages</option>
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <select
                  value={filterSalesperson || ""}
                  onChange={(e) =>
                    setFilterSalesperson(
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="">All Salespeople</option>
                  {salespeople.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="h-[calc(100vh-220px)] overflow-x-auto">
              <KanbanBoard
                leads={filteredLeads}
                onEditLead={handleEditLead}
                onStageTransition={handleStageTransition}
              />
            </div>
          </>
        )}

        {activeView === "contacts" && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Contacts Management</h2>
              <button
                onClick={() => {
                  setEditingContact(null);
                  setIsContactFormOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> New Contact
              </button>
            </div>
            <ContactsTable
              contacts={contacts}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          </>
        )}
      </main>

      {/* Lead Form */}
      {isLeadFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4 overflow-y-auto">
          <LeadForm
            lead={editingLead}
            onSave={handleAddLead}
            onCancel={() => {
              setIsLeadFormOpen(false);
              setEditingLead(null);
            }}
            salespeople={salespeople}
            contacts={contacts}
            allEmployees={allEmployees}
          />
        </div>
      )}

      {/* Contact Form */}
      {isContactFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4 overflow-y-auto">
          <ContactForm
            contact={editingContact}
            onSave={handleAddContact}
            onCancel={() => {
              setIsContactFormOpen(false);
              setEditingContact(null);
            }}
          />
        </div>
      )}

      {/* Stage Transition Dialog */}
      <StageTransitionDialog
        isOpen={isStageTransitionDialogOpen}
        onClose={() => {
          setIsStageTransitionDialogOpen(false);
          setTransitioningLead(null);
          setTargetStage(null);
          setStageValidationErrors([]);
        }}
        onConfirm={confirmStageTransition}
        lead={transitioningLead}
        currentStage={transitioningLead?.stage}
        nextStage={targetStage}
        validationErrors={stageValidationErrors}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteContact}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}