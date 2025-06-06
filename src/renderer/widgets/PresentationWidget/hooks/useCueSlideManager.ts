import { useState, useCallback, useMemo } from 'react';
import type { Cue, Slide, CueGroup } from '../types/presentationSharedTypes'; // Assuming CueGroup is defined or we'll define a similar structure

export interface UseCueSlideManagerProps {
  initialCues: Cue[];
  // initialSlidesData: Slide[]; // Removed as slides are part of Cue objects
}

export interface HandleEditingViewSlideSelectOptions {
  isCtrlCmdKey?: boolean;
  isShiftKey?: boolean;
}

export interface UseCueSlideManagerReturn {
  selectedCueId: string | null;
  selectedSlideId: string | null;
  allCuesAsCueGroups: CueGroup[];
  slidesForSelectedCue: Slide[];
  slidesForEditingView: Slide[]; // May be the same as slidesForSelectedCue
  selectedSlideIdsForEditing: string[];
  handleSelectCue: (cueId: string | null) => void;
  handleSelectSlide: (slideId: string | null) => void;
  handleClearSelection: () => void;
  handleGoToNextCue: () => void;
  handleGoToPreviousCue: () => void;
  handleGoToNextSlide: () => void;
  handleGoToPreviousSlide: () => void;
  handleUpdateCueSlides: (cueId: string, updatedSlides: Slide[]) => void; // Needs cueId to update specific cue's slides
  handleEditingViewSlideSelect: (slideId: string, slidesInView: Slide[], options?: HandleEditingViewSlideSelectOptions) => void;
  // Add other relevant states or handlers if identified
}

