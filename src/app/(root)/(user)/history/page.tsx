import { redirect } from 'next/navigation';

export const metadata = {
  title: 'History',
};

export default async function HistoryController() {
  redirect(`/history/practices/reading`);
}
