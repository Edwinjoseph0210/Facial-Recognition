from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime
import json
import base64
import cv2
import numpy as np
import face_recognition
import math
from functools import wraps
import attendance

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'
CORS(app, supports_credentials=True)

# Database initialization
def init_auth_db():
    """Initialize authentication database"""
    conn = sqlite3.connect('auth.db')
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT DEFAULT 'admin'
        )
    ''')
    
    # Create default admin user if not exists
    cur.execute('SELECT COUNT(*) FROM users')
    if cur.fetchone()[0] == 0:
        default_password = generate_password_hash('admin123')
        cur.execute('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', 
                   ('admin', default_password, 'admin'))
    
    conn.commit()
    conn.close()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'}), 400
    
    if password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match'}), 400
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'}), 400
    
    try:
        conn = sqlite3.connect('auth.db')
        cur = conn.cursor()
        
        # Check if username already exists
        cur.execute('SELECT id FROM users WHERE username = ?', (username,))
        if cur.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
        # Create new user
        password_hash = generate_password_hash(password)
        cur.execute('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', 
                   (username, password_hash, 'admin'))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Registration successful'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect('auth.db')
    cur = conn.cursor()
    cur.execute('SELECT id, password_hash FROM users WHERE username = ?', (username,))
    user = cur.fetchone()
    conn.close()
    
    if user and check_password_hash(user[1], password):
        session['user_id'] = user[0]
        session['username'] = username
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/dashboard')
@login_required
def dashboard():
    try:
        attendance_data = attendance.calculate_attendance_percentage()
        students = attendance.list_students()
        
        # Get today's attendance
        today = datetime.now().strftime('%Y-%m-%d')
        today_attendance = []
        for student in students:
            student_id = student[0]
            conn = sqlite3.connect(attendance.DB_NAME)
            cur = conn.cursor()
            cur.execute('SELECT status FROM attendance WHERE student_id = ? AND date = ? ORDER BY id DESC LIMIT 1', 
                       (student_id, today))
            result = cur.fetchone()
            status = result[0] if result else 'Absent'
            today_attendance.append({
                'id': student[0],
                'roll_number': student[1],
                'name': student[2],
                'status': status
            })
            conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'attendance_data': attendance_data,
                'today_attendance': today_attendance,
                'total_students': len(students)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/students')
@login_required
def students():
    try:
        students_list = attendance.list_students()
        return jsonify({'success': True, 'data': students_list})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/students', methods=['POST'])
@login_required
def add_student():
    try:
        data = request.get_json()
        roll_number = data.get('roll_number')
        name = data.get('name')
        attendance.add_student(roll_number, name)
        return jsonify({'success': True, 'message': 'Student added successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/students/<int:student_id>', methods=['PUT'])
@login_required
def update_student(student_id):
    try:
        data = request.get_json()
        roll_number = data.get('roll_number')
        name = data.get('name')
        
        conn = sqlite3.connect(attendance.DB_NAME)
        cur = conn.cursor()
        cur.execute('UPDATE students SET roll_number = ?, name = ? WHERE id = ?', 
                   (roll_number, name, student_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Student updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    try:
        conn = sqlite3.connect(attendance.DB_NAME)
        cur = conn.cursor()
        cur.execute('DELETE FROM attendance WHERE student_id = ?', (student_id,))
        cur.execute('DELETE FROM students WHERE id = ?', (student_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Student deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/attendance')
@login_required
def attendance_page():
    try:
        attendance_records = attendance.list_attendance()
        return jsonify({'success': True, 'data': attendance_records})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reports')
@login_required
def reports():
    try:
        attendance_data = attendance.calculate_attendance_percentage()
        
        conn = sqlite3.connect(attendance.DB_NAME)
        cur = conn.cursor()
        cur.execute('''
            SELECT a.date, a.time, s.name, a.status
            FROM attendance a
            LEFT JOIN students s ON a.student_id = s.id
            ORDER BY a.date DESC, a.time DESC
            LIMIT 50
        ''')
        recent_records = cur.fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'attendance_data': attendance_data,
                'recent_records': recent_records
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/export_csv')
@login_required
def export_csv():
    try:
        output_path = attendance.export_to_csv()
        if output_path:
            return jsonify({'success': True, 'file': output_path})
        else:
            return jsonify({'success': False, 'message': 'Export failed'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/mark_attendance', methods=['POST'])
@login_required
def mark_attendance():
    try:
        data = request.get_json()
        name = data.get('name')
        result = attendance.mark_attendance(name)
        return jsonify({'success': result, 'message': 'Attendance marked' if result else 'Failed to mark attendance'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    # Initialize databases
    init_auth_db()
    attendance.init_db()
    
    app.run(debug=True, host='0.0.0.0', port=5001)
