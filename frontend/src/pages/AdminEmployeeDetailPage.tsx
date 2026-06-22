import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, BriefcaseIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { getEmployeeById } from '../services/employeeService';
import { EmployeeDetailResponse } from '../services/employeeService';
import { useToast } from '../context/ToastContext';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    Inactive: 'bg-red-100 text-red-700',
    Present: 'bg-green-100 text-green-700',
    Absent: 'bg-red-100 text-red-700',
    'Half Day': 'bg-yellow-100 text-yellow-700',
    Leave: 'bg-blue-100 text-blue-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-earth-100 text-earth-600'}`}>{status}</span>;
};

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="h-4 w-4 text-earth-400 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-xs text-earth-400">{label}</p>
      <p className="text-sm text-earth-800 font-medium">{value || '—'}</p>
    </div>
  </div>
);

const AdminEmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEmployeeById(id)
      .then(setEmployee)
      .catch(() => addToast('Failed to load employee', 'error'))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" /></div>;
  }

  if (!employee) {
    return (
      <div className="p-8 text-center">
        <p className="text-earth-500 mb-4">Employee not found.</p>
        <button onClick={() => navigate('/labadmin/employees')} className="px-4 py-2 bg-organic-600 text-white rounded-lg">Back to List</button>
      </div>
    );
  }

  const { stats, recentAttendance } = employee;
  const attendancePct = stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/labadmin/employees')}
          className="flex items-center gap-2 text-earth-600 hover:text-organic-600 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="text-sm">Back to Employees</span>
        </button>
        <button
          onClick={() => navigate('/labadmin/employees', { state: { editId: employee.id } })}
          className="flex items-center gap-2 px-4 py-2 bg-organic-600 text-white rounded-lg hover:bg-organic-700 text-sm">
          <PencilIcon className="h-4 w-4" /> Edit Employee
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="h-24 w-24 rounded-full bg-organic-100 flex items-center justify-center overflow-hidden mx-auto mb-4">
              {employee.profileImage
                ? <img src={employee.profileImage} alt={employee.fullName} className="h-full w-full object-cover" />
                : <span className="text-organic-700 font-bold text-3xl">{employee.fullName.charAt(0).toUpperCase()}</span>}
            </div>
            <h2 className="text-xl font-bold text-earth-900">{employee.fullName}</h2>
            <p className="text-organic-600 font-medium mt-1">{employee.designation}</p>
            <p className="text-earth-500 text-sm mt-0.5">{employee.department}</p>
            <div className="mt-3 flex justify-center gap-2 flex-wrap">
              <StatusBadge status={employee.status} />
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{employee.employmentType}</span>
            </div>
            <p className="text-xs text-earth-400 mt-3 font-mono">{employee.employeeId}</p>
          </div>

          {/* Attendance Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-earth-800 mb-4">Attendance Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-earth-500">Total Recorded Days</span>
                <span className="font-semibold text-earth-900">{stats.totalDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-earth-500">Days Present</span>
                <span className="font-semibold text-green-600">{stats.presentDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-earth-500">Attendance Rate</span>
                <span className="font-semibold text-organic-600">{attendancePct}%</span>
              </div>
              <div className="mt-2 w-full bg-earth-100 rounded-full h-2">
                <div className="bg-organic-500 h-2 rounded-full transition-all" style={{ width: `${attendancePct}%` }} />
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-earth-800 mb-2">Compensation</h3>
            <p className="text-2xl font-bold text-organic-700">₨{Number(employee.salary).toLocaleString()}</p>
            <p className="text-xs text-earth-400 mt-1">Monthly Salary</p>
          </div>
        </div>

        {/* Details + Attendance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal & Work Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-earth-800 mb-4">Personal & Work Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 sm:divide-x divide-earth-100">
              <div className="space-y-1 pb-4 sm:pb-0 sm:pr-8">
                <InfoRow icon={EnvelopeIcon} label="Email" value={employee.email} />
                <InfoRow icon={PhoneIcon} label="Phone" value={employee.phone} />
                <InfoRow icon={MapPinIcon} label="Address" value={employee.address} />
                <InfoRow icon={CalendarIcon} label="Date of Birth"
                  value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : null} />
              </div>
              <div className="space-y-1 pt-4 sm:pt-0 sm:pl-8">
                <InfoRow icon={BriefcaseIcon} label="Department" value={employee.department} />
                <InfoRow icon={BriefcaseIcon} label="Designation" value={employee.designation} />
                <InfoRow icon={CalendarIcon} label="Joining Date"
                  value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : null} />
                <InfoRow icon={BriefcaseIcon} label="Gender" value={employee.gender} />
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-earth-800 mb-4">This Month's Attendance</h3>
            {recentAttendance.length === 0 ? (
              <p className="text-earth-400 text-sm text-center py-6">No attendance records this month.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-earth-200">
                      {['Date', 'Check In', 'Check Out', 'Hours', 'Status', 'Remarks'].map((h) => (
                        <th key={h} className="pb-2 text-left font-medium text-earth-500 text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-50">
                    {recentAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-earth-50">
                        <td className="py-2 text-earth-700">{new Date(rec.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}</td>
                        <td className="py-2 text-earth-600">{rec.checkInTime || '—'}</td>
                        <td className="py-2 text-earth-600">{rec.checkOutTime || '—'}</td>
                        <td className="py-2 text-earth-600">{rec.workingHours ? `${rec.workingHours}h` : '—'}</td>
                        <td className="py-2"><StatusBadge status={rec.status} /></td>
                        <td className="py-2 text-earth-400 text-xs">{rec.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => navigate('/labadmin/attendance', { state: { employeeId: employee.id } })}
              className="mt-4 text-sm text-organic-600 hover:text-organic-700 font-medium">
              View full attendance report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeDetailPage;
