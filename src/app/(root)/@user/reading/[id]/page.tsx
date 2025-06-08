import { redirect } from 'next/navigation';

export default function ReadingIdPage({ params }: { params: { id: string } }) {
  redirect(`/reading/${params.id}/practice`);
}
