import { SlMagnifier } from "react-icons/sl";
import { FiPlus } from "react-icons/fi";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function TransactionsPage() {
  // ======================
  // Mock Data (Enhanced with more realistic data)
  // ======================
  const transactions = [
    {
      id: 1,
      name: "Ahmad",
      type: "Income",
      category: "Salary",
      date: "19 Aug 2025",
      amount: 1000,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
    },
    {
      id: 2,
      name: "Mohammad",
      type: "Expense",
      category: "Groceries",
      date: "20 Sep 2024",
      amount: -500,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad",
    },
    {
      id: 3,
      name: "Ali",
      type: "Expense",
      category: "Dining",
      date: "21 Sep 2024",
      amount: -240,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
    },
    {
      id: 4,
      name: "Sarah",
      type: "Income",
      category: "Freelance",
      date: "22 Sep 2024",
      amount: 800,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      id: 5,
      name: "Amazon",
      type: "Expense",
      category: "Shopping",
      date: "23 Sep 2024",
      amount: -350,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amazon",
    },
    {
      id: 6,
      name: "Netflix",
      type: "Expense",
      category: "Entertainment",
      date: "24 Sep 2024",
      amount: -15,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Netflix",
    },
    {
      id: 7,
      name: "Google",
      type: "Income",
      category: "Freelance",
      date: "25 Sep 2024",
      amount: 1200,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google",
    },
    {
      id: 8,
      name: "Uber",
      type: "Expense",
      category: "Transportation",
      date: "26 Sep 2024",
      amount: -45,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Uber",
    },
  ];

  // ======================
  // Helper Functions
  // ======================
  const formatAmount = (amount) => {
    const sign = amount >= 0 ? "+" : "-";
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  const getAmountColor = (amount) => {
    return amount >= 0 ? "text-green-500" : "text-red-500";
  };

  const getTypeBadgeClass = (type) => {
    return type === "Income"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  const getCategoryColor = (category) => {
    const colors = {
      Salary:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Groceries:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Dining: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      Shopping:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Entertainment:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      Freelance:
        "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      Transportation:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    );
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-6 md:px-0">
        <div>
          <h1 className="text-foreground text-3xl md:text-4xl font-bold mb-2">
            Transactions
          </h1>
          <p className="text-text/70 text-sm md:text-base">
            View and manage all your financial transactions
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-foreground hover:bg-primary transition-all duration-200 px-5 py-3 font-semibold text-background shadow-lg hover:shadow-xl active:scale-95">
          <FiPlus className="text-xl" />
          Add New Transaction
        </button>
      </div>

      {/* Filters & Table Container */}
      <div className="rounded-2xl border border-text/10 bg-background dark:bg-linear-45 dark:from-background dark:to-primary/20 p-6 shadow-lg">
        {/* Filters Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          {/* Search Input */}
          <div className="relative w-full lg:w-auto flex-1 max-w-md">
            <input
              className="w-full rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 pr-12 text-foreground placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200"
              placeholder="Search transactions, categories, or amounts..."
            />
            <SlMagnifier className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text/50" />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            {/* Sort Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text">Sort by</span>
              <select className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent min-w-[140px] cursor-pointer transition-all duration-200">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text">Category</span>
              <select
                defaultValue="all"
                className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent min-w-[180px] cursor-pointer transition-all duration-200"
              >
                <option value="all">All Categories</option>
                <option value="income">Income</option>
                <option value="groceries">Groceries</option>
                <option value="dining">Dining</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="transportation">Transportation</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text">Type</span>
              <select
                defaultValue="all"
                className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent min-w-[140px] cursor-pointer transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-text/10">
          <table className="w-full min-w-200">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-text/10">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
                  Recipient / Sender
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
                  Category
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
                  Type
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-4 px-3 text-left text-sm font-semibold text-text uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors duration-150"
                >
                  {/* Recipient/Sender */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={tx.avatar}
                          className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800"
                          alt={tx.name}
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${
                            tx.type === "Income" ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground block">
                          {tx.name}
                        </span>
                        <span className="text-sm text-text/70">
                          {tx.type === "Income" ? "Received from" : "Paid to"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(
                        tx.category
                      )}`}
                    >
                      {tx.category}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTypeBadgeClass(
                        tx.type
                      )}`}
                    >
                      {tx.type}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">
                        {tx.date}
                      </span>
                      <span className="text-sm text-text/70">3:45 PM</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-6">
                    <div
                      className={`font-semibold text-md ${getAmountColor(
                        tx.amount
                      )}`}
                    >
                      {formatAmount(tx.amount)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 ">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text hover:text-red-600 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-text/10">
          <div className="text-sm text-text/70">
            Showing <span className="font-medium text-foreground">8</span> of{" "}
            <span className="font-medium text-foreground">8</span> transactions
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button className="px-3 py-2 rounded-lg bg-primary text-white font-medium">
              1
            </button>
            <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors">
              2
            </button>
            <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors">
              3
            </button>

            <span className="px-2 text-text/70">...</span>

            <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors">
              10
            </button>

            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
