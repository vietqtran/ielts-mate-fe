import { redirect } from 'next/navigation';

export default async function ReadingIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/listening/${id}/practice`);
}
