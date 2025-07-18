interface ExamsTabControllerProps {
  params: Promise<{ tabs: string }>;
}

const ExamsTabController = async ({ params }: ExamsTabControllerProps) => {
  const { tabs } = await params;

  switch (tabs) {
    case 'reading':
      return <div>Reading Exams History</div>; // reading exams component
    case 'listening':
      return <div>Listening Exams History</div>;
    default:
      return <div>Exams History</div>;
  }
};

export default ExamsTabController;
