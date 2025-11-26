import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { TransactionType, Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { suggestCategory } from '../services/geminiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [amount, setAmount] = useState<string>(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<string>(initialData?.category || EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    });
    onClose();
    // Reset form
    setAmount('');
    setDescription('');
  };

  const handleSuggestCategory = async () => {
    if (!description) return;
    setIsSuggesting(true);
    const suggested = await suggestCategory(description);
    if (suggested) {
      // Basic validation to ensure returned category is valid for current type, otherwise switch type or default
      const allCats = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
      if (allCats.includes(suggested)) {
          setCategory(suggested);
          if (INCOME_CATEGORIES.includes(suggested)) setType('INCOME');
          if (EXPENSE_CATEGORIES.includes(suggested)) setType('EXPENSE');
      }
    }
    setIsSuggesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('EXPENSE')}
            >
              Chi tiêu
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('INCOME')}
            >
              Thu nhập
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VND)</label>
            <input
              type="number"
              required
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              placeholder="0"
            />
          </div>

          {/* Description & AI Suggest */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Ví dụ: Ăn phở, Lương tháng 10..."
              />
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={!description || isSuggesting}
                className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                title="Dùng AI gợi ý danh mục"
              >
                {isSuggesting ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              {(type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all transform hover:scale-[1.01]"
            >
              {initialData ? 'Lưu thay đổi' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
