import React, { useState, useEffect } from "react";
import axios from "axios";
import { backEndURL } from "../Backendurl";

const STORAGE_KEY = "businessSettings";
const languages = ["English", "Hindi", "German", "Japanese", "Other"];

const BuisnessSettings = () => {
  const [form, setForm] = useState({
    businessName: "",
    printingStyle: "A4",
    openCash: "",
    address: "",
    contact: "",
    businessType: "Retail",
    gstNumber: "",
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

  useEffect(() => {
    // Fetch settings from backend
    axios.get(`${backEndURL}/api/business-settings`).then(res => {
      if (res.data && res.data.data) {
        setForm(res.data.data);
        setIsEdit(true);
        if (res.data.data.logo) setLogoPreview(res.data.data.logo);
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
  }, []);

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

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-primary">Business Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">TAX</label>
          <input
            type="text"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Business Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            value={form.registrationNumber}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          />
        </div>
        {/* Financial Year Start */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Financial Year Start</label>
          <input
            type="date"
            name="financialYearStart"
            value={form.financialYearStart}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          />
        </div>
        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Currency</label>
          <input
            type="text"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
            placeholder="e.g. USD, INR, EUR"
          />
        </div>
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
            placeholder="e.g. India, United States"
          />
        </div>
        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Website</label>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
            placeholder="https://example.com"
          />
        </div>
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block"
          />
          {logoPreview && (
            <img src={logoPreview} alt="Logo Preview" className="mt-2 h-16 object-contain border rounded" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Printing Style</label>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="printingStyle"
                value="A4"
                checked={form.printingStyle === "A4"}
                onChange={handleChange}
                className="accent-primary"
              />
              A4
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="printingStyle"
                value="POS"
                checked={form.printingStyle === "POS"}
                onChange={handleChange}
                className="accent-primary"
              />
              POS Billing
            </label>
          </div>
        </div>
        {/* Open Cash */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Open Cash</label>
          <input
            type="number"
            name="openCash"
            value={form.openCash}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            required
          />
        </div>
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            required
          />
        </div>
        {/* Contact Email/Phone */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Contact Email/Phone</label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition"
        >
          {isEdit ? "Update Settings" : "Save Settings"}
        </button>
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
      </form>
      {/* Notes & Terms Section */}
      <div className="bg-surface p-6 rounded-lg shadow-lg max-w-2xl mx-auto border border-border mt-10">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Notes & Terms</h2>
        <form onSubmit={handleNotesSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">
              Notes
            </label>
            <textarea
              className="w-full p-3 rounded-lg bg-background text-text-primary border border-border focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px]"
              placeholder="Enter notes..."
              value={notes}
              onChange={handleNotesChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">
              Terms and Conditions
            </label>
            <div className="space-y-2">
              {terms.map((term, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-2 text-primary">•</span>
                  <textarea
                    className="flex-1 p-2 rounded-lg bg-background text-text-primary border border-border focus:border-primary focus:ring-1 focus:ring-primary min-h-[40px]"
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
              className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-md transition-colors"
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
            <div className="text-green-600 text-center">{notesSuccessMsg}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BuisnessSettings;
