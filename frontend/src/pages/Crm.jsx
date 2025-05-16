"use client"

import { useState, useEffect, useMemo } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
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
} from "lucide-react"

// Utility function to conditionally join class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

// Sample data generation functions
function generateSampleLeads(count = 5) {
  const stages = ["New", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"]
  const sources = ["Website", "Referral", "Social Media", "Email Campaign", "Event"]
  const companies = ["Acme Inc", "Globex Corp", "Initech", "Umbrella Corp", "Stark Industries"]

  const leads = []

  for (let i = 0; i < count; i++) {
    const assignedToId = `sp-${Math.floor(Math.random() * 5) + 1}`
    const assignedToName = getSalespersonName(assignedToId)
    const isExistingClient = Math.random() > 0.7 // 30% chance of being an existing client
    const stage = stages[Math.floor(Math.random() * 4)] // Only use first 4 stages for new leads

    leads.push({
      id: `lead-${Date.now()}-${i}`,
      opportunityName: `Opportunity ${i + 1}`,
      clientName: getRandomName(),
      email: `client${i + 1}@example.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      expectedRevenue: Math.floor(Math.random() * 100000) + 5000,
      assignedTo: assignedToId,
      assignedToName,
      stage,
      internalNotes: Math.random() > 0.5 ? "Follow up needed. Client seems interested in our premium plan." : "",
      company: companies[Math.floor(Math.random() * companies.length)],
      website: `https://example${i + 1}.com`,
      leadSource: sources[Math.floor(Math.random() * sources.length)],
      leadScore: Math.floor(Math.random() * 100),
      isExistingClient,
      contactId: isExistingClient ? `contact-${Math.floor(Math.random() * 5) + 1}` : undefined,
    })
  }

  return leads
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
  ]
}

function generateSampleContacts() {
  const companies = ["Acme Inc", "Globex Corp", "Initech", "Umbrella Corp", "Stark Industries"]

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
  ]
}

function getSalespersonName(id) {
  const salespeople = {
    "sp-1": "John Doe",
    "sp-2": "Jane Smith",
    "sp-3": "nashad",
    "sp-4": "Emily Davis",
    "sp-5": "Michael Wilson",
  }

  return salespeople[id] || ""
}

function getRandomName() {
  const firstNames = ["Alex", "Taylor", "Jordan", "Casey", "Morgan", "Riley", "Jamie", "Quinn", "Avery", "Cameron"]
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
  ]

  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

