import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { attendanceAPI, studentAPI, classAPI } from '../services/apiService';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkAttendance, setBulkAttendance] = useState({});

  useEffect(() => {
    fetchClasses();
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll({ limit: 100 });
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentsByClass = async () => {
    try {
      const response = await studentAPI.getAll({ classId: selectedClass, limit: 100 });
      setStudents(response.data.data);
      
      const initialAttendance = {};
      response.data.data.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setBulkAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    
    setLoading(true);
    try {
      const response = await attendanceAPI.getAll({
        classId: selectedClass,
        date: selectedDate
      });
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAttendanceChange = (studentId, status) => {
    setBulkAttendance({ ...bulkAttendance, [studentId]: status });
  };

  const submitBulkAttendance = async () => {
    try {
      const attendanceList = Object.entries(bulkAttendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status
      }));

      await attendanceAPI.bulkMark({
        classId: selectedClass,
        date: selectedDate,
        attendanceList
      });

      fetchAttendance();
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      'half-day': 'bg-orange-100 text-orange-800',
      leave: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name} - {cls.grade}{cls.section}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
            <p className="text-sm text-gray-500">Select attendance status for each student</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.user?.firstName} {student.user?.lastName}</p>
                      <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {['present', 'absent', 'late', 'half-day', 'leave'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleBulkAttendanceChange(student.id, status)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${
                          bulkAttendance[student.id] === status
                            ? status === 'present' ? 'bg-green-600 text-white' :
                              status === 'absent' ? 'bg-red-600 text-white' :
                              status === 'late' ? 'bg-yellow-600 text-white' :
                              status === 'half-day' ? 'bg-orange-600 text-white' :
                              'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={submitBulkAttendance}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Submit Attendance
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
        </div>
        <DataTable
          columns={[
            { key: 'student.user.firstName', label: 'Student', render: (row) => `${row.student?.user?.firstName} ${row.student?.user?.lastName}` },
            { key: 'class.name', label: 'Class', render: (row) => row.class?.name },
            { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
            { key: 'status', label: 'Status', render: (row) => getStatusBadge(row.status) },
            { key: 'remarks', label: 'Remarks' },
          ]}
          data={attendance}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Attendance;
