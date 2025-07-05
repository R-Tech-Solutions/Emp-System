import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backEndURL } from '../Backendurl';
import { Eye, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

function formatDate(date) {
  if (!date) return '-';
  let d;
  if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else if (date.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) return typeof date === 'object' ? JSON.stringify(date) : String(date);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const ItemCard = ({ item }) => (
  <div className="border rounded-lg p-4 mb-3 bg-gray-50 shadow-sm">
    <div className="grid grid-cols-2 gap-2 text-sm">
      {[
        ['Barcode', item.barcode],
        ['Category', item.category],
        ['Name', item.name],
        ['ID', item.id],
        ['Main Product ID', item.mainProductId],
        ['Main Product SKU', item.mainProductSku],
        ['Quantity', item.quantity],
        ['Return Qty', item.returnQty],
        ['Price', item.price],
        ['Original Price', item.originalPrice],
        ['Discounted Price', item.discountedPrice],
        ['Discount Amount', item.discountAmount],
        ['Return Type', item.returnType],
        ['Identifier Type', item.identifierType || (item.identifier && item.identifier.type)],
        ['Identifier Value', item.identifierValue || (item.identifier && item.identifier.value)],
        ['Unique Line ID', item.uniqueLineId],
        ['Selected', item.selected !== undefined ? (item.selected ? 'Yes' : 'No') : '-'],
        ['Reason', item.reason],
      ].map(([label, value], idx) => (
        <div key={idx}><span className="font-medium">{label}:</span> {value ?? '-'}</div>
      ))}
    </div>
  </div>
);

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ffbb28'];

const IdentifierTable = ({ data, type }) => (
  <div className="overflow-x-auto mt-4">
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        <tr>
          {['Product ID', 'Identifier Type', 'Identifier Value', 'Quantity', 'Product Status', 'Return Number', 'Created At'].map(h => (
            <th key={h} className="px-4 py-2 border">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan="7" className="text-center py-4">No {type} identifiers found.</td></tr>
        ) : data.map((row, idx) => (
          <tr key={row.id || idx} className="hover:bg-gray-50">
            <td className="px-4 py-2 border">{row.productId}</td>
            <td className="px-4 py-2 border">{row.identifierType}</td>
            <td className="px-4 py-2 border">{row.identifierValue}</td>
            <td className="px-4 py-2 border">{row.quantity}</td>
            <td className="px-4 py-2 border">{row.productStatus}</td>
            <td className="px-4 py-2 border">{row.returnNumber}</td>
            <td className="px-4 py-2 border">{formatDate(row.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Retrundashboard = () => {
  const [tab, setTab] = useState('Good');
  const [returns, setReturns] = useState([]);
  const [damagedReturns, setDamagedReturns] = useState([]);
  const [openedReturns, setOpenedReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalReturn, setModalReturn] = useState(null);
  const [modalType, setModalType] = useState('Good');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [goodRes, damagedRes, openedRes] = await Promise.all([
          axios.get(`${backEndURL}/api/returns`),
          axios.get(`${backEndURL}/api/returns?type=Damaged`),
          axios.get(`${backEndURL}/api/returns?type=Opened`),
        ]);
        setReturns(goodRes.data);
        setDamagedReturns(damagedRes.data);
        setOpenedReturns(openedRes.data);
      } catch (err) {
        setError('Failed to fetch returns or identifiers.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Tab data
  const tabData = [
    { key: 'Good', label: 'Good Returns', data: returns },
    { key: 'Damaged', label: 'Damaged Returns', data: damagedReturns },
    { key: 'Opened', label: 'Opened Returns', data: openedReturns },
  ];

  // For charts, only for returns (not identifiers)
  const allReturns = [
    ...returns.map(r => ({ ...r, returnType: 'Good' })),
    ...damagedReturns.map(r => ({ ...r, returnType: 'Damaged' })),
    ...openedReturns.map(r => ({ ...r, returnType: 'Opened' })),
  ];

  const returnTypeData = ['Good', 'Damaged', 'Opened'].map(type => ({
    name: type,
    value: allReturns.filter(r => r.returnType === type).length,
  }));

  const returnsByDate = allReturns.reduce((acc, r) => {
    const d = formatDate(r.createdAt);
    const found = acc.find(i => i.date === d);
    if (found) found.count++;
    else acc.push({ date: d, count: 1 });
    return acc;
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-2">📦 Return Dashboard</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabData.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-t-lg border-b-2 font-semibold ${tab === t.key ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h4 className="text-sm text-gray-500">Total Returns</h4>
              <p className="text-xl font-semibold">{allReturns.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h4 className="text-sm text-gray-500">Unique Invoices</h4>
              <p className="text-xl font-semibold">{new Set(allReturns.map(r => r.invoiceId)).size}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h4 className="text-sm text-gray-500">Return Types</h4>
              <p className="text-xl font-semibold">{returnTypeData.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h4 className="font-semibold mb-2">Return Type Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={returnTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {returnTypeData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h4 className="font-semibold mb-2">Returns Over Time</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={returnsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tab Content */}
          {tab === 'Good' && (
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    {['Action', 'Return Number', 'Invoice ID', 'Invoice Ref', 'Return Type', '# Items'].map(h => (
                      <th key={h} className="px-4 py-2 border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No returns found.</td>
                    </tr>
                  ) : returns.map(ret => (
                    <tr key={ret.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => { setModalReturn(ret); setModalType('Good'); }}
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                      <td className="px-4 py-2 border">{ret.returnNumber}</td>
                      <td className="px-4 py-2 border">{ret.invoiceId || '-'}</td>
                      <td className="px-4 py-2 border">{ret.invoiceRef || '-'}</td>
                      <td className="px-4 py-2 border">{ret.returnType || '-'}</td>
                      <td className="px-4 py-2 border">{(ret.items && ret.items.length) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'Damaged' && (
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    {['Action', 'Return Number', 'Invoice ID', 'Invoice Ref', 'Return Type', '# Items'].map(h => (
                      <th key={h} className="px-4 py-2 border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {damagedReturns.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No damaged returns found.</td>
                    </tr>
                  ) : damagedReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => { setModalReturn(ret); setModalType('Damaged'); }}
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                      <td className="px-4 py-2 border">{ret.returnNumber}</td>
                      <td className="px-4 py-2 border">{ret.invoiceId || '-'}</td>
                      <td className="px-4 py-2 border">{ret.invoiceRef || '-'}</td>
                      <td className="px-4 py-2 border">{ret.returnType || '-'}</td>
                      <td className="px-4 py-2 border">{(ret.items && ret.items.length) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'Opened' && (
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    {['Action', 'Return Number', 'Invoice ID', 'Invoice Ref', 'Return Type', '# Items'].map(h => (
                      <th key={h} className="px-4 py-2 border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {openedReturns.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No opened returns found.</td>
                    </tr>
                  ) : openedReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => { setModalReturn(ret); setModalType('Opened'); }}
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                      <td className="px-4 py-2 border">{ret.returnNumber}</td>
                      <td className="px-4 py-2 border">{ret.invoiceId || '-'}</td>
                      <td className="px-4 py-2 border">{ret.invoiceRef || '-'}</td>
                      <td className="px-4 py-2 border">{ret.returnType || '-'}</td>
                      <td className="px-4 py-2 border">{(ret.items && ret.items.length) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </>
      )}

      {/* Modal Popup */}
      {modalReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setModalReturn(null)}
              title="Close"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Return Details</h3>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {[
                ['Return Number', modalReturn.returnNumber],
                ['Invoice ID', modalReturn.invoiceId],
                ['Invoice Ref', modalReturn.invoiceRef],
                ['Return Type', modalReturn.returnType],
                ['# Items', (modalReturn.items || []).length]
              ].map(([label, value], i) => (
                <div key={i}><span className="font-medium">{label}:</span> {value || '-'}</div>
              ))}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              {(modalReturn.items || []).length === 0
                ? <div className="text-gray-500">No items.</div>
                : modalReturn.items.map((item, idx) => (
                  <ItemCard key={item.uniqueLineId || idx} item={item} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Retrundashboard;
