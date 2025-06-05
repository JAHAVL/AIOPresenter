import React from 'react';
import type { ThemeColors } from '@theme/theme';
import type { TextSlideElement, SlideElement } from '@projectTypes/presentationSharedTypes';
import AlignLeftIcon from '@icons/AlignLeftIcon';
import AlignCenterHorizontalIcon from '@icons/AlignCenterHorizontalIcon';
import AlignRightIcon from '@icons/AlignRightIcon';
import AlignJustifyIcon from '@icons/AlignJustifyIcon';
import AlignTopIcon from '@icons/AlignTopIcon';
import AlignMiddleVerticalIcon from '@icons/AlignMiddleVerticalIcon';
import AlignBottomIcon from '@icons/AlignBottomIcon';
import styles from './TextProperties.module.css';

const availableFonts = [
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { name: 'Courier New', value: 'Courier New, Courier, monospace' },
  { name: 'Lucida Console', value: 'Lucida Console, Monaco, monospace' },
  { name: 'Calibri', value: 'Calibri, sans-serif' },
  { name: 'Cambria', value: 'Cambria, serif' },
  { name: 'Candara', value: 'Candara, sans-serif' },
  { name: 'Consolas', value: 'Consolas, monospace' },
  { name: 'Constantia', value: 'Constantia, serif' },
  { name: 'Corbel', value: 'Corbel, sans-serif' },
  { name: 'Franklin Gothic Medium', value: 'Franklin Gothic Medium, sans-serif' },
  { name: 'Gabriola', value: 'Gabriola, serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Palatino Linotype', value: 'Palatino Linotype, serif' },
  { name: 'Segoe Print', value: 'Segoe Print, sans-serif' },
  { name: 'Segoe Script', value: 'Segoe Script, sans-serif' },
  { name: 'Segoe UI', value: 'Segoe UI, sans-serif' },
  { name: 'Segoe UI Light', value: 'Segoe UI Light, sans-serif' },
  { name: 'Segoe UI Semibold', value: 'Segoe UI Semibold, sans-serif' },
  { name: 'Segoe UI Symbol', value: 'Segoe UI Symbol, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  // Add more fonts as needed, ensuring they are loaded via fonts.css or are system fonts
];

import sharedStyles from '@renderer/styles/sharedControls.module.css';

// Helper function to convert hex to RGBA (for box-shadow)
const hexToRgba = (hex: string, alpha: number = 1): string => {
  const hexValue = hex.replace('#', '');
  const bigint = parseInt(hexValue, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToRgbTriplet = (hex: string): string => {
  const hexValue = hex.replace('#', '');
  const bigint = parseInt(hexValue, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

interface TextPropertiesProps {
  element: TextSlideElement;
  onUpdateElement: (updatedElement: Partial<TextSlideElement>) => void;
  themeColors: ThemeColors;
}

const TextProperties: React.FC<TextPropertiesProps> = ({ element, onUpdateElement, themeColors }) => {
  // Helper components (defined within TextProperties for this step)
  const PropertySection: React.FC<{ title: string; children: React.ReactNode; themeColors: ThemeColors; className?: string }> = ({ title, children, themeColors, className }) => (
    <div className={`${styles.propertySection} ${className || ''}`} style={{ borderColor: themeColors.panelBorder }}>
      <h5 className={styles.sectionTitle} style={{ color: themeColors.headerText, borderBottomColor: themeColors.panelBorder }}>{title}</h5>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );

  // Font Properties Section
  const FontPropertiesSection = () => (
    <PropertySection title="Font" themeColors={themeColors}>
      <PropertyRow label="Family" htmlFor="fontFamily">
        <StyledSelect
          id="fontFamily"
          name="fontFamily"
          value={element.fontFamily || ''}
          onChange={handleInputChange}
          themeColors={themeColors}
        >
          <option value="">Default</option>
          {availableFonts.map(font => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </StyledSelect>
      </PropertyRow>
      {/* Placeholder for other font properties like size, weight, style if not handled by SegmentedControl */}
    </PropertySection>
  );


  const PropertyRow: React.FC<{ label?: string; children: React.ReactNode; htmlFor?: string; className?: string; tip?: string }> = ({ label, children, htmlFor, className, tip }) => (
    <div className={`${styles.propertyRow} ${className || ''}`} title={tip}>
      {label && <label htmlFor={htmlFor} className={styles.propertyLabel} style={{color: themeColors.mutedText}}>{label}</label>}
      <div className={styles.propertyControlContainer}>
        {children}
      </div>
    </div>
  );

  const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {themeColors: ThemeColors}> = ({themeColors, className, ...props}) => (
    <input className={`${styles.inputBase} ${sharedStyles.inputShared} ${className || ''}`} {...props} />
  );

  const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {themeColors: ThemeColors}> = ({themeColors, className, ...props}) => (
    <select className={`${styles.inputBase} ${sharedStyles.inputShared} ${className || ''}`} {...props} />
  );

  const StyledColorInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {themeColors: ThemeColors; value: string | undefined }> = ({themeColors, className, value, ...props}) => (
    <input type="color" className={`${styles.colorInput} ${sharedStyles.inputShared} ${className || ''}`} value={value || '#000000'} {...props} />
  );

  interface SegmentedControlOption {
    value: string;
    label?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
    title?: string;
  }

  type AlignmentControlNames = 'textAlign' | 'verticalAlign' | 'fontWeight' | 'fontStyle' | 'textTransform';

  interface SegmentedControlProps {
    name: AlignmentControlNames;
    options: readonly SegmentedControlOption[];
    value: string | undefined;
    onChange: (name: AlignmentControlNames, value: string) => void;
    themeColors: ThemeColors;
    className?: string;
  }

  const SegmentedControl: React.FC<SegmentedControlProps> = ({ name, options, value, onChange, themeColors, className }) => (
    <div className={`${sharedStyles.segmentedControlContainer} ${className || ''}`} style={{ backgroundColor: themeColors.secondaryPanelBackground, borderColor: themeColors.panelBorder }}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className={`${sharedStyles.segmentedControlButton} ${value === option.value ? sharedStyles.active : ''}`}
          onClick={() => onChange(name, option.value)}
          style={value === option.value ? { backgroundColor: themeColors.inputBackground || themeColors.accent, color: themeColors.toggleButtonActiveText } : { color: themeColors.toggleButtonInactiveText }}
          title={option.title || option.label}
        >
          {option.icon ? <option.icon size="1em" style={{fill: 'currentColor'}} /> : option.label}
        </button>
      ))}
    </div>
  );

  const StyledTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {themeColors: ThemeColors}> = ({themeColors, className, ...props}) => (
    <textarea className={`${styles.inputBase} ${sharedStyles.inputShared} ${className || ''}`} {...props} />
  );

  const ToggleSwitch: React.FC<{label: string, name: string, checked: boolean | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, themeColors: ThemeColors}> = 
    ({label, name, checked, onChange, themeColors}) => (
    <PropertyRow label={label} htmlFor={name}>
      <label className={sharedStyles.toggleSwitch}>
        <input type="checkbox" name={name} checked={!!checked} onChange={onChange} />
        <span className={sharedStyles.slider} style={{'--active-color': themeColors.accent, '--inactive-color': themeColors.inputBackground} as React.CSSProperties}></span>
      </label>
    </PropertyRow>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    let processedValue: string | number | boolean | undefined = value;

    // Consolidate numeric and specific property handling
    if (['fontSize', 'lineHeight', 'letterSpacing', 'textStrokeWidth', 'opacity', 
         'textShadowOpacity', 'textShadowAngle', 'textShadowOffsetMagnitude', 'textShadowBlurRadius'].includes(name)) {
      const numericValue = parseFloat(value as string);
      if (isNaN(numericValue)) {
        processedValue = undefined; // Or keep as string if that's preferred for empty inputs
      } else {
        if (name === 'opacity' || name === 'textShadowOpacity') {
          processedValue = Math.max(0, Math.min(1, numericValue));
        } else if (name === 'textShadowBlurRadius' || name === 'textStrokeWidth') {
          processedValue = Math.max(0, numericValue);
        } else {
          processedValue = numericValue;
        }
      }
    }

    if (name.startsWith('textShadow.')) {
      const shadowProp = name.split('.')[1] as keyof NonNullable<TextSlideElement['textShadow']>;
      const currentShadow = element.textShadow || { enabled: false, color: '#000000', opacity: 1, angle: 0, offsetMagnitude: 2, blurRadius: 2 };
      onUpdateElement({ textShadow: { ...currentShadow, [shadowProp]: processedValue } });
    } else {
      onUpdateElement({ [name]: processedValue });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateElement({ [e.target.name]: e.target.value });
  };

  const handleBoldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateElement({ fontWeight: e.target.checked ? 'bold' : 'normal' });
  };

  const handleTextStrokeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'textStrokeEnabled') {
      onUpdateElement({ textStrokeEnabled: checked });
    } else if (name === 'textStrokeColor') {
      onUpdateElement({ textStrokeColor: value });
    } else if (name === 'textStrokeWidth') {
      const width = parseFloat(value);
      onUpdateElement({ textStrokeWidth: isNaN(width) ? undefined : width });
    } else {
      return; // Unknown property
    }
  };

  const handleAlignmentChange = (name: 'textAlign' | 'verticalAlign' | 'fontWeight' | 'fontStyle' | 'textTransform', value: string) => {
    onUpdateElement({ [name]: value });
  };

  const toggleStyle = (style: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    console.log(`toggleStyle called for: ${style}`, 'Current element:', element);
    let update: Partial<TextSlideElement> = {};
    switch (style) {
      case 'bold':
        update = { fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' };
        break;
      case 'italic':
        update = { fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' };
        break;
      case 'underline':
      case 'strikethrough':
        {
          const currentDecorations = element.textDecoration?.split(' ').filter((d: string) => d) || [];
          const decorationMap = {
            underline: 'underline',
            strikethrough: 'line-through'
          };
          const targetDecoration = decorationMap[style];
          let newDecorations;
          if (currentDecorations.includes(targetDecoration)) {
            newDecorations = currentDecorations.filter((d: string) => d !== targetDecoration);
          } else {
            newDecorations = [...currentDecorations, targetDecoration];
          }
          // Ensure 'none' is handled correctly
          if (newDecorations.length === 0) {
            update = { textDecoration: 'none' as string | undefined };
          } else if (newDecorations.includes('none') && newDecorations.length > 1) {
            update = { textDecoration: newDecorations.filter((d: string) => d !== 'none').join(' ') as string | undefined };
          } else {
            update = { textDecoration: newDecorations.join(' ') as string | undefined };
          }
        }
        break;
    }
    onUpdateElement(update);
  };

  const handleTextShadowChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const currentShadow = element.textShadow || {
      enabled: false,
      color: '#000000',
      opacity: 1,
      angle: 0,
      offsetMagnitude: 2,
      blurRadius: 2,
    };

    let updatedShadowProperties: Partial<typeof currentShadow> = {};

    if (name === 'textShadowEnabled') {
      updatedShadowProperties = { enabled: checked };
    } else if (name === 'textShadowColor') {
      updatedShadowProperties = { color: value };
    } else if (name === 'textShadowOpacity') {
      const num = parseFloat(value);
      updatedShadowProperties = { opacity: isNaN(num) ? currentShadow.opacity : Math.max(0, Math.min(1, num)) };
    } else if (name === 'textShadowAngle') {
      const num = parseFloat(value);
      updatedShadowProperties = { angle: isNaN(num) ? currentShadow.angle : num };
    } else if (name === 'textShadowOffsetMagnitude') {
      const num = parseFloat(value);
      updatedShadowProperties = { offsetMagnitude: isNaN(num) ? currentShadow.offsetMagnitude : num };
    } else if (name === 'textShadowBlurRadius') {
      const num = parseFloat(value);
      updatedShadowProperties = { blurRadius: isNaN(num) ? currentShadow.blurRadius : Math.max(0, num) };
    } else {
      return; // Unknown property
    }

    onUpdateElement({ textShadow: { ...currentShadow, ...updatedShadowProperties } });
  };
  
  const fontFamilies = [
    { label: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: 'Times New Roman, Times, serif' },
    { label: 'Courier New', value: 'Courier New, Courier, monospace' },
    { label: 'Lucida Console', value: 'Lucida Console, Monaco, monospace' },
  ];

  const fontWeights = [
    { label: 'Normal', value: 'normal' },
    { label: 'Bold', value: 'bold' },
  ];

  const fontStyles = [
    { label: 'Normal', value: 'normal' },
    { label: 'Italic', value: 'italic' },
  ];

  const textTransforms = [
    { label: 'None', value: 'none' },
    { label: 'Uppercase', value: 'uppercase' },
    { label: 'Lowercase', value: 'lowercase' },
    { label: 'Capitalize', value: 'capitalize' },
  ];

  const textDecorations = [
    // For multi-select, this would be checkboxes. For single-select segmented, it's trickier.
    // The image doesn't show this control. Assuming simple toggles for now.
    { label: 'U', value: 'underline', title: 'Underline' }, 
    { label: 'S', value: 'line-through', title: 'Strikethrough' },
  ];

  const horizontalAlignments = [
    { value: 'left', icon: AlignLeftIcon, title: 'Align Left' },
    { value: 'center', icon: AlignCenterHorizontalIcon, title: 'Align Center Horizontal' },
    { value: 'right', icon: AlignRightIcon, title: 'Align Right' },
    { value: 'justify', icon: AlignJustifyIcon, title: 'Align Justify' },
  ] as const;

  const verticalAlignments = [
    { value: 'top', icon: AlignTopIcon, title: 'Align Top' },
    { value: 'middle', icon: AlignMiddleVerticalIcon, title: 'Align Middle Vertical' },
    { value: 'bottom', icon: AlignBottomIcon, title: 'Align Bottom' },
  ] as const;

  const focusShadowColor = themeColors.accent || themeColors.primary || '#007bff';

  // Adjusted toggleStyle for segmented controls or individual toggles
  const handleSingleDecorationToggle = (decoration: 'underline' | 'line-through') => {
    const currentDecorations = element.textDecoration?.split(' ').filter(d => d && d !== 'none') || [];
    let newDecorations;
    if (currentDecorations.includes(decoration)) {
      newDecorations = currentDecorations.filter(d => d !== decoration);
    } else {
      newDecorations = [...currentDecorations, decoration];
    }
    onUpdateElement({ textDecoration: newDecorations.length > 0 ? newDecorations.join(' ') : 'none' });
  };

  const componentRootStyle: React.CSSProperties & { [key: string]: string | number } = {
    color: themeColors.text || '#e0e0e0',
    padding: '10px',
    border: `1px solid ${themeColors.panelBorder || '#444'}`,
    borderRadius: '4px',
    backgroundColor: themeColors.panelBackground || '#333',
    maxHeight: 'calc(100vh - 200px)', // Example max height
    overflowY: 'auto',

    // CSS Custom Properties for children
    '--input-bg': themeColors.inputBackground || '#2a2a2a',
    '--input-border': themeColors.inputBorder || '#555',
    '--input-text': themeColors.text || '#e0e0e0',
    '--input-focus-border-color': focusShadowColor,
    '--label-text-color': themeColors.mutedText || '#aaa',
    '--button-bg': themeColors.buttonBackground || '#555',
    '--button-text': themeColors.buttonText || '#fff',
    '--button-hover-bg': themeColors.buttonHoverBackground || '#666',
    '--section-border': themeColors.panelBorder || '#444',
    '--header-text-color': themeColors.headerText || '#fff',
    '--accent-color': themeColors.accent || '#007bff',
    '--focus-box-shadow-color-rgb': hexToRgbTriplet(focusShadowColor),

    '--toggle-container-bg': themeColors.secondaryPanelBackground || '#383838',
    '--toggle-container-border': themeColors.panelBorder || '#444',
    '--toggle-active-bg': themeColors.inputBackground || '#4d4d4d',
    '--toggle-active-text': themeColors.toggleButtonActiveText || themeColors.text || '#ffffff',
    '--toggle-inactive-text': themeColors.mutedText || '#ababab',
  }; // Correctly closes componentRootStyle

  return (
    <div style={componentRootStyle} className={styles.textPropertiesPanel}>
      <PropertySection title="Content" themeColors={themeColors} className={styles.contentSection}>
        <PropertyRow label="Text" htmlFor="content" className={styles.fullWidthRow}>
          <StyledTextArea
            id="content"
            name="content"
            value={element.content || ''}
            onChange={handleInputChange}
            rows={3}
            themeColors={themeColors}
            placeholder="Enter text content..."
            aria-label="Text Content"
          />
        </PropertyRow>
      </PropertySection>
      {/* The existing <PropertySection title="Font"...> and subsequent sections will now be correctly nested */}

      <PropertySection title="Font" themeColors={themeColors} className={styles.fontSection}>
        <PropertyRow label="Family" htmlFor="fontFamily">
          <StyledSelect id="fontFamily" name="fontFamily" value={element.fontFamily || ''} onChange={handleInputChange} themeColors={themeColors}>
            <option value="">Default System Font</option>
            {availableFonts.map(font => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </option>
            ))}
          </StyledSelect>
        </PropertyRow>
        <div className={styles.gridRow}>
          <PropertyRow label="Size" htmlFor="fontSize" className={styles.gridItem}>
            <StyledInput type="number" id="fontSize" name="fontSize" value={element.fontSize || ''} onChange={handleInputChange} themeColors={themeColors} placeholder="16" />
          </PropertyRow>
          <PropertyRow label="Weight" className={styles.gridItem}>
            <SegmentedControl name="fontWeight" options={fontWeights} value={element.fontWeight} onChange={handleAlignmentChange} themeColors={themeColors} />
          </PropertyRow>
        </div>
        <PropertyRow label="Style" className={styles.fullWidthRow}>
          <SegmentedControl name="fontStyle" options={fontStyles} value={element.fontStyle} onChange={handleAlignmentChange} themeColors={themeColors} />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Paragraph" themeColors={themeColors} className={styles.paragraphSection}>
        <div className={styles.gridRow}>
            <PropertyRow label="Line Height" htmlFor="lineHeight" className={styles.gridItem}>
            <StyledInput type="number" id="lineHeight" name="lineHeight" value={element.lineHeight || ''} onChange={handleInputChange} themeColors={themeColors} step={0.1} placeholder="1.5" />
            </PropertyRow>
            <PropertyRow label="Letter Spacing" htmlFor="letterSpacing" className={styles.gridItem}>
            <StyledInput type="number" id="letterSpacing" name="letterSpacing" value={element.letterSpacing || ''} onChange={handleInputChange} themeColors={themeColors} placeholder="0" />
            </PropertyRow>
        </div>
        <PropertyRow label="Horizontal Align" className={styles.fullWidthRow}>
          <SegmentedControl name="textAlign" options={horizontalAlignments} value={element.textAlign} onChange={handleAlignmentChange} themeColors={themeColors} />
        </PropertyRow>
        <PropertyRow label="Vertical Align" className={styles.fullWidthRow}>
          <SegmentedControl name="verticalAlign" options={verticalAlignments} value={element.verticalAlign} onChange={handleAlignmentChange} themeColors={themeColors} />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Appearance" themeColors={themeColors} className={styles.appearanceSection}>
        <div className={styles.gridRow}>
            <PropertyRow label="Text Color" htmlFor="color" className={styles.gridItemHalfWidth}>
            <StyledColorInput id="color" name="color" value={element.color} onChange={handleColorChange} themeColors={themeColors} />
            </PropertyRow>
            <PropertyRow label="Background" htmlFor="textBackgroundColor" className={styles.gridItemHalfWidth}>
            <StyledColorInput id="textBackgroundColor" name="textBackgroundColor" value={element.textBackgroundColor} onChange={handleColorChange} themeColors={themeColors} />
            </PropertyRow>
        </div>
        <PropertyRow label={`Opacity: ${element.opacity === undefined ? 100 : Math.round((element.opacity || 0) * 100)}%`} htmlFor="opacity">
          <StyledInput type="range" id="opacity" name="opacity" min="0" max="1" step="0.01" value={element.opacity === undefined ? 1 : element.opacity} onChange={handleInputChange} themeColors={themeColors} />
        </PropertyRow>
        <PropertyRow label="Transform" className={styles.fullWidthRow}>
            <SegmentedControl name="textTransform" options={textTransforms} value={element.textTransform} onChange={handleAlignmentChange} themeColors={themeColors} />
        </PropertyRow>
        <PropertyRow label="Decoration" className={styles.fullWidthRow}>
          <div className={`${sharedStyles.segmentedControlContainer} ${styles.inlineControls}`} style={{ backgroundColor: themeColors.secondaryPanelBackground, borderColor: themeColors.panelBorder }}>
            <button 
              type="button"
              onClick={() => handleSingleDecorationToggle('underline')}
              className={`${sharedStyles.segmentedControlButton} ${element.textDecoration?.includes('underline') ? sharedStyles.active : ''}`}
              title="Underline"
              style={element.textDecoration?.includes('underline') ? { backgroundColor: themeColors.inputBackground || themeColors.accent, color: themeColors.toggleButtonActiveText } : { color: themeColors.toggleButtonInactiveText }}
            >
              U
            </button>
            <button 
              type="button"
              onClick={() => handleSingleDecorationToggle('line-through')}
              className={`${sharedStyles.segmentedControlButton} ${element.textDecoration?.includes('line-through') ? sharedStyles.active : ''}`}
              title="Strikethrough"
              style={element.textDecoration?.includes('line-through') ? { backgroundColor: themeColors.inputBackground || themeColors.accent, color: themeColors.toggleButtonActiveText } : { color: themeColors.toggleButtonInactiveText }}
            >
              S
            </button>
          </div>
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Stroke" themeColors={themeColors} className={styles.strokeSection}>
        <ToggleSwitch label="Enable Stroke" name="textStrokeEnabled" checked={element.textStrokeEnabled} onChange={handleTextStrokeChange} themeColors={themeColors} />
        {element.textStrokeEnabled && (
          <>
            <div className={styles.gridRow}>
                <PropertyRow label="Color" htmlFor="textStrokeColor" className={styles.gridItemHalfWidth}>
                <StyledColorInput id="textStrokeColor" name="textStrokeColor" value={element.textStrokeColor} onChange={handleTextStrokeChange} themeColors={themeColors} />
                </PropertyRow>
                <PropertyRow label="Width" htmlFor="textStrokeWidth" className={styles.gridItemHalfWidth}>
                <StyledInput type="number" id="textStrokeWidth" name="textStrokeWidth" value={element.textStrokeWidth || ''} onChange={handleTextStrokeChange} themeColors={themeColors} min={0} placeholder="1" />
                </PropertyRow>
            </div>
          </>
        )}
      </PropertySection>

      <PropertySection title="Shadow" themeColors={themeColors} className={styles.shadowSection}>
        <ToggleSwitch label="Enable Shadow" name="textShadow.enabled" checked={element.textShadow?.enabled} onChange={handleInputChange} themeColors={themeColors} />
        {element.textShadow?.enabled && (
          <>
            <div className={styles.gridRow}>
                <PropertyRow label="Color" htmlFor="textShadow.color" className={styles.gridItemHalfWidth}>
                <StyledColorInput id="textShadow.color" name="textShadow.color" value={element.textShadow?.color} onChange={handleInputChange} themeColors={themeColors} />
                </PropertyRow>
                <PropertyRow label={`Opacity: ${element.textShadow?.opacity === undefined ? 100 : Math.round((element.textShadow?.opacity || 0) * 100)}%`} htmlFor="textShadow.opacity" className={styles.gridItemHalfWidth}>
                <StyledInput type="range" id="textShadow.opacity" name="textShadow.opacity" min="0" max="1" step="0.01" value={element.textShadow?.opacity === undefined ? 1 : element.textShadow.opacity} onChange={handleInputChange} themeColors={themeColors} />
                </PropertyRow>
            </div>
            <div className={styles.gridRowResponsive}>
                <PropertyRow label="Angle" htmlFor="textShadow.angle" className={styles.gridItemThirdWidth}>
                <StyledInput type="number" id="textShadow.angle" name="textShadow.angle" value={element.textShadow?.angle || ''} onChange={handleInputChange} themeColors={themeColors} placeholder="0" />
                </PropertyRow>
                <PropertyRow label="Offset" htmlFor="textShadow.offsetMagnitude" className={styles.gridItemThirdWidth}>
                <StyledInput type="number" id="textShadow.offsetMagnitude" name="textShadow.offsetMagnitude" value={element.textShadow?.offsetMagnitude || ''} onChange={handleInputChange} themeColors={themeColors} placeholder="2" />
                </PropertyRow>
                <PropertyRow label="Blur" htmlFor="textShadow.blurRadius" className={styles.gridItemThirdWidth}>
                <StyledInput type="number" id="textShadow.blurRadius" name="textShadow.blurRadius" value={element.textShadow?.blurRadius || ''} onChange={handleInputChange} themeColors={themeColors} min={0} placeholder="2" />
                </PropertyRow>
            </div>
          </>
        )}
      </PropertySection>
    </div>
  );
};

export default TextProperties;
