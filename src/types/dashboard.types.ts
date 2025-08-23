export interface DashboardOverviewData {
  reading: {
    exam: number;
    task: number;
    total_exams: number;
    total_tasks: number;
  };
  listening: {
    exam: number;
    task: number;
    total_exams: number;
    total_tasks: number;
  };
  band_stats: {
    start_date: string;
    end_date: string;
    time_frame: string;
    average_reading_band: number | null;
    average_listening_band: number | null;
    average_overall_band: number | null;
    number_of_reading_exams: number;
    number_of_listening_exams: number;
  };
  last_learning_date: string;
}

export interface DashboardOverviewResponse {
  status: string;
  message: string | null;
  data: DashboardOverviewData;
}

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';
