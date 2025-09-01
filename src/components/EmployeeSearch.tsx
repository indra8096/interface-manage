'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
  id: number;
  name: string | null;
  email: string;
  itRole?: string;
}

interface EmployeeSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function EmployeeSearch({ 
  value, 
  onChange, 
  placeholder = "Rechercher un employé...", 
  className = "",
  style = {}
}: EmployeeSearchProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger la liste des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const users = await response.json();
          // Filtrer les utilisateurs qui ont un nom
          const employeesWithNames = users.filter((user: any) => user.name && user.name.trim() !== '');
          setEmployees(employeesWithNames);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filtrer les employés selon la recherche
  useEffect(() => {
    if (!value.trim()) {
      setFilteredEmployees([]);
      return;
    }

    const filtered = employees.filter(employee => 
      employee.name?.toLowerCase().includes(value.toLowerCase()) ||
      employee.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [value, employees]);

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredEmployees.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredEmployees.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredEmployees.length) {
          selectEmployee(filteredEmployees[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Sélectionner un employé
  const selectEmployee = (employee: Employee) => {
    onChange(employee.name || employee.email);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Gérer le clic en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtenir le label d'affichage pour un employé
  const getEmployeeLabel = (employee: Employee) => {
    if (employee.name) {
      const roleLabel = employee.itRole === 'IT_INTERN' ? 'Stagiaire IT' :
                       employee.itRole === 'IT_SUPPORT' ? 'Technicien support IT' :
                       employee.itRole === 'IT_ENGINEER' ? 'Ingénieur système / réseau' :
                       employee.itRole === 'IT_ADMIN' ? 'Administrateur IT' :
                       employee.itRole === 'IT_MANAGER' ? 'Chef IT' :
                       employee.itRole === 'IT_DIRECTOR' ? 'Responsable IT' :
                       employee.itRole === 'CIO' ? "Directeur des systèmes d'information" : '';
      
      return `${employee.name}${roleLabel ? ` — ${roleLabel}` : ''}`;
    }
    return employee.email;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent ${className}`}
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
          ...style
        }}
      />

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#CCFF00] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Dropdown des suggestions */}
      <AnimatePresence>
        {isOpen && filteredEmployees.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-xl border shadow-lg"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-primary)'
            }}
          >
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => selectEmployee(employee)}
                className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b last:border-b-0 ${
                  index === selectedIndex 
                    ? 'bg-[#CCFF00] bg-opacity-20' 
                    : 'hover:bg-[#CCFF00] hover:bg-opacity-10'
                }`}
                style={{ 
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="font-karla-medium text-sm">
                  {getEmployeeLabel(employee)}
                </div>
                <div className="text-xs opacity-70" style={{ color: 'var(--text-muted)' }}>
                  {employee.email}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message si aucun résultat */}
      <AnimatePresence>
        {isOpen && value.trim() && filteredEmployees.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 p-4 rounded-xl border text-center"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="text-sm font-karla-medium">
              Aucun employé trouvé pour "{value}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
