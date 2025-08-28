import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Reading Practice',
};

export default async function ReadingIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/reading/${id}/practice`);
}
