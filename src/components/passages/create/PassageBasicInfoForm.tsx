'use client';

import { ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { IeltsType, PassageStatus } from '@/types/reading.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { UseFormReturn } from 'react-hook-form';

interface PassageBasicInfoFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isCompleted: boolean;
}

const getIeltsTypeLabel = (type: IeltsType): string => {
  switch (type) {
    case IeltsType.ACADEMIC:
      return 'Academic';
    case IeltsType.GENERAL_TRAINING:
      return 'General Training';
    default:
      return 'Unknown';
  }
};

const getStatusLabel = (status: PassageStatus): string => {
  switch (status) {
    case PassageStatus.DRAFT:
      return 'Draft';
    case PassageStatus.PUBLISHED:
      return 'Published';
    case PassageStatus.TEST:
      return 'Test';
    default:
      return 'Unknown';
  }
};

export function PassageBasicInfoForm({ 
  form, 
  onSubmit, 
  isLoading, 
  isCompleted 
}: PassageBasicInfoFormProps) {
  const formData = form.getValues();

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle>Passage Information - Completed</CardTitle>
            </div>
            <Button variant="outline" onClick={() => form.reset()}>
              Edit Information
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg">{formData.title}</h3>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">
                  {getIeltsTypeLabel(formData.ieltsType)}
                </Badge>
                <Badge variant="outline">
                  Part {formData.partNumber}
                </Badge>
                <Badge variant="outline">
                  {getStatusLabel(formData.passageStatus)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Instruction</p>
              <p className="text-sm mt-1">{formData.instruction}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Reading Content</p>
            <div 
              className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-md max-h-40 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>

          <div className="flex justify-end">
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Passage created successfully. You can now add question groups.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Passage Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the basic information and content for your IELTS reading passage
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passage Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., The Future of Renewable Energy" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ieltsType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IELTS Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select IELTS type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={IeltsType.ACADEMIC}>Academic</SelectItem>
                        <SelectItem value={IeltsType.GENERAL_TRAINING}>General Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select part number" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Part 1 (Easy)</SelectItem>
                        <SelectItem value="2">Part 2 (Medium)</SelectItem>
                        <SelectItem value="3">Part 3 (Hard)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Part 1: Simple factual texts | Part 2: Descriptive texts | Part 3: Complex analytical texts
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passageStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PassageStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={PassageStatus.TEST}>Test</SelectItem>
                        <SelectItem value={PassageStatus.PUBLISHED}>Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Instruction *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the general instruction for this reading passage (e.g., 'Read the passage and answer questions 1-13')"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Passage Content *</FormLabel>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Enter the reading passage content. You can format the text with paragraphs, headings, and emphasis."
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Tip: For IELTS passages, aim for 700-1000 words. Include clear paragraph divisions (A, B, C, etc.) for matching questions.
                  </p>
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">IELTS Reading Passage Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Academic passages: Scientific articles, academic journals, books</li>
                <li>• General Training passages: Advertisements, notices, magazines, newspapers</li>
                <li>• Length: 700-1000 words with clear paragraph structure</li>
                <li>• Include varied vocabulary appropriate to the IELTS level</li>
                <li>• Consider different question types when structuring content</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? 'Creating Passage...' : 'Create Passage & Continue'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}