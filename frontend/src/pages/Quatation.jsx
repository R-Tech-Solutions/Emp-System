"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Send,
  Printer,
  Download,
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
import { pdf } from "@react-pdf/renderer"
import QuotationPDF from "../components/QuotationPDF"; 

export default function QuotationManagement() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("new")

  // State for quotations list
  const [quotations, setQuotations] = useState([])
  const [isSending, setIsSending] = useState(false);
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
    { id: 1, product: "", quantity: 1, salesPrice: 0, taxes: 0, amount: 0 },
  ])

  // State for notes and sections
  const [notes, setNotes] = useState([]);
  const [sections, setSections] = useState([]);

  // State for modals
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [createProductModalOpen, setCreateProductModalOpen] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")
  const [quotationToSend, setQuotationToSend] = useState(null)

  // State for new product
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    category: "General",
  })
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

  // Add state for createdBy
  const [createdBy, setCreatedBy] = useState("");

  // Helper to get price field based on pricelist
  const getProductPriceByPricelist = (product, pricelist) => {
    if (!product) return 0;
    if (pricelist === "Standard") return product.salesPrice || 0;
    if (pricelist === "Wholesale") return product.marginPrice || 0;
    if (pricelist === "Retail") return product.retailPrice || 0;
    return product.salesPrice || 0;
  };

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
    fetchContacts()
    fetchCrmLeads()
    const email = sessionStorage.getItem("email") || "";
    setCreatedBy(email);
    // eslint-disable-next-line
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/products`, {
        timeout: 10000 // 10 second timeout
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      addActivity("Failed to fetch products from server.");
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/contacts`, {
        timeout: 10000
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      addActivity("Failed to fetch contacts from server.");
    }
  };

  const fetchCrmLeads = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/crm`, {
        timeout: 10000
      });
      setCrmLeads(res.data);
    } catch (err) {
      console.error('Failed to fetch CRM leads:', err);
      addActivity("Failed to fetch CRM leads from server.");
    }
  };

  // Calculate totals
  const untaxedAmount = productLines
    .filter(line => !line.isSection && !line.isNote)
    .reduce((sum, line) => sum + line.quantity * line.salesPrice, 0)
  const taxAmount = productLines
    .filter(line => !line.isSection && !line.isNote)
    .reduce((sum, line) => sum + (line.quantity * line.salesPrice * line.taxes) / 100, 0)
  const totalAmount = untaxedAmount + taxAmount

  // Handle product line changes
  const updateProductLine = (id, field, value) => {
    setProductLines((prevLines) =>
      prevLines.map((line) => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value }

          // Recalculate amount
          if (field === "quantity" || field === "salesPrice") {
            updatedLine.amount = updatedLine.quantity * updatedLine.salesPrice
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
    setProductLines([...productLines, { id: newId, product: "", quantity: 1, salesPrice: 0, taxes: 0, amount: 0 }])

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

  // Fetch quotations from backend
  const fetchQuotations = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/quotation`);
      setQuotations(res.data);
    } catch (err) {
      addActivity("Failed to fetch quotations from database");
    }
  };

  // Fetch quotations when switching to "all" tab
  useEffect(() => {
    if (activeTab === "all") {
      fetchQuotations();
    }
  }, [activeTab]);

  // Handle send quotation
  const handleSendQuotation = () => {
    if (!customerEmail) return;

    // Build payload
    const payload = buildQuotationPayload();
    payload.Status = "Quotation Sent";

    // POST to backend
    axios.post(`${backEndURL}/api/quotation`, payload)
      .then(() => {
        addActivity(`Quotation sent to ${customerEmail}`);
        setStage("Quotation Sent");
        setSendModalOpen(false);
        fetchQuotations(); // Refresh the list
      })
      .catch(err => {
        addActivity("Failed to send quotation");
      });
  };

  // Handle confirm quotation
  const handleConfirmQuotation = async () => {
    setStage("Sales Order");
    addActivity("Quotation confirmed as Sales Order");

    // Build payload
    const payload = buildQuotationPayload();
    payload.Status = "Sales Order";

    try {
      // POST to backend
      await axios.post(`${backEndURL}/api/quotation`, payload);
      addActivity("Quotation saved to database");

      // Clear all fields
      setCustomer("");
      setCustomerEmail("");
      setSelectedCustomerId("");
      setSelectedCustomerEmail("");
      setSelectedProjectId("");
      setProject("");
      setProductLines([{ id: 1, product: "", quantity: 1, salesPrice: 0, taxes: 0, amount: 0 }]);
      setNotes([]);
      setSections([]);
      setTermsConditions("1. Prices are valid for 30 days from the date of quotation.\n" +
        "2. Delivery timeline will be confirmed upon order confirmation.\n" +
        "3. Payment terms as specified above.\n" +
        "4. Warranty as per manufacturer's policy.");
      setStage("Quotation");

      // Refresh the page
      window.location.reload();
    } catch (err) {
      addActivity("Failed to save quotation to database");
    }
  };

  // Print a specific quotation as PDF
  const handlePrint = async (quotation) => {
    try {
      // Fetch the latest quotation details from backend by ID
      const id = quotation.Quatation_Id || quotation.id;
      const res = await axios.get(`${backEndURL}/api/quotation/${id}`);
      const backendQuotation = res.data;

      // Show preview modal instead of downloading
      setQuotationToSend(backendQuotation);
      setPreviewModalOpen(true);
      addActivity("Opening quotation preview");
    } catch (err) {
      addActivity("Failed to fetch quotation from database for preview");
    }
  };

  // In Quotation.jsx, let's modify the handleDownload function
  const handleDownload = async (quotation) => {
    try {
      // Fetch the latest quotation details from backend by ID
      const id = quotation.Quatation_Id || quotation.id;
      const res = await axios.get(`${backEndURL}/api/quotation/${id}`);
      const backendQuotation = res.data;

      // Generate and download the PDF using the same data as preview
      const blob = await pdf(<QuotationPDF quotation={backendQuotation} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation-${backendQuotation.Reference}-${new Date(backendQuotation.Expiration).toLocaleDateString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      addActivity("PDF downloaded successfully");
    } catch (err) {
      addActivity("Failed to download quotation PDF");
    }
  };

  // Handle creating a new product
  const handleCreateProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) return
    try {
      const res = await axios.post(`${backEndURL}/api/products`, newProduct)
      setProducts([...products, res.data])
      setCreateProductModalOpen(false)
      addActivity(`Created new product: ${newProduct.name}`);
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

  // Helper to build the payload for the API
  const buildQuotationPayload = () => ({
    Quatation_Id: "", // will be set by backend
    Customer: customer,
    Email: customerEmail,
    Project: project,
    CreatedBy: createdBy,
    Pricelist: pricelist,
    PaymentTerms: paymentTerms,
    Expiration: expirationDate,
    OrderLines: productLines.map(line => ({
      Product: line.product,
      Quantity: line.quantity,
      UnitPrice: line.salesPrice,
      Taxes: line.taxes,
      Amount: line.amount,
    })),
    Notes: notes.map(note => ({
      id: note.id,
      note: note.note,
    })),
    Sections: sections.map(section => ({
      id: section.id,
      sectionName: section.sectionName,
    })),
    TermsConditions: termsConditions,
    UntaxedAmount: untaxedAmount,
    TaxesAmount: taxAmount,
    Total: totalAmount,
    Status: "Sales Order",
    createdAt: new Date().toISOString(),
  });

  // Add this function inside your component
  // In Quotation.jsx, update the handleSendQuotationEmail function
const handleSendQuotationEmail = async () => {
  if (!quotationToSend?.Email) {
    addActivity("No email address provided for the quotation");
    return;
  }
  
  setIsSending(true);
  try {
    // 1. Fetch full quotation details from backend by ID
    const res = await axios.get(`${backEndURL}/api/quotation/${quotationToSend.id}`);
    const quotationData = res.data;

    // 2. Generate PDF as blob with error handling
    let pdfBlob;
    try {
      pdfBlob = await pdf(<QuotationPDF quotation={quotationData} />).toBlob();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      throw new Error('Failed to generate PDF');
    }

    // 3. Convert blob to base64 with error handling
    let base64;
    try {
      base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          } catch (error) {
            reject(new Error('Failed to convert PDF to base64'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsDataURL(pdfBlob);
      });
    } catch (conversionError) {
      console.error('Base64 conversion error:', conversionError);
      throw new Error('Failed to convert PDF to base64');
    }

    // 4. Prepare email content
    const subject = `R-Tech Solutions Quotation ${quotationData.Reference}`;
    const message = `
      <p>Hello,</p>
      <p>Please find attached the quotation for your reference.</p>
      <p>Quotation Details:</p>
      <ul>
        <li>Reference: ${quotationData.Reference}</li>
        <li>Total Amount: Rs ${quotationData.Total?.toLocaleString()}</li>
        <li>Valid Until: ${new Date(quotationData.Expiration).toLocaleDateString()}</li>
      </ul>
      <p>Thank you for your interest!</p>
      <p>Best regards,<br/>R-Tech Solutions Team</p>
    `;

    // 5. Send to backend with proper error handling and timeout
    const response = await axios.post(
      `${backEndURL}/api/quotation/send-mail`,
      {
        quotationId: quotationData.Quatation_Id || quotationData.id,
        to: quotationData.Email,
        subject,
        message,
        pdfBase64: base64,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    if (response.data.success) {
      addActivity(`Quotation sent successfully to ${quotationData.Email}`);
      setSendModalOpen(false);
      setQuotationToSend(null);
    } else {
      throw new Error(response.data.error || 'Failed to send email');
    }
  } catch (err) {
    console.error('Send email error:', err);
    addActivity(`Failed to send quotation email: ${err.response?.data?.error || err.message}`);
  } finally {
    setIsSending(false);
  }
};

  // Add a section
  const addSection = () => {
    const newId = sections.length > 0 ? Math.max(...sections.map((section) => section.id)) + 1 : 1;
    setSections([
      ...sections,
      {
        id: newId,
        sectionName: "New Section",
      },
    ]);
    addActivity("Added a new section");
  };

  // Add a note
  const addNote = () => {
    const newId = notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1;
    setNotes([
      ...notes,
      {
        id: newId,
        note: "Add your note here...",
      },
    ]);
    addActivity("Added a note");
  };

  // Update section
  const updateSection = (id, sectionName) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, sectionName } : section
    ));
  };

  // Update note
  const updateNote = (id, note) => {
    setNotes(notes.map(n =>
      n.id === id ? { ...n, note } : n
    ));
  };

  // Remove section
  const removeSection = (id) => {
    setSections(sections.filter(section => section.id !== id));
    addActivity("Removed a section");
  };

  // Remove note
  const removeNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    addActivity("Removed a note");
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="bg-surface border-b border-border p-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex border-b border-border mb-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "new" ? "text-primary border-b-2 border-primary" : "text-text-secondary hover:text-text-primary"}`}
              onClick={() => setActiveTab("new")}
            >
              New Quotation
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "all" ? "text-primary border-b-2 border-primary" : "text-text-secondary hover:text-text-primary"}`}
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
                  onClick={handleConfirmQuotation}
                  className="flex items-center px-3 py-2 bg-primary text-white hover:bg-primary-dark rounded-md text-sm shadow transition"
                  disabled={stage === "Sales Order"}
                >
                  <Check size={16} className="mr-2" /> Confirm
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
                  className="flex items-center px-3 py-2 bg-primary hover:bg-primary-dark rounded-md text-sm text-white"
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
          <div className="bg-surface py-3 border-b border-border">
            <div className="container mx-auto">
              <div className="flex items-center justify-center">
                <div className={`flex items-center ${stage === "Quotation" ? "text-primary" : "text-text-muted"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "Quotation" ? "bg-primary" : "bg-surface"}`}>
                    <FileText size={16} />
                  </div>
                  <span className="ml-2">Quotation</span>
                </div>

                <ArrowRight size={20} className="mx-4 text-text-muted" />

                <div className={`flex items-center ${stage === "Quotation Sent" ? "text-primary" : "text-text-muted"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "Quotation Sent" ? "bg-primary" : "bg-surface"}`}>
                    <Send size={16} />
                  </div>
                  <span className="ml-2">Quotation Sent</span>
                </div>

                <ArrowRight size={20} className="mx-4 text-text-muted" />

                <div className={`flex items-center ${stage === "Sales Order" ? "text-primary" : "text-text-muted"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "Sales Order" ? "bg-primary" : "bg-surface"}`}>
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
                <div className="bg-surface rounded-lg p-6 mb-6 shadow">
                  <h2 className="text-lg font-semibold mb-4">Customer Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Customer</label>
                      <div className="relative">
                        <select
                          value={selectedCustomerId}
                          onChange={handleCustomerChange}
                          className="w-full bg-background border border-border rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select a customer</option>
                          {contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                              {contact.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown size={16} className="text-text-muted" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        readOnly
                        className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Project</label>
                      <div className="relative">
                        <select
                          value={selectedProjectId}
                          onChange={handleProjectChange}
                          className="w-full bg-background border border-border rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
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
                          <ChevronDown size={16} className="text-text-muted" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Created by</label>
                      <input
                        type="text"
                        value={createdBy}
                        readOnly
                        className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiration</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        </div>
                      </div>
                    </div>

                    {/* Pricelist */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Pricelist</label>
                      <div className="relative">
                        <select
                          value={pricelist}
                          onChange={(e) => {
                            setPricelist(e.target.value)
                            // Update all product lines' salesPrice based on new pricelist
                            setProductLines((prevLines) =>
                              prevLines.map((line) => {
                                if (line.product && !line.isSection && !line.isNote) {
                                  const selectedProduct = products.find((p) => p.name === line.product)
                                  const price = getProductPriceByPricelist(selectedProduct, e.target.value)
                                  return {
                                    ...line,
                                    salesPrice: price,
                                    amount: price * line.quantity,
                                  }
                                }
                                return line
                              })
                            )
                          }}
                          className="w-full bg-background border border-border rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Wholesale">Wholesale</option>
                          <option value="Retail">Retail</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <Tag size={16} className="text-text-muted" />
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
                          className="w-full bg-background border border-border rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
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
                <div className="bg-surface rounded-lg p-6 mb-6 shadow">
                  <h2 className="text-lg font-semibold mb-4">Order Lines</h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-text-muted border-b border-border">
                          <th className="pb-2 font-medium">Product</th>
                          <th className="pb-2 font-medium text-right">Quantity</th>
                          <th className="pb-2 font-medium text-right">Unit Price</th>
                          <th className="pb-2 font-medium text-right">Taxes (%)</th>
                          <th className="pb-2 font-medium text-right">Amount</th>
                          <th className="pb-2 w-10">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productLines.map((line) => (
                          <tr key={line.id} className="border-b border-border hover:bg-surface">
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
                                        const price = getProductPriceByPricelist(selectedProduct, pricelist)
                                        updateProductLine(line.id, "salesPrice", price)
                                        updateProductLine(line.id, "amount", price * line.quantity)
                                      }
                                    }
                                  }}
                                  className="w-full bg-background border border-border rounded-md py-1 pl-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                  <option value="">Select a product</option>
                                  {products.map((product, index) => (
                                    <option key={index} value={product.name}>
                                      {product.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <ChevronDown size={14} className="text-text-muted" />
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
                                className="w-full bg-background border border-border rounded-md py-1 px-2 text-right focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                min="0"
                                value={line.salesPrice}
                                onChange={(e) =>
                                  updateProductLine(line.id, "salesPrice", Number.parseFloat(e.target.value) || 0)
                                }
                                className="w-full bg-background border border-border rounded-md py-1 px-2 text-right focus:outline-none focus:ring-2 focus:ring-primary"
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
                                className="w-full bg-background border border-border rounded-md py-1 px-2 text-right focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </td>
                            <td className="py-3 text-right font-medium">Rs {line.amount.toLocaleString()}</td>
                            <td className="py-3">
                              <button
                                onClick={() => removeProductLine(line.id)}
                                className="text-text-muted hover:text-primary"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Sections */}
                  {sections.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-md font-semibold mb-3">Sections</h3>
                      {sections.map((section) => (
                        <div key={section.id} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={section.sectionName}
                            onChange={(e) => updateSection(section.id, e.target.value)}
                            className="flex-1 bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            onClick={() => removeSection(section.id)}
                            className="text-text-muted hover:text-primary"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {notes.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-md font-semibold mb-3">Notes</h3>
                      {notes.map((note) => (
                        <div key={note.id} className="flex items-start gap-2 mb-2">
                          <textarea
                            value={note.note}
                            onChange={(e) => updateNote(note.id, e.target.value)}
                            className="flex-1 bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={2}
                          />
                          <button
                            onClick={() => removeNote(note.id)}
                            className="text-text-muted hover:text-primary mt-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={addProductLine}
                      className="flex items-center text-sm text-primary hover:text-primary-dark"
                    >
                      <Plus size={16} className="mr-1" /> Add a product
                    </button>
                    <button
                      onClick={addSection}
                      className="flex items-center text-sm text-primary hover:text-primary-dark"
                    >
                      <Plus size={16} className="mr-1" /> Add a section
                    </button>
                    <button
                      onClick={addNote}
                      className="flex items-center text-sm text-primary hover:text-primary-dark"
                    >
                      <Plus size={16} className="mr-1" /> Add a note
                    </button>
                    <button
                      onClick={() => setCreateProductModalOpen(true)}
                      className="flex items-center text-sm text-primary hover:text-primary-dark"
                    >
                      <Plus size={16} className="mr-1" /> Create new product
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-surface rounded-lg p-6 mb-6 shadow">
                  <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
                  <textarea
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>

                {/* Totals */}
                <div className="bg-surface rounded-lg p-6">
                  <div className="flex flex-col items-end">
                    <div className="w-full md:w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Untaxed Amount:</span>
                        <span>Rs {untaxedAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Taxes:</span>
                        <span>Rs {taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
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
          <div className="bg-surface rounded-lg p-6 shadow">
            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search quotations..."
                    className="w-full bg-background border border-border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-text-muted" />
                  </div>
                </div>
              </div>
              <div>
                <select className="bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
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
                  <tr className="text-left text-text-muted border-b border-border">
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
                    <tr key={quotation.id} className="border-b border-border hover:bg-surface">
                      <td className="py-4 font-medium">{quotation.Reference}</td>
                      <td className="py-4">{quotation.Customer}</td>
                      <td className="py-4">{new Date(quotation.Date).toLocaleDateString()}</td>
                      <td className="py-4">{quotation.Products}</td>
                      <td className="py-4 text-right">Rs {quotation.Amount?.toLocaleString()}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${quotation.Stage === "Quotation"
                            ? "bg-surface text-text-secondary border border-border"
                            : quotation.Stage === "Quotation Sent"
                              ? "bg-primary text-white"
                              : "bg-secondary text-text-primary"
                            }`}
                        >
                          {quotation.Stage}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePrint(quotation)}
                            className="flex items-center px-3 py-2 bg-primary hover:bg-primary-dark rounded-md text-sm text-white shadow"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(quotation)}
                            className="flex items-center px-3 py-2 bg-accent hover:bg-secondary rounded-md text-sm text-text-primary shadow"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setQuotationToSend(quotation);
                              setSendModalOpen(true);
                            }}
                            className="flex items-center px-3 py-2 bg-primary hover:bg-primary-dark rounded-md text-sm text-white shadow"
                          >
                            <Send size={16} />
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
              <div className="text-sm text-text-muted">Showing 1 to 5 of 5 entries</div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-background border border-border rounded-md text-text-primary hover:bg-surface">Previous</button>
                <button className="px-3 py-1 bg-primary rounded-md text-white">1</button>
                <button className="px-3 py-1 bg-background border border-border rounded-md text-text-primary hover:bg-surface">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {sendModalOpen && quotationToSend && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Send Quotation {quotationToSend.Reference}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="email"
                  value={quotationToSend.Email || ""}
                  readOnly
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={`R-Tech Solutions Quotation ${quotationToSend.Reference}`}
                  readOnly
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={`Hello,\n\nYour quotation amounting to ${quotationToSend.Total?.toLocaleString()} Rs has been prepared.\n${quotationToSend.Notes?.length > 0 ? '\nNotes:\n' + quotationToSend.Notes.map(note => `- ${note.note}`).join('\n') : ''}\n${quotationToSend.Sections?.length > 0 ? '\nSections:\n' + quotationToSend.Sections.map(section => `- ${section.sectionName}`).join('\n') : ''}\n\nThank you for your interest!\nPlease review the attached quotation and let us know if you have any questions.\n\nBest regards,\nR-Tech Solutions Team`}
                  rows={8}
                  readOnly
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-background border border-border rounded-md p-3">
                <div className="flex items-center">
                  <div className="bg-surface p-2 rounded mr-3">
                    <FileText size={24} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="font-medium">Quotation - {quotationToSend.Reference}.pdf</p>
                    <p className="text-sm text-text-muted">Attachment preview</p>
                    <button
                      className="mt-2 px-3 py-1 bg-primary hover:bg-primary-dark rounded text-white text-xs"
                      onClick={async () => {
                        try {
                          const blob = await pdf(<QuotationPDF quotation={quotationToSend} />).toBlob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `Quotation-${quotationToSend.Reference}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }, 0);
                        } catch (err) {
                          addActivity("Failed to generate PDF preview");
                        }
                      }}
                      type="button"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setSendModalOpen(false);
                  setQuotationToSend(null);
                }}
                className="px-4 py-2 bg-background border border-border hover:bg-surface rounded-md"
              >
                Discard
              </button>
              <button
                onClick={handleSendQuotationEmail}
                className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-md flex items-center text-white shadow"
                disabled={!quotationToSend.Email || isSending}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Quotation Preview</h2>
                <p className="text-sm text-text-muted mt-1">ID: {quotationToSend?.Reference}</p>
              </div>
              <button onClick={() => setPreviewModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={24} />
              </button>
            </div>

            <div className="bg-background text-text-primary p-8 rounded-md">
              {/* Header Information */}
              <div className="border-b border-border pb-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary">Quotation {quotationToSend?.Reference}</h1>
                    <div className="mt-4 space-y-2">
                      <div>
                        <p className="font-medium text-text-secondary">Quotation ID:</p>
                        <p className="text-text-primary">{quotationToSend?.Reference}</p>
                      </div>
                      <div>
                        <p className="font-medium text-text-secondary">Created Date:</p>
                        <p className="text-text-primary">{new Date(quotationToSend?.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-text-secondary">Expired Date:</p>
                        <p className="text-primary font-medium">{new Date(quotationToSend?.Expiration).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-text-secondary">Customer:</p>
                        <p className="text-text-primary">{quotationToSend?.Customer || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-text-secondary">Payment Terms:</p>
                        <p className="text-text-primary">{quotationToSend?.PaymentTerms}</p>
                      </div>
                      <div>
                        <p className="font-medium text-text-secondary">Email:</p>
                        <p className="text-text-primary">{quotationToSend?.Email || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              {quotationToSend?.Sections?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-text-primary">Sections</h3>
                  <div className="space-y-2">
                    {quotationToSend.Sections.map((section, index) => (
                      <div key={index} className="bg-surface p-3 rounded-md">
                        <p className="font-medium text-text-primary">{section.sectionName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Lines */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-text-primary">Products</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-medium text-text-secondary">Product</th>
                      <th className="py-2 text-right font-medium text-text-secondary">Quantity</th>
                      <th className="py-2 text-right font-medium text-text-secondary">Unit Price</th>
                      <th className="py-2 text-right font-medium text-text-secondary">Taxes</th>
                      <th className="py-2 text-right font-medium text-text-secondary">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationToSend?.OrderLines?.map((line, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-3">{line.Product || "Not specified"}</td>
                        <td className="py-3 text-right">{line.Quantity}</td>
                        <td className="py-3 text-right">Rs {line.UnitPrice?.toLocaleString()}</td>
                        <td className="py-3 text-right">{line.Taxes}%</td>
                        <td className="py-3 text-right font-medium">Rs {line.Amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {quotationToSend?.Notes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-text-primary">Notes</h3>
                  <div className="space-y-2">
                    {quotationToSend.Notes.map((note, index) => (
                      <div key={index} className="bg-surface p-3 rounded-md">
                        <p className="text-text-primary">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-text-secondary">Untaxed Amount:</span>
                    <span>Rs {quotationToSend?.UntaxedAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-secondary">Taxes:</span>
                    <span>Rs {quotationToSend?.TaxesAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-border font-bold">
                    <span>Total:</span>
                    <span>Rs {quotationToSend?.Total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="border-t border-border pt-6">
                <h3 className="font-bold mb-2 text-text-primary">Terms & Conditions</h3>
                <p className="whitespace-pre-line text-text-secondary">{quotationToSend?.TermsConditions}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => handleDownload(quotationToSend)}
                className="px-4 py-2 bg-accent hover:bg-secondary rounded-md text-text-primary shadow"
              >
                Download PDF
              </button>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-background border border-border hover:bg-surface rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {createProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Product</h2>
              <button onClick={() => setCreateProductModalOpen(false)} className="text-text-muted hover:text-text-primary">
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
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => handleNewProductChange("category", e.target.value)}
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setCreateProductModalOpen(false)}
                className="px-4 py-2 bg-background border border-border hover:bg-surface rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-md text-white"
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