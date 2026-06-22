export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  supplier_id?: string | null;
  name: string;
  category: string;
  description: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  image_url: string;
  is_listed: boolean;
  created_at?: string;
  supplier?: Supplier;
}

/** Store-facing product shape with price alias */
export interface StoreProduct extends Product {
  price: number;
  image: string;
}

export interface CartItem extends StoreProduct {
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  status: 'ordered' | 'received';
  ordered_at: string;
  received_at?: string | null;
  supplier?: Supplier;
  product?: Product;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  payment_status: 'unpaid' | 'paid';
  payment_method?: 'cod' | 'card_mock' | null;
  order_date: string;
  order_items?: OrderItem[];
}

export interface CheckoutData {
  fullName: string;
  phoneNumber: string;
  address: string;
}

export interface DashboardStats {
  totalProducts: number;
  listedProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export type PaymentMethod = 'cod' | 'card_mock';

// ── Customer Auth ─────────────────────────────────────────────────────────────

export interface CustomerAddress {
  id: string;
  title: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isVerified?: boolean;
  status?: string;
  addresses?: CustomerAddress[];
  createdAt?: string;
}

export type CustomerOrderStatus =
  | 'pending' | 'confirmed' | 'processing' | 'packed'
  | 'shipped' | 'out_for_delivery' | 'delivered'
  | 'cancelled' | 'returned' | 'refunded';

export interface CustomerOrder {
  id: string;
  orderNumber?: string;
  trackingNumber?: string;
  customer_name: string;
  address: string;
  total_amount: number;
  order_status: CustomerOrderStatus;
  payment_status: 'unpaid' | 'paid';
  payment_method?: string | null;
  order_date: string;
  isGuestOrder?: boolean;
  statusHistory?: { status: string; timestamp: string; note?: string }[];
  order_items?: {
    id: string; product_id: string; quantity: number; unit_price: number;
    product?: { id: string; name: string; image_url: string; category: string } | null;
  }[];
}

export interface CustomerDashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalSpent: number;
}

// ── Employee Management ────────────────────────────────────────────────────────

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract';
export type EmployeeStatus = 'Active' | 'Inactive';
export type EmployeeGender = 'Male' | 'Female' | 'Other';
export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Leave';

export const DEPARTMENTS = ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Management'] as const;
export type Department = typeof DEPARTMENTS[number];

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  gender: EmployeeGender;
  dateOfBirth?: string | null;
  designation: string;
  department: Department;
  joiningDate?: string;
  address?: string;
  salary: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  status: AttendanceStatus;
  remarks?: string;
  createdAt?: string;
  employee?: {
    id: string;
    employeeId: string;
    fullName: string;
    department: string;
    designation: string;
    profileImage?: string;
  };
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  monthlyAttendancePct: number;
  totalSalaryExpense: number;
}

export interface MonthlyReportRow {
  employee: { id: string; employeeId: string; fullName: string; department: string; designation: string; profileImage?: string };
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  totalHours: number;
  attendancePct: number;
  daysInMonth: number;
}

// ── Finance Module ────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Internet', 'Marketing', 'Transportation',
  'Inventory', 'Employee Salary', 'Maintenance', 'Office Supplies', 'Other',
] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  expenseDate: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  employee: {
    id: string;
    fullName: string;
    employeeId: string;
    designation: string;
    department: string;
    profileImage?: string | null;
  } | null;
  month: string;
  salaryAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  paymentDate?: string | null;
  notes?: string;
  createdAt?: string;
}

export interface FinanceDashboard {
  revenue: {
    total: number;
    today: number;
    weekly: number;
    monthly: number;
    annual: number;
    monthly_chart: Array<{ month: string; revenue: number; orders: number }>;
  };
  employees: {
    total: number;
    active: number;
    totalMonthlySalary: number;
    totalPaid: number;
    totalPending: number;
  };
  inventory: {
    totalInvestment: number;
    totalPurchaseCost: number;
    totalStockValue: number;
    lowStockValue: number;
    totalProducts: number;
    lowStockCount: number;
  };
  expenses: {
    total: number;
    monthly: number;
    operating: number;
    other: number;
    by_category: Array<{ category: string; amount: number }>;
  };
  profit: {
    grossRevenue: number;
    totalDeductions: number;
    netProfit: number;
    profitMargin: number;
    ownerEarnings: number;
    breakdown: {
      revenue: number;
      salaries: number;
      inventoryCost: number;
      operatingExpenses: number;
      otherExpenses: number;
      generalExpenses: number;
    };
  };
}

export function toStoreProduct(product: Product): StoreProduct {
  return {
    ...product,
    price: product.selling_price,
    image: product.image_url || '',
  };
}