export const useCueSlideManager = ({
  initialCues,
}: UseCueSlideManagerProps): UseCueSlideManagerReturn => {
  const [selectedCueId, setSelectedCueId] = useState<string | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [currentCues, setCurrentCues] = useState<Cue[]>(initialCues);
  const [selectedSlideIdsForEditing, setSelectedSlideIdsForEditing] = useState<string[]>([]);
  const [lastSelectedSlideAnchorIdForEditing, setLastSelectedSlideAnchorIdForEditing] = useState<string | null>(null);

  // Generates a list of all cues grouped with their respective slides
  const allCuesAsCueGroups: CueGroup[] = useMemo(() => {
    return currentCues.map(cue => ({
      cue,
      slides: cue.slides || [], // Slides are directly part of the Cue object
    }));
  }, [currentCues]);

  // Provides slides for the currently selected cue
  const slidesForSelectedCue: Slide[] = useMemo(() => {
    if (!selectedCueId) return [];
    const selectedCueGroup = allCuesAsCueGroups.find(cg => cg.cue.id === selectedCueId);
    return selectedCueGroup ? selectedCueGroup.slides : [];
  }, [selectedCueId, allCuesAsCueGroups]);

  // Placeholder for slidesForEditingView (often the same as slidesForSelectedCue)
  const slidesForEditingView: Slide[] = useMemo(() => slidesForSelectedCue, [slidesForSelectedCue]);

  // Placeholder handlers - implementations will be moved from PresentationWidget
  const handleSelectCue = useCallback((cueId: string | null) => {
    setSelectedCueId(cueId);
    setSelectedSlideIdsForEditing([]); // Clear editor's multi-selection
    setLastSelectedSlideAnchorIdForEditing(null); // Clear editor's selection anchor

    if (cueId) {
      const cueGroup = allCuesAsCueGroups.find(cg => cg.cue.id === cueId);
      if (cueGroup && cueGroup.slides.length > 0) {
        setSelectedSlideId(cueGroup.slides[0].id); // Auto-select first slide
      } else {
        setSelectedSlideId(null); // No slides in this cue
      }
    } else {
      setSelectedSlideId(null); // No cue selected
    }
    console.log(`[useCueSlideManager] Cue selected: ${cueId}`);
  }, [allCuesAsCueGroups]);

  const handleSelectSlide = useCallback((slideId: string | null) => {
    setSelectedSlideId(slideId);
    console.log(`[useCueSlideManager] Slide selected: ${slideId}`);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedCueId(null);
    setSelectedSlideId(null);
    setSelectedSlideIdsForEditing([]);
    setLastSelectedSlideAnchorIdForEditing(null);
    console.log('[useCueSlideManager] Selection cleared');
  }, []);
  
  const handleGoToNextCue = useCallback(() => {
    if (!currentCues.length) return;
    const currentIndex = selectedCueId ? currentCues.findIndex(c => c.id === selectedCueId) : -1;
    if (currentIndex === -1 || currentIndex === currentCues.length - 1) {
      // If no cue selected or on the last cue, select the first cue (or stay on last if only one)
      handleSelectCue(currentCues[0].id);
    } else {
      handleSelectCue(currentCues[currentIndex + 1].id);
    }
  }, [currentCues, selectedCueId, handleSelectCue]);

  const handleGoToPreviousCue = useCallback(() => {
    if (!currentCues.length) return;
    const currentIndex = selectedCueId ? currentCues.findIndex(c => c.id === selectedCueId) : -1;
    if (currentIndex === -1 || currentIndex === 0) {
      // If no cue selected or on the first cue, select the last cue (or stay on first if only one)
      handleSelectCue(currentCues[currentCues.length - 1].id);
    } else {
      handleSelectCue(currentCues[currentIndex - 1].id);
    }
  }, [currentCues, selectedCueId, handleSelectCue]);

  const handleGoToNextSlide = useCallback(() => {
    if (!selectedCueId || !slidesForSelectedCue.length) {
      // If no cue or no slides in current cue, try to go to the next cue (which will select its first slide)
      handleGoToNextCue();
      return;
    }

    const currentSlideIndex = selectedSlideId ? slidesForSelectedCue.findIndex(s => s.id === selectedSlideId) : -1;

    if (currentSlideIndex === -1 || currentSlideIndex === slidesForSelectedCue.length - 1) {
      // If no slide selected or on the last slide of the current cue, go to the next cue
      handleGoToNextCue();
    } else {
      // Go to the next slide in the current cue
      setSelectedSlideId(slidesForSelectedCue[currentSlideIndex + 1].id);
    }
  }, [selectedCueId, selectedSlideId, slidesForSelectedCue, handleGoToNextCue]);

  const handleGoToPreviousSlide = useCallback(() => {
    if (!selectedCueId || !slidesForSelectedCue.length) {
      // If no cue or no slides in current cue, try to go to the previous cue
      // Then select its *last* slide
      const prevCueIdBeforeNavigation = selectedCueId;
      handleGoToPreviousCue(); // This will select the previous cue and its *first* slide
      // We need to wait for the state update from handleGoToPreviousCue or find the target cue directly
      // For simplicity here, we'll assume handleGoToPreviousCue updates selectedCueId synchronously for the next check
      // This is a potential area for refinement if state updates are not immediate enough.
      // A more robust way would be for handleGoToPreviousCue to return the selected cue, or to recalculate here.
      
      // After navigating to previous cue (which selects its first slide by default via handleSelectCue),
      // we now want to select its *last* slide.
      // This logic is tricky because selectedCueId might not be updated yet from handleGoToPreviousCue.
      // Let's find the target previous cue directly.
      if (!currentCues.length) return;
      let targetCueId = selectedCueId; // Current selected cue after potential navigation
      if (!targetCueId || targetCueId === prevCueIdBeforeNavigation) { // If navigation didn't change cue or no cue was selected
        const currentCueIndex = prevCueIdBeforeNavigation ? currentCues.findIndex(c => c.id === prevCueIdBeforeNavigation) : -1;
        if (currentCueIndex === -1 || currentCueIndex === 0) {
          targetCueId = currentCues[currentCues.length - 1].id;
        } else {
          targetCueId = currentCues[currentCueIndex - 1].id;
        }
      }

      const targetCueGroup = allCuesAsCueGroups.find(cg => cg.cue.id === targetCueId);
      if (targetCueGroup && targetCueGroup.slides.length > 0) {
        setSelectedSlideId(targetCueGroup.slides[targetCueGroup.slides.length - 1].id);
        if (selectedCueId !== targetCueId) setSelectedCueId(targetCueId); // Ensure cue is also selected if changed
      } else if (targetCueId) { // Cue exists but has no slides
        setSelectedSlideId(null);
        if (selectedCueId !== targetCueId) setSelectedCueId(targetCueId);
      }
      return;
    }

    const currentSlideIndex = selectedSlideId ? slidesForSelectedCue.findIndex(s => s.id === selectedSlideId) : -1;

    if (currentSlideIndex === -1 || currentSlideIndex === 0) {
      // If no slide selected or on the first slide of the current cue, go to the previous cue and select its last slide.
      const prevCueId = selectedCueId;
      handleGoToPreviousCue(); // This selects the previous cue and its first slide.
      // Now, adjust to select the last slide of that (newly selected) previous cue.
      // This relies on selectedCueId being updated by handleGoToPreviousCue.
      // A more robust approach might be needed if state updates are not processed in time.
      const newSelectedCueGroup = allCuesAsCueGroups.find(cg => cg.cue.id === selectedCueId);
      if (newSelectedCueGroup && newSelectedCueGroup.cue.id !== prevCueId && newSelectedCueGroup.slides.length > 0) {
         setSelectedSlideId(newSelectedCueGroup.slides[newSelectedCueGroup.slides.length - 1].id);
      } else if (newSelectedCueGroup && newSelectedCueGroup.slides.length > 0) {
        // If still in the same cue (e.g., it was the first cue), or new cue has no slides, this might not be desired.
        // For now, if handleGoToPreviousCue didn't change the cue, it means we were at the first cue.
        // If it did change the cue, and that new cue has slides, we select its last slide.
        // If the new cue has no slides, selectedSlideId would have been set to null by handleSelectCue.
      }
      // If after handleGoToPreviousCue, the selectedCueId is still the same, it means we were on the first cue.
      // In this case, we just stay on its first slide (which handleSelectCue would have set).

    } else {
      // Go to the previous slide in the current cue
      setSelectedSlideId(slidesForSelectedCue[currentSlideIndex - 1].id);
    }
  }, [currentCues, selectedCueId, selectedSlideId, slidesForSelectedCue, handleGoToPreviousCue, allCuesAsCueGroups, handleSelectCue]);

  const handleUpdateCueSlides = useCallback((cueIdToUpdate: string, updatedSlidesForCue: Slide[]) => {
    setCurrentCues(prevCues =>
      prevCues.map(cue =>
        cue.id === cueIdToUpdate ? { ...cue, slides: updatedSlidesForCue } : cue
      )
    );
    console.log(`[useCueSlideManager] Slides updated for cue: ${cueIdToUpdate}`);
  }, []);

  const handleEditingViewSlideSelect = useCallback((slideId: string, slidesInView: Slide[], options?: HandleEditingViewSlideSelectOptions) => {
    const slideIndex = slidesInView.findIndex((s: Slide) => s.id === slideId);
    if (slideIndex === -1) return; // Slide not found in the current view

    const isCtrlCmdKey = options?.isCtrlCmdKey || false;
    const isShiftKey = options?.isShiftKey || false;

    if (isCtrlCmdKey) {
      setSelectedSlideIdsForEditing(prevSelectedIds => {
        if (prevSelectedIds.includes(slideId)) {
          return prevSelectedIds.filter(id => id !== slideId);
        } else {
          return [...prevSelectedIds, slideId];
        }
      });
      // Note: Original code didn't update anchor on Ctrl/Cmd click, matching that behavior.
    } else if (isShiftKey && lastSelectedSlideAnchorIdForEditing) {
      const anchorIndex = slidesInView.findIndex((s: Slide) => s.id === lastSelectedSlideAnchorIdForEditing);
      if (anchorIndex !== -1) {
        const start = Math.min(slideIndex, anchorIndex);
        const end = Math.max(slideIndex, anchorIndex);
        const rangeIds = slidesInView.slice(start, end + 1).map((s: Slide) => s.id);
        setSelectedSlideIdsForEditing(rangeIds);
      } else {
        // Fallback if anchor not found (e.g. slidesInView changed)
        setSelectedSlideIdsForEditing([slideId]);
        setLastSelectedSlideAnchorIdForEditing(slideId);
      }
    } else {
      // Normal click or shift click without anchor
      setSelectedSlideIdsForEditing([slideId]);
      setLastSelectedSlideAnchorIdForEditing(slideId);
    }
  }, [lastSelectedSlideAnchorIdForEditing]);

  return {
    selectedCueId,
    selectedSlideId,
    allCuesAsCueGroups,
    slidesForSelectedCue,
    slidesForEditingView,
    selectedSlideIdsForEditing,
    handleSelectCue,
    handleSelectSlide,
    handleClearSelection,
    handleGoToNextCue,
    handleGoToPreviousCue,
    handleGoToNextSlide,
    handleGoToPreviousSlide,
    handleUpdateCueSlides,
    handleEditingViewSlideSelect,
  };
};
