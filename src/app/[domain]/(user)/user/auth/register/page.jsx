'use client';
import React from 'react';
import CustomerRegisterForm from '@/components/website/user/forms/RegisterForm';

export default function UserRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <CustomerRegisterForm />
    </div>
  );
}

