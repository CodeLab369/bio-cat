import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { formatBoliviano } from '../utils/currency';
import type { Product } from '../types';

const Inventario: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
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
    location: '',
    quantity: 0,
    cost: 0,
    salePrice: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Load products from storage
  useEffect(() => {
    const savedProducts = storage.get<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
    setProducts(savedProducts);
  }, []);

  // Save products to storage
  useEffect(() => {
    storage.set(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locs = products.map(p => p.location).filter(Boolean);
    return Array.from(new Set(locs));
  }, [products]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationFilter || product.location === locationFilter;
      const matchesMinQty = !minQuantity || product.quantity >= parseInt(minQuantity);
      const matchesMaxQty = !maxQuantity || product.quantity <= parseInt(maxQuantity);
      
      return matchesSearch && matchesLocation && matchesMinQty && matchesMaxQty;
    });
  }, [products, searchTerm, locationFilter, minQuantity, maxQuantity]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', location: '', quantity: 0, cost: 0, salePrice: 0 });
    setEditingProduct(null);
  };

  // Open add/edit modal
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        location: product.location,
        quantity: product.quantity,
        cost: product.cost,
        salePrice: product.salePrice,
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

  // Save product
  const saveProduct = () => {
    if (!formData.name || !formData.location) {
      addNotification('warning', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (editingProduct) {
      // Update existing
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...formData, updatedAt: new Date().toISOString() }
          : p
      ));
      addNotification('success', 'Producto actualizado correctamente');
    } else {
      // Add new
      const newProduct: Product = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts([...products, newProduct]);
      addNotification('success', 'Producto agregado correctamente');
    }

    closeModal();
  };

  // Delete product
  const deleteProduct = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Producto',
      message: '¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.',
      type: 'danger',
      onConfirm: () => {
        setProducts(products.filter(p => p.id !== id));
        addNotification('success', 'Producto eliminado');
      },
    });
  };

  // View product
  const viewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  // Clear all products
  const clearInventory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Vaciar Inventario',
      message: '¿Estás seguro de vaciar todo el inventario? Esta acción eliminará todos los productos y no se puede deshacer.',
      type: 'danger',
      onConfirm: () => {
        setProducts([]);
        addNotification('success', 'Inventario vaciado');
      },
    });
  };

  // Download format
  const downloadFormat = () => {
    const template = [
      { Nombre: '', Ubicación: '', Cantidad: 0, Costo: 0, 'Precio de Venta': 0 }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'formato_productos.xlsx');
    addNotification('success', 'Formato descargado');
  };

  // Import from Excel
  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newProducts: Product[] = jsonData.map((row: any) => ({
          id: Date.now().toString() + Math.random(),
          name: row['Nombre'] || row['nombre'] || '',
          location: row['Ubicación'] || row['ubicacion'] || row['Ubicacion'] || '',
          quantity: parseInt(row['Cantidad'] || row['cantidad'] || '0'),
          cost: parseFloat(row['Costo'] || row['costo'] || '0'),
          salePrice: parseFloat(row['Precio de Venta'] || row['precio_venta'] || row['Precio_Venta'] || '0'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })).filter(p => p.name && p.location);

        setProducts([...products, ...newProducts]);
        addNotification('success', `${newProducts.length} productos importados`);
      } catch (error) {
        addNotification('error', 'Error al importar archivo');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Export to Excel
  const exportToExcel = () => {
    if (products.length === 0) {
      addNotification('warning', 'No hay productos para exportar');
      return;
    }

    const exportData = products.map(p => ({
      Nombre: p.name,
      Ubicación: p.location,
      Cantidad: p.quantity,
      Costo: p.cost,
      'Precio de Venta': p.salePrice,
      'Fecha Creación': new Date(p.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, `inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
    addNotification('success', 'Inventario exportado');
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Inventario</h1>
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
              Agregar Producto
            </button>

            <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Importar
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Exportar
            </button>

            <button
              onClick={downloadFormat}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Formato
            </button>

            <button
              onClick={clearInventory}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Vaciar Inventario
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Buscar producto
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del producto..."
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

            {/* Min Quantity */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Cantidad mínima
              </label>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Max Quantity */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Cantidad máxima
              </label>
              <input
                type="number"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
                placeholder="999999"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No hay productos en el inventario
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(product => (
                    <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4 text-sm text-center text-neutral-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-neutral-600 dark:text-neutral-400">
                        {product.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-neutral-900 dark:text-white">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-neutral-900 dark:text-white">
                        {formatBoliviano(product.cost)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-neutral-900 dark:text-white">
                        {formatBoliviano(product.salePrice)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => viewProduct(product)}
                            className="p-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                            title="Ver"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 text-red-700 hover:text-red-900 dark:text-red-600 dark:hover:text-red-400"
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
          {filteredProducts.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-neutral-700 dark:text-neutral-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Producto' : 'Agregar Producto'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Ubicación *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Oruro, Almacén A"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Costo (Bs.)
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Precio Venta (Bs.)
              </label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveProduct}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingProduct ? 'Actualizar' : 'Guardar'}
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
        title="Detalles del Producto"
      >
        {viewingProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Nombre
              </label>
              <p className="text-lg text-neutral-900 dark:text-white">{viewingProduct.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Ubicación
              </label>
              <p className="text-lg text-neutral-900 dark:text-white">{viewingProduct.location}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Cantidad
                </label>
                <p className="text-lg text-neutral-900 dark:text-white">{viewingProduct.quantity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Costo
                </label>
                <p className="text-lg text-neutral-900 dark:text-white">{formatBoliviano(viewingProduct.cost)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Precio Venta
                </label>
                <p className="text-lg text-neutral-900 dark:text-white">{formatBoliviano(viewingProduct.salePrice)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Fecha de Creación
              </label>
              <p className="text-neutral-900 dark:text-white">
                {new Date(viewingProduct.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Última Actualización
              </label>
              <p className="text-neutral-900 dark:text-white">
                {new Date(viewingProduct.updatedAt).toLocaleString()}
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
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Inventario;
