import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  List, 
  Sparkles,
  PieChart as PieChartIcon,
  Trash2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

import { Transaction, TransactionType, CategoryData } from './types';
import { INITIAL_TRANSACTIONS, COLORS } from './constants';
import StatsCard from './components/StatsCard';
import TransactionModal from './components/TransactionModal';
import AIAdvisor from './components/AIAdvisor';

const App = () => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'ai'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handlers
  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Calculations
  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    
    return Object.keys(data).map((name, index) => ({
      name,
      value: data[name],
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Last 6 months data for Bar Chart
  const monthlyData = useMemo(() => {
    const data: Record<string, { name: string, Thu: number, Chi: number }> = {};
    const today = new Date();
    
    // Initialize last 6 months
    for(let i=5; i>=0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      data[key] = { name: key, Thu: 0, Chi: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (data[key]) {
        if (t.type === 'INCOME') data[key].Thu += t.amount;
        else data[key].Chi += t.amount;
      }
    });

    return Object.values(data);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed md:sticky top-0 z-30 h-auto md:h-screen">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            SmartSpend
          </h1>
        </div>
        
        <nav className="p-4 space-y-2 flex flex-row md:flex-col justify-around md:justify-start overflow-x-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden md:inline">Tổng quan</span>
          </button>

          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <List size={20} />
            <span className="hidden md:inline">Giao dịch</span>
          </button>

          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-medium transition-colors ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Sparkles size={20} />
            <span className="hidden md:inline">Trợ lý AI</span>
          </button>
        </nav>

        <div className="hidden md:block absolute bottom-0 w-full p-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-80 mb-1">Số dư hiện tại</p>
            <p className="text-xl font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.balance)}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-20 md:mt-0 overflow-y-auto">
        
        {/* Header Action */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Tổng quan tài chính'}
              {activeTab === 'transactions' && 'Lịch sử giao dịch'}
              {activeTab === 'ai' && 'Phân tích thông minh'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Quản lý chi tiêu hiệu quả với SmartSpend</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all transform hover:scale-105"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Thêm giao dịch</span>
          </button>
        </div>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard 
                title="Tổng thu nhập" 
                value={summary.totalIncome} 
                icon={ArrowUpCircle} 
                color="text-green-600 bg-green-100" 
              />
              <StatsCard 
                title="Tổng chi tiêu" 
                value={summary.totalExpense} 
                icon={ArrowDownCircle} 
                color="text-red-600 bg-red-100" 
              />
              <StatsCard 
                title="Số dư" 
                value={summary.balance} 
                icon={Wallet} 
                color="text-indigo-600 bg-indigo-100" 
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Biến động Thu/Chi</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value)}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="Thu" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="Chi" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Cơ cấu chi tiêu</h3>
                {expenseByCategory.length > 0 ? (
                  <div className="h-72 flex flex-col sm:flex-row items-center justify-center">
                    <div className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {expenseByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full sm:w-1/2 max-h-48 overflow-y-auto mt-4 sm:mt-0 pr-2 custom-scrollbar">
                      {expenseByCategory.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between mb-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-gray-600 truncate max-w-[100px]">{entry.name}</span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {((entry.value / summary.totalExpense) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-gray-400">
                    <PieChartIcon size={48} className="mb-2 opacity-20" />
                    <p>Chưa có dữ liệu chi tiêu</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions List (Small) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Giao dịch gần đây</h3>
                <button onClick={() => setActiveTab('transactions')} className="text-indigo-600 text-sm font-medium hover:underline">Xem tất cả</button>
              </div>
              <div className="divide-y divide-gray-50">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'INCOME' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{t.description}</p>
                        <p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(t.amount)} 
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">Chưa có giao dịch nào.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TRANSACTIONS TAB --- */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
             <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-sm text-gray-800 font-medium">{t.description}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {t.category}
                        </span>
                      </td>
                      <td className={`p-4 text-right text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(t.amount)}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Danh sách trống. Hãy thêm giao dịch mới!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
             </div>
          </div>
        )}

        {/* --- AI ADVISOR TAB --- */}
        {activeTab === 'ai' && (
          <AIAdvisor transactions={transactions} />
        )}

      </main>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTransaction}
      />

    </div>
  );
};

export default App;
