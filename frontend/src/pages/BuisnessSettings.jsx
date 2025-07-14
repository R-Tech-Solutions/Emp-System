import React, { useState, useEffect } from "react";
import axios from "axios";
import { backEndURL } from "../Backendurl";
import Swal from "sweetalert2";
import DotSpinner from "../loaders/Loader";

const STORAGE_KEY = "businessSettings";
const NON_DELETABLE = ["users", "businessSettings", "deletion_audit_log", "backups"];
const OTP_EXPIRE_SECONDS = 120;

const TAB_BUSINESS = 'business';
const TAB_NOTES = 'notes';
const TAB_DB = 'db';
const TAB_IMPORT_EXPORT = 'import_export';
const TAB_STORAGE_KEY = 'businessSettingsActiveTab';

const ProgressBar = ({ show, duration = 10, onDone }) => {
  const [percent, setPercent] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(duration);
  React.useEffect(() => {
    if (!show) {
      setPercent(0);
      setTimeLeft(duration);
      return;
    }
    setPercent(0);
    setTimeLeft(duration);
    let start = Date.now();
    let raf;
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setPercent(p);
      setTimeLeft(Math.max(0, Math.ceil(duration - elapsed)));
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else if (onDone) {
        onDone();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [show, duration, onDone]);
  if (!show) return null;
  return (
    <div className="w-full mb-3">
      <div className="w-full h-2 bg-blue-100 rounded overflow-hidden">
        <div className="h-full bg-blue-500 transition-all" style={{ width: `${percent}%` }}></div>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>{percent}%</span>
        <span>Estimated time: {timeLeft}s</span>
      </div>
    </div>
  );
};

const BuisnessSettings = () => {
  const [form, setForm] = useState({
    businessName: "",
    printingStyle: "A4",
    openCash: "",
    address: "",
    contact: "",
    businessType: "Retail",
    gstNumber: "",
    taxRate: "0",
    registrationNumber: "",
    financialYearStart: "",
    currency: "",
    country: "",
    website: "",
    logo: "",
    enableInventory: false,
    language: "English",
  });
  const [logoPreview, setLogoPreview] = useState("");
  const [success, setSuccess] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  // Notes & Terms state
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState([""]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesEditing, setNotesEditing] = useState(false);
  const [notesSuccessMsg, setNotesSuccessMsg] = useState("");
  const [clearDbLoading, setClearDbLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('sms');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpInterval, setOtpInterval] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(TAB_STORAGE_KEY) || TAB_BUSINESS);
  const [templateUrl, setTemplateUrl] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreMsg, setRestoreMsg] = useState("");
  const [deleteProgress, setDeleteProgress] = useState(false);
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    // Fetch settings from backend
    axios.get(`${backEndURL}/api/business-settings`).then(res => {
      if (res.data && res.data.data) {
        setForm(res.data.data);
        setIsEdit(true);
        if (res.data.data.logo) setLogoPreview(res.data.data.logo);
        if (res.data.data.templateUrl) setTemplateUrl(res.data.data.templateUrl);
      }
    });
    // Fetch notes & terms
    setNotesLoading(true);
    axios.get(`${backEndURL}/api/additional/notes-terms`).then(res => {
      if (res.data) {
        setNotes(res.data.notes || "");
        if (Array.isArray(res.data.terms) && res.data.terms.length > 0) {
          setTerms(res.data.terms);
        } else {
          setTerms([""]);
        }
        setNotesEditing(!!res.data.id);
      } else {
        setTerms([""]);
      }
    }).catch(() => setTerms([""])).finally(() => setNotesLoading(false));
    // Check if logged in user is Super Admin
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    setIsSuperAdmin(userData.role === "super-admin");
    return () => {
      if (otpInterval) clearInterval(otpInterval);
    };
  }, []);

  useEffect(() => {
    if (activeTab === TAB_DB) {
      // Fetch backups when Database Management tab is active
      axios.get(`${backEndURL}/api/business-settings/backups`).then(res => {
        if (res.data && res.data.success) {
          setBackups(res.data.backups);
        }
      }).catch(() => setBackups([]));
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('logo', file);
      try {
        const res = await axios.post(`${backEndURL}/api/business-settings/upload-logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data && res.data.url) {
          setForm((prev) => ({ ...prev, logo: res.data.url }));
          setLogoPreview(res.data.url);
        }
      } catch (err) {
        alert('Failed to upload logo.');
      }
    }
  };

  const handleTemplateChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setTemplateLoading(true);
      const formData = new FormData();
      formData.append('template', file);
      try {
        const res = await axios.post(`${backEndURL}/api/business-settings/upload-template`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data && res.data.url) {
          setTemplateUrl(res.data.url);
        }
      } catch (err) {
        alert('Failed to upload template.');
      } finally {
        setTemplateLoading(false);
      }
    } else {
      alert('Please select a PDF file.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save or update in backend
    axios.post(`${backEndURL}/api/business-settings`, form)
      .then(() => {
        setSuccess(isEdit ? "Settings updated successfully!" : "Settings saved successfully!");
        setIsEdit(true);
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => {
        setSuccess("Error saving settings.");
        setTimeout(() => setSuccess(""), 2000);
      });
  };

  const handleNotesChange = (e) => setNotes(e.target.value);
  const handleTermsChange = (e, idx) => {
    const newTerms = [...terms];
    newTerms[idx] = e.target.value;
    setTerms(newTerms);
  };
  const handleTermsKeyDown = (e, idx) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTerms = [...terms];
      newTerms.splice(idx + 1, 0, "");
      setTerms(newTerms);
    }
    if (e.key === "Backspace" && terms[idx] === "" && terms.length > 1) {
      e.preventDefault();
      const newTerms = [...terms];
      newTerms.splice(idx, 1);
      setTerms(newTerms);
    }
  };
  const handleNotesSubmit = (e) => {
    e.preventDefault();
    setNotesLoading(true);
    const payload = { notes, terms: terms.filter((t) => t.trim() !== "") };
    const req = notesEditing
      ? axios.put(`${backEndURL}/api/additional/notes-terms`, payload)
      : axios.post(`${backEndURL}/api/additional/notes-terms`, payload);
    req
      .then(() => {
        setNotesSuccessMsg(notesEditing ? "Updated successfully!" : "Saved successfully!");
        setNotesEditing(true);
      })
      .catch(() => setNotesSuccessMsg("Error saving data."))
      .finally(() => setNotesLoading(false));
  };

  const handleClearAll = () => {
    // Clear main form
    setForm({
      businessName: "",
      printingStyle: "A4",
      openCash: "",
      address: "",
      contact: "",
      businessType: "Retail",
      gstNumber: "",
      taxRate: "0",
      registrationNumber: "",
      financialYearStart: "",
      currency: "",
      country: "",
      website: "",
      logo: "",
      enableInventory: false,
      language: "English",
    });
    
    // Clear logo preview
    setLogoPreview("");
    
    // Clear notes and terms
    setNotes("");
    setTerms([""]);
    
    // Reset edit states
    setIsEdit(false);
    setNotesEditing(false);
    
    // Clear success messages
    setSuccess("");
    setNotesSuccessMsg("");
  };

  const handleClearAllDatabase = async () => {
    const result = await Swal.fire({
      title: '⚠️ WARNING',
      text: 'This will permanently delete ALL operational data from the database including employees, tasks, invoices, products, etc. Business settings will be preserved. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear all data!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setClearDbLoading(true);
      
      try {
        const response = await axios.delete(`${backEndURL}/api/business-settings/clear-all-database`);
        if (response.data.success) {
          await Swal.fire({
            title: '✅ Success!',
            text: 'All operational data cleared successfully! Business settings preserved.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          // Refresh the page to reflect the cleared state
          window.location.reload();
        } else {
          await Swal.fire({
            title: '❌ Error',
            text: 'Error clearing database: ' + response.data.message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        await Swal.fire({
          title: '❌ Error',
          text: 'Error clearing database: ' + (error.response?.data?.message || error.message),
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setClearDbLoading(false);
      }
    }
  };

  // Fetch all collection names for deletion modal
  const fetchCollections = async () => {
    try {
      const res = await axios.get(`${backEndURL}/api/business-settings/collections`);
      if (res.data && res.data.success) {
        setCollections(res.data.collections);
      } else {
        setCollections([]);
      }
    } catch (e) {
      setCollections([]);
    }
  };

  const openDeleteModal = () => {
    fetchCollections();
    setSelectedCollections([]);
    setSelectAll(false);
    setOtpSent(false);
    setOtp("");
    setOtpError("");
    setVerificationMethod('sms');
    setOtpTimer(0);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setOtpSent(false);
    setOtp("");
    setOtpError("");
    setDeleteLoading(false);
    setOtpTimer(0);
    if (otpInterval) clearInterval(otpInterval);
  };

  const handleCollectionChange = (col) => {
    setSelectedCollections((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCollections([]);
      setSelectAll(false);
    } else {
      setSelectedCollections(collections);
      setSelectAll(true);
    }
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await axios.post(`${backEndURL}/api/database/send-otp`, { method: verificationMethod });
      if (res.data.success) {
        setOtpSent(true);
        setOtpTimer(OTP_EXPIRE_SECONDS);
        if (otpInterval) clearInterval(otpInterval);
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setOtpInterval(interval);
      } else {
        setOtpError(res.data.message || "Failed to send OTP");
      }
    } catch (e) {
      setOtpError(e.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpAndDelete = async () => {
    setDeleteLoading(true);
    setOtpError("");
    try {
      const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
      const res = await axios.post(`${backEndURL}/api/database/verify-otp-and-delete`, {
        otp,
        collections: selectedCollections,
        performedBy: { id: userData.id, email: userData.email, name: userData.name },
        method: verificationMethod
      });
      if (res.data.success) {
        closeDeleteModal();
        Swal.fire({ icon: "success", title: "Deleted!", text: res.data.message });
        window.location.reload();
      } else {
        setOtpError(res.data.message || "Failed to delete");
      }
    } catch (e) {
      setOtpError(e.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setOtp("");
    setOtpError("");
    setOtpTimer(0);
    if (otpInterval) clearInterval(otpInterval);
    handleSendOtp();
  };

  const handleShowAuditLog = async () => {
    setShowAuditLog(true);
    try {
      const res = await axios.get(`${backEndURL}/api/database/audit-log`);
      setAuditLog(res.data.logs || []);
    } catch (e) {
      setAuditLog([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-surface p-10 rounded-2xl shadow-2xl border border-border relative overflow-hidden">
      {/* Decorative Accent */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent opacity-20 rounded-full z-0"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary opacity-10 rounded-full z-0"></div>
      {/* Tab Navigation */}
      <div className="flex mb-10 z-10 relative border-b border-border">
        <button
          className={`flex-1 py-3 text-lg font-semibold flex items-center justify-center gap-2 transition border-b-2 ${activeTab === TAB_BUSINESS ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}
          onClick={() => { setActiveTab(TAB_BUSINESS); localStorage.setItem(TAB_STORAGE_KEY, TAB_BUSINESS); }}
        >
          Business Info
        </button>
        <button
          className={`flex-1 py-3 text-lg font-semibold flex items-center justify-center gap-2 transition border-b-2 ${activeTab === TAB_NOTES ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}
          onClick={() => { setActiveTab(TAB_NOTES); localStorage.setItem(TAB_STORAGE_KEY, TAB_NOTES); }}
        > 
          Notes & Terms
        </button>
        <button
          className={`flex-1 py-3 text-lg font-semibold flex items-center justify-center gap-2 transition border-b-2 ${activeTab === TAB_DB ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}
          onClick={() => { setActiveTab(TAB_DB); localStorage.setItem(TAB_STORAGE_KEY, TAB_DB); }}
        >
          Database Management
        </button>
        <button
          className={`flex-1 py-3 text-lg font-semibold flex items-center justify-center gap-2 transition border-b-2 ${activeTab === TAB_IMPORT_EXPORT ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}
          onClick={() => { setActiveTab(TAB_IMPORT_EXPORT); localStorage.setItem(TAB_STORAGE_KEY, TAB_IMPORT_EXPORT); }}
        >
          Import/Export
        </button>
      </div>
      {/* Tab Panels */}
      {/* Business Info Tab */}
      {activeTab === TAB_BUSINESS && (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-extrabold mb-8 text-primary flex items-center gap-3 z-10 relative">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h6M9 17H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4" /></svg>
            Business Settings
          </h2>
          <form onSubmit={handleSubmit} className="space-y-7 z-10 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">TAX</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={form.taxRate}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 bg-white shadow-sm"
                  placeholder="e.g. 18 for 18% GST"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Business Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Financial Year Start</label>
                <input
                  type="date"
                  name="financialYearStart"
                  value={form.financialYearStart}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Currency</label>
                <input
                  type="text"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 bg-white shadow-sm"
                  placeholder="e.g. USD, INR, EUR"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 bg-white shadow-sm"
                  placeholder="e.g. India, United States"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Website</label>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 bg-white shadow-sm"
                  placeholder="https://example.com"
                />
              </div>
              {/* Logo Upload */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo Preview" className="h-16 object-contain border rounded-lg shadow bg-white" />
                  )}
                </div>
              </div>
              {/* PDF Template Upload */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-2">PDF Template</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleTemplateChange}
                    className="block file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={templateLoading}
                  />
                  {templateLoading && <DotSpinner />}
                  {templateUrl && !templateLoading && (
                    <a
                      href={templateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary underline text-sm font-semibold hover:text-primary-dark"
                    >
                      Download Current Template
                    </a>
                  )}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-2">Printing Style</label>
                <div className="flex gap-8 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="printingStyle"
                      value="A4"
                      checked={form.printingStyle === "A4"}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    <span className="text-text-secondary">A4</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="printingStyle"
                      value="POS"
                      checked={form.printingStyle === "POS"}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    <span className="text-text-secondary">POS Billing</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Open Cash</label>
                <input
                  type="number"
                  name="openCash"
                  value={form.openCash}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm bg-white"
                  min="0"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-2">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm bg-white"
                  rows={3}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-2">Contact Email/Phone</label>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm bg-white"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition font-semibold shadow-lg shadow-primary/10"
              >
                {isEdit ? "Update Settings" : "Save Settings"}
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold shadow-lg shadow-orange-500/10"
              >
                Clear Form
              </button>
            </div>
            {success && <div className="text-green-600 text-center mt-2 font-semibold">{success}</div>}
          </form>
        </div>
      )}
      {/* Notes & Terms Tab */}
      {activeTab === TAB_NOTES && (
        <div className="animate-fade-in">
          <div className="bg-surface p-8 rounded-2xl shadow-lg max-w-2xl mx-auto border border-border mt-10 relative z-10">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1H9a1 1 0 00-1 1v9m12 4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Notes & Terms
            </h2>
            <form onSubmit={handleNotesSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-text-secondary">
                  Notes
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-background text-text-primary border border-border focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] shadow-sm"
                  placeholder="Enter notes..."
                  value={notes}
                  onChange={handleNotesChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-text-secondary">
                  Terms and Conditions
                </label>
                <div className="space-y-2">
                  {terms.map((term, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="mt-2 text-primary">•</span>
                      <textarea
                        className="flex-1 p-2 rounded-lg bg-background text-text-primary border border-border focus:border-primary focus:ring-1 focus:ring-primary min-h-[40px] shadow-sm"
                        placeholder="Enter term..."
                        value={term}
                        onChange={(e) => handleTermsChange(e, idx)}
                        onKeyDown={(e) => handleTermsKeyDown(e, idx)}
                        rows={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-md transition-colors"
                  disabled={notesLoading}
                >
                  {notesLoading ? (
                    <span>Saving...</span>
                  ) : notesEditing ? (
                    "Update Changes"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
              {notesSuccessMsg && (
                <div className="text-green-600 text-center font-semibold">{notesSuccessMsg}</div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Database Management Tab */}
      {activeTab === TAB_DB && (
        <div className="animate-fade-in">
          {/* Database Delete Section */}
          <div className="mt-8 p-8 bg-red-50 border border-red-200 rounded-2xl shadow-lg relative z-10">
            <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Database Management
            </h3>
            <p className="text-red-700 mb-4 text-sm">
              This action will permanently delete all operational data (employees, tasks, invoices, products, etc.) 
              while preserving business settings. This action cannot be undone.
            </p>
            <ProgressBar show={clearDbLoading || deleteProgress} duration={5} />
            <button
              type="button"
              onClick={async () => {
                setDeleteProgress(true);
                setTimeout(() => setDeleteProgress(false), 5000);
                openDeleteModal();
              }}
              disabled={!isSuperAdmin}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-red-600/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All Database</span>
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleShowAuditLog}
                className="w-full mt-2 bg-blue-100 text-blue-800 py-2 px-4 rounded-lg hover:bg-blue-200 transition font-semibold shadow"
              >
                View Deletion Audit Log
              </button>
            )}
          </div>

          {/* Backup & Restore Section */}
          <div className="mt-10 p-8 bg-white border border-blue-200 rounded-2xl shadow-lg relative z-10">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Backup & Restore Database
            </h3>
            {/* Backup Section */}
            <div className="mb-8">
              <ProgressBar show={backupLoading} duration={10} />
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-700">Create a new backup of your database</span>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={backupLoading}
                  onClick={async () => {
                    setBackupLoading(true);
                    setRestoreMsg("");
                    // Wait for fake progress bar
                    await new Promise(res => setTimeout(res, 10000));
                    try {
                      const userData = JSON.parse(sessionStorage.getItem("userData") || '{}');
                      const email = userData.email || '';
                      const response = await axios.post(
                        `${backEndURL}/api/business-settings/backup`,
                        { email },
                        { responseType: 'blob' }
                      );
                      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'firestore-backup.zip');
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode.removeChild(link);
                    } catch (err) {
                      setRestoreMsg('Backup failed.');
                    } finally {
                      setBackupLoading(false);
                    }
                  }}
                >
                  {backupLoading ? <DotSpinner /> : <><svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Create Backup</>}
                </button>
              </div>
              {/* Mocked backup list */}
              <div className="mt-4 border rounded-lg bg-blue-50 p-3 max-h-40 overflow-y-auto">
                <div className="text-xs text-blue-900 font-semibold mb-2">Available Backups</div>
                {backups.length === 0 ? (
                  <div className="text-xs text-gray-400 mt-2">No backups found.</div>
                ) : (
                  <ul className="text-xs divide-y divide-blue-200">
                    {backups.map(b => (
                      <li key={b.id} className="py-1 flex items-center justify-between gap-2">
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline font-semibold"
                          download
                        >
                          Download ({b.fileName?.split('/').pop() || 'backup.zip'})
                        </a>
                        <span className="text-gray-500 ml-2">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</span>
                        {b.email && <span className="ml-2 text-gray-400">{b.email}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* Restore Section */}
            <div className="border-t pt-6 mt-6">
              <ProgressBar show={restoreLoading} duration={10} />
              <div className="font-semibold text-blue-700 mb-2">Restore database from a backup file</div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="file"
                  accept=".zip"
                  className="block file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                  onChange={e => {
                    setRestoreFile(e.target.files[0]);
                    setRestoreMsg("");
                  }}
                  disabled={restoreLoading}
                />
                <button
                  type="button"
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={restoreLoading || !restoreFile}
                  onClick={async () => {
                    if (!restoreFile) return;
                    setRestoreLoading(true);
                    setRestoreMsg("");
                    // Wait for fake progress bar
                    await new Promise(res => setTimeout(res, 10000));
                    try {
                      const formData = new FormData();
                      formData.append('zip', restoreFile);
                      const response = await axios.post(`${backEndURL}/api/business-settings/restore`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      setRestoreMsg(response.data.success ? 'Restore completed successfully!' : (response.data.message || 'Restore failed.'));
                    } catch (err) {
                      if (err.response && err.response.data && err.response.data.message) {
                        setRestoreMsg(err.response.data.message);
                      } else {
                        setRestoreMsg('Restore failed.');
                      }
                    } finally {
                      setRestoreLoading(false);
                      setRestoreFile(null);
                    }
                  }}
                >
                  {restoreLoading ? <DotSpinner /> : <><svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 8h8" /></svg> Restore</>}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">Select a backup .zip file to restore your database. This will overwrite existing data in collections present in the backup.</div>
              {restoreMsg && <div className={`mt-2 text-center font-semibold ${restoreMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{restoreMsg}</div>}
            </div>
          </div>
        </div>
      )}
      {/* Import/Export Tab */}
      {activeTab === TAB_IMPORT_EXPORT && (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-extrabold mb-8 text-primary flex items-center gap-3 z-10 relative">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Import / Export Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'employees', label: 'Employees', desc: 'Manage employee data.' },
              { key: 'tasks', label: 'Tasks', desc: 'Import/export task assignments.' },
              { key: 'timesheets', label: 'Timesheets', desc: 'Track and manage work hours.' },
              { key: 'attendance', label: 'Attendance', desc: 'Attendance records for employees.' },
              { key: 'leave_requests', label: 'Leave Requests', desc: 'Employee leave requests.' },
              { key: 'payroll', label: 'Payroll', desc: 'Payroll and salary data.' },
              { key: 'messages', label: 'Messages', desc: 'Internal communication messages.' },
              { key: 'assets', label: 'Assets', desc: 'Company asset records.' },
              { key: 'crm', label: 'CRM', desc: 'Customer relationship management.' },
              { key: 'contacts', label: 'Contacts', desc: 'Business contacts.' },
              { key: 'products', label: 'Products', desc: 'Product catalog and details.' },
              { key: 'quotation', label: 'Quotation', desc: 'Sales quotations.' },
              { key: 'purchase', label: 'Purchase', desc: 'Purchase records.' },
              { key: 'inventory', label: 'Inventory', desc: 'Inventory management.' },
              { key: 'supplier', label: 'Supplier', desc: 'Supplier information.' },
              { key: 'return', label: 'Return', desc: 'Product returns.' },
              { key: 'customer_accounts', label: 'Customer Accounts', desc: 'Customer account details.' },
            ].map((item) => (
              <div key={item.key} className="bg-white border border-border rounded-2xl shadow-lg p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xl font-bold text-primary">{item.label}</span>
                </div>
                <div className="text-text-secondary text-sm mb-2">{item.desc}</div>
                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed" disabled>Import</button>
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed" disabled>Export</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full relative border border-border animate-slide-up">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-3xl font-bold transition" onClick={closeDeleteModal}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Select Collections to Delete
            </h2>
            <div className="mb-4 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              <label className="flex items-center mb-2">
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                <span className="ml-2 font-semibold">Select All</span>
              </label>
              {collections.map((col) => (
                <label key={col} className={`flex items-center mb-1 pl-2 ${NON_DELETABLE.includes(col) ? 'text-gray-400 line-through' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(col)}
                    onChange={() => handleCollectionChange(col)}
                    disabled={NON_DELETABLE.includes(col)}
                  />
                  <span className="ml-2">{col}</span>
                </label>
              ))}
            </div>
            {!otpSent ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Choose verification method:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="verificationMethod"
                        value="sms"
                        checked={verificationMethod === 'sms'}
                        onChange={() => setVerificationMethod('sms')}
                      />
                      <span className="ml-2">SMS (to Super Admin mobile)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="verificationMethod"
                        value="email"
                        checked={verificationMethod === 'email'}
                        onChange={() => setVerificationMethod('email')}
                      />
                      <span className="ml-2">Email (to Super Admin email)</span>
                    </label>
                  </div>
                </div>
                <button
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow"
                  disabled={selectedCollections.length === 0 || otpLoading}
                  onClick={handleSendOtp}
                >
                  {otpLoading ? <DotSpinner /> : `Send OTP via ${verificationMethod === 'sms' ? 'SMS' : 'Email'}`}
                </button>
                {otpError && <div className="text-red-600 mt-2 text-center font-semibold">{otpError}</div>}
              </>
            ) : (
              <>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-2">Enter OTP sent to Super Admin {verificationMethod === 'sms' ? 'mobile' : 'email'}</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2 shadow-sm"
                    maxLength={6}
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{otpTimer > 0 ? `OTP expires in ${otpTimer}s` : 'OTP expired'}</span>
                  {otpTimer === 0 && (
                    <button className="text-xs text-blue-600 underline" onClick={handleResendOtp}>Resend OTP</button>
                  )}
                </div>
                <button
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow"
                  disabled={otp.length !== 6 || deleteLoading || otpTimer === 0}
                  onClick={handleVerifyOtpAndDelete}
                >
                  {deleteLoading ? <DotSpinner /> : "Delete Selected Collections"}
                </button>
                {otpError && <div className="text-red-600 mt-2 text-center font-semibold">{otpError}</div>}
              </>
            )}
          </div>
        </div>
      )}
      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl w-full relative border border-border animate-slide-up">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-3xl font-bold transition" onClick={() => setShowAuditLog(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1H9a1 1 0 00-1 1v9m12 4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Deletion Audit Log
            </h2>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {auditLog.length === 0 ? (
                <div className="text-gray-500 text-center">No audit log entries found.</div>
              ) : (
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-2 py-1">Date</th>
                      <th className="px-2 py-1">Who</th>
                      <th className="px-2 py-1">Collections Deleted</th>
                      <th className="px-2 py-1">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((log) => (
                      <tr key={log.id} className="border-b">
                        <td className="px-2 py-1">{new Date(log.deletedAt).toLocaleString()}</td>
                        <td className="px-2 py-1">{log.performedBy?.name || log.performedBy?.email}</td>
                        <td className="px-2 py-1">{log.deletedCollections.join(", ")}</td>
                        <td className="px-2 py-1">{log.ip || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuisnessSettings;
