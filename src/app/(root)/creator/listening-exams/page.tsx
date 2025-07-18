'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  ListeningExamRequest,
  activateListeningExam,
  createListeningExam,
  deleteListeningExam,
  fetchListeningExams,
  updateListeningExam,
} from '@/lib/api/listening-exams';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CreatorListeningExamsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [editingExam, setEditingExam] = useState<any>(null);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const data = await fetchListeningExams();
      setExams(data || []);
    } catch (error) {
      console.error('Failed to fetch listening exams:', error);
      toast.error('Failed to fetch listening exams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
    });
    setSelectedTasks([]);
    setEditingExam(null);
  };

  const createOrUpdateExam = async () => {
    if (!formData.title) {
      toast.error('Exam title is required');
      return;
    }
    if (selectedTasks.length === 0) {
      toast.error('Please select at least one listening task');
      return;
    }
    try {
      setIsLoading(true);
      const tasksWithPartNumbers = selectedTasks.map((taskId, index) => ({
        id: taskId,
        partNumber: index,
      }));
      const payload: ListeningExamRequest = {
        title: formData.title,
        description: formData.description,
        tasks: tasksWithPartNumbers,
      };
      if (editingExam) {
        await updateListeningExam(editingExam.id, payload);
        toast.success('Listening exam updated successfully');
      } else {
        await createListeningExam(payload);
        toast.success('Listening exam created successfully');
      }
      resetForm();
      fetchExams();
    } catch (error) {
      console.error('Failed to save listening exam:', error);
      toast.error('Failed to save listening exam');
    } finally {
      setIsLoading(false);
    }
  };

  const removeExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      setIsLoading(true);
      await deleteListeningExam(examId);
      toast.success('Listening exam deleted successfully');
      fetchExams();
    } catch (error) {
      console.error('Failed to delete listening exam:', error);
      toast.error('Failed to delete listening exam');
    } finally {
      setIsLoading(false);
    }
  };

  const editExam = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      title: exam.exam_name || '',
      description: exam.exam_description || '',
    });
    // Set selected tasks based on part1-4
    const taskIds = [exam.part1, exam.part2, exam.part3, exam.part4]
      .filter((part) => part && part.task_id)
      .map((part) => part.task_id);
    setSelectedTasks(taskIds);
  };

  const activateExamHandler = async (examId: string, active: boolean) => {
    try {
      setIsLoading(true);
      await activateListeningExam(examId, active);
      toast.success(`Exam ${active ? 'activated' : 'deactivated'} successfully`);
      fetchExams();
    } catch (error) {
      console.error('Failed to update exam status:', error);
      toast.error('Failed to update exam status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Manage Listening Exams</h1>
        <Dialog onOpenChange={(open) => !open && resetForm()}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className='mr-2 h-4 w-4' />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {editingExam ? 'Edit Listening Exam' : 'Create New Listening Exam'}
              </DialogTitle>
              <DialogDescription>
                {editingExam
                  ? 'Update this listening exam with your changes'
                  : 'Create a new listening exam by grouping tasks together'}
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='title' className='text-right'>
                  Exam Title
                </Label>
                <Input
                  id='title'
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  className='col-span-3'
                  placeholder='e.g., IELTS Listening Test 1'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='description' className='text-right'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  className='col-span-3'
                  placeholder='Provide a brief description of this exam...'
                  rows={3}
                />
              </div>
              <div className='grid grid-cols-1 gap-4 mt-4'>
                <Label>Select Listening Tasks</Label>
                <p className='text-sm text-muted-foreground'>
                  Tasks will be organized as parts in the order you select them. Select up to 4
                  tasks.
                </p>
                {isLoading ? (
                  <div className='flex justify-center py-4'>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className='max-h-[300px] overflow-y-auto border rounded-md p-4'>
                    {tasks.length === 0 ? (
                      <p className='text-center py-4 text-muted-foreground'>
                        No listening tasks available. Please create some first.
                      </p>
                    ) : (
                      tasks.map((task, index) => (
                        <div
                          key={task.id}
                          className='flex items-center space-x-2 py-2 border-b last:border-0'
                        >
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={() => handleTaskSelection(task.id)}
                          />
                          <Label
                            htmlFor={`task-${task.id}`}
                            className='flex-1 cursor-pointer flex items-center'
                          >
                            <span className='mr-2'>
                              {task.title || `Listening Task ${index + 1}`}
                            </span>
                            {selectedTasks.includes(task.id) && (
                              <Badge variant='outline' className='ml-2'>
                                Part {selectedTasks.indexOf(task.id) + 1}
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button onClick={createOrUpdateExam} disabled={isLoading}>
                {isLoading ? (
                  <div className='mr-2'>
                    <LoadingSpinner />
                  </div>
                ) : null}
                {editingExam ? 'Update Exam' : 'Create Exam'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Listening Exams</CardTitle>
          <CardDescription>Manage IELTS listening exams for your students</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && exams.length === 0 ? (
            <div className='flex justify-center py-8'>
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-6'>
                      No listening exams found. Create your first one!
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.listening_exam_id}>
                      <TableCell className='font-medium'>
                        {exam.exam_name || 'Untitled Exam'}
                      </TableCell>
                      <TableCell className='max-w-xs truncate'>
                        {exam.exam_description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-1'>
                          {[exam.part1, exam.part2, exam.part3, exam.part4].map((part, idx) =>
                            part && part.task_id ? (
                              <Badge key={part.task_id} variant='outline'>
                                Part {idx + 1}: {part.title || 'No title'}
                              </Badge>
                            ) : null
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={exam.is_current ? 'default' : 'secondary'}>
                          {exam.is_current ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() =>
                              activateExamHandler(exam.listening_exam_id, !exam.is_current)
                            }
                          >
                            <Eye className={`h-4 w-4 ${exam.is_current ? 'text-green-500' : ''}`} />
                          </Button>
                          <Dialog onOpenChange={(open) => !open && resetForm()}>
                            <DialogTrigger asChild>
                              <Button variant='outline' size='icon' onClick={() => editExam(exam)}>
                                <Pencil className='h-4 w-4' />
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => removeExam(exam.listening_exam_id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
