'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Highlighter, Plus, Square } from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type React from 'react';

interface PassageEditorProps {
  content: string;
  onChange: (content: string) => void;
  onHighlightedContentChange?: (content: string) => void;
}

export function PassageEditor({
  content,
  onChange,
  onHighlightedContentChange,
}: PassageEditorProps) {
  const [_cursorPosition, setCursorPosition] = useState(0);
  const [highlightedContent, setHighlightedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertDropZone = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const dropZoneId = `drop-${Date.now()}`;
    const dropZoneText = `[DROP_ZONE:${dropZoneId}]`;

    const newContent = content.slice(0, start) + dropZoneText + content.slice(end);
    onChange(newContent);

    // Set cursor position after the inserted drop zone
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + dropZoneText.length, start + dropZoneText.length);
    }, 0);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);

    // If we have a highlighted content handler, update the highlighted version too
    if (onHighlightedContentChange) {
      setHighlightedContent(e.target.value);
      onHighlightedContentChange(e.target.value);
    }
  };

  const highlightSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return; // No selection

    const selectedText = content.slice(start, end);
    const highlightedText = `<mark>${selectedText}</mark>`;

    const newContent = content.slice(0, start) + selectedText + content.slice(end);
    const newHighlightedContent =
      highlightedContent.slice(0, start) + highlightedText + highlightedContent.slice(end);

    onChange(newContent);
    setHighlightedContent(newHighlightedContent);

    if (onHighlightedContentChange) {
      onHighlightedContentChange(newHighlightedContent);
    }
  };

  const renderPreview = () => {
    if (!content)
      return <p className='text-gray-500 italic'>Start typing your passage content...</p>;

    // Split content by drop zones and render them
    const parts = content.split(/(\[DROP_ZONE:[^\]]+\])/g);

    return (
      <div className='prose max-w-none'>
        {' '}
        {parts.map((part, index) => {
          if (part.match(/\[DROP_ZONE:[^\]]+\]/)) {
            const _dropZoneId = part.match(/\[DROP_ZONE:([^\]]+)\]/)?.[1] || '';
            return (
              <span
                key={index}
                className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded border-2 border-dashed border-blue-300 mx-1'
              >
                <Square className='h-3 w-3' />
                Drop Zone
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  const renderHighlightedPreview = () => {
    if (!highlightedContent)
      return <p className='text-gray-500 italic'>No highlighted content yet</p>;

    // Replace drop zones with visual elements
    const processedContent = highlightedContent.replace(
      /\[DROP_ZONE:[^\]]+\]/g,
      '<span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded border-2 border-dashed border-blue-300 mx-1">Drop Zone</span>'
    );

    return (
      <div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: processedContent }} />
    );
  };

  const getDropZones = () => {
    const matches = content.match(/\[DROP_ZONE:[^\]]+\]/g) || [];
    return matches.map((match) => {
      const id = match.match(/\[DROP_ZONE:([^\]]+)\]/)?.[1] || '';
      return { id, text: match };
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant='outline'>
            Words: {content.split(/\s+/).filter((word) => word.length > 0).length}
          </Badge>
          <Badge variant='outline'>Drop Zones: {getDropZones().length}</Badge>
        </div>
        <div className='flex gap-2'>
          <Button onClick={highlightSelection} variant='outline' size='sm'>
            <Highlighter className='h-4 w-4 mr-2' />
            Highlight Selection
          </Button>
          <Button onClick={insertDropZone} variant='outline' size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            Insert Drop Zone
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={textareaRef}
              placeholder="Enter your passage content here. Use the 'Insert Drop Zone' button to add areas where students can drop answers..."
              value={content}
              onChange={handleTextareaChange}
              className='min-h-[400px] font-mono text-sm'
            />
            <div className='mt-2 text-xs text-gray-500'>
              Tip: Place your cursor where you want to insert a drop zone, then click "Insert Drop
              Zone"
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='min-h-[400px] p-4 bg-gray-50 rounded border'>{renderPreview()}</div>
          </CardContent>
        </Card>
      </div>

      {onHighlightedContentChange && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Highlighted Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='min-h-[200px] p-4 bg-gray-50 rounded border'>
              {renderHighlightedPreview()}
            </div>
            <div className='mt-2 text-xs text-gray-500'>
              Select text and click "Highlight Selection" to mark important keywords
            </div>
          </CardContent>
        </Card>
      )}

      {getDropZones().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Drop Zones Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {getDropZones().map((zone, index) => (
                <div key={zone.id} className='flex items-center gap-2 p-2 bg-blue-50 rounded'>
                  <Badge variant='outline'>Zone {index + 1}</Badge>
                  <code className='text-sm bg-white px-2 py-1 rounded'>{zone.text}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
