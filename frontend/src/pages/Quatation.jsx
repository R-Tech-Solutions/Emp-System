"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Send,
  Printer,
  Check,
  Eye,
  Search,
  Plus,
  MessageSquare,
  Calendar,
  ChevronDown,
  X,
  ArrowRight,
  FileText,
  Clipboard,
  DollarSign,
  Tag,
} from "lucide-react"
import { backEndURL } from "../Backendurl"

export default function QuotationManagement() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("new")

  // State for quotations list (mock data)
  const [quotations, setQuotations] = useState([
    {
      id: "S00001",
      customer: "Acme Corporation",
      date: "2025-05-10",
      amount: 12500,
      stage: "Quotation Sent",
      products: 3,
    },
    {
      id: "S00002",
      customer: "Globex Industries",
      date: "2025-05-12",
      amount: 8750,
      stage: "Sales Order",
      products: 2,
    },
    {
      id: "S00003",
      customer: "Stark Enterprises",
      date: "2025-05-15",
      amount: 22000,
      stage: "Quotation",
      products: 5,
    },
    {
      id: "S00004",
      customer: "Wayne Enterprises",
      date: "2025-05-16",
      amount: 15300,
      stage: "Quotation Sent",
      products: 4,
    },
    {
      id: "S00005",
      customer: "Umbrella Corporation",
      date: "2025-05-18",
      amount: 9200,
      stage: "Quotation",
      products: 2,
    },
  ])

  // State for quotation data
  const [stage, setStage] = useState("Quotation")
  const [customer, setCustomer] = useState("")
  const [expirationDate, setExpirationDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split("T")[0]
  })
  const [pricelist, setPricelist] = useState("Standard")
  const [paymentTerms, setPaymentTerms] = useState("Immediate")
  const [termsConditions, setTermsConditions] = useState(
    "1. Prices are valid for 30 days from the date of quotation.\n" +
    "2. Delivery timeline will be confirmed upon order confirmation.\n" +
    "3. Payment terms as specified above.\n" +
    "4. Warranty as per manufacturer's policy.",
  )

  // State for product lines
  const [productLines, setProductLines] = useState([
    { id: 1, product: "", quantity: 1, unitPrice: 0, taxes: 0, amount: 0 },
  ])

  // State for modals
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [createProductModalOpen, setCreateProductModalOpen] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")

  // State for new product
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    category: "General",
  })

  // State for activity logs
  const [activities, setActivities] = useState([
    { id: 1, time: "Just now", message: "Creating a new quotation...", user: "You" },
  ])

  // State for products (mock data initially)
  const [products, setProducts] = useState([])

  // State for contacts and crm leads
  const [contacts, setContacts] = useState([]);
  const [crmLeads, setCrmLeads] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [project, setProject] = useState("");

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
    fetchContacts()
    fetchCrmLeads()
    // eslint-disable-next-line
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/products`)
      setProducts(res.data)
    } catch (err) {
      addActivity("Failed to fetch products from server.")
    }
  }

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/contacts`);
      setContacts(res.data);
    } catch (err) {
      // handle error
    }
  };

  const fetchCrmLeads = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/crm`);
      setCrmLeads(res.data);
    } catch (err) {
      // handle error
    }
  };

  // Calculate totals
  const untaxedAmount = productLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const taxAmount = productLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice * line.taxes) / 100, 0)
  const totalAmount = untaxedAmount + taxAmount

  // Handle product line changes
  const updateProductLine = (id, field, value) => {
    setProductLines((prevLines) =>
      prevLines.map((line) => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value }

          // Recalculate amount
          if (field === "quantity" || field === "unitPrice") {
            updatedLine.amount = updatedLine.quantity * updatedLine.unitPrice
          }

          return updatedLine
        }
        return line
      }),
    )
  }

  // Add new product line
  const addProductLine = () => {
    const newId = productLines.length > 0 ? Math.max(...productLines.map((line) => line.id)) + 1 : 1
    setProductLines([...productLines, { id: newId, product: "", quantity: 1, unitPrice: 0, taxes: 0, amount: 0 }])

    // Add activity
    addActivity("Added a new product line")
  }

  // Remove product line
  const removeProductLine = (id) => {
    if (productLines.length > 1) {
      setProductLines(productLines.filter((line) => line.id !== id))
      addActivity("Removed a product line")
    }
  }

  // Add activity log
  const addActivity = (message) => {
    const newId = activities.length > 0 ? Math.max(...activities.map((activity) => activity.id)) + 1 : 1
    setActivities([{ id: newId, time: "Just now", message, user: "You" }, ...activities])
  }

  // Handle send quotation
  const handleSendQuotation = () => {
    if (!customerEmail) return

    // Simulate sending
    addActivity(`Quotation sent to ${customerEmail}`)
    setStage("Quotation Sent")
    setSendModalOpen(false)

    // Add to quotations list
    if (!quotations.some((q) => q.id === "S00001")) {
      const newQuotation = {
        id: "S00001",
        customer: customer || "New Customer",
        date: new Date().toISOString().split("T")[0],
        amount: totalAmount,
        stage: "Quotation Sent",
        products: productLines.filter((line) => !line.isSection && !line.isNote).length,
      }
      setQuotations([newQuotation, ...quotations])
    } else {
      // Update existing quotation
      setQuotations(
        quotations.map((q) => (q.id === "S00001" ? { ...q, stage: "Quotation Sent", amount: totalAmount } : q)),
      )
    }
  }

  // Handle confirm quotation
  const handleConfirmQuotation = () => {
    setStage("Sales Order")
    addActivity("Quotation confirmed as Sales Order")

    // Update in quotations list
    if (!quotations.some((q) => q.id === "S00001")) {
      const newQuotation = {
        id: "S00001",
        customer: customer || "New Customer",
        date: new Date().toISOString().split("T")[0],
        amount: totalAmount,
        stage: "Sales Order",
        products: productLines.filter((line) => !line.isSection && !line.isNote).length,
      }
      setQuotations([newQuotation, ...quotations])
    } else {
      // Update existing quotation
      setQuotations(
        quotations.map((q) => (q.id === "S00001" ? { ...q, stage: "Sales Order", amount: totalAmount } : q)),
      )
    }
  }

  // Handle print
  const handlePrint = () => {
    addActivity("Generating PDF for download")

    // In a real application, you would use a library like jsPDF or html2pdf
    // This is a simulation of PDF download
    setTimeout(() => {
      // Create a blob that simulates a PDF file
      const pdfContent = `
        Customer Information:
        Customer: ${customer || "Not specified"}
        Expiration: ${new Date(expirationDate).toLocaleDateString()}
        Pricelist: ${pricelist}
        Payment Terms: ${paymentTerms}
        
        Order Lines:
        ${productLines
          .map((line) => {
            if (line.isSection) return `Section: ${line.sectionName}`
            if (line.isNote) return `Note: ${line.note}`
            return `Product: ${line.product || "Not specified"}, Quantity: ${line.quantity}, Unit Price: Rs ${line.unitPrice}, Taxes: ${line.taxes}%, Amount: Rs ${line.amount}`
          })
          .join("\n")}
        
        Terms & Conditions:
        ${termsConditions}
        
        Untaxed Amount: Rs ${untaxedAmount.toLocaleString()}
        Taxes: Rs ${taxAmount.toLocaleString()}
        Total: Rs ${totalAmount.toLocaleString()}
      `

      const blob = new Blob([pdfContent], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      // Create a link and trigger download
      const a = document.createElement("a")
      a.href = url
      a.download = `Quotation-S00001.pdf`
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)

      addActivity("PDF downloaded successfully")
    }, 500)
  }

  // Add a section
  const addSection = () => {
    const newId = productLines.length > 0 ? Math.max(...productLines.map((line) => line.id)) + 1 : 1
    setProductLines([
      ...productLines,
      {
        id: newId,
        isSection: true,
        sectionName: "New Section",
      },
    ])
    addActivity("Added a new section")
  }

  // Add a note
  const addNote = () => {
    const newId = productLines.length > 0 ? Math.max(...productLines.map((line) => line.id)) + 1 : 1
    setProductLines([
      ...productLines,
      {
        id: newId,
        isNote: true,
        note: "Add your note here...",
      },
    ])
    addActivity("Added a note")
  }

  // Handle creating a new product
  const handleCreateProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) return
    try {
      const res = await axios.post(`${backEndURL}/api/products`, newProduct)
      setProducts([...products, res.data])
      setCreateProductModalOpen(false)
      addActivity(`Created new product: ${newProduct.name}`)
      setNewProduct({ name: "", price: 0, description: "", category: "General" })
    } catch (err) {
      addActivity("Failed to create product.")
    }
  }

  // Handle new product input changes
  const handleNewProductChange = (field, value) => {
    setNewProduct({
      ...newProduct,
      [field]: value,
    })
  }

  // Open create product modal from product dropdown
  const openCreateProductModal = (lineId) => {
    setCreateProductModalOpen(true)
    // Store the line ID to update after product creation
    setNewProduct({
      ...newProduct,
      lineId: lineId,
    })
  }

  // Customers dropdown options (mock data)
  const customers = [
    "Acme Corporation",
    "Globex Industries",
    "Stark Enterprises",
    "Wayne Enterprises",
    "Umbrella Corporation",
  ]

  // Product categories
  const productCategories = ["General", "Electronics", "Office", "Services", "Hardware", "Software"]

  // When customer is selected, set name and email
  const handleCustomerChange = (e) => {
    const contactId = e.target.value;
    setSelectedCustomerId(contactId);
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setCustomer(contact.name);
      setCustomerEmail(contact.email);
      setSelectedCustomerEmail(contact.email);
      setProject(""); // reset project when customer changes
      setSelectedProjectId("");
    } else {
      setCustomer("");
      setCustomerEmail("");
      setSelectedCustomerEmail("");
      setProject("");
      setSelectedProjectId("");
    }
  };

  // Filter projects (leads) by selected customer email
  const filteredProjects = crmLeads.filter(
    (lead) => lead.email && lead.email === selectedCustomerEmail
  );

  // When project is selected, set project name
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    const lead = crmLeads.find((l) => l.id === projectId);
    if (lead) {
      setProject(lead.opportunityName);
    } else {
      setProject("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "new" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"
                }`}
              onClick={() => setActiveTab("new")}
            >
              New Quotation
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "all" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"
                }`}
              onClick={() => setActiveTab("all")}
            >
              View All Quotations
            </button>
          </div>

          {activeTab === "new" && (
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">New Quotation</h1>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSendModalOpen(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                >
                  <Send size={16} className="mr-2" /> Send
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                >
                  <Printer size={16} className="mr-2" /> Print
                </button>

                <button
                  onClick={handleConfirmQuotation}
                  className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm"
                  disabled={stage === "Sales Order"}
                >
                  <Check size={16} className="mr-2" /> Confirm
                </button>

                <button
                  onClick={() => setPreviewModalOpen(true)}
                  className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                >
                  <Eye size={16} className="mr-2" /> Preview
                </button>
              </div>
            </div>
          )}

          {activeTab === "all" && (
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">All Quotations</h1>

              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("new")}
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                >
                  <Plus size={16} className="mr-2" /> Create New
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      {activeTab === "new" ? (
        <>
          {/* Status Flow */}
          <div className="bg-gray-800 py-3 border-b border-gray-700">
            <div className="container mx-auto">
              <div className="flex items-center justify-center">
                <div className={`flex items-center ${stage === "Quotation" ? "text-blue-400" : "text-gray-400"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "Quotation" ? "bg-blue-600" : "bg-gray-700"}`}
                  >
                    <FileText size={16} />
                  </div>
                  <span className="ml-2">Quotation</span>
                </div>

                <ArrowRight size={20} className="mx-4 text-gray-600" />

                <div className={`flex items-center ${stage === "Quotation Sent" ? "text-blue-400" : "text-gray-400"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "Quotation Sent" ? "bg-blue-600" : "bg-gray-700"}`}
                  >
                    <Send size={16} />
                  </div>
                  <span className="ml-2">Quotation Sent</span>
                </div>

                <ArrowRight size={20} className="mx-4 text-gray-600" />

                <div className={`flex items-center ${stage === "Sales Order" ? "text-blue-400" : "text-gray-400"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "Sales Order" ? "bg-blue-600" : "bg-gray-700"}`}
                  >
                    <Clipboard size={16} />
                  </div>
                  <span className="ml-2">Sales Order</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto py-6 px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - Main Form */}
              <div className="flex-1">
                {/* Customer Info Section */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Customer Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Customer</label>
                      <div className="relative">
                        <select
                          value={selectedCustomerId}
                          onChange={handleCustomerChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a customer</option>
                          {contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                              {contact.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        readOnly
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Project</label>
                      <div className="relative">
                        <select
                          value={selectedProjectId}
                          onChange={handleProjectChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!selectedCustomerEmail}
                        >
                          <option value="">Select a Project of the customer</option>
                          {filteredProjects.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                              {lead.opportunityName}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Created by</label>
                      <input
                        type="text"
                        value=""
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiration</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          {/* <Calendar size={16} className="text-gray-400" /> */}
                        </div>
                      </div>
                    </div>

                    {/* Pricelist */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Pricelist</label>
                      <div className="relative">
                        <select
                          value={pricelist}
                          onChange={(e) => setPricelist(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Wholesale">Wholesale</option>
                          <option value="Retail">Retail</option>
                          <option value="Premium">Premium</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <Tag size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Terms</label>
                      <div className="relative">
                        <select
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="45 Days">45 Days</option>
                          <option value="60 Days">60 Days</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Order Lines */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Order Lines</h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                          <th className="pb-2 font-medium">Product</th>
                          <th className="pb-2 font-medium text-right">Quantity</th>
                          <th className="pb-2 font-medium text-right">Unit Price</th>
                          <th className="pb-2 font-medium text-right">Taxes (%)</th>
                          <th className="pb-2 font-medium text-right">Amount</th>
                          <th className="pb-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {productLines.map((line) => (
                          <tr key={line.id} className="border-b border-gray-700">
                            {line.isSection ? (
                              <td colSpan={6} className="py-3">
                                <input
                                  type="text"
                                  value={line.sectionName}
                                  onChange={(e) => updateProductLine(line.id, "sectionName", e.target.value)}
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            ) : line.isNote ? (
                              <td colSpan={6} className="py-3">
                                <textarea
                                  value={line.note}
                                  onChange={(e) => updateProductLine(line.id, "note", e.target.value)}
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-gray-300 italic focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={2}
                                />
                              </td>
                            ) : (
                              <>
                                <td className="py-3">
                                  <div className="relative">
                                    <select
                                      value={line.product}
                                      onChange={(e) => {
                                        if (e.target.value === "create_new") {
                                          openCreateProductModal(line.id)
                                        } else {
                                          const selectedProduct = products.find((p) => p.name === e.target.value)
                                          updateProductLine(line.id, "product", e.target.value)
                                          if (selectedProduct) {
                                            updateProductLine(line.id, "unitPrice", selectedProduct.price)
                                            updateProductLine(line.id, "amount", selectedProduct.price * line.quantity)
                                          }
                                        }
                                      }}
                                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 pl-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Select a product</option>
                                      {products.map((product, index) => (
                                        <option key={index} value={product.name}>
                                          {product.name}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                      <ChevronDown size={14} className="text-gray-400" />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <input
                                    type="number"
                                    min="1"
                                    value={line.quantity}
                                    onChange={(e) =>
                                      updateProductLine(line.id, "quantity", Number.parseInt(e.target.value) || 0)
                                    }
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={line.unitPrice}
                                    onChange={(e) =>
                                      updateProductLine(line.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={line.taxes}
                                    onChange={(e) =>
                                      updateProductLine(line.id, "taxes", Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="py-3 text-right font-medium">Rs {line.amount.toLocaleString()}</td>
                                <td className="py-3">
                                  <button
                                    onClick={() => removeProductLine(line.id)}
                                    className="text-gray-400 hover:text-red-400"
                                  >
                                    <X size={16} />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={addProductLine}
                      className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Plus size={16} className="mr-1" /> Add a product
                    </button>
                    <button
                      onClick={addSection}
                      className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Plus size={16} className="mr-1" /> Add a section
                    </button>
                    <button onClick={addNote} className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                      <Plus size={16} className="mr-1" /> Add a note
                    </button>
                    <button
                      onClick={() => setCreateProductModalOpen(true)}
                      className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Plus size={16} className="mr-1" /> Create new product
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
                  <textarea
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>

                {/* Totals */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex flex-col items-end">
                    <div className="w-full md:w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Untaxed Amount:</span>
                        <span>Rs {untaxedAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Taxes:</span>
                        <span>Rs {taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
                        <span>Total:</span>
                        <span>Rs {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="container mx-auto py-6 px-4">
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search quotations..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <select className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Stages</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Quotation Sent">Quotation Sent</option>
                  <option value="Sales Order">Sales Order</option>
                </select>
              </div>
            </div>

            {/* Quotations table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3 font-medium">Reference</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Products</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                    <th className="pb-3 font-medium">Stage</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-4 font-medium">{quotation.id}</td>
                      <td className="py-4">{quotation.customer}</td>
                      <td className="py-4">{new Date(quotation.date).toLocaleDateString()}</td>
                      <td className="py-4">{quotation.products}</td>
                      <td className="py-4 text-right">Rs {quotation.amount.toLocaleString()}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${quotation.stage === "Quotation"
                            ? "bg-gray-600 text-gray-200"
                            : quotation.stage === "Quotation Sent"
                              ? "bg-blue-600 text-blue-100"
                              : "bg-green-600 text-green-100"
                            }`}
                        >
                          {quotation.stage}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-blue-400" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-green-400" title="Edit">
                            <FileText size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-red-400" title="Delete">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-400">Showing 1 to 5 of 5 entries</div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600">Previous</button>
                <button className="px-3 py-1 bg-blue-600 rounded-md text-white">1</button>
                <button className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Send Quotation</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={`R-Tech Solutions Order (Ref S00001)`}
                  readOnly
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={`Hello,

Your order S00001 amounting in ${totalAmount.toLocaleString()} Rs has been confirmed.  
Thank you for your trust!

Do not hesitate to contact us if you have any questions.  
--  
Shinan`}
                  readOnly
                  rows={8}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-md p-3">
                <div className="flex items-center">
                  <div className="bg-gray-600 p-2 rounded mr-3">
                    <FileText size={24} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="font-medium">Order - S00001.pdf</p>
                    <p className="text-sm text-gray-400">Attachment preview</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setSendModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Discard
              </button>
              <button
                onClick={handleSendQuotation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                disabled={!customerEmail}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quotation Preview</h2>
              <button onClick={() => setPreviewModalOpen(false)} className="text-gray-400 hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="bg-white text-gray-900 p-8 rounded-md">
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quotation</h1>
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="font-medium">Customer:</p>
                    <p>{customer || "Not specified"}</p>
                    <p className="mt-2 font-medium">Payment Terms:</p>
                    <p>{paymentTerms}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Quotation Date:</p>
                    <p>{new Date().toLocaleDateString()}</p>
                    <p className="mt-2 font-medium">Expiration Date:</p>
                    <p>{new Date(expirationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-medium">Product</th>
                    <th className="text-right py-2 font-medium">Quantity</th>
                    <th className="text-right py-2 font-medium">Unit Price</th>
                    <th className="text-right py-2 font-medium">Taxes</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {productLines.map((line) => {
                    if (line.isSection) {
                      return (
                        <tr key={line.id}>
                          <td colSpan={5} className="py-3 font-semibold">
                            {line.sectionName}
                          </td>
                        </tr>
                      )
                    } else if (line.isNote) {
                      return (
                        <tr key={line.id}>
                          <td colSpan={5} className="py-3 text-gray-600 italic">
                            {line.note}
                          </td>
                        </tr>
                      )
                    } else {
                      return (
                        <tr key={line.id} className="border-b border-gray-200">
                          <td className="py-3">{line.product || "Not specified"}</td>
                          <td className="py-3 text-right">{line.quantity}</td>
                          <td className="py-3 text-right">Rs {line.unitPrice.toLocaleString()}</td>
                          <td className="py-3 text-right">{line.taxes}%</td>
                          <td className="py-3 text-right font-medium">Rs {line.amount.toLocaleString()}</td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>

              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Untaxed Amount:</span>
                    <span>Rs {untaxedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Taxes:</span>
                    <span>Rs {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
                    <span>Total:</span>
                    <span>Rs {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold mb-2">Terms & Conditions</h3>
                <p className="whitespace-pre-line text-gray-700">{termsConditions}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {createProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Product</h2>
              <button onClick={() => setCreateProductModalOpen(false)} className="text-gray-400 hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => handleNewProductChange("name", e.target.value)}
                  placeholder="Enter product name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => handleNewProductChange("price", Number.parseFloat(e.target.value) || 0)}
                  placeholder="Enter price"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => handleNewProductChange("category", e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {productCategories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => handleNewProductChange("description", e.target.value)}
                  placeholder="Enter product description"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setCreateProductModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                disabled={!newProduct.name || newProduct.price <= 0}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
