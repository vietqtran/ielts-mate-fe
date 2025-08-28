'use client';

import VocabularyCreateModal from '@/components/features/vocabulary/VocabularyCreateModal';
import { Button } from '@/components/ui/button';
import { BookMarkedIcon } from 'lucide-react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

interface SelectableTextProps {
  content: string;
  className?: string;
  children?: React.ReactNode;
  examAttemptId: string;
  partKey: string; // 'part1', 'part2', 'part3', 'practice'
  passageId: string;
  isReviewMode?: boolean; // If true, don't allow text selection
}

interface SelectedTextData {
  text: string;
}

export const SelectableText = ({
  content,
  className = '',
  children,
  examAttemptId,
  partKey,
  passageId,
  isReviewMode = false,
}: SelectableTextProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTextData, setSelectedTextData] = useState<SelectedTextData | null>(null);
  const [actionPos, setActionPos] = useState<{
    visible: boolean;
    top: number;
    left: number;
  }>({ visible: false, top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setActionPos((p) => ({ ...p, visible: false }));
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0 || selectedText.length > 100) return; // Limit selection length

    // Check if selection is within our content
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Find the closest element with our content
    let currentElement =
      container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);

    let contentElement: Element | null = null;
    while (currentElement && !contentElement) {
      if (currentElement.hasAttribute('data-selectable-content')) {
        contentElement = currentElement;
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (!contentElement) return;

    // Compute position for floating action button near the selection
    const rect = range.getBoundingClientRect();
    const firstRect = rect.width || rect.height ? rect : range.getClientRects()[0];
    const containerRect = (contentElement as HTMLElement).getBoundingClientRect();
    if (!firstRect) return;

    // Place the button slightly above the selection (or fallback to on top-left)
    const offsetY = 8; // px above selection
    const left = firstRect.left - containerRect.left + firstRect.width / 2;
    const top = firstRect.top - containerRect.top - offsetY;

    setSelectedTextData({
      text: selectedText,
    });
    setActionPos({
      visible: true,
      top: Math.max(0, top),
      left: Math.max(0, left),
    });
  }, [content]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Clear selectedTextData only when modal is closed
    setSelectedTextData(null);
  }, []);

  const handleVocabularySuccess = useCallback(() => {
    // Optional: You can add a success toast or callback here
    console.log('Vocabulary added successfully!');
  }, []);

  const handleAddVocabularyClick = useCallback(() => {
    const selection = window.getSelection();
    // Clear the selection highlight when opening the modal
    if (selection && selection.rangeCount) selection.removeAllRanges();
    setIsModalOpen(true);
    setActionPos((p) => ({ ...p, visible: false }));
    // Don't clear selectedTextData here - let the modal handle it
  }, []);

  // Hide the floating action on window events like scroll/resize
  useEffect(() => {
    const hide = () => setActionPos((p) => (p.visible ? { ...p, visible: false } : p));
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, []);

  // Hide when clicking outside the container or pressing Escape
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setActionPos((p) => (p.visible ? { ...p, visible: false } : p));
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActionPos((p) => (p.visible ? { ...p, visible: false } : p));
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      <div className='relative group' ref={containerRef}>
        {/* Visual indicator */}
        <div className='absolute -top-2 -right-2 opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none'>
          <BookMarkedIcon className='w-4 h-4 text-tekhelet-400' />
        </div>

        <MemoContent
          className={`select-text cursor-text transition-colors hover:bg-selective-yellow-50 ${className}`}
          onMouseUp={isReviewMode ? undefined : handleTextSelection}
          content={content}
        />

        {/* Floating action button to add vocabulary */}
        {actionPos.visible && !isReviewMode && (
          <div
            className='absolute z-50 -translate-x-1/2 -translate-y-full'
            style={{ top: actionPos.top, left: actionPos.left }}
          >
            <div className='rounded-md bg-white shadow-md border-0 p-1'>
              <Button
                size='sm'
                variant='ghost'
                onClick={handleAddVocabularyClick}
                className='gap-2 text-tekhelet-400 hover:text-tekhelet-500 hover:bg-selective-yellow-50'
                aria-label='Add selected text to vocabulary'
              >
                <BookMarkedIcon className='w-4 h-4' /> Add vocabulary
              </Button>
            </div>
          </div>
        )}
      </div>

      {children}

      {/* Enhanced Vocabulary Create Modal */}
      <VocabularyCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleVocabularySuccess}
        initialData={
          selectedTextData
            ? {
                word: selectedTextData.text,
              }
            : undefined
        }
      />
    </>
  );
};

// Memoized content block to avoid DOM updates that can clear native selections
const MemoContent = memo(
  function MemoContent({
    content,
    className,
    onMouseUp,
  }: {
    content: string;
    className?: string;
    onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  }) {
    return (
      <div
        className={className}
        onMouseUp={onMouseUp}
        data-selectable-content='true'
        dangerouslySetInnerHTML={{ __html: content }}
        title='Select text to add to vocabulary'
      />
    );
  },
  (prev, next) => prev.content === next.content && prev.className === next.className
);
