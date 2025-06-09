import React, { useState } from 'react';
import Modal from '../common/Modal';
import type { ThemeColors } from '../../theme/theme';

// Define sample layout templates with SVG representations
const SAMPLE_TEMPLATES = [
  { 
    id: 'default', 
    name: 'Default Layout', 
    description: 'Standard presentation layout with all panels',
    svgLayout: (
      <svg width="100%" height="100%" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        {/* Libraries section */}
        <rect x="5" y="5" width="45" height="55" fill="#444" opacity="0.7" />
        <text x="27" y="30" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Libraries</text>
        
        {/* Cuelists section */}
        <rect x="5" y="65" width="45" height="50" fill="#555" opacity="0.7" />
        <text x="27" y="90" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Cuelists</text>
        
        {/* Slides section */}
        <rect x="55" y="5" width="80" height="110" fill="#666" opacity="0.7" />
        <text x="95" y="60" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Slides</text>
        
        {/* Output section */}
        <rect x="140" y="5" width="55" height="110" fill="#777" opacity="0.7" />
        <text x="167" y="60" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Output</text>
      </svg>
    )
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    description: 'Focus on slides with minimal UI',
    svgLayout: (
      <svg width="100%" height="100%" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        {/* Compact Libraries section */}
        <rect x="5" y="5" width="30" height="35" fill="#444" opacity="0.7" />
        <text x="20" y="22" fontFamily="Arial" fontSize="6" fill="#fff" textAnchor="middle">Libraries</text>
        
        {/* Compact Cuelists section */}
        <rect x="5" y="45" width="30" height="70" fill="#555" opacity="0.7" />
        <text x="20" y="80" fontFamily="Arial" fontSize="6" fill="#fff" textAnchor="middle">Cuelists</text>
        
        {/* Expanded Slides section */}
        <rect x="40" y="5" width="100" height="110" fill="#666" opacity="0.7" />
        <text x="90" y="60" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Slides</text>
        
        {/* Expanded Output section */}
        <rect x="145" y="5" width="50" height="110" fill="#777" opacity="0.7" />
        <text x="170" y="60" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Output</text>
      </svg>
    )
  },
  { 
    id: 'output-focus', 
    name: 'Output Focus', 
    description: 'Emphasizes the output window',
    svgLayout: (
      <svg width="100%" height="100%" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        {/* Compact Libraries section */}
        <rect x="5" y="5" width="30" height="35" fill="#444" opacity="0.7" />
        <text x="20" y="22" fontFamily="Arial" fontSize="6" fill="#fff" textAnchor="middle">Libraries</text>
        
        {/* Compact Cuelists section */}
        <rect x="5" y="45" width="30" height="70" fill="#555" opacity="0.7" />
        <text x="20" y="80" fontFamily="Arial" fontSize="6" fill="#fff" textAnchor="middle">Cuelists</text>
        
        {/* Smaller Slides section */}
        <rect x="40" y="5" width="50" height="110" fill="#666" opacity="0.7" />
        <text x="65" y="60" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Slides</text>
        
        {/* Expanded Output section */}
        <rect x="95" y="5" width="100" height="110" fill="#777" opacity="0.7" />
        <text x="145" y="60" fontFamily="Arial" fontSize="10" fill="#fff" textAnchor="middle">Output</text>
      </svg>
    )
  },
  { 
    id: 'dual-screen', 
    name: 'Dual Screen', 
    description: 'Optimized for dual screen setups',
    svgLayout: (
      <svg width="100%" height="100%" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        {/* Left screen */}
        <rect x="5" y="5" width="90" height="110" stroke="#888" strokeWidth="1" fill="none" strokeDasharray="2,2" />
        
        {/* Libraries section */}
        <rect x="10" y="10" width="25" height="50" fill="#444" opacity="0.7" />
        <text x="22" y="35" fontFamily="Arial" fontSize="6" fill="#fff" textAnchor="middle">Libraries</text>
        
        {/* Cuelists section */}
        <rect x="10" y="65" width="25" height="45" fill="#555" opacity="0.7" />
        <text x="22" y="87" fontFamily="Arial" fontSize="6" fill="#fff" textAnchor="middle">Cuelists</text>
        
        {/* Slides section */}
        <rect x="40" y="10" width="50" height="100" fill="#666" opacity="0.7" />
        <text x="65" y="60" fontFamily="Arial" fontSize="8" fill="#fff" textAnchor="middle">Slides</text>
        
        {/* Right screen */}
        <rect x="105" y="5" width="90" height="110" stroke="#888" strokeWidth="1" fill="none" strokeDasharray="2,2" />
        
        {/* Output section (full second screen) */}
        <rect x="110" y="10" width="80" height="100" fill="#777" opacity="0.7" />
        <text x="150" y="60" fontFamily="Arial" fontSize="10" fill="#fff" textAnchor="middle">Output</text>
      </svg>
    )
  },
  { 
    id: 'custom', 
    name: 'Custom', 
    description: 'Your saved custom layout',
    svgLayout: (
      <svg width="100%" height="100%" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="190" height="110" fill="#555" opacity="0.2" stroke="#777" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Placeholder sections with dashed outlines */}
        <rect x="15" y="15" width="35" height="40" fill="none" stroke="#777" strokeWidth="1" strokeDasharray="3,3" />
        <rect x="15" y="65" width="35" height="40" fill="none" stroke="#777" strokeWidth="1" strokeDasharray="3,3" />
        <rect x="60" y="15" width="70" height="90" fill="none" stroke="#777" strokeWidth="1" strokeDasharray="3,3" />
        <rect x="140" y="15" width="45" height="90" fill="none" stroke="#777" strokeWidth="1" strokeDasharray="3,3" />
        
        <text x="100" y="50" fontFamily="Arial" fontSize="12" fill="#999" textAnchor="middle">Custom Layout</text>
        <text x="100" y="70" fontFamily="Arial" fontSize="8" fill="#888" textAnchor="middle">Save your current arrangement</text>
      </svg>
    )
  },
];

