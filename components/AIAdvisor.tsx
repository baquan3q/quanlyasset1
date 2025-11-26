import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Transaction, AIAnalysisResult } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  transactions: Transaction[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      // Take only the last 50 transactions to avoid token limits and keep relevant
      const recentTransactions = transactions.slice(0, 50);
      const result = await getFinancialAdvice(recentTransactions);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto fetch on mount if we have data and no analysis yet
    if (transactions.length > 0 && !analysis) {
      fetchAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-8 h-8 text-green-500" />;
      case 'negative': return <TrendingDown className="w-8 h-8 text-red-500" />;
      default: return <Minus className="w-8 h-8 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 border-green-100';
      case 'negative': return 'bg-red-50 border-red-100';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bot className="text-indigo-600" />
          Trợ lý Tài chính AI
        </h2>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          Phân tích ngay
        </button>
      </div>

      {!analysis && !loading && (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
          <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nhấn nút "Phân tích ngay" để AI xem xét chi tiêu của bạn.</p>
        </div>
      )}

      {loading && (
        <div className="bg-white p-12 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-4 border border-gray-100">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 animate-pulse">Đang phân tích dữ liệu tài chính của bạn...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sentiment Card */}
          <div className={`col-span-1 p-6 rounded-2xl border ${getSentimentColor(analysis.sentiment)} flex flex-col items-center justify-center text-center shadow-sm`}>
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              {getSentimentIcon(analysis.sentiment)}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Sức khỏe Tài chính</h3>
            <p className="text-gray-600 capitalize">{analysis.sentiment === 'positive' ? 'Tích cực' : analysis.sentiment === 'negative' ? 'Cần cải thiện' : 'Ổn định'}</p>
          </div>

          {/* Summary Card */}
          <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Tổng quan
            </h3>
            <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Tips List */}
          <div className="col-span-1 md:col-span-3 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">Lời khuyên dành cho bạn</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.tips.map((tip, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50 flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
