import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import SearchFilter from '../components/SearchFilter';
import { examAPI, classAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    classId: '',
    subject: '',
    examDate: '',
    startTime: '',
    endTime: '',
    maxMarks: '100',
    passMarks: '40',
    academicYear: '',
    instructions: ''
  });

  const { isAdmin, isTeacher } = useAuth();

  useEffect(() => {
    fetchExams();
    fetchClasses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedClass]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = { search: searchTerm };
      if (selectedClass) params.classId = selectedClass;
      
      const response = await examAPI.getAll(params);
      setExams(response.data.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll({ limit: 100 });
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentExam) {
        await examAPI.update(currentExam.id, formData);
      } else {
        await examAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchExams();
      resetForm();
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleEdit = (exam) => {
    setCurrentExam(exam);
    setFormData({
      name: exam.name || '',
      type: exam.type || '',
      classId: exam.classId || '',
      subject: exam.subject || '',
      examDate: exam.examDate?.split('T')[0] || '',
      startTime: exam.startTime || '',
      endTime: exam.endTime || '',
      maxMarks: exam.maxMarks || '100',
      passMarks: exam.passMarks || '40',
      academicYear: exam.academicYear || '',
      instructions: exam.instructions || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examAPI.delete(id);
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      classId: '',
      subject: '',
      examDate: '',
      startTime: '',
      endTime: '',
      maxMarks: '100',
      passMarks: '40',
      academicYear: '',
      instructions: ''
    });
    setCurrentExam(null);
  };

  const examTypeOptions = [
    { value: 'midterm', label: 'Midterm Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'practical', label: 'Practical' },
    { value: 'other', label: 'Other' }
  ];

  const columns = [
    { key: 'name', label: 'Exam Name' },
    { key: 'type', label: 'Type', render: (row) => examTypeOptions.find(o => o.value === row.type)?.label || row.type },
    { key: 'subject', label: 'Subject' },
    { key: 'class.name', label: 'Class', render: (row) => row.class?.name },
    { key: 'examDate', label: 'Date', render: (row) => new Date(row.examDate).toLocaleDateString() },
    { key: 'maxMarks', label: 'Max Marks' },
    { key: 'passMarks', label: 'Pass Marks' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
        {(isAdmin || isTeacher) && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Schedule Exam
          </button>
        )}
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            name: 'class',
            label: 'Filter by Class',
            value: selectedClass,
            options: classes.map(c => ({ value: c.id, label: c.name }))
          }
        ]}
        onFilterChange={(name, value) => setSelectedClass(value)}
        placeholder="Search exams..."
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={exams}
          loading={loading}
          actions={(row) => (
            (isAdmin || isTeacher) && (
              <>
                <button
                  onClick={() => handleEdit(row)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentExam ? 'Edit Exam' : 'Schedule Exam'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Exam Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <InputField
              label="Exam Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={examTypeOptions}
              required
            />
            <InputField
              label="Class"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              options={classes.map(c => ({ value: c.id, label: c.name }))}
              required
            />
            <InputField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <InputField
              label="Exam Date"
              name="examDate"
              type="date"
              value={formData.examDate}
              onChange={handleChange}
              required
            />
            <InputField
              label="Start Time"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
            />
            <InputField
              label="End Time"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
            />
            <InputField
              label="Maximum Marks"
              name="maxMarks"
              type="number"
              value={formData.maxMarks}
              onChange={handleChange}
              required
            />
            <InputField
              label="Pass Marks"
              name="passMarks"
              type="number"
              value={formData.passMarks}
              onChange={handleChange}
              required
            />
            <InputField
              label="Academic Year"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="2024-2025"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
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
              {currentExam ? 'Update' : 'Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Exams;
