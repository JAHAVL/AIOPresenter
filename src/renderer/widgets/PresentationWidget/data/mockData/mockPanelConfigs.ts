import type { PanelConfig as HookPanelConfig } from '../../hooks/usePanelManager';

export const initialPanelsConfigForHook: HookPanelConfig[] = [
  { id: 'libraryCueList', defaultPosition: { x: 0, y: 0 }, defaultSize: { width: '25%', height: '60%' }, componentKey: 'libraryCueList', minWidth: 200, minHeight: 150, visible: true },
  { id: 'slides', defaultPosition: { x: 300, y: 0 }, defaultSize: { width: '75%', height: '60%' }, componentKey: 'slides', minWidth: 400, minHeight: 300, visible: true },
  { id: 'output', defaultPosition: { x: 0, y: 480 }, defaultSize: { width: '50%', height: '40%' }, componentKey: 'output', minWidth: 320, minHeight: 180, visible: true },
  { id: 'automation', defaultPosition: { x: 600, y: 480 }, defaultSize: { width: '50%', height: '40%' }, componentKey: 'automation', minWidth: 200, minHeight: 150, visible: true },
];
