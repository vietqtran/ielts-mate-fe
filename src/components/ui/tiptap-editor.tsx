'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import {
  Bold as BoldIcon,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic as ItalicIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Bold from '@tiptap/extension-bold';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({ content, onChange, placeholder, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
          className
        ),
      },
    },
  });

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) {
    return null;
  }

  const isTableActive = editor.isActive('table');

  return (
    <div className='border border-input rounded-md'>
      <div className='border-b border-input p-2 flex gap-1 flex-wrap'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
        >
          <BoldIcon className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
        >
          <ItalicIcon className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-muted')}
        >
          <UnderlineIcon className='h-4 w-4' />
        </Button>
        <div className='w-px h-8 bg-border mx-1' />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 1 }) && 'bg-muted')}
        >
          <Heading1 className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
        >
          <Heading2 className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 3 }) && 'bg-muted')}
        >
          <Heading3 className='h-4 w-4' />
        </Button>
        <div className='w-px h-8 bg-border mx-1' />
        <Button type='button' variant='ghost' size='sm' onClick={addImage} className='h-8 w-8 p-0'>
          <ImageIcon className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={insertTable}
          className={cn('h-8 w-8 p-0', isTableActive && 'bg-muted')}
        >
          <TableIcon className='h-4 w-4' />
        </Button>

        {/* Table controls - only show when table is active */}
        {isTableActive && (
          <>
            <div className='w-px h-8 bg-border mx-1' />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className='h-8 px-2 text-xs'
              title='Add column before'
            >
              +Col
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className='h-8 px-2 text-xs'
              title='Add row before'
            >
              +Row
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className='h-8 px-2 text-xs'
              title='Delete column'
            >
              -Col
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => editor.chain().focus().deleteRow().run()}
              className='h-8 px-2 text-xs'
              title='Delete row'
            >
              -Row
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => editor.chain().focus().deleteTable().run()}
              className='h-8 px-2 text-xs text-red-600 hover:text-red-700'
              title='Delete table'
            >
              Del
            </Button>
          </>
        )}
      </div>
      <div className='min-h-[200px]'>
        <EditorContent editor={editor} className='prose max-w-none' placeholder={placeholder} />
      </div>
    </div>
  );
}
