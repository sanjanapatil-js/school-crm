import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import SearchFilter from '../components/SearchFilter';
import { resultAPI, examAPI, studentAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Results = () => {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [formData, setFormData] = useState({
    examId: '',
    studentId: '',
    marksObtained: '',
    remarks: ''
  });

  const { isAdmin, isTeacher, isStudent, user } = useAuth();

  useEffect(() => {
    fetchResults();
    fetchExams();
    if (!isStudent) {
      fetchStudents();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedExam]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedExam) params.examId = selectedExam;
      if (isStudent && user?.profile?.id) {
        params.studentId = user.profile.id;
      }
      
      const response = await resultAPI.getAll(params);
      setResults(response.data.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAll({ limit: 100 });
      setExams(response.data.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
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

  const fetchStudentReport = async (studentId) => {
    try {
      const response = await resultAPI.getReport(studentId);
      setReportData(response.data.data);
      setIsReportOpen(true);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resultAPI.create(formData);
      setIsModalOpen(false);
      fetchResults();
      resetForm();
    } catch (error) {
      console.error('Error creating result:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      examId: '',
      studentId: '',
      marksObtained: '',
      remarks: ''
    });
  };

  const getGradeBadge = (grade) => {
    const styles = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[grade] || 'bg-gray-100 text-gray-800'}`}>
        {grade}
      </span>
    );
  };

  const columns = [
    { key: 'student.user.firstName', label: 'Student', render: (row) => `${row.student?.user?.firstName} ${row.student?.user?.lastName}` },
    { key: 'exam.name', label: 'Exam', render: (row) => row.exam?.name },
    { key: 'exam.subject', label: 'Subject', render: (row) => row.exam?.subject },
    { key: 'exam.class.name', label: 'Class', render: (row) => row.exam?.class?.name },
    { key: 'marksObtained', label: 'Marks' },
    { key: 'exam.maxMarks', label: 'Max Marks', render: (row) => row.exam?.maxMarks },
    { key: 'grade', label: 'Grade', render: (row) => getGradeBadge(row.grade) },
    { key: 'isPassed', label: 'Status', render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.isPassed ? 'Passed' : 'Failed'}
      </span>
    )},
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        {(isAdmin || isTeacher) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Result
          </button>
        )}
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            name: 'exam',
            label: 'Filter by Exam',
            value: selectedExam,
            options: exams.map(e => ({ value: e.id, label: `${e.name} - ${e.subject}` }))
          }
        ]}
        onFilterChange={(name, value) => setSelectedExam(value)}
        placeholder="Search results..."
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <DataTable
          columns={columns}
          data={results}
          loading={loading}
          actions={(row) => (
            <>
              <button
                onClick={() => fetchStudentReport(row.studentId)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="View Student Report"
              >
                <FileText className="w-4 h-4" />
              </button>
            </>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Result"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Exam"
            name="examId"
            value={formData.examId}
            onChange={handleChange}
            options={exams.map(e => ({ value: e.id, label: `${e.name} - ${e.subject} (${e.class?.name})` }))}
            required
          />
          <InputField
            label="Student"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            options={students.map(s => ({ value: s.id, label: `${s.user?.firstName} ${s.user?.lastName}` }))}
            required
          />
          <InputField
            label="Marks Obtained"
            name="marksObtained"
            type="number"
            value={formData.marksObtained}
            onChange={handleChange}
            required
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
              Add Result
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Student Report Card"
        size="lg"
      >
        {reportData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-semibold text-lg">{reportData.student?.user?.firstName} {reportData.student?.user?.lastName}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average Marks</p>
                <p className="font-semibold text-lg">{reportData.averageMarks}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="font-semibold text-lg">
                  {reportData.totalExams > 0 ? Math.round((reportData.passed / reportData.totalExams) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
              <DataTable
                columns={[
                  { key: 'exam.name', label: 'Exam', render: (row) => row.exam?.name },
                  { key: 'exam.subject', label: 'Subject', render: (row) => row.exam?.subject },
                  { key: 'marksObtained', label: 'Marks' },
                  { key: 'grade', label: 'Grade', render: (row) => getGradeBadge(row.grade) },
                  { key: 'isPassed', label: 'Status', render: (row) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {row.isPassed ? 'Passed' : 'Failed'}
                    </span>
                  )},
                ]}
                data={reportData.results}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Results;
