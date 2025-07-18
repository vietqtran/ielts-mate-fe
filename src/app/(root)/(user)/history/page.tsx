import { redirect } from 'next/navigation';

export default async function HistoryController() {
  redirect(`/history/practices/reading`);
}