export interface LayoutTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColors: ThemeColors;
  onSelectTemplate?: (templateId: string) => void;
  onSaveCurrentLayout?: () => void;
  currentLayoutId?: string;
}

const LayoutTemplateModal: React.FC<LayoutTemplateModalProps> = ({
  isOpen,
  onClose,
  themeColors,
  onSelectTemplate,
  onSaveCurrentLayout,
  currentLayoutId = 'default',
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(currentLayoutId);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleApply = () => {
    if (onSelectTemplate) {
      onSelectTemplate(selectedTemplateId);
    }
    onClose();
  };

  const templateListStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  };

  const templateItemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '15px',
    borderRadius: '8px',
    border: `2px solid ${isSelected ? themeColors.selectedItemAccentColor || '#3498db' : themeColors.panelBorder || '#444'}`,
    backgroundColor: isSelected ? `${themeColors.selectedItemBackground || 'rgba(52, 152, 219, 0.1)'}` : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
    transform: isSelected ? 'translateY(-2px)' : 'none',
  });

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  };

  const buttonStyle = (isPrimary: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '4px',
    border: isPrimary ? 'none' : `1px solid ${themeColors.panelBorder || '#444'}`,
    backgroundColor: isPrimary ? themeColors.selectedItemAccentColor || '#3498db' : 'transparent',
    color: isPrimary ? '#fff' : themeColors.textColor,
    cursor: 'pointer',
    fontWeight: isPrimary ? 'bold' : 'normal',
  });

  const templateTitleStyle: React.CSSProperties = {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: themeColors.textColor,
  };

  const templateDescriptionStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '14px',
    color: themeColors.textSecondary || '#aaa',
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Layout Templates"
      onClose={onClose}
      themeColors={themeColors}
      width="800px"
    >
      <div>
        <p style={{ color: themeColors.textColor, marginTop: 0 }}>
          Select a layout template or save your current layout as a custom template.
        </p>
        
        <div style={templateListStyle}>
          {SAMPLE_TEMPLATES.map(template => (
            <div
              key={template.id}
              style={templateItemStyle(selectedTemplateId === template.id)}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div style={{ 
                marginBottom: '12px', 
                backgroundColor: themeColors.panelBackground || '#222',
                borderRadius: '4px',
                padding: '10px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {template.svgLayout}
              </div>
              <h3 style={templateTitleStyle}>{template.name}</h3>
              <p style={templateDescriptionStyle}>{template.description}</p>
            </div>
          ))}
        </div>
        
        <div style={buttonContainerStyle}>
          <button 
            style={buttonStyle(false)}
            onClick={onSaveCurrentLayout}
          >
            Save Current Layout
          </button>
          <div>
            <button 
              style={{...buttonStyle(false), marginRight: '10px'}}
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              style={buttonStyle(true)}
              onClick={handleApply}
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LayoutTemplateModal;
