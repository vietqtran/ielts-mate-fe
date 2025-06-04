'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreatePassageRequest, Question, QuestionGroup } from '@/types/reading-passage.types';
import { Loader2, Minus, Plus, Save, Settings, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { readingPassageAPI } from '@/lib/api/reading-passages';
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

const QUESTION_TYPES = [
  { value: 1, label: 'Multiple Choice' },
  { value: 2, label: 'Fill in the Blank' },
  { value: 3, label: 'Drag and Drop' },
  { value: 4, label: 'Matching' },
];

const QUESTION_CATEGORIES = [
  'Reading for gist',
  'Reading for detail',
  'Reading for inference',
  'Reading for opinion',
  'Reading for structure',
];

// Question Form Component
const QuestionForm = ({
  question,
  index,
  onUpdate,
  onRemove,
}: {
  question: Partial<Question>;
  index: number;
  onUpdate: (index: number, field: keyof Question, value: any) => void;
  onRemove: (index: number) => void;
}) => {
  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-lg'>Question {question.question_order}</CardTitle>
          <Button size='sm' variant='destructive' onClick={() => onRemove(index)}>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label htmlFor={`question_order_${index}`}>Question Order *</Label>{' '}
            <Input
              id={`question_order_${index}`}
              type='number'
              value={question.question_order ?? ''}
              onChange={(e) => onUpdate(index, 'question_order', parseInt(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor={`point_${index}`}>Points *</Label>
            <Input
              id={`point_${index}`}
              type='number'
              value={question.point ?? ''}
              onChange={(e) => onUpdate(index, 'point', parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`question_type_${index}`}>Question Type *</Label>
          <Select
            value={question.question_type?.toString()}
            onValueChange={(value) => onUpdate(index, 'question_type', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select question type' />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value.toString()}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`explanation_${index}`}>Question Text/Explanation *</Label>{' '}
          <Textarea
            id={`explanation_${index}`}
            value={question.explanation ?? ''}
            onChange={(e) => onUpdate(index, 'explanation', e.target.value)}
            required
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor={`instruction_${index}`}>Instruction</Label>
          <Textarea
            id={`instruction_${index}`}
            value={question.instruction ?? ''}
            onChange={(e) => onUpdate(index, 'instruction', e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <Label>Question Categories</Label>
          <div className='flex flex-wrap gap-2 mt-2'>
            {QUESTION_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={question.question_category?.includes(category) ? 'default' : 'outline'}
                className='cursor-pointer'
                onClick={() => {
                  const categories = question.question_category || [];
                  const newCategories = categories.includes(category)
                    ? categories.filter((c) => c !== category)
                    : [...categories, category];
                  onUpdate(index, 'question_category', newCategories);
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Question type specific fields */}
        {question.question_type === 1 && (
          <div>
            <Label htmlFor={`instruction_for_choice_${index}`}>Choice Instruction</Label>{' '}
            <Textarea
              id={`instruction_for_choice_${index}`}
              value={question.instruction_for_choice ?? ''}
              onChange={(e) => onUpdate(index, 'instruction_for_choice', e.target.value)}
              rows={2}
            />
          </div>
        )}

        {question.question_type === 2 && (
          <>
            <div>
              <Label htmlFor={`blank_index_${index}`}>Blank Index</Label>{' '}
              <Input
                id={`blank_index_${index}`}
                type='number'
                value={question.blank_index ?? ''}
                onChange={(e) => onUpdate(index, 'blank_index', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor={`correct_answer_${index}`}>Correct Answer</Label>
              <Input
                id={`correct_answer_${index}`}
                value={question.correct_answer ?? ''}
                onChange={(e) => onUpdate(index, 'correct_answer', e.target.value)}
              />
            </div>
          </>
        )}

        {question.question_type === 3 && (
          <>
            <div>
              <Label htmlFor={`zone_index_${index}`}>Zone Index</Label>{' '}
              <Input
                id={`zone_index_${index}`}
                type='number'
                value={question.zone_index ?? ''}
                onChange={(e) => onUpdate(index, 'zone_index', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor={`drag_item_${index}`}>Drag Item</Label>
              <Input
                id={`drag_item_${index}`}
                value={question.drag_item ?? ''}
                onChange={(e) => onUpdate(index, 'drag_item', e.target.value)}
              />
            </div>
          </>
        )}

        {question.question_type === 4 && (
          <>
            <div>
              <Label htmlFor={`instruction_for_matching_${index}`}>Matching Instruction</Label>{' '}
              <Textarea
                id={`instruction_for_matching_${index}`}
                value={question.instruction_for_matching ?? ''}
                onChange={(e) => onUpdate(index, 'instruction_for_matching', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor={`correct_answer_for_matching_${index}`}>
                Correct Answer for Matching
              </Label>
              <Textarea
                id={`correct_answer_for_matching_${index}`}
                value={question.correct_answer_for_matching ?? ''}
                onChange={(e) => onUpdate(index, 'correct_answer_for_matching', e.target.value)}
                rows={2}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor={`number_of_correct_answer_${index}`}>Number of Correct Answers</Label>{' '}
          <Input
            id={`number_of_correct_answer_${index}`}
            type='number'
            value={question.number_of_correct_answer ?? ''}
            onChange={(e) => onUpdate(index, 'number_of_correct_answer', parseInt(e.target.value))}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default function CreatePassagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [passageData, setPassageData] = useState({
    ielts_type: 1,
    part_number: 1,
    instruction: '',
    title: '',
    content: '',
    content_with_highlight_keyword: '',
    passage_status: 1,
  });
  // State for questions
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);

  // State for managing drop zones and enable/disable
  const [enableDropZones, setEnableDropZones] = useState(false);
  const [dropZones, setDropZones] = useState<{ id: number; label: string }[]>([]);
  const nextDropZoneIdRef = useRef(1);
  const handlePassageChange = (field: keyof typeof passageData, value: any) => {
    setPassageData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-sync drop zones when content changes (only if dropzones are enabled)
    if (field === 'content' && enableDropZones) {
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
    setDropZones(uniqueZones); // Update next ID to be the smallest available ID starting from 1
    const existingIds = uniqueZones.map((z) => z.id).sort((a, b) => a - b);
    let nextId = 1;
    for (const id of existingIds) {
      if (id === nextId) {
        nextId++;
      } else {
        break;
      }
    }
    nextDropZoneIdRef.current = nextId;
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
    nextDropZoneIdRef.current = newId + 1;
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
    setDropZones(reindexedZones); // Update nextDropZoneId to be the smallest available ID starting from 1
    const newExistingIds = reindexedZones.map((z) => z.id).sort((a, b) => a - b);
    let nextId = 1;
    for (const existingId of newExistingIds) {
      if (existingId === nextId) {
        nextId++;
      } else {
        break;
      }
    }
    nextDropZoneIdRef.current = nextId;

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

  // Question management functions
  const addQuestion = () => {
    const newQuestion: Partial<Question> = {
      question_order: questions.length + 1,
      point: 1,
      question_type: 1,
      question_category: [],
      explanation: '',
      number_of_correct_answer: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Re-order remaining questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      question_order: i + 1,
    }));
    setQuestions(reorderedQuestions);
  };
  const handleSave = async () => {
    try {
      setLoading(true);

      // Prepare question groups
      const questionGroups: QuestionGroup[] = [];

      if (questions.length > 0) {
        // Create a single question group containing all questions
        const questionGroup: QuestionGroup = {
          section_label: 'Questions',
          section_order: 1,
          instruction: passageData.instruction,
          questions: questions
            .filter((q) => q.explanation)
            .map(
              (question) =>
                ({
                  question_order: question.question_order ?? 1,
                  point: question.point ?? 1,
                  question_type: question.question_type ?? 1,
                  question_category: question.question_category ?? [],
                  explanation: question.explanation!,
                  number_of_correct_answer: question.number_of_correct_answer ?? 1,
                  instruction: question.instruction,
                  instruction_for_choice: question.instruction_for_choice,
                  blank_index: question.blank_index,
                  correct_answer: question.correct_answer,
                  instruction_for_matching: question.instruction_for_matching,
                  correct_answer_for_matching: question.correct_answer_for_matching,
                  zone_index: question.zone_index,
                  drag_item: question.drag_item,
                }) as Question
            ),
          drag_item: questions
            .filter((q) => q.question_type === 3 && q.drag_item)
            .map((q) => q.drag_item!),
        };

        questionGroups.push(questionGroup);
      }

      const requestData: CreatePassageRequest = {
        ietls_type: passageData.ielts_type,
        part_number: passageData.part_number,
        instruction: passageData.instruction,
        title: passageData.title,
        content: passageData.content,
        passage_status: passageData.passage_status,
        content_with_hight_light_keyword: passageData.content_with_highlight_keyword,
        question_groups: questionGroups,
      };

      // Create passage with question groups
      const passageResponse = await readingPassageAPI.createPassage(requestData);

      if (passageResponse.status === 'success') {
        if (questions.length > 0) {
          toast.success(`Reading passage created with ${questions.length} questions successfully.`);
        } else {
          toast.success('Reading passage created successfully.');
        }
        router.push('/admin/reading-passage');
      }
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
            <p className='text-gray-600'>Add a new IELTS reading passage with questions</p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={() => handleSave()} disabled={loading}>
              {loading ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                <Save className='h-4 w-4 mr-2' />
              )}
              Save Passage & Questions
            </Button>
          </div>
        </div>

        <div className='space-y-6'>
          {/* Passage Information */}
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
                    value={passageData.ielts_type.toString()}
                    onValueChange={(value) =>
                      handlePassageChange('ielts_type', Number.parseInt(value))
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
              </div>
            </CardContent>
          </Card>

          {/* Passage Content */}
          <Card>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle>Passage Content</CardTitle>
                <div className='flex items-center space-x-2'>
                  <Settings className='h-4 w-4' />
                  <Label htmlFor='enable-dropzones' className='text-sm font-medium'>
                    Enable Drop Zones
                  </Label>
                  <Switch
                    id='enable-dropzones'
                    checked={enableDropZones}
                    onCheckedChange={setEnableDropZones}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Drop Zone Management - Only show when enabled */}
              {enableDropZones && (
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
                          Chưa có drop zone nào. Nhấn &quot;Add Drop Zone&quot; để tạo.
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
              )}

              <div className='space-y-2'>
                <Label htmlFor='content'>Content</Label>
                <div className='space-y-2'>
                  <Textarea
                    ref={contentTextareaRef}
                    id='content'
                    placeholder={
                      enableDropZones
                        ? "Nhập nội dung đoạn văn. Chọn vị trí cần chèn drop zone rồi nhấn nút 'Insert to Content' ở trên..."
                        : 'Nhập nội dung đoạn văn...'
                    }
                    value={passageData.content}
                    onChange={(e) => handlePassageChange('content', e.target.value)}
                    rows={10}
                    className='min-h-[200px] font-mono text-sm'
                  />
                  {enableDropZones && (
                    <div className='text-xs text-gray-500'>
                      💡 Tip: Chọn đoạn text cần thay thế bằng drop zone, sau đó nhấn &quot;Insert
                      to Content&quot;
                    </div>
                  )}
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

              {/* Preview - Only show when there's content and dropzones enabled */}
              {passageData.content && enableDropZones && (
                <div className='space-y-2'>
                  <Label>Preview (với Drop Zones)</Label>
                  <div className='bg-white p-4 border rounded min-h-[100px]'>
                    {previewPassageWithDropZones()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle>Questions ({questions.length})</CardTitle>
                <Button onClick={addQuestion}>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {questions.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    <p className='mb-4'>No questions added yet</p>
                    <p className='text-sm'>Add questions to this passage to make it complete</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <QuestionForm
                      key={`question-${question.question_order ?? index}`}
                      question={question}
                      index={index}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
