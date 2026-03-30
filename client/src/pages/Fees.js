import React, { useState, useEffect } from 'react';
import { Plus, IndianRupee, CheckCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import SearchFilter from '../components/SearchFilter';
import { feeAPI, studentAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentFee, setCurrentFee] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: '',
    amount: '',
    dueDate: '',
    academicYear: '',
    month: '',
    remarks: ''
  });
  const [paymentData, setPaymentData] = useState({
    paidAmount: '',
    paymentMethod: '',
    transactionId: ''
  });

  const { isAdmin, isStudent, user } = useAuth();

  useEffect(() => {
    if (isStudent) {
      setSelectedStudent(user?.profile?.id);
    }
    fetchFees();
    fetchSummary();
    if (!isStudent) {
      fetchStudents();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedStudent]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = { search: searchTerm };
      if (selectedStudent) params.studentId = selectedStudent;
      
      const response = await feeAPI.getAll(params);
      setFees(response.data.data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (selectedStudent) params.studentId = selectedStudent;
      
      const response = await feeAPI.getSummary(params);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching fee summary:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll({ limit: 100 });
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.create(formData);
      setIsModalOpen(false);
      fetchFees();
      fetchSummary();
      resetForm();
    } catch (error) {
      console.error('Error creating fee:', error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.recordPayment(currentFee.id, {
        ...paymentData,
        paidDate: new Date().toISOString()
      });
      setIsPaymentModalOpen(false);
      fetchFees();
      fetchSummary();
      setPaymentData({ paidAmount: '', paymentMethod: '', transactionId: '' });
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const openPaymentModal = (fee) => {
    setCurrentFee(fee);
    setPaymentData({
      paidAmount: (parseFloat(fee.amount) - parseFloat(fee.paidAmount)).toString(),
      paymentMethod: '',
      transactionId: ''
    });
    setIsPaymentModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      feeType: '',
      amount: '',
      dueDate: '',
      academicYear: '',
      month: '',
      remarks: ''
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const feeTypeOptions = [
    { value: 'tuition', label: 'Tuition Fee' },
    { value: 'exam', label: 'Exam Fee' },
    { value: 'library', label: 'Library Fee' },
    { value: 'transport', label: 'Transport Fee' },
    { value: 'sports', label: 'Sports Fee' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fee Management</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Amount" value={`₹${summary.totalAmount?.toLocaleString()}`} icon={IndianRupee} color="blue" />
          <StatsCard title="Total Paid" value={`₹${summary.totalPaid?.toLocaleString()}`} icon={CheckCircle} color="green" />
          <StatsCard title="Pending" value={`₹${summary.pendingAmount?.toLocaleString()}`} icon={IndianRupee} color="red" />
          <StatsCard title="Pending Count" value={summary.byStatus?.pending} icon={IndianRupee} color="yellow" />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={!isStudent ? [
            {
              name: 'student',
              label: 'Filter by Student',
              value: selectedStudent,
              options: students.map(s => ({ value: s.id, label: `${s.user?.firstName} ${s.user?.lastName}` }))
            }
          ] : []}
          onFilterChange={(name, value) => setSelectedStudent(value)}
          placeholder="Search fees..."
        />
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Fee
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={[
            { key: 'student.user.firstName', label: 'Student', render: (row) => `${row.student?.user?.firstName} ${row.student?.user?.lastName}` },
            { key: 'feeType', label: 'Fee Type', render: (row) => feeTypeOptions.find(o => o.value === row.feeType)?.label || row.feeType },
            { key: 'amount', label: 'Amount', render: (row) => `₹${parseFloat(row.amount).toLocaleString()}` },
            { key: 'paidAmount', label: 'Paid', render: (row) => `₹${parseFloat(row.paidAmount).toLocaleString()}` },
            { key: 'status', label: 'Status', render: (row) => getStatusBadge(row.status) },
            { key: 'dueDate', label: 'Due Date', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-' },
          ]}
          data={fees}
          loading={loading}
          actions={(row) => (
            isAdmin && row.status !== 'paid' && (
              <button
                onClick={() => openPaymentModal(row)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                Record Payment
              </button>
            )
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Fee"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Student"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            options={students.map(s => ({ value: s.id, label: `${s.user?.firstName} ${s.user?.lastName}` }))}
            required
          />
          <InputField
            label="Fee Type"
            name="feeType"
            value={formData.feeType}
            onChange={handleChange}
            options={feeTypeOptions}
            required
          />
          <InputField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <InputField
            label="Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
          />
          <InputField
            label="Academic Year"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            placeholder="2024-2025"
          />
          <InputField
            label="Month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            placeholder="January"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Fee
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
        size="md"
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Fee Amount: <span className="font-semibold">₹{currentFee?.amount}</span></p>
            <p className="text-sm text-gray-600">Already Paid: <span className="font-semibold">₹{currentFee?.paidAmount}</span></p>
            <p className="text-sm text-gray-600">Remaining: <span className="font-semibold">₹{(parseFloat(currentFee?.amount) - parseFloat(currentFee?.paidAmount)).toFixed(2)}</span></p>
          </div>
          <InputField
            label="Payment Amount"
            name="paidAmount"
            type="number"
            value={paymentData.paidAmount}
            onChange={handlePaymentChange}
            required
          />
          <InputField
            label="Payment Method"
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handlePaymentChange}
            options={paymentMethodOptions}
            required
          />
          <InputField
            label="Transaction ID"
            name="transactionId"
            value={paymentData.transactionId}
            onChange={handlePaymentChange}
            placeholder="Optional"
          />
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;
