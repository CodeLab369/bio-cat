import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { Client } from '../types';

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [clients, setClients] = useState<Client[]>(() => {
    // Inicializar desde localStorage
    const savedClients = storage.get<Client[]>(STORAGE_KEYS.CLIENTS);
    return savedClients || [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  
  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'info',
  });
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    shippingLocation: '',
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locs = clients.map(c => c.shippingLocation).filter(Boolean);
    return Array.from(new Set(locs));
  }, [clients]);

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationFilter || client.shippingLocation === locationFilter;
      
      return matchesSearch && matchesLocation;
    });
  }, [clients, searchTerm, locationFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', contact: '', shippingLocation: '' });
    setEditingClient(null);
  };

  // Open add/edit modal
  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        contact: client.contact,
        shippingLocation: client.shippingLocation,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Save client
  const saveClient = () => {
    if (!formData.name.trim() || !formData.contact.trim() || !formData.shippingLocation.trim()) {
      addNotification('warning', 'Por favor completa todos los campos');
      return;
    }

    if (editingClient) {
      // Update existing client
      const updatedClients = clients.map(c =>
        c.id === editingClient.id
          ? { ...c, ...formData, updatedAt: new Date().toISOString() }
          : c
      );
      setClients(updatedClients);
      storage.set(STORAGE_KEYS.CLIENTS, updatedClients);
      addNotification('success', 'Cliente actualizado correctamente');
    } else {
      // Add new client
      const newClient: Client = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      storage.set(STORAGE_KEYS.CLIENTS, updatedClients);
      addNotification('success', 'Cliente agregado correctamente');
    }

    closeModal();
  };

  // Delete client
  const deleteClient = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar Cliente?',
      message: 'Esta acción no se puede deshacer. El cliente será eliminado permanentemente.',
      type: 'danger',
      onConfirm: () => {
        const updatedClients = clients.filter(c => c.id !== id);
        setClients(updatedClients);
        storage.set(STORAGE_KEYS.CLIENTS, updatedClients);
        addNotification('success', 'Cliente eliminado');
      },
    });
  };

  // View client details
  const viewClient = (client: Client) => {
    setViewingClient(client);
    setIsViewModalOpen(true);
  };

  // Clear all clients
  const clearClients = () => {
    setConfirmModal({
      isOpen: true,
      title: '¿Vaciar Lista de Clientes?',
      message: 'Esta acción eliminará todos los clientes de la lista. No se puede deshacer.',
      type: 'danger',
      onConfirm: () => {
        setClients([]);
        storage.set(STORAGE_KEYS.CLIENTS, []);
        addNotification('success', 'Lista de clientes vaciada');
      },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Clientes</h1>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Cliente
            </button>

            <button
              onClick={clearClients}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Vaciar Clientes
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Buscar cliente
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o contacto..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Filtrar por ubicación
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Lugar de Envío
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {client.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                          {client.contact}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                          {client.shippingLocation}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => viewClient(client)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="Ver detalles"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal(client)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredClients.length > 0 && (
            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700/50 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    Mostrar
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    clientes
                  </span>
                </div>

                {/* Page info */}
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredClients.length)} de {filteredClients.length}
                </div>

                {/* Page buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-600"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-300">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-600"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClient ? 'Editar Cliente' : 'Agregar Cliente'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Contacto
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Teléfono o email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Lugar de Envío
            </label>
            <input
              type="text"
              value={formData.shippingLocation}
              onChange={(e) => setFormData({ ...formData, shippingLocation: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Oruro, Cochabamba"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveClient}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingClient ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Cliente"
      >
        {viewingClient && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Nombre
              </label>
              <p className="text-neutral-900 dark:text-white">{viewingClient.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Contacto
              </label>
              <p className="text-neutral-900 dark:text-white">{viewingClient.contact}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Lugar de Envío
              </label>
              <p className="text-neutral-900 dark:text-white">{viewingClient.shippingLocation}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Fecha de Creación
              </label>
              <p className="text-neutral-900 dark:text-white">
                {new Date(viewingClient.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Última Actualización
              </label>
              <p className="text-neutral-900 dark:text-white">
                {new Date(viewingClient.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};

export default Clientes;
