import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ roll_number: '', name: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getStudents();
      if (response.data.success) {
        setStudents(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentsAPI.updateStudent(editingStudent.id, formData);
        showAlert('Student updated successfully!', 'success');
      } else {
        await studentsAPI.addStudent(formData);
        showAlert('Student added successfully!', 'success');
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ roll_number: '', name: '' });
      fetchStudents();
    } catch (err) {
      showAlert('Error saving student: ' + err.message, 'danger');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({ roll_number: student[1], name: student[2] });
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.deleteStudent(studentId);
        showAlert('Student deleted successfully!', 'success');
        fetchStudents();
      } catch (err) {
        showAlert('Error deleting student: ' + err.message, 'danger');
      }
    }
  };

  const showAlert = (message, type) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').insertBefore(alertDiv, document.querySelector('main').firstChild);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="fas fa-users me-2"></i>Students
            </h1>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingStudent(null);
                setFormData({ roll_number: '', name: '' });
                setShowModal(true);
              }}
            >
              <i className="fas fa-plus me-2"></i>Add Student
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>{error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student[0]}>
                    <td>{student[0]}</td>
                    <td>{student[1]}</td>
                    <td>{student[2]}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(student)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(student[0])}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingStudent ? 'Edit Student' : 'Add Student'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Roll Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.roll_number}
                      onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingStudent ? 'Update' : 'Add'} Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
