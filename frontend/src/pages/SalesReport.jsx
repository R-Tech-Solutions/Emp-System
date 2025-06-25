"use client"

import { useState } from "react"

const ReportsPage = () => {
  const [activeFilter, setActiveFilter] = useState("today")
  const [activeCategory, setActiveCategory] = useState("sales")

  // Sample data for charts
  const salesData = [
    { day: "Mon", amount: 1200 },
    { day: "Tue", amount: 1900 },
    { day: "Wed", amount: 800 },
    { day: "Thu", amount: 1600 },
    { day: "Fri", amount: 2200 },
    { day: "Sat", amount: 2800 },
    { day: "Sun", amount: 1400 },
  ]

  const paymentMethods = [
    { method: "Cash", percentage: 45, color: "#875A7B" },
    { method: "Card", percentage: 35, color: "#CBA8C6" },
    { method: "Digital", percentage: 20, color: "#D8BFD8" },
  ]

  // Chart Components
  const BarChart = ({ data, title }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-300">
      <h4 className="text-sm font-medium text-gray-800 mb-3">{title}</h4>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-purple-600 rounded-t"
              style={{ height: `${(item.amount / Math.max(...data.map((d) => d.amount))) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-600 mt-1">{item.day}</span>
            <span className="text-xs text-gray-500">${item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const PieChart = ({ data, title }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-300">
      <h4 className="text-sm font-medium text-gray-800 mb-3">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const offset = data.slice(0, index).reduce((sum, d) => sum + d.percentage, 0)
              const circumference = 2 * Math.PI * 40
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((offset / 100) * circumference)

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              )
            })}
          </svg>
        </div>
        <div className="ml-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-gray-600">
                {item.method}: {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const LineChart = ({ title }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-300">
      <h4 className="text-sm font-medium text-gray-800 mb-3">{title}</h4>
      <div className="h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <polyline
            fill="none"
            stroke="#875A7B"
            strokeWidth="2"
            points="0,80 50,60 100,70 150,40 200,50 250,30 300,35"
          />
          <circle cx="0" cy="80" r="3" fill="#875A7B" />
          <circle cx="50" cy="60" r="3" fill="#875A7B" />
          <circle cx="100" cy="70" r="3" fill="#875A7B" />
          <circle cx="150" cy="40" r="3" fill="#875A7B" />
          <circle cx="200" cy="50" r="3" fill="#875A7B" />
          <circle cx="250" cy="30" r="3" fill="#875A7B" />
          <circle cx="300" cy="35" r="3" fill="#875A7B" />
        </svg>
      </div>
    </div>
  )

  const ExportButtons = () => (
    <div className="flex gap-2">
      <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors">
        PDF
      </button>
      <button className="px-3 py-1 bg-purple-400 text-white text-xs rounded hover:bg-purple-600 transition-colors">
        Excel
      </button>
    </div>
  )

  const FilterDropdown = ({ options, value, onChange }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  const ReportCard = ({ title, value, change, icon }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className={`text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? "+" : ""}
            {change}%
          </p>
        </div>
        <div className="text-purple-600 text-2xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">POS Reports Dashboard</h1>
              <p className="text-gray-600 text-sm">Comprehensive business analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <FilterDropdown
              options={[
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "year", label: "This Year" },
              ]}
              value={activeFilter}
              onChange={setActiveFilter}
            />
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-300 px-6 py-3">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: "sales", label: "🧾 Sales" },
            { id: "crm", label: "👥 CRM" },
            { id: "products", label: "📦 Products" },
            { id: "quotations", label: "📋 Quotations" },
            { id: "purchases", label: "🛒 Purchases" },
            { id: "inventory", label: "🏪 Inventory" },
            { id: "suppliers", label: "📦 Suppliers" },
            { id: "cashbook", label: "💵 Cashbook" },
            { id: "income", label: "💰 Income" },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-purple-100"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ReportCard title="Today's Sales" value="$12,450" change={8.2} icon="💰" />
          <ReportCard title="Total Orders" value="156" change={-2.1} icon="🛒" />
          <ReportCard title="Active Customers" value="89" change={12.5} icon="👥" />
          <ReportCard title="Profit Margin" value="23.4%" change={5.7} icon="📈" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <BarChart data={salesData} title="Weekly Sales Performance" />
          <PieChart data={paymentMethods} title="Payment Methods Distribution" />
          <LineChart title="Profit Trends (30 Days)" />
        </div>

        {/* Reports Sections */}
        <div className="space-y-8">
          {/* Sales Reports */}
          {activeCategory === "sales" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">🧾 Sales Reports</h2>
                <ExportButtons />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Daily/Weekly/Monthly Summary</h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Daily Sales</span>
                      <span className="font-bold text-gray-800">$2,450</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Weekly Sales</span>
                      <span className="font-bold text-gray-800">$16,800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Sales</span>
                      <span className="font-bold text-gray-800">$68,200</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Top-Selling Products</h3>
                  <div className="space-y-2">
                    {["Coffee Beans - Premium", "Espresso Machine", "Milk Frother", "Coffee Cups Set"].map(
                      (product, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                          <span className="text-gray-600 text-sm">{product}</span>
                          <span className="text-purple-600 font-medium">{120 - index * 20}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Sales by Category</h3>
                  <div className="space-y-2">
                    {["Employee: John Doe", "Employee: Jane Smith", "Payment: Cash", "Payment: Card"].map(
                      (item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                          <span className="text-gray-600 text-sm">{item}</span>
                          <span className="text-purple-600 font-medium">${(1500 - index * 200).toLocaleString()}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CRM Reports */}
          {activeCategory === "crm" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">👥 CRM / Customer Reports</h2>
                <ExportButtons />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Customer History</h3>
                  <div className="space-y-2">
                    {["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson"].map((customer, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded">
                        <div className="font-medium text-gray-800">{customer}</div>
                        <div className="text-sm text-gray-600">Last visit: {index + 1} days ago</div>
                        <div className="text-sm text-purple-600">
                          Total spent: ${(500 + index * 150).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Frequent Customers</h3>
                  <div className="space-y-2">
                    {["Premium Member A", "Premium Member B", "Regular Customer C", "Regular Customer D"].map(
                      (customer, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                          <span className="text-gray-600 text-sm">{customer}</span>
                          <span className="text-purple-600 font-medium">{25 - index * 3} visits</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Outstanding Payments</h3>
                  <div className="space-y-2">
                    {["Invoice #1001", "Invoice #1002", "Invoice #1003", "Invoice #1004"].map((invoice, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                        <div className="text-sm font-medium text-red-800">{invoice}</div>
                        <div className="text-sm text-red-600">${(200 + index * 50).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Customer-wise Sales</h3>
                  <div className="space-y-2">
                    {["Top Customer 1", "Top Customer 2", "Top Customer 3", "Top Customer 4"].map((customer, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                        <span className="text-gray-600 text-sm">{customer}</span>
                        <span className="text-purple-600 font-medium">${(2000 - index * 300).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Product Reports */}
          {activeCategory === "products" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">📦 Product Reports</h2>
                <ExportButtons />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Product Performance</h3>
                  <div className="space-y-2">
                    {["Coffee Beans Premium", "Espresso Machine Pro", "Milk Frother Deluxe", "Coffee Cup Set"].map(
                      (product, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded">
                          <div className="font-medium text-gray-800">{product}</div>
                          <div className="text-sm text-gray-600">Sold: {150 - index * 20} units</div>
                          <div className="text-sm text-purple-600">
                            Revenue: ${(3000 - index * 400).toLocaleString()}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Low Stock Alerts</h3>
                  <div className="space-y-2">
                    {["Product A", "Product B", "Product C", "Product D"].map((product, index) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="text-sm font-medium text-yellow-800">{product}</div>
                        <div className="text-sm text-yellow-600">{5 - index} units left</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Stock Movement</h3>
                  <div className="space-y-2">
                    {["In: Product X", "Out: Product Y", "In: Product Z", "Out: Product W"].map((movement, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                        <span className="text-gray-600 text-sm">{movement}</span>
                        <span className="text-purple-600 font-medium">{50 + index * 10} units</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Slow/Dead Stock</h3>
                  <div className="space-y-2">
                    {["Old Product 1", "Old Product 2", "Old Product 3", "Old Product 4"].map((product, index) => (
                      <div key={index} className="p-2 bg-gray-50 border border-gray-200 rounded">
                        <div className="text-sm font-medium text-gray-800">{product}</div>
                        <div className="text-sm text-gray-600">No sales in {30 + index * 15} days</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Continue with other categories... */}
          {activeCategory === "quotations" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">📋 Quotation Reports</h2>
                <ExportButtons />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Quotation History</h3>
                  <div className="space-y-2">
                    {["Quote #Q001", "Quote #Q002", "Quote #Q003", "Quote #Q004"].map((quote, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded">
                        <div className="font-medium text-gray-800">{quote}</div>
                        <div className="text-sm text-gray-600">Date: 2024-01-{15 + index}</div>
                        <div className="text-sm text-purple-600">Amount: ${(1500 + index * 200).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Conversion Ratio</h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">68%</div>
                      <div className="text-sm text-gray-600">Quote to Sale Conversion</div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Quotes</span>
                        <span className="font-medium">125</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Converted</span>
                        <span className="font-medium text-green-600">85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-medium text-yellow-600">40</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Pending Quotations</h3>
                  <div className="space-y-2">
                    {["Pending Quote #P001", "Pending Quote #P002", "Pending Quote #P003", "Pending Quote #P004"].map(
                      (quote, index) => (
                        <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="text-sm font-medium text-yellow-800">{quote}</div>
                          <div className="text-sm text-yellow-600">${(800 + index * 150).toLocaleString()}</div>
                          <div className="text-xs text-yellow-500">{index + 1} days pending</div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Add other categories as needed */}
          {activeCategory === "purchases" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">🛒 Purchase Reports</h2>
                <ExportButtons />
              </div>
              <div className="p-4 text-center text-gray-600">Purchase reports content will be displayed here...</div>
            </section>
          )}

          {activeCategory === "inventory" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">🏪 Inventory Reports</h2>
                <ExportButtons />
              </div>
              <div className="p-4 text-center text-gray-600">Inventory reports content will be displayed here...</div>
            </section>
          )}

          {activeCategory === "suppliers" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">📦 Supplier Reports</h2>
                <ExportButtons />
              </div>
              <div className="p-4 text-center text-gray-600">Supplier reports content will be displayed here...</div>
            </section>
          )}

          {activeCategory === "cashbook" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">💵 Cashbook / Financial Reports</h2>
                <ExportButtons />
              </div>
              <div className="p-4 text-center text-gray-600">Cashbook reports content will be displayed here...</div>
            </section>
          )}

          {activeCategory === "income" && (
            <section className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">💰 Income Reports</h2>
                <ExportButtons />
              </div>
              <div className="p-4 text-center text-gray-600">Income reports content will be displayed here...</div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 px-6 py-4 mt-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            © 2024 POS Reports Dashboard. Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm text-purple-600 hover:text-purple-700">Help</button>
            <button className="text-sm text-purple-600 hover:text-purple-700">Settings</button>
            <button className="text-sm text-purple-600 hover:text-purple-700">Export All</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ReportsPage
