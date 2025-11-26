import { Transaction } from './types';

export const EXPENSE_CATEGORIES = [
  'Ăn uống',
  'Di chuyển',
  'Nhà cửa',
  'Mua sắm',
  'Giải trí',
  'Sức khỏe',
  'Giáo dục',
  'Hóa đơn & Tiện ích',
  'Khác'
];

export const INCOME_CATEGORIES = [
  'Lương',
  'Thưởng',
  'Đầu tư',
  'Bán hàng',
  'Quà tặng',
  'Khác'
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// Initial mock data to populate the app if empty
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    amount: 15000000,
    category: 'Lương',
    description: 'Lương tháng này',
    type: 'INCOME'
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    amount: 50000,
    category: 'Ăn uống',
    description: 'Cà phê sáng',
    type: 'EXPENSE'
  },
  {
    id: '3',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    amount: 200000,
    category: 'Di chuyển',
    description: 'Đổ xăng xe máy',
    type: 'EXPENSE'
  }
];
