/**
 * Mock Users Database
 * Supports Parent, Student, and Teacher roles.
 * Single login screen accepts any of these credentials or demo buttons.
 */

export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

export const MOCK_USERS = [
  {
    id: 'user_t_01',
    email: 'teacher@school.com',
    username: 'teacher',
    password: 'password123',
    role: USER_ROLES.TEACHER,
    name: 'Mrs. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    initials: 'SJ',
    designation: 'Senior Mathematics & Physics Faculty',
    department: 'High School (Grades 9-12)',
    employeeId: 'TCH-2024-042',
    phone: '+1 (555) 234-5678',
    assignedClasses: ['Grade 10-A', 'Grade 9-B', 'Grade 11-Science'],
  },
  {
    id: 'user_s_01',
    email: 'student@school.com',
    username: 'student',
    password: 'password123',
    role: USER_ROLES.STUDENT,
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    initials: 'AR',
    grade: 'Grade 10 - Section A',
    rollNumber: '14',
    studentId: 'STU-2024-8831',
    guardianName: 'David Rivera',
    attendancePercent: 94.5,
    currentGPA: '3.88',
    rank: '4th in Class',
  },
  {
    id: 'user_p_01',
    email: 'parent@school.com',
    username: 'parent',
    password: 'password123',
    role: USER_ROLES.PARENT,
    name: 'David Rivera',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    initials: 'DR',
    relationship: 'Father',
    phone: '+1 (555) 876-5432',
    emailVerified: true,
    children: [
      {
        id: 'child_01',
        name: 'Alex Rivera',
        grade: 'Grade 10 - Section A',
        rollNumber: '14',
        attendanceToday: 'Present (08:12 AM)',
        status: 'in_class',
        gpa: '3.88',
        pendingFees: '$0 (Paid)',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        initials: 'AR',
      },
      {
        id: 'child_02',
        name: 'Emma Rivera',
        grade: 'Grade 6 - Section B',
        rollNumber: '09',
        attendanceToday: 'Present (08:20 AM)',
        status: 'in_class',
        gpa: '3.95',
        pendingFees: '$350 (Due Nov 30)',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        initials: 'ER',
      },
    ],
  },
];

/**
 * Helper to authenticate user by email/username and password.
 * Returns user object or throws error message.
 */
export const authenticateUser = (identifier, password, selectedRole = null) => {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  const user = MOCK_USERS.find(
    (u) =>
      (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) &&
      u.password === cleanPassword
  );

  if (!user) {
    return {
      success: false,
      error: 'Invalid credentials. Please check your username/email and password.',
    };
  }

  // If a specific role tab was selected (other than 'all'), check role match
  if (selectedRole && selectedRole !== 'all' && user.role !== selectedRole) {
    return {
      success: false,
      error: `This account is registered as a ${user.role.toUpperCase()}, not ${selectedRole.toUpperCase()}. Please switch role tab or choose All Roles.`,
    };
  }

  return {
    success: true,
    user,
  };
};
