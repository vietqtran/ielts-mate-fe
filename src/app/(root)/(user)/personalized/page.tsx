'use client';

import VocabularyCreateModal from '@/components/features/vocabulary/VocabularyCreateModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModules } from '@/hooks/apis/modules/useModules';
import { useVocabulary } from '@/hooks/apis/vocabulary/useVocabulary';
import { ModuleResponse } from '@/lib/api/modules';
import { VocabularyResponse } from '@/lib/api/vocabulary';
import {
  Award,
  BookMarked,
  BookOpen,
  Clock,
  Filter,
  GraduationCap,
  Lightbulb,
  Plus,
  Search,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Reading' | 'Listening' | 'Writing' | 'Speaking';
  estimatedTime: string;
  lastAccessed?: string;
}

interface Vocabulary {
  id: string;
  word: string;
  definition: string;
  example: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  mastered: boolean;
  reviewDate?: string;
}

const mockModules: Module[] = [
  {
    id: '1',
    title: 'Academic Reading Fundamentals',
    description: 'Master essential reading strategies for academic texts',
    progress: 75,
    totalLessons: 12,
    completedLessons: 9,
    difficulty: 'Intermediate',
    category: 'Reading',
    estimatedTime: '2-3 hours',
    lastAccessed: '2 hours ago',
  },
  {
    id: '2',
    title: 'Listening Comprehension',
    description: 'Improve your listening skills with various accents',
    progress: 45,
    totalLessons: 8,
    completedLessons: 4,
    difficulty: 'Beginner',
    category: 'Listening',
    estimatedTime: '1.5-2 hours',
    lastAccessed: '1 day ago',
  },
  {
    id: '3',
    title: 'Advanced Writing Techniques',
    description: 'Learn advanced writing structures and vocabulary',
    progress: 20,
    totalLessons: 15,
    completedLessons: 3,
    difficulty: 'Advanced',
    category: 'Writing',
    estimatedTime: '3-4 hours',
  },
];

