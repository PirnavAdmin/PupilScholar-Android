/**
 * Timetable & Academic Scheduling API Service
 * Integrates live SMS.Api Timetable, Classes, Sections, Departments, Subjects, and Substitutions
 */

import { apiClient } from './client';

// ============================
// DEPARTMENTS API
// ============================

export const fetchDepartmentsApi = async (search) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient(`/api/departments${query}`, { method: 'GET' });
};

export const fetchDepartmentsDropdownApi = async (search) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient(`/api/departments/dropdown${query}`, { method: 'GET' });
};

export const fetchDepartmentByIdApi = async (id) => {
  return apiClient(`/api/departments/${id}`, { method: 'GET' });
};

export const fetchDepartmentSubjectsApi = async (id) => {
  return apiClient(`/api/departments/${id}/subjects`, { method: 'GET' });
};

export const createDepartmentApi = async (payload) => {
  return apiClient('/api/departments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateDepartmentApi = async (id, payload) => {
  return apiClient(`/api/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteDepartmentApi = async (id) => {
  return apiClient(`/api/departments/${id}`, { method: 'DELETE' });
};

// ============================
// SUBJECTS API
// ============================

export const fetchSubjectsApi = async (search) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient(`/api/subjects${query}`, { method: 'GET' });
};

export const fetchSubjectsDropdownApi = async (search) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient(`/api/subjects/dropdown${query}`, { method: 'GET' });
};

export const fetchSubjectByIdApi = async (id) => {
  return apiClient(`/api/subjects/${id}`, { method: 'GET' });
};

export const createSubjectApi = async (payload) => {
  return apiClient('/api/subjects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateSubjectApi = async (id, payload) => {
  return apiClient(`/api/subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteSubjectApi = async (id) => {
  return apiClient(`/api/subjects/${id}`, { method: 'DELETE' });
};

// ============================
// CLASSES API (Existing)
// ============================

export const fetchClassesApi = async () => {
  return apiClient('/api/classes', { method: 'GET' });
};

export const fetchClassByIdApi = async (id) => {
  // If the ID is a string prefixed like "CL-10", extract the numeric part
  const numericId = typeof id === 'string' && id.startsWith('CL-') ? id.replace('CL-', '') : id;
  return apiClient(`/api/classes/${numericId}`, { method: 'GET' });
};

export const createClassApi = async (payload) => {
  return apiClient('/api/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateClassApi = async (id, payload) => {
  const numericId = typeof id === 'string' && id.startsWith('CL-') ? id.replace('CL-', '') : id;
  return apiClient(`/api/classes/${numericId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteClassApi = async (id) => {
  const numericId = typeof id === 'string' && id.startsWith('CL-') ? id.replace('CL-', '') : id;
  return apiClient(`/api/classes/${numericId}`, { method: 'DELETE' });
};

// ============================
// SECTIONS, SUBJECTS & TEACHERS SUB-ROUTES
// ============================

export const addSectionApi = async (classId, payload) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  return apiClient(`/api/classes/${numericId}/sections`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateSectionApi = async (classId, sectionLetter, payload) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  const cleanSec = (sectionLetter || 'A').replace(/^Section\s*/i, '').trim();
  return apiClient(`/api/classes/${numericId}/sections/${cleanSec}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteSectionApi = async (classId, sectionLetter) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  const cleanSec = (sectionLetter || 'A').replace(/^Section\s*/i, '').trim();
  return apiClient(`/api/classes/${numericId}/sections/${cleanSec}`, { method: 'DELETE' });
};

export const mapSubjectApi = async (classId, payload) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  return apiClient(`/api/classes/${numericId}/subjects`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const removeSubjectApi = async (classId, subjectId) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  return apiClient(`/api/classes/${numericId}/subjects/${subjectId}`, { method: 'DELETE' });
};

export const assignTeacherApi = async (classId, sectionLetter, payload) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  const cleanSec = (sectionLetter || 'A').replace(/^Section\s*/i, '').trim();
  return apiClient(`/api/classes/${numericId}/sections/${cleanSec}/assign-teacher`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const fetchClassTeacherAssignmentsApi = async () => {
  return apiClient('/api/classes/teacher-assignments', { method: 'GET' });
};

export const unassignTeacherApi = async (classId, sectionLetter, subjectId) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  const cleanSec = (sectionLetter || 'A').replace(/^Section\s*/i, '').trim();
  return apiClient(`/api/classes/${numericId}/sections/${cleanSec}/subjects/${subjectId}/unassign-teacher`, {
    method: 'DELETE',
  });
};

// ============================
// STUDENT ALLOCATION
// ============================

export const fetchClassStudentsApi = async (classId, section) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  const query = section ? `?section=${encodeURIComponent(section)}` : '';
  return apiClient(`/api/classes/${numericId}/students${query}`, { method: 'GET' });
};

export const allocateStudentApi = async (studentId, payload) => {
  return apiClient(`/api/students/${studentId}/allocate`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const autoAllocateApi = async (classId) => {
  const numericId = typeof classId === 'string' && classId.startsWith('CL-') ? classId.replace('CL-', '') : classId;
  return apiClient(`/api/classes/${numericId}/auto-allocate`, { method: 'POST' });
};

// ============================
// TIMETABLE API
// ============================

export const fetchPeriodsApi = async () => {
  return apiClient('/api/timetable/periods', { method: 'GET' });
};

export const savePeriodApi = async (payload) => {
  return apiClient('/api/timetable/period', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const syncPeriodSettingsApi = async (periods) => {
  return apiClient('/api/timetable/periods/sync', {
    method: 'POST',
    body: JSON.stringify(periods),
  });
};

export const deletePeriodApi = async (id) => {
  const numericId = typeof id === 'string' && id.startsWith('PS-') ? id.replace('PS-', '') : id;
  return apiClient(`/api/timetable/period/${numericId}`, { method: 'DELETE' });
};

export const fetchTimetableGridApi = async (classId, sectionId, academicYear = '') => {
  let numClassId = typeof classId === 'string' ? classId.replace(/^CL-/i, '') : String(classId);
  if (isNaN(Number(numClassId))) numClassId = '1';

  let secStr = typeof sectionId === 'string' ? sectionId.replace(/^SEC-/i, '').trim() : String(sectionId || 'A');
  const secName = secStr.replace(/^Section\s*/i, '').trim();

  let numSecId = '';
  if (!isNaN(Number(secStr))) {
    numSecId = secStr;
  }

  const secIdParam = numSecId ? `sectionId=${encodeURIComponent(numSecId)}&` : '';
  const yearParam = academicYear && academicYear !== 'All' ? `&academicYear=${encodeURIComponent(academicYear)}` : '';
  const query = `classId=${encodeURIComponent(numClassId)}&${secIdParam}sectionName=${encodeURIComponent(secName)}&section=${encodeURIComponent(secName)}${yearParam}`;
  
  try {
    const res = await apiClient(`/api/Timetable/class-grid?${query}`, { method: 'GET' });
    if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
  } catch {}
  return apiClient(`/api/timetable/class-grid?${query}`, {
    method: 'GET',
  });
};

export const saveTimetableSlotApi = async (payload) => {
  const p = { ...payload, overwrite: true, isOverwrite: true, force: true };

  if (p.classId !== undefined) {
    let c = typeof p.classId === 'string' ? p.classId.replace(/^CL-/i, '') : String(p.classId);
    p.classId = isNaN(Number(c)) ? 1 : Number(c);
  }

  if (p.sectionId !== undefined) {
    let s = typeof p.sectionId === 'string' ? p.sectionId.replace(/^SEC-/i, '').trim() : String(p.sectionId);
    if (!isNaN(Number(s))) {
      p.sectionId = Number(s);
    } else {
      if (!p.sectionName) {
        p.sectionName = s.replace(/^Section\s*/i, '').trim();
      }
      delete p.sectionId;
    }
  }

  if (p.subjectId !== undefined && typeof p.subjectId === 'string') {
    const cleanSub = p.subjectId.replace(/^SUB-/i, '');
    p.subjectId = !isNaN(Number(cleanSub)) ? Number(cleanSub) : undefined;
  }
  if (p.teacherId !== undefined && typeof p.teacherId === 'string') {
    const cleanEmp = p.teacherId.replace(/^EMP-/i, '');
    p.teacherId = !isNaN(Number(cleanEmp)) ? Number(cleanEmp) : undefined;
  }
  if (p.periodId !== undefined && typeof p.periodId === 'string') {
    const cleanPs = p.periodId.replace(/^PS-/i, '');
    p.periodId = !isNaN(Number(cleanPs)) ? Number(cleanPs) : undefined;
  }

  return apiClient('/api/timetable/slot', {
    method: 'POST',
    body: JSON.stringify(p),
  });
};

export const deleteTimetableSlotApi = async (id) => {
  const numericId = typeof id === 'string' && id.startsWith('TT-') ? id.replace('TT-', '') : id;
  return apiClient(`/api/timetable/slot/${numericId}`, { method: 'DELETE' }).catch((err) => {
    if (err?.status === 404 || String(err?.message || '').includes('404')) {
      return null;
    }
    throw err;
  });
};

export const clearClassTimetableApi = async (className, section, academicYear) => {
  const query = `className=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}${academicYear ? `&academicYear=${encodeURIComponent(academicYear)}` : ''}`;
  return apiClient(`/api/timetable/class?${query}`, { method: 'DELETE' }).catch(() => null);
};

export const publishTimetableApi = async (payload) => {
  const p = { ...payload };
  if (typeof p.classId === 'string') {
    const clean = p.classId.replace('CL-', '');
    p.classId = !isNaN(Number(clean)) ? Number(clean) : 0;
  }
  if (typeof p.sectionId === 'string') {
    const clean = p.sectionId.replace('SEC-', '');
    p.sectionId = !isNaN(Number(clean)) ? Number(clean) : 0;
  }

  return apiClient('/api/timetable/publish', {
    method: 'POST',
    body: JSON.stringify(p),
  });
};

export const copyTimetableApi = async (payload) => {
  const p = { ...payload };
  if (typeof p.sourceClassId === 'string') p.sourceClassId = Number(p.sourceClassId.replace('CL-', ''));
  if (typeof p.sourceSectionId === 'string') p.sourceSectionId = Number(p.sourceSectionId.replace('SEC-', ''));
  if (typeof p.targetClassId === 'string') p.targetClassId = Number(p.targetClassId.replace('CL-', ''));
  if (typeof p.targetSectionId === 'string') p.targetSectionId = Number(p.targetSectionId.replace('SEC-', ''));

  return apiClient('/api/timetable/copy', {
    method: 'POST',
    body: JSON.stringify(p),
  });
};

// ============================
// DESIGNATIONS API
// ============================

export const fetchDesignationsApi = async (search) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient(`/api/designations${query}`, { method: 'GET' });
};

export const createDesignationApi = async (payload) => {
  const p = {
    designationName: payload.designationName,
    employeeCategory: payload.employeeCategory || 'Both',
    status: payload.status,
  };
  return apiClient('/api/designations', {
    method: 'POST',
    body: JSON.stringify(p),
  });
};

export const updateDesignationApi = async (id, payload) => {
  const p = {
    designationName: payload.designationName,
    employeeCategory: payload.employeeCategory || 'Both',
    status: payload.status,
  };
  return apiClient(`/api/designations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(p),
  });
};

export const deleteDesignationApi = async (id) => {
  return apiClient(`/api/designations/${id}`, { method: 'DELETE' });
};

// ============================
// ACADEMIC SUBJECTS & PERIODS
// ============================

export const fetchAcademicSubjectsApi = async () => {
  return apiClient('/api/academics/subjects', { method: 'GET' });
};

export const fetchAcademicPeriodsApi = async () => {
  return apiClient('/api/academics/periods', { method: 'GET' });
};

export const fetchTimetableForClassSectionApi = async (
  classId,
  sectionName,
  academicYear = '2026-2027'
) => {
  return apiClient(
    `/api/academics/timetable?classId=${classId}&section=${encodeURIComponent(sectionName)}&academicYear=${encodeURIComponent(academicYear)}`,
    { method: 'GET' }
  );
};

export const generateTimetableApi = async (payload) => {
  return apiClient('/api/academics/timetable/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const validateTimetableApi = async (classId, sectionId, academicYear = '2026-2027') => {
  return apiClient(
    `/api/academics/timetable/validate?classId=${classId}&sectionId=${sectionId}&academicYear=${encodeURIComponent(academicYear)}`,
    { method: 'POST' }
  );
};

export const fetchTeacherSubstitutionsApi = async (
  date,
  teacherId,
  teacherName,
  academicYear,
  branch
) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (teacherId) params.append('teacherId', String(teacherId));
  if (teacherName) params.append('teacherName', teacherName);
  if (academicYear && academicYear !== 'All') params.append('academicYear', academicYear);
  if (branch && branch !== 'All' && branch !== 'All Branches') params.append('branch', branch);
  const queryString = params.toString();
  return apiClient(`/api/academics/timetable/substitutions${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const fetchAbsentTeachersScheduleApi = async (
  date,
  academicYear,
  branch
) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (academicYear && academicYear !== 'All') params.append('academicYear', academicYear);
  if (branch && branch !== 'All' && branch !== 'All Branches') params.append('branch', branch);
  const queryString = params.toString();
  return apiClient(`/api/academics/timetable/substitutions/absent-teachers${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const fetchAvailableLeisureTeachersApi = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.date) searchParams.append('date', params.date);
  if (params.dayOfWeek) searchParams.append('dayOfWeek', params.dayOfWeek);
  if (params.startTime) searchParams.append('startTime', params.startTime);
  if (params.endTime) searchParams.append('endTime', params.endTime);
  if (params.subjectId) searchParams.append('subjectId', String(params.subjectId));
  if (params.excludeTeacherId) searchParams.append('excludeTeacherId', String(params.excludeTeacherId));
  return apiClient(`/api/academics/timetable/substitutions/leisure-teachers?${searchParams.toString()}`, { method: 'GET' });
};

export const assignTeacherSubstitutionApi = async (payload) => {
  return apiClient('/api/academics/timetable/substitutions/assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const autoReplaceTeacherSubstitutionsApi = async (payload) => {
  return apiClient('/api/academics/timetable/substitutions/auto-replace', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const deleteTeacherSubstitutionApi = async (substitutionId) => {
  return apiClient(`/api/academics/timetable/substitutions/${substitutionId}`, {
    method: 'DELETE',
  });
};

export const fetchAllTimetablesApi = async (academicYear = '') => {
  const query = academicYear && academicYear !== 'All' ? `?academicYear=${encodeURIComponent(academicYear)}` : '';
  try {
    const res = await apiClient(`/api/Timetable/all${query}`, { method: 'GET' });
    if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
  } catch {}
  try {
    const res = await apiClient(`/api/timetable/all${query}`, { method: 'GET' });
    if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
  } catch {}
  try {
    const res = await apiClient(`/api/academics/timetable/all${query}`, { method: 'GET' });
    if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
  } catch {}
  try {
    const res = await apiClient(`/api/academics/timetable${query}`, { method: 'GET' });
    if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
  } catch {}
  if (query) {
    try {
      const res = await apiClient('/api/Timetable/all', { method: 'GET' });
      if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
    } catch {}
    try {
      const res = await apiClient('/api/timetable/all', { method: 'GET' });
      if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
    } catch {}
  }
  return [];
};

export const fetchTeacherTimetableApi = async (teacherId, academicYear = '') => {
  const query = academicYear && academicYear !== 'All' ? `?academicYear=${encodeURIComponent(academicYear)}` : '';
  try {
    const res = await apiClient(`/api/Timetable/teacher/${teacherId}${query}`, { method: 'GET' });
    if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
  } catch {}
  try {
    const res = await apiClient(`/api/timetable/teacher/${teacherId}${query}`, { method: 'GET' });
    if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
  } catch {}
  if (query) {
    try {
      const res = await apiClient(`/api/Timetable/teacher/${teacherId}`, { method: 'GET' });
      if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
    } catch {}
    try {
      const res = await apiClient(`/api/timetable/teacher/${teacherId}`, { method: 'GET' });
      if (res && (Array.isArray(res) || Array.isArray(res.data))) return res;
    } catch {}
  }
  return [];
};

export const getParentTimetable = async (studentId) => {
  try {
    const response = await apiClient(`/api/parent/timetable/${studentId}`, { method: 'GET' });
    return response?.data || response;
  } catch {
    return [];
  }
};
