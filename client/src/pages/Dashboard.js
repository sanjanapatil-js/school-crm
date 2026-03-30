import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, School, CreditCard, UserCheck, FileText } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import BarChartComponent from '../components/BarChartComponent';
import PieChartComponent from '../components/PieChartComponent';
import DataTable from '../components/DataTable';
import { dashboardAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isTeacher, isStudent } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      let response;
      if (isAdmin) {
        response = await dashboardAPI.getStats();
      } else if (isTeacher) {
        response = await dashboardAPI.getTeacherDashboard();
      } else {
        response = await dashboardAPI.getStudentDashboard();
      }
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin Dashboard
  if (isAdmin && stats) {
    const attendanceData = [
      { name: 'Present', value: stats.attendance.present },
      { name: 'Absent', value: stats.attendance.absent },
    ];

    const feeData = [
      { name: 'Collected', value: parseFloat(stats.fees.collected) },
      { name: 'Pending', value: parseFloat(stats.fees.pending) },
    ];

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={stats.counts.students}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Total Teachers"
            value={stats.counts.teachers}
            icon={GraduationCap}
            color="green"
          />
          <StatsCard
            title="Total Classes"
            value={stats.counts.classes}
            icon={School}
            color="yellow"
          />
          <StatsCard
            title="Pending Fees"
            value={`₹${stats.fees.pending.toLocaleString()}`}
            icon={CreditCard}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PieChartComponent
            title="Today's Attendance"
            data={attendanceData}
          />
          <BarChartComponent
            title="Fee Collection Overview"
            data={feeData}
            xKey="name"
            yKey="value"
          />
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Students</h3>
          <DataTable
            columns={[
              { key: 'user.firstName', label: 'Name', render: (row) => `${row.user?.firstName} ${row.user?.lastName}` },
              { key: 'user.email', label: 'Email', render: (row) => row.user?.email },
              { key: 'rollNumber', label: 'Roll Number' },
              { key: 'createdAt', label: 'Joined', render: (row) => new Date(row.createdAt).toLocaleDateString() },
            ]}
            data={stats.recentStudents}
          />
        </div>
      </div>
    );
  }

  // Teacher Dashboard
  if (isTeacher && stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Teacher Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="My Classes"
            value={stats.classes?.length || 0}
            icon={School}
            color="blue"
          />
          <StatsCard
            title="Attendance Marked Today"
            value={stats.attendanceMarked || 0}
            icon={UserCheck}
            color="green"
          />
          <StatsCard
            title="Upcoming Exams"
            value={stats.upcomingExams?.length || 0}
            icon={FileText}
            color="yellow"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Class Name' },
              { key: 'grade', label: 'Grade' },
              { key: 'section', label: 'Section' },
              { key: 'students', label: 'Students', render: (row) => row.students?.length || 0 },
            ]}
            data={stats.classes}
          />
        </div>
      </div>
    );
  }

  // Student Dashboard
  if (isStudent && stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Attendance Rate"
            value={`${stats.attendance.total > 0 ? Math.round((stats.attendance.present / stats.attendance.total) * 100) : 0}%`}
            icon={UserCheck}
            color="blue"
          />
          <StatsCard
            title="Total Fees Paid"
            value={`₹${stats.fees.paid.toLocaleString()}`}
            icon={CreditCard}
            color="green"
          />
          <StatsCard
            title="Pending Fees"
            value={`₹${stats.fees.pending.toLocaleString()}`}
            icon={CreditCard}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
            <DataTable
              columns={[
                { key: 'exam.name', label: 'Exam', render: (row) => row.exam?.name },
                { key: 'exam.subject', label: 'Subject', render: (row) => row.exam?.subject },
                { key: 'marksObtained', label: 'Marks' },
                { key: 'grade', label: 'Grade' },
              ]}
              data={stats.results?.slice(0, 5)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Exams</h3>
            <DataTable
              columns={[
                { key: 'name', label: 'Exam Name' },
                { key: 'subject', label: 'Subject' },
                { key: 'examDate', label: 'Date', render: (row) => new Date(row.examDate).toLocaleDateString() },
              ]}
              data={stats.upcomingExams}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