// Inside the LeadCard component, add these SVG graphics after the imports but before the component definition:
function SuccessGraffiti() {
  return (
    <div className="absolute -right-2 -top-2 rotate-12 z-10">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M55 30C55 43.8071 43.8071 55 30 55C16.1929 55 5 43.8071 5 30C5 16.1929 16.1929 5 30 5C43.8071 5 55 16.1929 55 30Z"
          fill="#22c55e"
          fillOpacity="0.8"
        />
        <path d="M22 32L27 37L38 26" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 10L10 2M2 2L10 10" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 10L58 2M50 2L58 10" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <path d="M10 50L18 42M10 42L18 50" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 50L58 42M50 42L58 50" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function SadGraffiti() {
  return (
    <div className="absolute -right-2 -top-2 rotate-12 z-10">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M55 30C55 43.8071 43.8071 55 30 55C16.1929 55 5 43.8071 5 30C5 16.1929 16.1929 5 30 5C43.8071 5 55 16.1929 55 30Z"
          fill="#ef4444"
          fillOpacity="0.8"
        />
        <path d="M20 40C23.3333 36.6667 36.6667 36.6667 40 40" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="22" cy="25" r="3" fill="white" />
        <circle cx="38" cy="25" r="3" fill="white" />
        <path d="M2 10L10 2M2 2L10 10" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 10L58 2M50 2L58 10" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <path d="M10 50L18 42M10 42L18 50" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 50L58 42M50 42L58 50" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// Lead Card Component
function LeadCard({ lead, onEdit, onMarkAsLost, onMarkAsWon }) {
  const [expanded, setExpanded] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: "lead",
    item: { id: lead.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => lead.stage !== "Won" && lead.stage !== "Lost",
  })

  const getLeadScoreBadge = () => {
    const score = lead.leadScore || 0
    if (score >= 80) return <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Hot</span>
    if (score >= 50) return <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Warm</span>
    return <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Cold</span>
  }

  return (
    <div
      ref={drag}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border shadow-sm cursor-pointer transition-all relative",
        isDragging ? "opacity-50" : "opacity-100",
        expanded ? "ring-1 ring-blue-500" : "",
        lead.stage === "Won" && "border-green-500 bg-green-50 dark:bg-green-900/20",
        lead.stage === "Lost" && "border-red-500 bg-red-50 dark:bg-red-900/20",
        lead.isExistingClient && "border-l-4 border-l-blue-500",
      )}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {lead.stage === "Won" && <SuccessGraffiti />}
      {lead.stage === "Lost" && <SadGraffiti />}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-sm">{lead.clientName}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{lead.opportunityName}</p>
          </div>
          <div className="flex items-center gap-1">
            {lead.isExistingClient && (
              <span className="border border-blue-500 text-blue-500 text-xs px-2 py-0.5 rounded-full flex items-center">
                <User size={10} className="mr-1" /> Existing
              </span>
            )}
            {getLeadScoreBadge()}
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

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button className="flex-1 py-1 px-2 text-xs font-medium border-b-2 border-blue-500">Details</button>
              <button className="flex-1 py-1 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Notes</button>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Expected Revenue:</span>
                <span className="font-medium">${lead.expectedRevenue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Assigned To:</span>
                <span className="font-medium">{lead.assignedToName}</span>
              </div>
              {lead.company && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Company:</span>
                  <span className="font-medium">{lead.company}</span>
                </div>
              )}
              {(lead.stage === "Won" || lead.stage === "Lost") && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={cn("font-medium", lead.stage === "Won" ? "text-green-500" : "text-red-500")}>
                    {lead.stage}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                className="w-full text-xs h-8 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                onClick={() => onEdit(lead)}
              >
                <Edit size={12} className="mr-1" /> Edit
              </button>
              {lead.stage !== "Won" && lead.stage !== "Lost" && (
                <>
                  <button
                    className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
                    onClick={() => onMarkAsWon(lead.id)}
                  >
                    <Check size={12} className="mr-1" /> Won
                  </button>
                  <button
                    className="w-full text-xs h-8 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center"
                    onClick={() => onMarkAsLost(lead.id)}
                  >
                    <X size={12} className="mr-1" /> Lost
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Kanban Column Component
function KanbanColumn({ id, title, color, leads, onMoveLead, onEditLead, onMarkAsLost, onMarkAsWon }) {
  const [{ isOver }, drop] = useDrop({
    accept: "lead",
    drop: (item) => {
      onMoveLead(item.id, id)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  return (
    <div
      ref={drop}
      className={cn(
        "flex-shrink-0 w-80 flex flex-col rounded-lg bg-gray-50 dark:bg-gray-900 border",
        isOver && "border-blue-500 border-dashed",
      )}
    >
      <div className={`p-3 ${color} rounded-t-lg`}>
        <h3 className="font-medium text-white flex justify-between items-center">
          {title}
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">{leads.length}</span>
        </h3>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={onEditLead}
            onMarkAsLost={onMarkAsLost}
            onMarkAsWon={onMarkAsWon}
          />
        ))}
        {leads.length === 0 && (
          <div className="h-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  )
}

// Kanban Board Component
function KanbanBoard({ leads, onMoveLead, onEditLead, onMarkAsLost, onMarkAsWon }) {
  const stages = [
    { id: "New", name: "New", color: "bg-blue-500" },
    { id: "Qualified", name: "Qualified", color: "bg-purple-500" },
    { id: "Proposal Sent", name: "Proposal Sent ✅", color: "bg-amber-500" },
    { id: "Negotiation", name: "Negotiation ✅", color: "bg-orange-500" },
    { id: "Won", name: "Won", color: "bg-green-500" },
    { id: "Lost", name: "Lost", color: "bg-red-500" },
  ]

  const leadsByStage = useMemo(() => {
    const result = {}

    stages.forEach((stage) => {
      result[stage.id] = leads.filter((lead) => lead.stage === stage.id)
    })

    return result
  }, [leads, stages])

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {stages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          id={stage.id}
          title={stage.name}
          color={stage.color}
          leads={leadsByStage[stage.id] || []}
          onMoveLead={onMoveLead}
          onEditLead={onEditLead}
          onMarkAsLost={onMarkAsLost}
          onMarkAsWon={onMarkAsWon}
        />
      ))}
    </div>
  )
}

// Lead Form Component
function LeadForm({ lead, onSave, onCancel, salespeople, contacts }) {
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
  })

  const [clientType, setClientType] = useState("new")
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    if (lead) {
      setFormData(lead)
      setClientType(lead.isExistingClient ? "existing" : "new")
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
      })
      setClientType("new")
    }
  }, [lead])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "expectedRevenue" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      assignedToName:
        name === "assignedTo" ? salespeople.find((sp) => sp.id === value)?.name || "" : prev.assignedToName,
    }))
  }

  const handleClientTypeChange = (value) => {
    setClientType(value)
    setFormData((prev) => ({
      ...prev,
      isExistingClient: value === "existing",
      contactId: value === "existing" ? prev.contactId : "",
    }))
  }

  const handleContactSelect = (contactId) => {
    const selectedContact = contacts.find((c) => c.id === contactId)
    if (selectedContact) {
      setFormData((prev) => ({
        ...prev,
        contactId,
        clientName: selectedContact.name,
        email: selectedContact.email,
        phone: selectedContact.phone,
        company: selectedContact.company || "",
        website: selectedContact.website || "",
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Find the salesperson name based on the ID
    const assignedSalesperson = salespeople.find((sp) => sp.id === formData.assignedTo)

    onSave({
      ...formData,
      id: lead?.id || Date.now().toString(),
      stage: lead?.stage || "New",
      assignedToName: assignedSalesperson?.name || "",
      isExistingClient: clientType === "existing",
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{lead ? "Edit Lead" : "Add New Lead"}</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

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
              <label htmlFor="contactId" className="block text-sm font-medium">
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
            <label htmlFor="opportunityName" className="block text-sm font-medium">
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

          {clientType === "new" && (
            <div>
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium ${activeTab === "basic" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  onClick={() => setActiveTab("basic")}
                >
                  Basic Information
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium ${activeTab === "notes" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  onClick={() => setActiveTab("notes")}
                >
                  Internal Notes
                </button>
              </div>

              {activeTab === "basic" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="clientName" className="block text-sm font-medium">
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
                    <label htmlFor="email" className="block text-sm font-medium">
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
                    <label htmlFor="phone" className="block text-sm font-medium">
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
                    <label htmlFor="company" className="block text-sm font-medium">
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
                    <label htmlFor="website" className="block text-sm font-medium">
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
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-2">
                  <label htmlFor="internalNotes" className="block text-sm font-medium">
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="expectedRevenue" className="block text-sm font-medium">
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
              <label htmlFor="assignedTo" className="block text-sm font-medium">
                Assign to Salesperson
              </label>
              <select
                id="assignedTo"
                value={formData.assignedTo || ""}
                onChange={(e) => handleSelectChange("assignedTo", e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="">Select a salesperson</option>
                {salespeople.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="leadSource" className="block text-sm font-medium">
                Lead Source
              </label>
              <select
                id="leadSource"
                value={formData.leadSource || ""}
                onChange={(e) => handleSelectChange("leadSource", e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="">Select a source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="email">Email Campaign</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="leadScore" className="block text-sm font-medium">
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
  )
}

// Contact Form Component
function ContactForm({ contact, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    notes: "",
  })

  useEffect(() => {
    if (contact) {
      setFormData(contact)
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        website: "",
        notes: "",
      })
    }
  }, [contact])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      id: contact?.id || `contact-${Date.now()}`,
      createdAt: contact?.createdAt || new Date().toISOString(),
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{contact ? "Edit Contact" : "Add New Contact"}</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name *
            </label>
            <input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
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
            <label htmlFor="phone" className="block text-sm font-medium">
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
            <label htmlFor="company" className="block text-sm font-medium">
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
            <label htmlFor="website" className="block text-sm font-medium">
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
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about this contact"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
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
            {contact ? "Update Contact" : "Add Contact"}
          </button>
        </div>
      </form>
    </div>
  )
}

// Contacts Table Component
function ContactsTable({ contacts, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{contact.name}</td>
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
                        onClick={() => onDelete(contact.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
  )
}

// Lost Lead Dialog Component
function LostLeadDialog({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    onConfirm(reason, notes)
    setReason("")
    setNotes("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Mark as Lost</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Lost Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why was this deal lost?"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Closing Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this lost opportunity"
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
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
          >
            Mark as Lost
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Dialog Component
function DeleteConfirmationDialog({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          This will permanently delete this contact. This action cannot be undone.
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
  )
}

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between z-50`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white">
        <X size={16} />
      </button>
    </div>
  )
}

// Main CRM Application
export default function CrmSinglePage() {
  const [leads, setLeads] = useState([])
  const [salespeople, setSalespeople] = useState([])
  const [contacts, setContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStage, setFilterStage] = useState(null)
  const [filterSalesperson, setFilterSalesperson] = useState(null)

  const [activeView, setActiveView] = useState("pipeline") // "pipeline" or "contacts"
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [editingContact, setEditingContact] = useState(null)
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false)
  const [leadToMarkAsLost, setLeadToMarkAsLost] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState(null)

  const [toast, setToast] = useState(null)

  useEffect(() => {
    // Initialize with sample data
    setSalespeople(generateSampleSalespeople())
    setLeads(generateSampleLeads(15))
    setContacts(generateSampleContacts())
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  const handleAddLead = (lead) => {
    if (editingLead) {
      setLeads(leads.map((l) => (l.id === lead.id ? lead : l)))
      showToast(`${lead.opportunityName} has been updated.`)
    } else {
      setLeads([...leads, { ...lead, id: `lead-${Date.now()}`, stage: "New" }])
      showToast(`${lead.opportunityName} has been added to the pipeline.`)
    }
    setIsLeadFormOpen(false)
    setEditingLead(null)
  }

  const handleMoveLead = (leadId, newStage) => {
    setLeads(
      leads.map((lead) => {
        if (lead.id === leadId) {
          return { ...lead, stage: newStage }
        }
        return lead
      }),
    )
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setIsLeadFormOpen(true)
  }

  const handleMarkAsLost = (leadId) => {
    setLeadToMarkAsLost(leadId)
    setIsLostDialogOpen(true)
  }

  const confirmMarkAsLost = (reason, notes) => {
    setLeads(
      leads.map((lead) => {
        if (lead.id === leadToMarkAsLost) {
          return {
            ...lead,
            stage: "Lost",
            lostReason: reason,
            closingNotes: notes,
          }
        }
        return lead
      }),
    )
    setIsLostDialogOpen(false)
    setLeadToMarkAsLost(null)
    showToast("The lead has been moved to the Lost stage.", "error")
  }

  const handleMarkAsWon = (leadId) => {
    setLeads(
      leads.map((lead) => {
        if (lead.id === leadId) {
          return { ...lead, stage: "Won" }
        }
        return lead
      }),
    )
    showToast("Congratulations on closing the deal!", "success")
  }

  const handleAddContact = (contact) => {
    if (editingContact) {
      setContacts(contacts.map((c) => (c.id === contact.id ? contact : c)))
      showToast(`${contact.name} has been updated.`)
    } else {
      const newContact = {
        ...contact,
        id: `contact-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      setContacts([...contacts, newContact])
      showToast(`${contact.name} has been added to your contacts.`)
    }
    setIsContactFormOpen(false)
    setEditingContact(null)
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setIsContactFormOpen(true)
  }

  const handleDeleteContact = (contactId) => {
    setContactToDelete(contactId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteContact = () => {
    // Check if contact is used in any leads
    const isContactUsed = leads.some((lead) => lead.contactId === contactToDelete)

    if (isContactUsed) {
      showToast("This contact is associated with one or more leads.", "error")
    } else {
      setContacts(contacts.filter((c) => c.id !== contactToDelete))
      showToast("The contact has been removed from your contacts.", "error")
    }

    setIsDeleteDialogOpen(false)
    setContactToDelete(null)
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.opportunityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = filterStage === null || lead.stage === filterStage

    const matchesSalesperson = filterSalesperson === null || lead.assignedTo === filterSalesperson

    return matchesSearch && matchesStage && matchesSalesperson
  })

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveView("pipeline")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeView === "pipeline"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Pipeline
                </button>
                <button
                  onClick={() => setActiveView("contacts")}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                    activeView === "contacts"
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
                <h2 className="text-xl font-bold">Sales Pipeline</h2>
                <button
                  onClick={() => {
                    setEditingLead(null)
                    setIsLeadFormOpen(true)
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
                  <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                  <select
                    value={filterStage || ""}
                    onChange={(e) => setFilterStage(e.target.value === "" ? null : e.target.value)}
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
                    onChange={(e) => setFilterSalesperson(e.target.value === "" ? null : e.target.value)}
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
                  onMoveLead={handleMoveLead}
                  onEditLead={handleEditLead}
                  onMarkAsLost={handleMarkAsLost}
                  onMarkAsWon={handleMarkAsWon}
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
                    setEditingContact(null)
                    setIsContactFormOpen(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                >
                  <Plus size={16} className="mr-1" /> New Contact
                </button>
              </div>
              <ContactsTable contacts={contacts} onEdit={handleEditContact} onDelete={handleDeleteContact} />
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
                setIsLeadFormOpen(false)
                setEditingLead(null)
              }}
              salespeople={salespeople}
              contacts={contacts}
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
                setIsContactFormOpen(false)
                setEditingContact(null)
              }}
            />
          </div>
        )}

        {/* Lost Lead Dialog */}
        <LostLeadDialog
          isOpen={isLostDialogOpen}
          onClose={() => setIsLostDialogOpen(false)}
          onConfirm={confirmMarkAsLost}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteContact}
        />

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </DndProvider>
  )
}
