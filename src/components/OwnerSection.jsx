// src/components/OwnerSection.jsx
import { useState, useEffect } from 'react';
import { OwnerSearch } from './OwnerSearch';
import { OwnerInfo } from './OwnerInfo';
import { toast } from 'react-hot-toast';

export function OwnerSection({ initialOwner = null, onOwnerChange }) {
  const [owner, setOwner] = useState(initialOwner);
  const [isSearching, setIsSearching] = useState(!initialOwner);

  useEffect(() => {
    setOwner(initialOwner);
    setIsSearching(!initialOwner);
  }, [initialOwner]);

  const handleOwnerSelect = (selectedOwner) => {
    console.log("OwnerSection - Propietario a seleccionar:", selectedOwner);
    
    // Verificar que el propietario tenga datos
    if (!selectedOwner) {
      console.error("Error: No se proporcionó un propietario para seleccionar");
      toast.error("Error al seleccionar propietario. No se recibieron datos.");
      return;
    }
    
    // SOLUCIÓN CLAVE: Asegurar que exista un ID válido usando newId si es necesario
    const ownerWithId = {
      ...selectedOwner,
      // Usar id existente o _id o newId, en ese orden de prioridad
      id: selectedOwner.id || selectedOwner._id || selectedOwner.newId
    };
    
    // Verificar si tenemos un ID válido
    if (!ownerWithId.id) {
      console.error("El propietario seleccionado no tiene ningún tipo de ID:", selectedOwner);
      toast.error("Error: El propietario no tiene un ID válido.");
      return;
    }
  
    console.log("Propietario normalizado con ID:", ownerWithId);
    
    setOwner(ownerWithId);
    setIsSearching(false);
    
    if (onOwnerChange) {
      onOwnerChange(ownerWithId);
    }
  };
  const handleChangeOwner = () => {
    setIsSearching(true);
  };

  if (isSearching) {
    return <OwnerSearch onOwnerSelect={handleOwnerSelect} />;
  }

  return <OwnerInfo owner={owner} onChangeOwner={handleChangeOwner} />;
}