export default function PersonalizedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const { getMyVocabulary, isLoading: vocabLoading } = useVocabulary();
  const { getMyModules, isLoading: moduleLoading } = useModules();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch vocabularies
      const vocabResponse = await getMyVocabulary({
        page: 1,
        size: 50,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      });

      if (vocabResponse) {
        setVocabularies(vocabResponse.data);
        setPagination(vocabResponse.pagination);
      }

      // Fetch modules
      const moduleResponse = await getMyModules();
      if (moduleResponse) {
        setModules(moduleResponse.data);
      }
    };

    fetchData();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Reading':
        return <BookOpen className='h-4 w-4' />;
      case 'Listening':
        return <GraduationCap className='h-4 w-4' />;
      case 'Writing':
        return <Target className='h-4 w-4' />;
      case 'Speaking':
        return <TrendingUp className='h-4 w-4' />;
      default:
        return <BookMarked className='h-4 w-4' />;
    }
  };

  const filteredModules = modules.filter((module) =>
    module.module_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVocabularies = vocabularies.filter(
    (vocab) =>
      vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || vocab.category === selectedCategory)
  );

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col space-y-4'>
        <div className='flex items-center space-x-3'>
          <div className='p-3 bg-gradient-to-r from-tekhelet-400 to-medium-slate-blue-500 rounded-xl'>
            <Lightbulb className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-tekhelet-400'>Personalized Learning</h1>
            <p className='text-medium-slate-blue-500'>
              Track your progress and manage your learning journey
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-tekhelet-100 rounded-lg'>
                <BookOpen className='h-5 w-5 text-tekhelet-600' />
              </div>
              <div>
                <p className='text-sm text-medium-slate-blue-500'>Active Modules</p>
                <p className='text-2xl font-bold text-tekhelet-400'>{modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-selective-yellow-100 rounded-lg'>
                <Target className='h-5 w-5 text-selective-yellow-600' />
              </div>
              <div>
                <p className='text-sm text-medium-slate-blue-500'>Avg. Progress</p>
                <p className='text-2xl font-bold text-selective-yellow-500'>47%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-persimmon-100 rounded-lg'>
                <Award className='h-5 w-5 text-persimmon-600' />
              </div>
              <div>
                <p className='text-sm text-medium-slate-blue-500'>Mastered Words</p>
                <p className='text-2xl font-bold text-persimmon-500'>156</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-tangerine-100 rounded-lg'>
                <Clock className='h-5 w-5 text-tangerine-600' />
              </div>
              <div>
                <p className='text-sm text-medium-slate-blue-500'>Study Time</p>
                <p className='text-2xl font-bold text-tangerine-500'>12h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='modules' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2 bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl'>
          <TabsTrigger value='modules' className='rounded-xl'>
            Learning Modules
          </TabsTrigger>
          <TabsTrigger value='vocabulary' className='rounded-xl'>
            Vocabulary
          </TabsTrigger>
        </TabsList>

        <TabsContent value='modules' className='space-y-6'>
          {/* Search and Filter */}
          <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
            <CardContent className='p-6'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1 relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-slate-blue-400' />
                  <Input
                    placeholder='Search modules...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 bg-white/80 border-tekhelet-200'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' className='border-tekhelet-200 text-tekhelet-400'>
                    <Filter className='h-4 w-4 mr-2' />
                    Filter
                  </Button>
                  <Button className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white' asChild>
                    <Link href='/personalized/create-module'>
                      <Plus className='h-4 w-4 mr-2' />
                      Add Module
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Grid */}
          {moduleLoading.getMyModules ? (
            <div className='flex justify-center py-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-tekhelet-400 mx-auto mb-4'></div>
                <p className='text-medium-slate-blue-500'>Loading modules...</p>
              </div>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className='text-center py-8'>
              <BookOpen className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
              <p className='text-medium-slate-blue-500 mb-2'>No modules found</p>
              <Button asChild className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'>
                <Link href='/personalized/create-module'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Your First Module
                </Link>
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredModules.map((module) => (
                <Card
                  key={module.module_id}
                  className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300'
                >
                  <CardHeader className='pb-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-2'>
                        <BookOpen className='h-4 w-4 text-tekhelet-400' />
                        <Badge
                          className={
                            module.is_public
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {module.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      <span className='text-xs text-medium-slate-blue-500 flex items-center'>
                        <Clock className='h-3 w-3 mr-1' />
                        {new Date(module.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className='text-lg text-tekhelet-400'>
                      {module.module_name}
                    </CardTitle>
                    <CardDescription className='text-medium-slate-blue-500'>
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-medium-slate-blue-500'>Vocabulary Count</span>
                        <span className='text-tekhelet-400 font-medium'>
                          {module.flash_card_ids.length}
                        </span>
                      </div>
                      <div className='text-xs text-medium-slate-blue-500'>
                        <span>Created: {new Date(module.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button className='flex-1 bg-tekhelet-400 hover:bg-tekhelet-500 text-white'>
                        Study
                      </Button>
                      <Button variant='outline' className='border-tekhelet-200 text-tekhelet-400'>
                        <Star className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        className='border-tekhelet-200 text-tekhelet-400'
                        asChild
                      >
                        <Link href={`/personalized/update-module?id=${module.module_id}`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='vocabulary' className='space-y-6'>
          {/* Search and Filter */}
          <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
            <CardContent className='p-6'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1 relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-slate-blue-400' />
                  <Input
                    placeholder='Search vocabulary...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 bg-white/80 border-tekhelet-200'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' className='border-tekhelet-200 text-tekhelet-400'>
                    <Filter className='h-4 w-4 mr-2' />
                    Filter
                  </Button>
                  <Button
                    className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Word
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vocabulary List */}
          <div className='space-y-4'>
            {filteredVocabularies.map((vocab) => (
              <Card
                key={vocab.vocabulary_id}
                className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300'
              >
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-xl font-semibold text-tekhelet-400'>{vocab.word}</h3>
                        {vocab.mastered && (
                          <Badge className='bg-selective-yellow-100 text-selective-yellow-800'>
                            <Star className='h-3 w-3 mr-1' />
                            Mastered
                          </Badge>
                        )}
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <p className='text-sm font-medium text-medium-slate-blue-500 mb-1'>
                            Meaning
                          </p>
                          <p className='text-medium-slate-blue-600'>{vocab.meaning}</p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-medium-slate-blue-500 mb-1'>
                            Context
                          </p>
                          <p className='text-sm text-medium-slate-blue-500 italic'>
                            "{vocab.context}"
                          </p>
                        </div>
                      </div>
                      <p className='text-xs text-medium-slate-blue-400 mt-3'>
                        Created: {new Date(vocab.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex flex-col gap-2 ml-4'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='border-tekhelet-200 text-tekhelet-400'
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Vocabulary Create Modal */}
      <VocabularyCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Refresh vocabulary list after successful creation
          const fetchVocabularies = async () => {
            const response = await getMyVocabulary({
              page: 1,
              size: 50,
              sortBy: 'createdAt',
              sortDirection: 'desc',
            });

            if (response) {
              setVocabularies(response.data);
              setPagination(response.pagination);
            }
          };
          fetchVocabularies();
        }}
      />
    </div>
  );
}
