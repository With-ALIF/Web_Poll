import { useState } from 'react';
import { Admin } from '../types';

export function useAdminRequest() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAdmins, setShowAdmins] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [requestForm, setRequestForm] = useState({
    name: '',
    telegramUsername: '',
    purpose: ''
  });

  const handleAdminClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestForm({ name: '', telegramUsername: '', purpose: '' });
  };

  return {
    showRequestModal,
    showAdmins,
    setShowAdmins,
    selectedAdmin,
    requestForm,
    setRequestForm,
    handleAdminClick,
    closeRequestModal
  };
}
