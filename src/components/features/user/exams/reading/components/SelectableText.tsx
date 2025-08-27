'use client';

import VocabularyCreateModal from '@/components/features/vocabulary/VocabularyCreateModal';
import { BookMarkedIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface SelectableTextProps {
  content: string;
  className?: string;
  children?: React.ReactNode;
}

interface SelectedTextData {
  text: string;
}

export const SelectableText = ({ content, className = '', children }: SelectableTextProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTextData, setSelectedTextData] = useState<SelectedTextData | null>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

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

    setSelectedTextData({
      text: selectedText,
    });
    setIsModalOpen(true);

    // Clear selection
    selection.removeAllRanges();
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTextData(null);
  }, []);

  const handleVocabularySuccess = useCallback(() => {
    // Optional: You can add a success toast or callback here
    console.log('Vocabulary added successfully!');
  }, []);

  return (
    <>
      <div className='relative group'>
        {/* Visual indicator */}
        <div className='absolute -top-2 -right-2 opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none'>
          <BookMarkedIcon className='w-4 h-4 text-tekhelet-400' />
        </div>

        <div
          className={`select-text cursor-text transition-colors hover:bg-selective-yellow-50 ${className}`}
          onMouseUp={handleTextSelection}
          data-selectable-content='true'
          dangerouslySetInnerHTML={{ __html: content }}
          title='Select text to add to vocabulary'
        />
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
