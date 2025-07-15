import React, { useState, useEffect } from 'react';
import { backEndURL } from '../../Backendurl';

export function HoldBillModal({ open, onClose, cart, customer, onSaved }) {
  const [billName, setBillName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!cart || cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${backEndURL}/api/hold-bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          customer,
          billName: billName || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save hold bill');
      const data = await res.json();
      onSaved && onSaved(data);
      setBillName('');
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md card-shadow fade-in">
        <h3 className="text-lg font-semibold mb-4">🧾 Hold Bill</h3>
        <input
          type="text"
          value={billName}
          onChange={e => setBillName(e.target.value)}
          placeholder="Enter a name or note for this bill"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !cart || cart.length === 0}
            className="flex-1 btn-primary px-4 py-2 rounded-lg font-medium"
          >
            {loading ? 'Saving...' : 'Save Hold Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnholdBillModal({ open, onClose, onRestore }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [holdBills, setHoldBills] = useState([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError('');
      fetch(`${backEndURL}/api/hold-bills`)
        .then(res => res.json())
        .then(data => setHoldBills(Array.isArray(data) ? data : []))
        .catch(e => setError('Failed to fetch hold bills'))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleRestore = (bill) => {
    onRestore && onRestore(bill);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl card-shadow fade-in max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Unhold Bill</h3>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600 mb-2">{error}</div>
        ) : holdBills.length === 0 ? (
          <div className="text-gray-500">No held bills found.</div>
        ) : (
          <div className="space-y-3">
            {holdBills.map(bill => (
              <div key={bill.id} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-50 transition cursor-pointer" onClick={() => handleRestore(bill)}>
                <div>
                  <div className="font-semibold text-blue-900">{bill.billName || 'Unnamed Bill'}</div>
                  <div className="text-xs text-gray-500">{bill.customer?.name && `Customer: ${bill.customer.name}`}</div>
                  <div className="text-xs text-gray-400">{bill.createdAt && new Date(bill.createdAt).toLocaleString()}</div>
                  <div className="text-xs text-gray-600">{bill.cart?.length || 0} items</div>
                </div>
                <div className="mt-2 md:mt-0">
                  <button className="btn-primary px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleRestore(bill); }}>Restore</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to delete a hold bill after payment
export async function deleteHoldBillById(id) {
  if (!id) return;
  await fetch(`${backEndURL}/api/hold-bills/${id}`, { method: 'DELETE' });
}
