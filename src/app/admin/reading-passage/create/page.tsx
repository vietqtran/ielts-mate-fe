'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreatePassageRequest, readingPassageAPI } from '@/lib/api/reading-passages';
import { Loader2, Minus, Plus, Save } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Constants for IELTS types and status
const IELTS_TYPES = [
  { value: 1, label: 'Academic' },
  { value: 2, label: 'General Training' },
];

const PASSAGE_STATUS = [
  { value: 1, label: 'Draft' },
  { value: 2, label: 'Published' },
  { value: 3, label: 'Archived' },
  { value: 4, label: 'Test' },
];

export default function CreatePassagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [passageData, setPassageData] = useState({
    ietls_type: 1,
    part_number: 1,
    instruction: '',
    title: '',
    content: '',
    content_with_highlight_keyword: '',
    passage_status: 1,
  });

  // State for managing drop zones
  const [dropZones, setDropZones] = useState<{ id: number; label: string }[]>([]);
  const [_nextDropZoneId, setNextDropZoneId] = useState(1);

  const handlePassageChange = (field: keyof typeof passageData, value: any) => {
    setPassageData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-sync drop zones when content changes
    if (field === 'content') {
      syncDropZonesFromContent(value);
    }
  };
  // Function to extract and sync drop zones from content
  const syncDropZonesFromContent = (content: string) => {
    const matches = content.match(/\[DROP_ZONE:\d+\]/g) || [];
    const foundZones = matches.map((match) => {
      const idMatch = /\[DROP_ZONE:(\d+)\]/.exec(match);
      const id = idMatch ? Number.parseInt(idMatch[1]) : 0;
      return { id, label: `Zone ${id}` };
    });

    // Remove duplicates
    const uniqueZones = foundZones.filter(
      (zone, index, self) => index === self.findIndex((z) => z.id === zone.id)
    );
    // Update drop zones state
    setDropZones(uniqueZones);

    // Update next ID to be the smallest available ID starting from 1
    const existingIds = uniqueZones.map((z) => z.id).sort((a, b) => a - b);
    let nextId = 1;
    for (const id of existingIds) {
      if (id === nextId) {
        nextId++;
      } else {
        break;
      }
    }
    setNextDropZoneId(nextId);
  };
  // Drop zone management functions
  const addDropZone = () => {
    // Find the smallest available ID starting from 1
    const existingIds = dropZones.map((zone) => zone.id).sort((a, b) => a - b);
    let newId = 1;
    for (const id of existingIds) {
      if (id === newId) {
        newId++;
      } else {
        break;
      }
    }

    const newDropZone = { id: newId, label: `Zone ${newId}` };
    setDropZones([...dropZones, newDropZone]);
    setNextDropZoneId(newId + 1);
  };
  const removeDropZone = (id: number) => {
    // First, check if this drop zone exists in content
    const dropZoneTag = `[DROP_ZONE:${id}]`;
    const existsInContent = passageData.content.includes(dropZoneTag);
    const existsInHighlight = passageData.content_with_highlight_keyword.includes(dropZoneTag);

    // Remove from drop zones list
    const remainingZones = dropZones.filter((zone) => zone.id !== id); // Re-index remaining zones starting from 1
    const reindexedZones = remainingZones.map((_zone, index) => ({
      id: index + 1,
      label: `Zone ${index + 1}`,
    }));
    setDropZones(reindexedZones);

    // Update nextDropZoneId to be the smallest available ID starting from 1
    const newExistingIds = reindexedZones.map((z) => z.id).sort((a, b) => a - b);
    let nextId = 1;
    for (const existingId of newExistingIds) {
      if (existingId === nextId) {
        nextId++;
      } else {
        break;
      }
    }
    setNextDropZoneId(nextId);

    // Create mapping for old IDs to new IDs
    const idMapping: { [key: number]: number } = {};
    remainingZones.forEach((zone, index) => {
      idMapping[zone.id] = index + 1;
    });

    // Update content by removing the deleted zone and re-indexing others
    let updatedContent = passageData.content;
    let updatedHighlightContent = passageData.content_with_highlight_keyword;

    // Remove the deleted drop zone
    const escapedTag = dropZoneTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updatedContent = updatedContent.replace(new RegExp(escapedTag, 'g'), '');
    updatedHighlightContent = updatedHighlightContent.replace(new RegExp(escapedTag, 'g'), '');

    // Re-index remaining drop zones in content
    Object.entries(idMapping).forEach(([oldId, newId]) => {
      const oldTag = `[DROP_ZONE:${oldId}]`;
      const newTag = `[DROP_ZONE:${newId}]`;
      const escapedOldTag = oldTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      updatedContent = updatedContent.replace(new RegExp(escapedOldTag, 'g'), newTag);
      updatedHighlightContent = updatedHighlightContent.replace(
        new RegExp(escapedOldTag, 'g'),
        newTag
      );
    });

    // Update the content
    setPassageData((prev) => ({
      ...prev,
      content: updatedContent,
      content_with_highlight_keyword: updatedHighlightContent,
    }));

    // Show appropriate message
    if (existsInContent || existsInHighlight) {
      toast.success(`Drop zone ${id} đã được xóa và các zone còn lại đã được đánh số lại`);
    } else {
      toast.success(`Drop zone ${id} đã được xóa khỏi danh sách`);
    }
  };

  const insertDropZoneInContent = (zoneId: number, targetTextarea: 'content' | 'highlight') => {
    const textarea =
      targetTextarea === 'content' ? contentTextareaRef.current : highlightTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const field = targetTextarea === 'content' ? 'content' : 'content_with_highlight_keyword';
    const currentValue = passageData[field];

    const dropZoneTag = `[DROP_ZONE:${zoneId}]`;

    // Check if this drop zone already exists in the content
    if (currentValue.includes(dropZoneTag)) {
      toast.warning(`Drop zone ${zoneId} đã tồn tại trong nội dung này`);
      return;
    }

    const newValue = currentValue.slice(0, start) + dropZoneTag + currentValue.slice(end);

    handlePassageChange(field, newValue);

    // Set cursor position after the inserted drop zone
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + dropZoneTag.length, start + dropZoneTag.length);
    }, 0);

    toast.success(
      `Drop zone ${zoneId} đã được chèn vào ${targetTextarea === 'content' ? 'nội dung chính' : 'nội dung highlight'}`
    );
  };

  const previewPassageWithDropZones = () => {
    const dropZoneRegex = /(\[DROP_ZONE:[^\]]+\])/g;
    const parts = passageData.content.split(dropZoneRegex);

    return (
      <div className='prose max-w-none'>
        {parts.map((part, index) => {
          const dropZoneMatch = /\[DROP_ZONE:[^\]]+\]/.exec(part);
          if (dropZoneMatch) {
            const idMatch = /\[DROP_ZONE:([^\]]+)\]/.exec(part);
            const dropZoneId = idMatch?.[1] ?? '';
            return (
              <span
                key={`dropzone-${dropZoneId}-${index}`}
                className='inline-flex items-center gap-1 px-3 py-1 mx-1 rounded border-2 border-dashed bg-blue-100 text-blue-800 border-blue-300'
              >
                [{dropZoneId}]
              </span>
            );
          }
          return <span key={`text-part-${part.slice(0, 10)}-${index}`}>{part}</span>;
        })}
      </div>
    );
  };

  const handleSave = async (status: number) => {
    try {
      setLoading(true); // Update status before saving
      const updatedPassageData = {
        ...passageData,
        passage_status: status,
      };

      const requestData: CreatePassageRequest = {
        ietls_type: updatedPassageData.ietls_type,
        part_number: updatedPassageData.part_number,
        instruction: updatedPassageData.instruction,
        title: updatedPassageData.title,
        content: updatedPassageData.content,
        passage_status: updatedPassageData.passage_status,
        content_with_highlight_keywords: updatedPassageData.content_with_highlight_keyword,
      };

      await readingPassageAPI.createPassage(requestData);

      toast.success('Reading passage created successfully.');

      router.push('/admin/reading-passage');
    } catch (error) {
      console.error('Failed to create passage:', error);
      toast.error('Failed to create reading passage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Create Reading Passage</h1>
            <p className='text-gray-600'>Add a new IELTS reading passage</p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => handleSave(1)} disabled={loading}>
              {loading ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : null}
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(2)} disabled={loading}>
              {loading ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                <Save className='h-4 w-4 mr-2' />
              )}
              Save & Publish
            </Button>
          </div>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Passage Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>Title</Label>
                  <Input
                    id='title'
                    placeholder='Enter passage title'
                    value={passageData.title}
                    onChange={(e) => handlePassageChange('title', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='part_number'>Part Number</Label>
                  <Input
                    id='part_number'
                    type='number'
                    min='1'
                    max='3'
                    placeholder='1-3'
                    value={passageData.part_number}
                    onChange={(e) =>
                      handlePassageChange('part_number', Number.parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='ielts_type'>IELTS Type</Label>
                  <Select
                    value={passageData.ietls_type.toString()}
                    onValueChange={(value) =>
                      handlePassageChange('ietls_type', Number.parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select IELTS type' />
                    </SelectTrigger>
                    <SelectContent>
                      {IELTS_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value.toString()}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={passageData.passage_status.toString()}
                    onValueChange={(value) =>
                      handlePassageChange('passage_status', Number.parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      {PASSAGE_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value.toString()}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='instruction'>Instruction</Label>
                <Textarea
                  id='instruction'
                  placeholder='Enter instructions for this passage'
                  value={passageData.instruction}
                  onChange={(e) => handlePassageChange('instruction', e.target.value)}
                  rows={3}
                />
              </div>{' '}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passage Content</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Drop Zone Management */}
              <Card className='bg-blue-50 border-blue-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    🎯 Drop Zone Manager
                    <Button size='sm' onClick={addDropZone} className='ml-auto'>
                      <Plus className='h-4 w-4 mr-1' />
                      Add Drop Zone
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <p className='text-sm text-gray-600'>
                      Tạo các drop zone và chèn vào đoạn văn. Học sinh sẽ kéo thả đáp án vào các
                      vùng này.
                    </p>

                    {dropZones.length === 0 ? (
                      <div className='text-center py-4 text-gray-500'>
                        Chưa có drop zone nào. Nhấn "Add Drop Zone" để tạo.
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {dropZones.map((zone) => (
                          <div
                            key={zone.id}
                            className='flex items-center gap-2 p-3 bg-white rounded border'
                          >
                            <span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
                              [DROP_ZONE:{zone.id}]
                            </span>
                            <div className='flex gap-1 ml-auto'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => insertDropZoneInContent(zone.id, 'content')}
                                title='Chèn vào nội dung chính'
                              >
                                Insert to Content
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => insertDropZoneInContent(zone.id, 'highlight')}
                                title='Chèn vào nội dung có highlight'
                              >
                                Insert to Highlight
                              </Button>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => removeDropZone(zone.id)}
                              >
                                <Minus className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className='space-y-2'>
                <Label htmlFor='content'>Content</Label>
                <div className='space-y-2'>
                  <Textarea
                    ref={contentTextareaRef}
                    id='content'
                    placeholder="Nhập nội dung đoạn văn. Chọn vị trí cần chèn drop zone rồi nhấn nút 'Insert to Content' ở trên..."
                    value={passageData.content}
                    onChange={(e) => handlePassageChange('content', e.target.value)}
                    rows={10}
                    className='min-h-[200px] font-mono text-sm'
                  />
                  <div className='text-xs text-gray-500'>
                    💡 Tip: Chọn đoạn text cần thay thế bằng drop zone, sau đó nhấn "Insert to
                    Content"
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='content_with_highlight'>Content with Highlighted Keywords</Label>
                <div className='space-y-2'>
                  <Textarea
                    ref={highlightTextareaRef}
                    id='content_with_highlight'
                    placeholder='Nhập nội dung có từ khóa được highlight (thường giống với content chính)...'
                    value={passageData.content_with_highlight_keyword}
                    onChange={(e) =>
                      handlePassageChange('content_with_highlight_keyword', e.target.value)
                    }
                    rows={10}
                    className='min-h-[200px] font-mono text-sm'
                  />
                </div>
              </div>

              {/* Preview */}
              {passageData.content && (
                <div className='space-y-2'>
                  <Label>Preview (với Drop Zones)</Label>
                  <div className='bg-white p-4 border rounded min-h-[100px]'>
                    {previewPassageWithDropZones()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
