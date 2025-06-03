"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Printer, CreditCard, Banknote, Eye } from "lucide-react"

export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState("create")
  const [savedInvoices, setSavedInvoices] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
  })

  const [clientInfo, setClientInfo] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
  })

  const [invoiceDetails, setInvoiceDetails] = useState({
    number: "INV-001",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "USD",
  })

  const [items, setItems] = useState([{ id: 1, name: "", quantity: 1, price: 0, tax: 0, discount: 0 }])

  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("")

  const [cardPaymentDetails, setCardPaymentDetails] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
  })

  const [cashPaymentDetails, setCashPaymentDetails] = useState({
    upiId: "",
    phoneNumber: "",
    address: "",
  })

  // Load saved invoices from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedInvoices")
    if (saved) {
      setSavedInvoices(JSON.parse(saved))
    }
  }, [])

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: "",
      quantity: 1,
      price: 0,
      tax: 0,
      discount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.price
    const discountAmount = (subtotal * item.discount) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * item.tax) / 100
    return taxableAmount + taxAmount
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const totalDiscount = items.reduce((sum, item) => sum + (item.quantity * item.price * item.discount) / 100, 0)
    const totalTax = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price
      const itemDiscount = (itemSubtotal * item.discount) / 100
      const taxableAmount = itemSubtotal - itemDiscount
      return sum + (taxableAmount * item.tax) / 100
    }, 0)
    const total = subtotal - totalDiscount + totalTax

    return { subtotal, totalDiscount, totalTax, total }
  }

  const handlePrint = () => {
    window.print()
  }

  const saveInvoice = () => {
    const invoice = {
      id: Date.now(),
      companyInfo,
      clientInfo,
      invoiceDetails,
      items,
      notes,
      terms,
      paymentMethod: selectedPaymentMethod,
      paymentDetails: selectedPaymentMethod === "card" ? cardPaymentDetails : cashPaymentDetails,
      totals: calculateTotals(),
      createdAt: new Date().toISOString(),
    }

    const updatedInvoices = [...savedInvoices, invoice]
    setSavedInvoices(updatedInvoices)
    localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices))
    alert("Invoice saved successfully!")
  }

  const deleteInvoice = (id) => {
    const updatedInvoices = savedInvoices.filter((invoice) => invoice.id !== id)
    setSavedInvoices(updatedInvoices)
    localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices))
  }

  const totals = calculateTotals()

  const PaymentMethodCard = ({ method, icon: Icon, title, description, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={24} className={isSelected ? "text-blue-600" : "text-gray-600 dark:text-gray-400"} />
        <div>
          <h3 className={`font-medium ${isSelected ? "text-blue-600" : "text-gray-800 dark:text-gray-200"}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "create" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Create Invoice
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "history" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Invoice History ({savedInvoices.length})
            </button>
          </div>
        </div>

        {activeTab === "create" ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Invoice Form */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Invoice Details</h2>

              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Client Address"
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={clientInfo.city}
                    onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  />
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Invoice Number"
                    value={invoiceDetails.number}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, number: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={invoiceDetails.date}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="Due Date"
                    value={invoiceDetails.dueDate}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-300">Items</h3>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-700 p-3 rounded-md">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="col-span-4 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Tax%"
                        value={item.tax}
                        onChange={(e) => updateItem(item.id, "tax", Number.parseFloat(e.target.value) || 0)}
                        className="col-span-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Disc%"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="col-span-1 p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PaymentMethodCard
                    method="card"
                    icon={CreditCard}
                    title="Bank Transfer"
                    description="Bank account details"
                    isSelected={selectedPaymentMethod === "card"}
                    onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === "card" ? "" : "card")}
                  />
                  <PaymentMethodCard
                    method="cash"
                    icon={Banknote}
                    title="Digital Payment"
                    description="UPI, mobile payment"
                    isSelected={selectedPaymentMethod === "cash"}
                    onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === "cash" ? "" : "cash")}
                  />
                </div>

                {/* Payment Details Form */}
                {selectedPaymentMethod === "card" && (
                  <div className="bg-gray-700 p-4 rounded-lg space-y-4">
                    <h4 className="font-medium text-gray-300">Bank Transfer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Bank Name"
                        value={cardPaymentDetails.bankName}
                        onChange={(e) => setCardPaymentDetails({ ...cardPaymentDetails, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={cardPaymentDetails.accountNumber}
                        onChange={(e) =>
                          setCardPaymentDetails({ ...cardPaymentDetails, accountNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Routing Number"
                        value={cardPaymentDetails.routingNumber}
                        onChange={(e) =>
                          setCardPaymentDetails({ ...cardPaymentDetails, routingNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="SWIFT Code"
                        value={cardPaymentDetails.swiftCode}
                        onChange={(e) => setCardPaymentDetails({ ...cardPaymentDetails, swiftCode: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === "cash" && (
                  <div className="bg-gray-700 p-4 rounded-lg space-y-4">
                    <h4 className="font-medium text-gray-300">Digital Payment Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="UPI ID"
                        value={cashPaymentDetails.upiId}
                        onChange={(e) => setCashPaymentDetails({ ...cashPaymentDetails, upiId: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={cashPaymentDetails.phoneNumber}
                        onChange={(e) => setCashPaymentDetails({ ...cashPaymentDetails, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={cashPaymentDetails.address}
                        onChange={(e) => setCashPaymentDetails({ ...cashPaymentDetails, address: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes and Terms */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Terms & Conditions</label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Terms and conditions..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                </div>
              </div>

              {/* Save Invoice Button */}
              <div className="flex justify-center">
                <button
                  onClick={saveInvoice}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Save Invoice
                </button>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white text-black rounded-lg p-8 print:shadow-none print:p-0">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-600">{companyInfo.name || "Your Company"}</h1>
                    <div className="text-sm text-gray-600 mt-2">
                      {companyInfo.address && <div>{companyInfo.address}</div>}
                      {companyInfo.city && <div>{companyInfo.city}</div>}
                      {companyInfo.phone && <div>Phone: {companyInfo.phone}</div>}
                      {companyInfo.email && <div>Email: {companyInfo.email}</div>}
                      {companyInfo.website && <div>Website: {companyInfo.website}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>Invoice #: {invoiceDetails.number}</div>
                      <div>Date: {invoiceDetails.date}</div>
                      {invoiceDetails.dueDate && <div>Due Date: {invoiceDetails.dueDate}</div>}
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{clientInfo.name || "Client Name"}</div>
                    {clientInfo.address && <div>{clientInfo.address}</div>}
                    {clientInfo.city && <div>{clientInfo.city}</div>}
                    {clientInfo.phone && <div>Phone: {clientInfo.phone}</div>}
                    {clientInfo.email && <div>Email: {clientInfo.email}</div>}
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Tax%</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Disc%</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-4 py-2">{item.name || "Item name"}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.tax}%</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.discount}%</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            ${calculateItemTotal(item).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${totals.totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${totals.totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                      <span>Total:</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes:</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
                  </div>
                )}

                {/* Terms */}
                {terms && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms & Conditions:</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{terms}</p>
                  </div>
                )}

                {/* Payment Details */}
                {selectedPaymentMethod && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Details:</h3>
                    <div className="text-sm text-gray-600">
                      {selectedPaymentMethod === "card" && (
                        <>
                          {cardPaymentDetails.bankName && <div>Bank: {cardPaymentDetails.bankName}</div>}
                          {cardPaymentDetails.accountNumber && <div>Account: {cardPaymentDetails.accountNumber}</div>}
                          {cardPaymentDetails.routingNumber && <div>Routing: {cardPaymentDetails.routingNumber}</div>}
                          {cardPaymentDetails.swiftCode && <div>SWIFT: {cardPaymentDetails.swiftCode}</div>}
                        </>
                      )}
                      {selectedPaymentMethod === "cash" && (
                        <>
                          {cashPaymentDetails.upiId && <div>UPI ID: {cashPaymentDetails.upiId}</div>}
                          {cashPaymentDetails.phoneNumber && <div>Phone: {cashPaymentDetails.phoneNumber}</div>}
                          {cashPaymentDetails.address && <div>Address: {cashPaymentDetails.address}</div>}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Print Button */}
                <div className="flex justify-center gap-4 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Printer size={16} />
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Invoice History Tab */
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-400 mb-6">Invoice History</h2>

            {savedInvoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No invoices saved yet</p>
                <p className="text-gray-500 text-sm mt-2">Create your first invoice to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedInvoices.map((invoice) => (
                  <div key={invoice.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium text-white">{invoice.invoiceDetails.number}</h3>
                          <p className="text-sm text-gray-400">
                            {invoice.clientInfo.name || "No client name"} • ${invoice.totals.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Load invoice data for editing
                          setCompanyInfo(invoice.companyInfo)
                          setClientInfo(invoice.clientInfo)
                          setInvoiceDetails(invoice.invoiceDetails)
                          setItems(invoice.items)
                          setNotes(invoice.notes)
                          setTerms(invoice.terms)
                          setSelectedPaymentMethod(invoice.paymentMethod)
                          if (invoice.paymentMethod === "card") {
                            setCardPaymentDetails(invoice.paymentDetails)
                          } else {
                            setCashPaymentDetails(invoice.paymentDetails)
                          }
                          setActiveTab("create")
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Invoice"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
