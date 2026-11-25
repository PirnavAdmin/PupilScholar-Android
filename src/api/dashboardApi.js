/**
 * Dashboard & School Operations API Service
 */

import { apiFetch } from './client';
import { ENDPOINTS } from './config';

export const normalizeCircular = (item, index = 0) => {
  if (!item) return null;

  const id = item.circularId || item.id || `circ_${index}`;
  const title = item.title || item.circularHeadline || item.headline || 'School Announcement';
  const category = item.category || item.categoryTag || 'General';
  const content = item.content || item.messageContent || item.circularText || '';
  const dateStr = item.createdDate || item.broadcastDate || item.date || new Date().toISOString();

  let formattedDate = 'Recent';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {
    formattedDate = dateStr;
  }

  const urgent = Boolean(item.isPinned || item.smsAlert || item.sendSMS || category.toLowerCase().includes('urgent'));

  return {
    id: String(id),
    title,
    category,
    date: formattedDate,
    author: item.author || 'School Administration',
    badge: category,
    urgent,
    summary: content.length > 120 ? `${content.substring(0, 117)}...` : content,
    fullText: content,
    attachment: item.attachment || null,
  };
};

export const normalizeNotification = (item, index = 0) => {
  if (!item) return null;

  const id = item.id || item.notificationId || `notif_${index}`;
  const title = item.title || item.headline || 'Notification';
  const desc = item.message || item.content || item.desc || '';
  const category = item.category || 'General';

  let icon = '🔔';
  const catLower = category.toLowerCase();
  if (catLower.includes('exam') || catLower.includes('grade')) icon = '🎯';
  else if (catLower.includes('meet') || catLower.includes('ptm')) icon = '🤝';
  else if (catLower.includes('academic') || catLower.includes('task')) icon = '📝';
  else if (catLower.includes('bus') || catLower.includes('trans')) icon = '🚌';
  else if (catLower.includes('fee')) icon = '💳';

  return {
    id: String(id),
    title,
    desc,
    time: item.time || item.createdDate || 'Just now',
    category,
    icon,
    urgent: Boolean(item.urgent || item.isPinned),
    read: Boolean(item.read || item.isRead),
  };
};

export const fetchDashboardSummary = async () => {
  return await apiFetch(ENDPOINTS.DASHBOARD.SUMMARY);
};

export const fetchTeacherDashboard = async () => {
  return await apiFetch(ENDPOINTS.DASHBOARD.TEACHER);
};

export const fetchParentDashboard = async (studentId) => {
  if (!studentId) return { success: false, error: 'Student ID is required' };
  return await apiFetch(ENDPOINTS.DASHBOARD.PARENT(studentId));
};

export const fetchCirculars = async (category = '', search = '') => {
  const queryParams = [];
  if (category && category !== 'All') queryParams.push(`category=${encodeURIComponent(category)}`);
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const result = await apiFetch(`${ENDPOINTS.COMMUNICATIONS.CIRCULARS}${queryString}`);

  if (result.success && Array.isArray(result.data)) {
    return {
      success: true,
      data: result.data.map(normalizeCircular),
    };
  }

  return result;
};

export const fetchNotifications = async (category = '', search = '') => {
  const queryParams = [];
  if (category && category !== 'All') queryParams.push(`category=${encodeURIComponent(category)}`);
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const result = await apiFetch(`${ENDPOINTS.COMMUNICATIONS.NOTIFICATIONS}${queryString}`);

  if (result.success && Array.isArray(result.data)) {
    return {
      success: true,
      data: result.data.map(normalizeNotification),
    };
  }

  return result;
};

export const fetchStudentTimetable = async (params = {}) => {
  const q = new URLSearchParams(params);
  return await apiFetch(`/api/Timetable/student?${q.toString()}`);
};

export const fetchTeacherTimetable = async (teacherId) => {
  return await apiFetch(`/api/Timetable/teacher/${teacherId}`);
};

export const fetchStudentHomework = async (params = {}) => {
  const q = new URLSearchParams(params);
  return await apiFetch(`/api/homework/student?${q.toString()}`);
};

export const fetchParentAttendance = async (studentId) => {
  return await apiFetch(`/api/parent/attendance/${studentId}`);
};

export const fetchTeacherAttendanceToday = async () => {
  return await apiFetch('/api/teacher/attendance/today');
};

export const markStudentAttendance = async (payload) => {
  return await apiFetch('/api/attendance/student/mark', {
    method: 'POST',
    body: payload,
  });
};
