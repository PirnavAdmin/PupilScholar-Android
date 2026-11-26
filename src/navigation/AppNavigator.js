import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../data/mockUsers';
import {
  SplashScreen,
  LoginScreen,
  TeacherDashboardScreen,
  StudentDashboardScreen,
  ParentDashboardScreen,
} from '../screens';
import { Loading, AppText } from '../components';
import { COLORS } from '../constants/colors';

export const AppNavigator = () => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // 1. Initial Splash Screen presentation
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Not authenticated -> Single Unified Login Page
  // Keeps user on Login screen with in-button loading indicator only
  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  // 3. Authenticated Role Transition Loading State (only after user is logged in)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading
          mode="fullscreen"
          size="large"
          color={COLORS.primaryLight}
          message="Entering PupilScholar Portal..."
        />
      </View>
    );
  }

  // 4. Role-based Dashboards
  switch (role) {
    case USER_ROLES.TEACHER:
      return <TeacherDashboardScreen />;

    case USER_ROLES.STUDENT:
      return <StudentDashboardScreen />;

    case USER_ROLES.PARENT:
      return <ParentDashboardScreen />;

    default:
      return (
        <View style={styles.unknownRoleContainer}>
          <AppText variant="h3" color="danger">
            Unrecognized Role
          </AppText>
          <AppText variant="body" color="secondary" style={styles.unknownText}>
            This account role ({String(role)}) is not mapped to a dashboard.
          </AppText>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D1E',
  },
  unknownRoleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  unknownText: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AppNavigator;
