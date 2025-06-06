import { useState, useCallback } from 'react';

export interface InputModalProps {
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void; // Optional: if specific cancel logic is needed beyond just closing
}

export interface UseInputModalReturn {
  isModalOpen: boolean;
  modalProps: InputModalProps | null;
  openModal: (props: InputModalProps) => void;
  closeModal: () => void;
}

export const useInputModal = (): UseInputModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<InputModalProps | null>(null);

  const openModal = useCallback((props: InputModalProps) => {
    setModalProps(props);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalProps(null); // Reset props on close
  }, []);

  return {
    isModalOpen,
    modalProps,
    openModal,
    closeModal,
  };
};
