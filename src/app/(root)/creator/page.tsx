'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import instance from '@/lib/axios';
import { format } from 'date-fns';
import {
  ClipboardCheck,
  Ear,
  FileText,
  Headphones,
  LayoutDashboard,
  RefreshCw,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type BranchDistributionItem = {
  branch_score: string;
  number_of_users: number;
  fill?: string;
};

type QuestionTypeCorrectItem = {
  question_type: number;
  correct_count: number;
  fill?: string;
};

type QuestionTypeWrongItem = {
  question_type: number;
  wrong_count: number;
  fill?: string;
};

type CreatorDashboardData = {
  number_of_reading_tasks: number;
  number_of_listening_tasks: number;
  number_of_reading_exams: number;
  number_of_listening_exams: number;
  users_in_avg_branch_score_reading: BranchDistributionItem[];
  users_in_avg_branch_score_listening: BranchDistributionItem[];
  question_type_stats_reading: QuestionTypeCorrectItem[];
  question_type_stats_listening: QuestionTypeCorrectItem[];
  question_type_stats_reading_wrong: QuestionTypeWrongItem[];
  question_type_stats_listening_wrong: QuestionTypeWrongItem[];
};

type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className='bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-tekhelet-900/10'>
      <CardContent className='p-5 flex items-center justify-between'>
        <div>
          <p className='text-sm text-tekhelet-500'>{title}</p>
          <p className='text-2xl font-bold text-tekhelet-400'>{value}</p>
        </div>
        <div className='p-3 bg-gradient-to-br from-tekhelet-900/20 to-tekhelet-800/5 rounded-xl border border-tekhelet-900/10'>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className='bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-tekhelet-900/10'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-tekhelet-400 text-base'>
          {title}
          {subtitle ? (
            <span className='block text-xs font-normal text-tekhelet-500 mt-1'>{subtitle}</span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-2'>{children}</CardContent>
    </Card>
  );
}

const Page = () => {
  const [data, setData] = useState<CreatorDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await instance.get<ApiResponse<CreatorDashboardData>>(
          '/personal/creator-dashboard/default',
          { signal: controller.signal, notify: false }
        );
        setData(data.data);
        // Initialize question-type charts from default payload
        setReadingCorrect(data.data.question_type_stats_reading || []);
        setReadingWrong(data.data.question_type_stats_reading_wrong || []);
        setListeningCorrect(data.data.question_type_stats_listening || []);
        setListeningWrong(data.data.question_type_stats_listening_wrong || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const readingBranchData = useMemo(() => data?.users_in_avg_branch_score_reading || [], [data]);
  const listeningBranchData = useMemo(
    () => data?.users_in_avg_branch_score_listening || [],
    [data]
  );
  const readingBranchTotal = useMemo(
    () => readingBranchData.reduce((s, d) => s + (d.number_of_users || 0), 0),
    [readingBranchData]
  );
  const listeningBranchTotal = useMemo(
    () => listeningBranchData.reduce((s, d) => s + (d.number_of_users || 0), 0),
    [listeningBranchData]
  );
  // Date ranges for question-type stats (separate per section)
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);
  const defaultTo = useMemo(() => new Date(), []);
  const [readingDateRange, setReadingDateRange] = useState<DateRange | undefined>({
    from: defaultFrom,
    to: defaultTo,
  });
  const [listeningDateRange, setListeningDateRange] = useState<DateRange | undefined>({
    from: defaultFrom,
    to: defaultTo,
  });

  // Question-type datasets loaded via dedicated endpoints
  const [readingCorrect, setReadingCorrect] = useState<QuestionTypeCorrectItem[]>([]);
  const [readingWrong, setReadingWrong] = useState<QuestionTypeWrongItem[]>([]);
  const [listeningCorrect, setListeningCorrect] = useState<QuestionTypeCorrectItem[]>([]);
  const [listeningWrong, setListeningWrong] = useState<QuestionTypeWrongItem[]>([]);
  const [readingStatsLoading, setReadingStatsLoading] = useState<boolean>(false);
  const [listeningStatsLoading, setListeningStatsLoading] = useState<boolean>(false);

  const formatDateParam = (d: Date) => format(d, 'yyyy-MM-dd');
  const formatQuestionTypeLabel = (t: number) => `Type ${t}`;
  const hasData = (arr: Array<{ [k: string]: number }>, key: string) =>
    (arr || []).some((i) => (i?.[key] || 0) > 0);

  const fetchReadingQuestionTypeStats = async () => {
    if (!readingDateRange?.from || !readingDateRange?.to) return;
    setReadingStatsLoading(true);
    setError(null);
    try {
      const params = {
        from_date: formatDateParam(readingDateRange.from),
        to_date: formatDateParam(readingDateRange.to),
      } as const;
      const [rc, rw] = await Promise.all([
        instance.get<ApiResponse<QuestionTypeCorrectItem[]>>(
          '/personal/creator-dashboard/reading/question-type-stats',
          { params, notify: false }
        ),
        instance.get<ApiResponse<QuestionTypeWrongItem[]>>(
          '/personal/creator-dashboard/reading/question-type-stats/wrong',
          { params, notify: false }
        ),
      ]);
      setReadingCorrect(rc.data.data || []);
      setReadingWrong(rw.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load reading question-type stats');
    } finally {
      setReadingStatsLoading(false);
    }
  };

  const fetchListeningQuestionTypeStats = async () => {
    if (!listeningDateRange?.from || !listeningDateRange?.to) return;
    setListeningStatsLoading(true);
    setError(null);
    try {
      const params = {
        from_date: formatDateParam(listeningDateRange.from),
        to_date: formatDateParam(listeningDateRange.to),
      } as const;
      const [lc, lw] = await Promise.all([
        instance.get<ApiResponse<QuestionTypeCorrectItem[]>>(
          '/personal/creator-dashboard/listening/question-type-stats',
          { params, notify: false }
        ),
        instance.get<ApiResponse<QuestionTypeWrongItem[]>>(
          '/personal/creator-dashboard/listening/question-type-stats/wrong',
          { params, notify: false }
        ),
      ]);
      setListeningCorrect(lc.data.data || []);
      setListeningWrong(lw.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load listening question-type stats');
    } finally {
      setListeningStatsLoading(false);
    }
  };

  // Note: per-chart stats are fetched only when user applies date filters above.

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-3 bg-gradient-to-r from-medium-slate-blue-900/30 to-tekhelet-900/10 rounded-2xl border border-tekhelet-900/20 backdrop-blur-md shadow-xl'>
          <LayoutDashboard className='h-6 w-6 text-tekhelet-400' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold text-tekhelet-400'>Creator Dashboard</h1>
          <p className='text-sm text-tekhelet-500'>Overview of your IELTS content and users</p>
        </div>
      </div>

      {/* Removed Reading question-type date range (redundant) */}

      {error && (
        <Alert className='bg-white/70 backdrop-blur-lg border border-persimmon-300/40 rounded-2xl'>
          <AlertDescription className='text-persimmon-500'>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Reading Tasks'
          value={data?.number_of_reading_tasks || 0}
          icon={<FileText className='h-5 w-5 text-tekhelet-400' />}
        />
        <StatCard
          title='Listening Tasks'
          value={data?.number_of_listening_tasks || 0}
          icon={<Headphones className='h-5 w-5 text-medium-slate-blue-400' />}
        />
        <StatCard
          title='Reading Exams'
          value={data?.number_of_reading_exams || 0}
          icon={<ClipboardCheck className='h-5 w-5 text-selective-yellow-400' />}
        />
        <StatCard
          title='Listening Exams'
          value={data?.number_of_listening_exams || 0}
          icon={<Ear className='h-5 w-5 text-tangerine-400' />}
        />
      </div>

      {/* Distributions */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <SectionCard
          title='Users by Avg Band (Reading)'
          subtitle={readingBranchTotal ? `${readingBranchTotal} users` : 'No users in range'}
        >
          <div className='h-72 px-2 pb-2'>
            {readingBranchTotal > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={readingBranchData}
                    dataKey='number_of_users'
                    nameKey='branch_score'
                    cx='50%'
                    cy='50%'
                    outerRadius={90}
                    innerRadius={40}
                    isAnimationActive={!loading}
                  >
                    {readingBranchData.map((entry, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Cell key={`pie-r-${index}`} fill={entry.fill || '#457ddb'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-full w-full flex items-center justify-center text-tekhelet-500 text-sm'>
                No data
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title='Users by Avg Band (Listening)'
          subtitle={listeningBranchTotal ? `${listeningBranchTotal} users` : 'No users in range'}
        >
          <div className='h-72 px-2 pb-2'>
            {listeningBranchTotal > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={listeningBranchData}
                    dataKey='number_of_users'
                    nameKey='branch_score'
                    cx='50%'
                    cy='50%'
                    outerRadius={90}
                    innerRadius={40}
                    isAnimationActive={!loading}
                  >
                    {listeningBranchData.map((entry, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Cell key={`pie-l-${index}`} fill={entry.fill || '#6da5ef'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-full w-full flex items-center justify-center text-tekhelet-500 text-sm'>
                No data
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Question type stats (Reading) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <SectionCard
          title='Question Type — Correct (Reading)'
          subtitle={
            hasData(readingCorrect as any, 'correct_count')
              ? undefined
              : 'No data in selected range'
          }
        >
          <div className='space-y-4'>
            {/* Date Filter for Reading Question Type Correct */}
            <div className='flex items-center gap-3'>
              <div className='flex-1'>
                <DatePickerWithRange
                  dateRange={readingDateRange}
                  onDateRangeChange={setReadingDateRange}
                  placeholder='Select date range for Reading Correct'
                />
              </div>
              <Button
                onClick={fetchReadingQuestionTypeStats}
                disabled={readingStatsLoading || !readingDateRange?.from || !readingDateRange?.to}
                className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white border-0'
                size='sm'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${readingStatsLoading ? 'animate-spin' : ''}`}
                />
                Apply
              </Button>
            </div>

            <div className='h-64 px-2 pb-2'>
              {readingStatsLoading ? (
                <div className='h-full w-full flex items-center justify-center text-tekhelet-500 text-sm'>
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={readingCorrect} barSize={28}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#cfd8ea66' />
                    <XAxis
                      dataKey='question_type'
                      tickFormatter={formatQuestionTypeLabel as any}
                      tick={{ fill: '#5b6a93' }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#5b6a93' }} />
                    <Tooltip cursor={{ fill: '#e8eefb80' }} />
                    <Bar dataKey='correct_count' name='Correct' fill='#457ddb'>
                      {readingCorrect.map((entry, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Cell key={`cell-rc-${index}`} fill={entry.fill || '#457ddb'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Removed Listening question-type date range (redundant) */}

        {/* Question type stats (Listening) */}
        <SectionCard
          title='Question Type — Correct (Listening)'
          subtitle={
            hasData(listeningCorrect as any, 'correct_count')
              ? undefined
              : 'No data in selected range'
          }
        >
          <div className='space-y-4'>
            {/* Date Filter for Listening Question Type Correct */}
            <div className='flex items-center gap-3'>
              <div className='flex-1'>
                <DatePickerWithRange
                  dateRange={listeningDateRange}
                  onDateRangeChange={setListeningDateRange}
                  placeholder='Select date range for Listening Correct'
                />
              </div>
              <Button
                onClick={fetchListeningQuestionTypeStats}
                disabled={
                  listeningStatsLoading || !listeningDateRange?.from || !listeningDateRange?.to
                }
                className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white border-0'
                size='sm'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${listeningStatsLoading ? 'animate-spin' : ''}`}
                />
                Apply
              </Button>
            </div>

            <div className='h-64 px-2 pb-2'>
              {listeningStatsLoading ? (
                <div className='h-full w-full flex items-center justify-center text-tekhelet-500 text-sm'>
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={listeningCorrect} barSize={28}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#cfd8ea66' />
                    <XAxis
                      dataKey='question_type'
                      tickFormatter={formatQuestionTypeLabel as any}
                      tick={{ fill: '#5b6a93' }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#5b6a93' }} />
                    <Tooltip cursor={{ fill: '#e8eefb80' }} />
                    <Bar dataKey='correct_count' name='Correct' fill='#6da5ef'>
                      {listeningCorrect.map((entry, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Cell key={`cell-lc-${index}`} fill={entry.fill || '#6da5ef'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <SectionCard
          title='Question Type — Wrong (Reading)'
          subtitle={
            hasData(readingWrong as any, 'wrong_count') ? undefined : 'No data in selected range'
          }
        >
          <div className='space-y-4'>
            {/* Date Filter for Reading Question Type Wrong */}
            <div className='flex items-center gap-3'>
              <div className='flex-1'>
                <DatePickerWithRange
                  dateRange={readingDateRange}
                  onDateRangeChange={setReadingDateRange}
                  placeholder='Select date range for Reading Wrong'
                />
              </div>
              <Button
                onClick={fetchReadingQuestionTypeStats}
                disabled={readingStatsLoading || !readingDateRange?.from || !readingDateRange?.to}
                className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white border-0'
                size='sm'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${readingStatsLoading ? 'animate-spin' : ''}`}
                />
                Apply
              </Button>
            </div>

            <div className='h-64 px-2 pb-2'>
              {readingStatsLoading ? (
                <div className='h-full w-full flex items-center justify-center text-tekhelet-500 text-sm'>
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={readingWrong} barSize={28}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#cfd8ea66' />
                    <XAxis
                      dataKey='question_type'
                      tickFormatter={formatQuestionTypeLabel as any}
                      tick={{ fill: '#5b6a93' }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#5b6a93' }} />
                    <Tooltip cursor={{ fill: '#e8eefb80' }} />
                    <Bar dataKey='wrong_count' name='Wrong' fill='#75adf3'>
                      {readingWrong.map((entry, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Cell key={`cell-rw-${index}`} fill={entry.fill || '#75adf3'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title='Question Type — Wrong (Listening)'
          subtitle={
            hasData(listeningWrong as any, 'wrong_count') ? undefined : 'No data in selected range'
          }
        >
          <div className='space-y-4'>
            {/* Date Filter for Listening Question Type Wrong */}
            <div className='flex items-center gap-3'>
              <div className='flex-1'>
                <DatePickerWithRange
                  dateRange={listeningDateRange}
                  onDateRangeChange={setListeningDateRange}
                  placeholder='Select date range for Listening Wrong'
                />
              </div>
              <Button
                onClick={fetchListeningQuestionTypeStats}
                disabled={
                  listeningStatsLoading || !listeningDateRange?.from || !listeningDateRange?.to
                }
                className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white border-0'
                size='sm'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${listeningStatsLoading ? 'animate-spin' : ''}`}
                />
                Apply
              </Button>
            </div>

            <div className='h-64 px-2 pb-2'>
              {listeningStatsLoading ? (
                <div className='h-full w-full flex items-center justify-center text-tekhelet-500 text-sm'>
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={listeningWrong} barSize={28}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#cfd8ea66' />
                    <XAxis
                      dataKey='question_type'
                      tickFormatter={formatQuestionTypeLabel as any}
                      tick={{ fill: '#5b6a93' }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#5b6a93' }} />
                    <Tooltip cursor={{ fill: '#e8eefb80' }} />
                    <Bar dataKey='wrong_count' name='Wrong' fill='#6da5ef'>
                      {listeningWrong.map((entry, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Cell key={`cell-lw-${index}`} fill={entry.fill || '#6da5ef'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Page;
