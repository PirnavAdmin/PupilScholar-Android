/**
 * Authentication API Service
 * Implements SMS.Api Auth endpoints & contracts
 * Version 2.0 Teacher Portal Specification
 */

import { apiClient, setAuthToken, getAuthToken } from './client';
import { USER_ROLES } from '../data/mockUsers';

/**
 * Normalizes backend AuthResponseDto into the app's unified user object
 */
export const normalizeBackendUser = (dto) => {
  if (!dto) return null;

  // Determine client role from backend roles
  let mappedRole = USER_ROLES.TEACHER;
  let rolesArray = [];

  if (Array.isArray(dto.roles)) {
    rolesArray = dto.roles.map((r) => String(r).toLowerCase());
  } else if (typeof dto.roles === 'string') {
    rolesArray = dto.roles.split(',').map((r) => r.trim().toLowerCase());
  } else if (dto.role) {
    rolesArray = [String(dto.role).toLowerCase()];
  }

  if (rolesArray.some((r) => r.includes('student')) || (dto.studentId && !dto.staffId)) {
    mappedRole = USER_ROLES.STUDENT;
  } else if (rolesArray.some((r) => r.includes('parent') || r.includes('guardian'))) {
    mappedRole = USER_ROLES.PARENT;
  } else {
    // Default to Teacher / Faculty
    mappedRole = USER_ROLES.TEACHER;
  }

  const fullName = dto.fullName || dto.name || 'User';
  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'PS';

  const gradeDisplay = dto.className
    ? `${dto.className}${dto.section ? ` - Section ${dto.section}` : ''}`
    : '';

  const token = dto.token || dto.accessToken || dto.jwt || null;
  const staffId = dto.staffId || (dto.userId && mappedRole === USER_ROLES.TEACHER ? dto.userId : 5);

  return {
    id: dto.userId ? `api_${dto.userId}` : `api_u_${Date.now()}`,
    userId: dto.userId || staffId,
    email: dto.email || '',
    username: dto.email ? dto.email.split('@')[0] : fullName,
    name: fullName,
    role: mappedRole,
    roles: dto.roles || [mappedRole === USER_ROLES.TEACHER ? 'Teacher' : mappedRole],
    avatar: dto.avatar || null,
    initials,
    phone: dto.mobileNumber || dto.phone || '',
    branch: dto.branch || 'Main Campus',
    employeeId: dto.employeeId || (staffId ? `EMP-${staffId}` : 'EMP-104'),
    staffId,
    designation: dto.designation || (mappedRole === USER_ROLES.TEACHER ? 'Senior Faculty' : null),
    department: dto.department || (mappedRole === USER_ROLES.TEACHER ? 'Academics' : null),
    studentId: dto.studentId || null,
    admissionNo: dto.admissionNo || '',
    rollNo: dto.rollNo || '',
    grade: gradeDisplay,
    token,
    isLiveBackend: true,
  };
};

/**
 * Login API
 * Strict conformity to SMS Teacher Portal Mobile REST API Specification:
 * POST /api/auth/login with { emailOrPhone, password, portal: "Teacher" }
 */
export const loginApi = async (emailOrPhone, password, portal = 'Teacher') => {
  const resolvedPortal = portal || 'Teacher';
  const isSuperAdminPortal = resolvedPortal === 'Super Admin' || resolvedPortal === 'SuperAdmin';
  const endpoint = isSuperAdminPortal ? '/api/superadmin/login' : '/api/auth/login';

  let rawResponse;
  try {
    rawResponse = await apiClient(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        emailOrPhone: (emailOrPhone || '').trim(),
        password: password || '',
        portal: resolvedPortal,
      }),
    });
  } catch (err) {
    if (isSuperAdminPortal) {
      // Fallback to unified auth login
      rawResponse = await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          emailOrPhone: (emailOrPhone || '').trim(),
          password: password || '',
          portal: resolvedPortal,
        }),
      });
    } else {
      throw err;
    }
  }

  // Handle token & normalization for mobile app state
  const userDto =
    rawResponse && typeof rawResponse === 'object' && rawResponse.data && typeof rawResponse.data === 'object'
      ? rawResponse.data
      : rawResponse;

  const token = userDto?.token || userDto?.accessToken || userDto?.jwt || rawResponse?.token || null;
  if (token) {
    setAuthToken(token);
  }

  const normalizedUser = normalizeBackendUser({ ...userDto, token });

  return {
    ...rawResponse,
    success: true,
    user: normalizedUser,
    token,
    data: userDto,
  };
};

/**
 * Dispatch OTP for Password Reset (Email or SMS)
 */
export const sendOtpApi = async (emailOrPhone) => {
  const cleanId = (emailOrPhone || '').trim();
  const isEmail = cleanId.includes('@');
  return apiClient('/api/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ emailOrPhone: cleanId, deliveryMethod: isEmail ? 'Email' : 'SMS' })
  });
};

/**
 * Verify OTP Code
 */
export const verifyOtpApi = async (emailOrPhone, otpCode) => {
  return apiClient('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ emailOrPhone: (emailOrPhone || '').trim(), otpCode: (otpCode || '').trim() })
  });
};

/**
 * Reset Password using OTP
 */
export const resetPasswordWithOtpApi = async (emailOrPhone, otpCode, newPassword) => {
  return apiClient('/api/auth/otp/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      emailOrPhone: (emailOrPhone || '').trim(),
      oldPassword: '',
      otpCode: (otpCode || '').trim(),
      newPassword,
      confirmPassword: newPassword,
    })
  });
};

/**
 * Change Password (Authenticated User)
 */
export const changePasswordApi = async (data) => {
  const token = getAuthToken();
  const headers = {};
  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return apiClient('/api/auth/change-password', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};
