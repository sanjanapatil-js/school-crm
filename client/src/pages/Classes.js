import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import SearchFilter from '../components/SearchFilter';
import { classAPI, teacherAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    teacherId: '',
    academicYear: '',
    capacity: '',
    roomNumber: ''
  });

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await classAPI.getAll({ search: searchTerm });
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherAPI.getAll({ limit: 100 });
      setTeachers(response.data.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentClass) {
        await classAPI.update(currentClass.id, formData);
      } else {
        await classAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchClasses();
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handleEdit = (cls) => {
    setCurrentClass(cls);
    setFormData({
      name: cls.name || '',
      grade: cls.grade || '',
      section: cls.section || '',
      teacherId: cls.teacherId || '',
      academicYear: cls.academicYear || '',
      capacity: cls.capacity || '',
      roomNumber: cls.roomNumber || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classAPI.delete(id);
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      section: '',
      teacherId: '',
      academicYear: '',
      capacity: '',
      roomNumber: ''
    });
    setCurrentClass(null);
  };

  const columns = [
    { key: 'name', label: 'Class Name' },
    { key: 'grade', label: 'Grade' },
    { key: 'section', label: 'Section' },
    { key: 'teacher.user.firstName', label: 'Teacher', render: (row) => row.teacher ? `${row.teacher.user?.firstName} ${row.teacher.user?.lastName}` : 'Not Assigned' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'students', label: 'Students', render: (row) => row.students?.length || 0 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        )}
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search classes..."
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={classes}
          loading={loading}
          actions={(row) => (
            <>
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentClass ? 'Edit Class' : 'Add Class'}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Class Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <InputField
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
            />
            <InputField
              label="Section"
              name="section"
              value={formData.section}
              onChange={handleChange}
            />
            <InputField
              label="Class Teacher"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              options={teachers.map(t => ({ value: t.id, label: `${t.user?.firstName} ${t.user?.lastName}` }))}
            />
            <InputField
              label="Academic Year"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="2024-2025"
            />
            <InputField
              label="Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
            />
            <InputField
              label="Room Number"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
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
              {currentClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
