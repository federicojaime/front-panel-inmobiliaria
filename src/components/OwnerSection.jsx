// src/components/OwnerSection.jsx
import { useState, useEffect } from 'react';
import { OwnerSearch } from './OwnerSearch';
import { OwnerInfo } from './OwnerInfo';

export function OwnerSection({ initialOwner = null, onOwnerChange }) {
  const [owner, setOwner] = useState(initialOwner);
  const [isSearching, setIsSearching] = useState(!initialOwner);

  useEffect(() => {
    setOwner(initialOwner);
    setIsSearching(!initialOwner);
  }, [initialOwner]);

  const handleOwnerSelect = (selectedOwner) => {
    setOwner(selectedOwner);
    setIsSearching(false);
    if (onOwnerChange) {
      onOwnerChange(selectedOwner);
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