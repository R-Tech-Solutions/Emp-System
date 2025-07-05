import React, { useEffect, useState, useMemo } from 'react';
import { Eye, Search, Filter, Download, RefreshCw, Users } from 'lucide-react';
import { backEndURL } from '../Backendurl';

const fetchInvoices = async () => {
  const res = await fetch(`${backEndURL}/api/invoices`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return await res.json();
};

const CustomerAccounts = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payModal, setPayModal] = useState({ open: false, customer: null, amount: 0 });
  const [detailModal, setDetailModal] = useState({ open: false, customer: null, transactions: [] });
  const [walkingCustomersModal, setWalkingCustomersModal] = useState({ open: false, invoices: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('customerName');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter and group by customerId for customer accounts
  const customerAccounts = useMemo(() => {
    const accounts = {};
    invoices.forEach((inv) => {
      // Include invoices with cash, card, or customer_account payment methods
      if ((inv.paymentMethod === 'customer_account' || inv.paymentMethod === 'cash' || inv.paymentMethod === 'card') && 
          inv.customer && inv.customer.length > 0) {
        const cust = inv.customer[0];
        if (!accounts[cust.customerId]) {
          accounts[cust.customerId] = {
            customer: cust,
            transactions: [],
            total: 0,
            paid: 0,
            pending: 0,
          };
        }
        accounts[cust.customerId].transactions.push(inv);
        accounts[cust.customerId].total += inv.total || 0;
        accounts[cust.customerId].paid += inv.amountPaid || 0;
        // Calculate pending amount for this invoice
        const invoicePending = (inv.total || 0) - (inv.amountPaid || 0);
        accounts[cust.customerId].pending += invoicePending;
      }
    });
    return Object.values(accounts);
  }, [invoices]);

  // Filter walking customer invoices (cash and card payments with no customer selected)
  const walkingCustomerInvoices = useMemo(() => {
    return invoices.filter(inv => 
      (inv.paymentMethod === 'cash' || inv.paymentMethod === 'card') && 
      inv.paymentStatus === 'Paid' &&
      (!inv.customer || inv.customer.length === 0)
    );
  }, [invoices]);

  // Calculate walking customers stats
  const walkingCustomersStats = useMemo(() => {
    const totalInvoiced = walkingCustomerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = walkingCustomerInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const cashPayments = walkingCustomerInvoices.filter(inv => inv.paymentMethod === 'cash').length;
    const cardPayments = walkingCustomerInvoices.filter(inv => inv.paymentMethod === 'card').length;
    
    return {
      totalInvoiced,
      totalPaid,
      totalInvoices: walkingCustomerInvoices.length,
      cashPayments,
      cardPayments
    };
  }, [walkingCustomerInvoices]);

  // Filter and sort customer accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = customerAccounts.filter(account => 
      account.customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer.customerCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer.customerPhone?.includes(searchTerm) ||
      account.customer.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'customerName':
          aValue = a.customer.customerName;
          bValue = b.customer.customerName;
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'pending':
          aValue = a.pending;
          bValue = b.pending;
          break;
        case 'paid':
          aValue = a.paid;
          bValue = b.paid;
          break;
        default:
          aValue = a.customer.customerName;
          bValue = b.customer.customerName;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [customerAccounts, searchTerm, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePayNow = (customer, amount) => {
    setPayModal({ open: true, customer, amount });
  };

  const handleConfirmPay = () => {
    // Simulate payment: mark all pending invoices for this customer as paid
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.customer && inv.customer[0] && inv.customer[0].customerId === payModal.customer.customerId && inv.paymentStatus === 'Pending'
          ? { ...inv, paymentStatus: 'Paid', amountPaid: inv.total }
          : inv
      )
    );
    setPayModal({ open: false, customer: null, amount: 0 });
  };

  const handleViewDetails = (account) => {
    setDetailModal({ 
      open: true, 
      customer: account.customer, 
      transactions: account.transactions 
    });
  };

  const handleViewWalkingCustomers = () => {
    setWalkingCustomersModal({ 
      open: true, 
      invoices: walkingCustomerInvoices 
    });
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="text-gray-400">↕</span>;
    return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
        <span className="text-lg text-gray-600">Loading customer accounts...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 text-lg mb-2">Error loading data</div>
        <div className="text-gray-500">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Customer Account Transactions</h1>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by customer name, company, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Filters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Walking Customers Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Walking Customers</h2>
                <p className="text-sm text-gray-600">Walk-in customers (no customer selected) with cash and card payments</p>
              </div>
            </div>
            <button
              onClick={handleViewWalkingCustomers}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Total Invoices</div>
              <div className="text-2xl font-bold text-gray-900">{walkingCustomersStats.totalInvoices}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">Rs {walkingCustomersStats.totalInvoiced.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Cash Payments</div>
              <div className="text-2xl font-bold text-green-600">{walkingCustomersStats.cashPayments}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Card Payments</div>
              <div className="text-2xl font-bold text-blue-600">{walkingCustomersStats.cardPayments}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Average Invoice</div>
              <div className="text-2xl font-bold text-purple-600">
                Rs {(walkingCustomersStats.totalInvoiced / Math.max(walkingCustomersStats.totalInvoices, 1)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Accounts Section */}
      {customerAccounts.length > 0 ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredAndSortedAccounts.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoiced</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rs {filteredAndSortedAccounts.reduce((sum, acc) => sum + acc.total, 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs {filteredAndSortedAccounts.reduce((sum, acc) => sum + acc.paid, 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-2xl font-bold text-red-600">
                    Rs {filteredAndSortedAccounts.reduce((sum, acc) => sum + acc.pending, 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <div className="w-6 h-6 bg-red-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Customer</span>
                        <SortIcon column="customerName" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total Invoiced</span>
                        <SortIcon column="total" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('paid')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total Paid</span>
                        <SortIcon column="paid" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('pending')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Pending Amount</span>
                        <SortIcon column="pending" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Methods
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedAccounts.map((account) => {
                    const { customer, total, paid, pending } = account;
                    const balance = total - paid;
                    const status = pending > 0 ? 'Pending' : 'Paid';
                    
                    // Get unique payment methods used by this customer
                    const paymentMethods = [...new Set(account.transactions.map(inv => inv.paymentMethod))];
                    const hasCustomerAccount = paymentMethods.includes('customer_account');
                    
                    return (
                      <tr key={customer.customerId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {customer.customerName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                              <div className="text-sm text-gray-500">
                                {customer.customerCompany && `🏢 ${customer.customerCompany}`}
                              </div>
                              <div className="text-xs text-gray-400">
                                {customer.customerPhone && `📞 ${customer.customerPhone}`}
                                {customer.customerEmail && ` ✉️ ${customer.customerEmail}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">Rs {total.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{account.transactions.length} invoices</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">Rs {paid.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{((paid / total) * 100).toFixed(1)}% paid</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-red-600">Rs {pending.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{((pending / total) * 100).toFixed(1)}% pending</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {paymentMethods.map((method) => (
                              <span
                                key={method}
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  method === 'cash' 
                                    ? 'bg-green-100 text-green-800'
                                    : method === 'card'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {method === 'cash' ? 'Cash' : method === 'card' ? 'Card' : 'Account'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(account)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {pending > 0 && hasCustomerAccount && (
                              <button
                                onClick={() => handlePayNow(customer, pending)}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                title="Pay Now"
                              >
                                💸
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">No customer account transactions found</div>
          <div className="text-gray-400">Start creating invoices with customer accounts to see data here</div>
        </div>
      )}

      {/* Pay Now Modal */}
      {payModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md card-shadow">
            <h2 className="text-xl font-semibold mb-4">Pay Outstanding Balance</h2>
            <div className="mb-4">
              <div className="font-medium text-gray-700 mb-2">Customer:</div>
              <div className="text-lg text-purple-800 font-bold">{payModal.customer.customerName}</div>
              <div className="text-sm text-gray-600">ID: {payModal.customer.customerId}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium text-gray-700 mb-2">Outstanding Amount:</div>
              <div className="text-2xl text-red-600 font-bold">Rs {payModal.amount.toFixed(2)}</div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPayModal({ open: false, customer: null, amount: 0 })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customer Account Details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {detailModal.customer.customerName} - ID: {detailModal.customer.customerId}
                </p>
              </div>
              <button
                onClick={() => setDetailModal({ open: false, customer: null, transactions: [] })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Details Column */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Invoice Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Invoiced:</span>
                        <div className="font-semibold text-gray-900">
                          Rs {detailModal.transactions.reduce((sum, inv) => sum + (inv.total || 0), 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Paid:</span>
                        <div className="font-semibold text-green-600">
                          Rs {detailModal.transactions.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Pending:</span>
                        <div className="font-semibold text-red-600">
                          Rs {detailModal.transactions.reduce((sum, inv) => sum + ((inv.total || 0) - (inv.amountPaid || 0)), 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Invoice Count:</span>
                        <div className="font-semibold text-gray-900">{detailModal.transactions.length}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {detailModal.transactions.map((inv) => (
                      <div key={inv.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">
                            Invoice #{inv.invoiceNumber || inv.id}
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            inv.paymentStatus === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : inv.amountPaid > 0 
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inv.paymentStatus === 'Paid' ? 'Paid' : inv.amountPaid > 0 ? 'Partial' : 'Pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <div className="font-medium">
                              {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <div className="font-semibold text-gray-900">Rs {inv.total?.toFixed(2) || '0.00'}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Paid:</span>
                            <div className="font-semibold text-green-600">Rs {inv.amountPaid?.toFixed(2) || '0.00'}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Pending:</span>
                            <div className="font-semibold text-red-600">
                              Rs {((inv.total || 0) - (inv.amountPaid || 0)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Transactions Column */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Payment Transactions
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Payment Summary</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Payments:</span>
                        <span className="font-semibold">
                          {detailModal.transactions.filter(inv => inv.amountPaid > 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Payment:</span>
                        <span className="font-semibold">
                          Rs {(detailModal.transactions.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0) / 
                               Math.max(detailModal.transactions.filter(inv => inv.amountPaid > 0).length, 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {detailModal.transactions
                      .filter(inv => inv.amountPaid > 0)
                      .map((inv, index) => (
                        <div key={`payment-${inv.id}`} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-900">
                              Payment #{index + 1}
                            </div>
                            <span className="text-xs text-gray-500">
                              {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Invoice:</span>
                              <span className="font-medium">#{inv.invoiceNumber || inv.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount Paid:</span>
                              <span className="font-semibold text-green-600">Rs {inv.amountPaid?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="font-medium capitalize">{inv.paymentMethod?.replace('_', ' ') || 'Customer Account'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                inv.paymentStatus === 'Paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {inv.paymentStatus === 'Paid' ? 'Completed' : 'Partial'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {detailModal.transactions.filter(inv => inv.amountPaid > 0).length === 0 && (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <div className="text-gray-500 mb-2">No payment transactions yet</div>
                        <div className="text-sm text-gray-400">Payments will appear here once made</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walking Customers Modal */}
      {walkingCustomersModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Walking Customers Transactions</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Walk-in customers (no customer selected) with cash and card payments - {walkingCustomersModal.invoices.length} transactions
                </p>
              </div>
              <button
                onClick={() => setWalkingCustomersModal({ open: false, invoices: [] })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Total Invoices</div>
                  <div className="text-xl font-bold text-gray-900">{walkingCustomersStats.totalInvoices}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Total Amount</div>
                  <div className="text-xl font-bold text-gray-900">Rs {walkingCustomersStats.totalInvoiced.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Cash Payments</div>
                  <div className="text-xl font-bold text-green-600">{walkingCustomersStats.cashPayments}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Card Payments</div>
                  <div className="text-xl font-bold text-blue-600">{walkingCustomersStats.cardPayments}</div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {walkingCustomersModal.invoices.map((inv) => {
                        const customer = inv.customer && inv.customer.length > 0 ? inv.customer[0] : null;
                        return (
                          <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                #{inv.invoiceNumber || inv.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {inv.items && inv.items.length > 0 ? `${inv.items.length} items` : 'No items'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {customer ? customer.customerName : 'Walk-in Customer'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer ? (customer.customerPhone || customer.customerEmail || 'No contact info') : 'No customer info'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                Rs {inv.total?.toFixed(2) || '0.00'}
                              </div>
                              {inv.discount > 0 && (
                                <div className="text-xs text-green-600">
                                  -Rs {inv.discount?.toFixed(2) || '0.00'} discount
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                inv.paymentMethod === 'cash' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {inv.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {walkingCustomersModal.invoices.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-2">No walking customer transactions found</div>
                  <div className="text-sm text-gray-400">Walk-in customers with cash and card payments will appear here</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAccounts;
