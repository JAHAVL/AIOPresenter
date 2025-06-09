import React, { useState, useEffect, useRef } from 'react';

// Using a simplified ThemeColors interface to avoid import issues
interface ThemeColors {
  panelBackground: string;
  textColor: string;
  itemInputBackground?: string;
  itemInputText?: string;
  itemInputBorder?: string;
  accentColor?: string;
  [key: string]: string | undefined;
}
import SelectableItem from './SelectableItem';

export interface EditableSelectableItemProps {
  id: string;
  isSelected: boolean;
  isEditing: boolean;
  initialValue: string;
  themeColors: ThemeColors;
  onSelect: () => void;
  onStartEdit?: () => void;
  onEditSubmit: (value: string) => void;
  onEditCancel?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

/**
 * A selectable item that can be edited (e.g., for renaming libraries, cuelists, etc.)
 * Extends the SelectableItem component with editing capabilities.
 */
// Using React.memo for better HMR performance
const EditableSelectableItem: React.FC<EditableSelectableItemProps> = React.memo(({
  id,
  isSelected,
  isEditing,
  initialValue,
  themeColors,
  onSelect,
  onStartEdit,
  onEditSubmit,
  onEditCancel,
  onKeyDown,
  className = '',
}) => {
  const [editValue, setEditValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset edit value when initialValue changes or editing starts
  useEffect(() => {
    if (isEditing) {
      setEditValue(initialValue);
    }
  }, [initialValue, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!isEditing && onStartEdit) {
      onStartEdit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    if (isEditing) {
      onEditSubmit(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEditSubmit(editValue);
    } else if (e.key === 'Escape') {
      if (onEditCancel) {
        onEditCancel();
      }
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px',
    margin: 0,
    border: `1px solid ${themeColors.itemInputBorder || themeColors.accentColor}`,
    borderRadius: '3px',
    backgroundColor: themeColors.itemInputBackground || themeColors.panelBackground,
    color: themeColors.itemInputText || themeColors.textColor,
    boxSizing: 'border-box',
  };

  return (
    <SelectableItem
      id={id}
      isSelected={isSelected}
      isEditing={isEditing}
      themeColors={themeColors}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={`editable-selectable-item ${className}`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={inputStyle}
          data-library-id={id}
          autoFocus
        />
      ) : (
        initialValue
      )}
    </SelectableItem>
  );
});

export default EditableSelectableItem;
