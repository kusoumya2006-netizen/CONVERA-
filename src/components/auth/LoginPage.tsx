import React from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';

interface LoginPageProps {
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding }) => {
  return (
    <AuthLayout onBackToLanding={onBackToLanding}>
      <LoginForm />
    </AuthLayout>
  );
};
