import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Listening Practice',
};

export default async function ReadingIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/listening/${id}/practice`);
}
