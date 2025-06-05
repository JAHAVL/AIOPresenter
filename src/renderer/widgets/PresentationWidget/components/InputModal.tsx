import React, { useState, useEffect } from 'react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  defaultValue = '',
  placeholder = '',
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit(inputValue.trim());
    onClose(); // Close modal after submit
  };

  const handleCancel = () => {
    onClose();
  };

  // Basic styling - can be expanded or moved to a CSS file
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    minWidth: '300px',
    border: '1px solid #ccc',
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };

  const inputStyle: React.CSSProperties = {
    width: 'calc(100% - 22px)', // Account for padding and border
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1em',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white',
  };

  return (
    <>
      <div style={backdropStyle} onClick={handleCancel} />
      <div style={modalStyle}>
        <h3>{title}</h3>
        {message && <p style={{ marginTop: 0, marginBottom: '10px' }}>{message}</p>}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <div style={buttonContainerStyle}>
          <button style={secondaryButtonStyle} onClick={handleCancel}>Cancel</button>
          <button style={primaryButtonStyle} onClick={handleSubmit}>OK</button>
        </div>
      </div>
    </>
  );
};

export default InputModal;
