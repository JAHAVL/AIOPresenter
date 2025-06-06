import { useState, useCallback } from 'react';

export type AddItemModalMode = 'cuelist' | 'cue' | null;

interface UseAddItemModalsProps {
  selectedItemTypeForCue?: 'library' | 'cuelist' | 'folder' | null; // Used to validate if 'add cue' is possible
}

export interface UseAddItemModalsReturn {
  isModalOpen: boolean;
  modalMode: AddItemModalMode;
  modalTitle: string;
  modalMessage: string;
  modalPlaceholder: string;
  modalInputValue: string;
  openNewCuelistModal: (parentId: string) => void;
  openAddCueModal: () => boolean; // Returns true if opened, false if not (e.g., no cuelist selected)
  closeModal: () => void;
  handleModalInputChange: (value: string) => void;
  parentLibraryId: string | null; // For submitting new cuelist
}

export const useAddItemModals = ({
  selectedItemTypeForCue = null,
}: UseAddItemModalsProps): UseAddItemModalsReturn => {
  const [modalMode, setModalMode] = useState<AddItemModalMode>(null);
  const [inputValue, setInputValue] = useState('');
  const [parentLibraryId, setParentLibraryId] = useState<string | null>(null);

  const isModalOpen = modalMode !== null;

  const openNewCuelistModal = useCallback((id: string) => {
    setParentLibraryId(id);
    setModalMode('cuelist');
    setInputValue('');
  }, []);

  const openAddCueModal = useCallback(() => {
    if (selectedItemTypeForCue === 'cuelist') {
      setModalMode('cue');
      setInputValue('');
      setParentLibraryId(null); // Not needed for adding a cue directly to selected cuelist
      return true;
    }
    console.warn('[useAddItemModals] Cannot open add cue modal: No cuelist selected or invalid item type.');
    return false;
  }, [selectedItemTypeForCue]);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setInputValue('');
    setParentLibraryId(null);
  }, []);

  const handleModalInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  let modalTitle = '';
  let modalMessage = '';
  let modalPlaceholder = '';

  if (modalMode === 'cuelist') {
    modalTitle = 'Add New Cuelist';
    modalMessage = 'Please enter the name for the new cuelist:';
    modalPlaceholder = 'Cuelist Name';
  } else if (modalMode === 'cue') {
    modalTitle = 'Add New Cue';
    modalMessage = 'Please enter the name for the new cue:';
    modalPlaceholder = 'Cue Name';
  }

  return {
    isModalOpen,
    modalMode,
    modalTitle,
    modalMessage,
    modalPlaceholder,
    modalInputValue: inputValue,
    openNewCuelistModal,
    openAddCueModal,
    closeModal,
    handleModalInputChange,
    parentLibraryId,
  };
};
