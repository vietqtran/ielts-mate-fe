'use client';

import ModuleProgressBar from '@/components/features/modules/ModuleProgressBar';
import ModuleProgressModal from '@/components/features/modules/ModuleProgressModal';
import ModuleShareCard from '@/components/features/modules/ModuleShareCard';
import ShareModuleModal from '@/components/features/modules/ShareModuleModal';
import StudySession from '@/components/features/modules/StudySession';
import VocabularyCreateModal from '@/components/features/vocabulary/VocabularyCreateModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModules } from '@/hooks/apis/modules/useModules';
import { useVocabulary } from '@/hooks/apis/vocabulary/useVocabulary';
import { ModuleResponse, ModuleUserResponse } from '@/lib/api/modules';
import { VocabularyResponse } from '@/lib/api/vocabulary';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  Globe,
  GraduationCap,
  Lightbulb,
  Lock,
  Play,
  Plus,
  Search,
  Share2,
  SortAsc,
  SortDesc,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
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

interface FilterOptions {
  visibility: 'all' | 'public' | 'private';
  sortBy: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'vocab-asc' | 'vocab-desc';
}

export default function PersonalizedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    visibility: 'all',
    sortBy: 'newest',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isStudySessionOpen, setIsStudySessionOpen] = useState(false);
  const [selectedModuleForShare, setSelectedModuleForShare] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedModuleForProgress, setSelectedModuleForProgress] = useState<ModuleResponse | null>(
    null
  );
  const [selectedModuleForStudy, setSelectedModuleForStudy] = useState<ModuleResponse | null>(null);
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [sharedModules, setSharedModules] = useState<ModuleUserResponse[]>([]);
  const [shareRequests, setShareRequests] = useState<ModuleUserResponse[]>([]);
  const [mySharedModules, setMySharedModules] = useState<ModuleUserResponse[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const { getMyVocabulary, isLoading: vocabLoading } = useVocabulary();
  const {
    getMyModules,
    getMySharedModules,
    getSharedModuleRequests,
    getMyRequestedModules,
    isLoading: moduleLoading,
  } = useModules();

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

      // Fetch shared modules
      const sharedResponse = await getMySharedModules();
      if (sharedResponse) {
        setSharedModules(sharedResponse.data);
      }

      // Fetch sharing requests
      const requestsResponse = await getSharedModuleRequests();
      if (requestsResponse) {
        setShareRequests(requestsResponse.data);
      }

      // Fetch my shared modules
      const mySharedResponse = await getMyRequestedModules();
      if (mySharedResponse) {
        setMySharedModules(mySharedResponse.data);
      }
    };

    fetchData();
  }, []);

  // Handle share modal
  const handleShareModule = (moduleId: string, moduleName: string) => {
    setSelectedModuleForShare({ id: moduleId, name: moduleName });
    setIsShareModalOpen(true);
  };

  const handleShareSuccess = async () => {
    // Refresh sharing data after successful share
    const mySharedResponse = await getMyRequestedModules();
    if (mySharedResponse) {
      setMySharedModules(mySharedResponse.data);
    }
  };

  const handleRequestUpdate = async () => {
    // Refresh data after accepting/denying requests
    const [sharedResponse, requestsResponse] = await Promise.all([
      getMySharedModules(),
      getSharedModuleRequests(),
    ]);

    if (sharedResponse) {
      setSharedModules(sharedResponse.data);
    }
    if (requestsResponse) {
      setShareRequests(requestsResponse.data);
    }
  };

  // Handle progress modal
  const handleShowProgress = (module: ModuleResponse) => {
    setSelectedModuleForProgress(module);
    setIsProgressModalOpen(true);
  };

  // Handle study session
  const handleStartStudy = (module: ModuleResponse | ModuleUserResponse) => {
    if ('module_id' in module) {
      // Convert ModuleUserResponse to ModuleResponse format
      const moduleForStudy: ModuleResponse = {
        module_id: module.module_id,
        module_name: module.module_name,
        description: module.description,
        is_public: module.is_public,
        is_deleted: module.is_deleted || false,
        flash_card_ids: module.flash_card_ids,
        created_by: module.created_by,
        created_at: module.created_at,
        updated_by: module.updated_by || null,
        updated_at: module.updated_at || null,
      };
      setSelectedModuleForStudy(moduleForStudy);
    } else {
      setSelectedModuleForStudy(module as ModuleResponse);
    }
    setIsStudySessionOpen(true);
  };

  const handleStudyComplete = async () => {
    setIsStudySessionOpen(false);
    setSelectedModuleForStudy(null);
    // Refresh modules to get updated progress
    const moduleResponse = await getMyModules();
    if (moduleResponse) {
      setModules(moduleResponse.data);
    }
  };

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

  // Filter and sort modules
  const filteredModules = modules
    .filter((module) => {
      // Search filter
      const matchesSearch = module.module_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Visibility filter
      let matchesVisibility = true;
      if (filterOptions.visibility === 'public') {
        matchesVisibility = module.is_public === true;
      } else if (filterOptions.visibility === 'private') {
        matchesVisibility = module.is_public === false;
      }

      return matchesSearch && matchesVisibility;
    })
    .sort((a, b) => {
      switch (filterOptions.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name-asc':
          return a.module_name.localeCompare(b.module_name);
        case 'name-desc':
          return b.module_name.localeCompare(a.module_name);
        case 'vocab-asc':
          return a.flash_card_ids.length - b.flash_card_ids.length;
        case 'vocab-desc':
          return b.flash_card_ids.length - a.flash_card_ids.length;
        default:
          return 0;
      }
    });

  // Helper functions for filter
  const getActiveFilterCount = () => {
    let count = 0;
    if (filterOptions.visibility !== 'all') count++;
    if (filterOptions.sortBy !== 'newest') count++;
    return count;
  };

  const clearFilters = () => {
    setFilterOptions({
      visibility: 'all',
      sortBy: 'newest',
    });
  };

  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'name-asc':
        return 'Name A-Z';
      case 'name-desc':
        return 'Name Z-A';
      case 'vocab-asc':
        return 'Fewer Vocabulary';
      case 'vocab-desc':
        return 'More Vocabulary';
      default:
        return 'Newest First';
    }
  };

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
        <TabsList className='grid w-full grid-cols-5 bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl'>
          <TabsTrigger value='modules' className='rounded-xl'>
            My Modules
          </TabsTrigger>
          <TabsTrigger value='vocabulary' className='rounded-xl'>
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value='shared' className='rounded-xl'>
            <Users className='h-4 w-4 mr-1' />
            Shared with me
          </TabsTrigger>
          <TabsTrigger value='requests' className='rounded-xl'>
            <Share2 className='h-4 w-4 mr-1' />
            Requests
            {shareRequests.length > 0 && (
              <Badge className='ml-1 bg-red-500 text-white text-xs px-1 py-0'>
                {shareRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='myshared' className='rounded-xl'>
            My Shared
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
                  <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='border-tekhelet-200 text-tekhelet-400 relative'
                      >
                        <Filter className='h-4 w-4 mr-2' />
                        Filter
                        {getActiveFilterCount() > 0 && (
                          <Badge className='ml-2 bg-tekhelet-500 text-white text-xs px-1 py-0'>
                            {getActiveFilterCount()}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-80 p-4 bg-white/95 backdrop-blur-lg border border-tekhelet-200'>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-medium text-tekhelet-400'>Filter Options</h4>
                          {getActiveFilterCount() > 0 && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={clearFilters}
                              className='text-medium-slate-blue-500 hover:text-tekhelet-400'
                            >
                              <X className='h-3 w-3 mr-1' />
                              Clear
                            </Button>
                          )}
                        </div>

                        {/* Visibility Filter */}
                        <div className='space-y-2'>
                          <Label className='text-sm font-medium text-medium-slate-blue-600'>
                            Visibility
                          </Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='outline'
                                className='w-full justify-between border-tekhelet-200'
                              >
                                <div className='flex items-center'>
                                  {filterOptions.visibility === 'all' && (
                                    <Globe className='h-4 w-4 mr-2' />
                                  )}
                                  {filterOptions.visibility === 'public' && (
                                    <Globe className='h-4 w-4 mr-2' />
                                  )}
                                  {filterOptions.visibility === 'private' && (
                                    <Lock className='h-4 w-4 mr-2' />
                                  )}
                                  {filterOptions.visibility === 'all' && 'All Modules'}
                                  {filterOptions.visibility === 'public' && 'Public Only'}
                                  {filterOptions.visibility === 'private' && 'Private Only'}
                                </div>
                                <ChevronDown className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-48'>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, visibility: 'all' }))
                                }
                              >
                                <Globe className='h-4 w-4 mr-2' />
                                All Modules
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, visibility: 'public' }))
                                }
                              >
                                <Globe className='h-4 w-4 mr-2' />
                                Public Only
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, visibility: 'private' }))
                                }
                              >
                                <Lock className='h-4 w-4 mr-2' />
                                Private Only
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Sort Filter */}
                        <div className='space-y-2'>
                          <Label className='text-sm font-medium text-medium-slate-blue-600'>
                            Sort By
                          </Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='outline'
                                className='w-full justify-between border-tekhelet-200'
                              >
                                <div className='flex items-center'>
                                  {(filterOptions.sortBy === 'newest' ||
                                    filterOptions.sortBy === 'oldest') && (
                                    <Calendar className='h-4 w-4 mr-2' />
                                  )}
                                  {(filterOptions.sortBy === 'name-asc' ||
                                    filterOptions.sortBy === 'name-desc') && (
                                    <SortAsc className='h-4 w-4 mr-2' />
                                  )}
                                  {(filterOptions.sortBy === 'vocab-asc' ||
                                    filterOptions.sortBy === 'vocab-desc') && (
                                    <BookOpen className='h-4 w-4 mr-2' />
                                  )}
                                  {getSortLabel(filterOptions.sortBy)}
                                </div>
                                <ChevronDown className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-48'>
                              <DropdownMenuLabel>Date Created</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, sortBy: 'newest' }))
                                }
                              >
                                <Calendar className='h-4 w-4 mr-2' />
                                Newest First
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, sortBy: 'oldest' }))
                                }
                              >
                                <Calendar className='h-4 w-4 mr-2' />
                                Oldest First
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Name</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, sortBy: 'name-asc' }))
                                }
                              >
                                <SortAsc className='h-4 w-4 mr-2' />A to Z
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, sortBy: 'name-desc' }))
                                }
                              >
                                <SortDesc className='h-4 w-4 mr-2' />Z to A
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Vocabulary Count</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, sortBy: 'vocab-desc' }))
                                }
                              >
                                <BookOpen className='h-4 w-4 mr-2' />
                                More Vocabulary
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFilterOptions((prev) => ({ ...prev, sortBy: 'vocab-asc' }))
                                }
                              >
                                <BookOpen className='h-4 w-4 mr-2' />
                                Fewer Vocabulary
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Results Summary */}
                        <div className='pt-2 border-t border-tekhelet-200'>
                          <p className='text-xs text-medium-slate-blue-500'>
                            Showing {filteredModules.length} of {modules.length} modules
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
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

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className='flex flex-wrap items-center gap-2 py-2'>
              <span className='text-sm text-medium-slate-blue-500'>Active filters:</span>
              {filterOptions.visibility !== 'all' && (
                <Badge
                  variant='secondary'
                  className='bg-tekhelet-100 text-tekhelet-700 border border-tekhelet-200'
                >
                  <Globe className='h-3 w-3 mr-1' />
                  {filterOptions.visibility === 'public' ? 'Public' : 'Private'}
                  <button
                    onClick={() => setFilterOptions((prev) => ({ ...prev, visibility: 'all' }))}
                    className='ml-1 hover:text-red-600 transition-colors'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )}
              {filterOptions.sortBy !== 'newest' && (
                <Badge
                  variant='secondary'
                  className='bg-tekhelet-100 text-tekhelet-700 border border-tekhelet-200'
                >
                  <Calendar className='h-3 w-3 mr-1' />
                  {getSortLabel(filterOptions.sortBy)}
                  <button
                    onClick={() => setFilterOptions((prev) => ({ ...prev, sortBy: 'newest' }))}
                    className='ml-1 hover:text-red-600 transition-colors'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={clearFilters}
                className='h-6 px-2 text-xs text-medium-slate-blue-500 hover:text-tekhelet-400'
              >
                Clear all
              </Button>
            </div>
          )}

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
              {modules.length === 0 ? (
                <>
                  <p className='text-medium-slate-blue-500 mb-2'>No modules found</p>
                  <Button asChild className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'>
                    <Link href='/personalized/create-module'>
                      <Plus className='h-4 w-4 mr-2' />
                      Create Your First Module
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className='text-medium-slate-blue-500 mb-2'>No modules match your filters</p>
                  <p className='text-sm text-medium-slate-blue-400 mb-4'>
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    variant='outline'
                    onClick={clearFilters}
                    className='border-tekhelet-200 text-tekhelet-400'
                  >
                    <X className='h-4 w-4 mr-2' />
                    Clear Filters
                  </Button>
                </>
              )}
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

                    {/* Progress Bar */}
                    <ModuleProgressBar totalCards={module.flash_card_ids.length} compact={true} />

                    <div className='flex gap-2'>
                      <Button
                        className='flex-1 bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                        onClick={() => handleStartStudy(module)}
                      >
                        <Play className='h-4 w-4 mr-2' />
                        Study
                      </Button>
                      <Button
                        variant='outline'
                        className='border-tekhelet-200 text-tekhelet-400'
                        onClick={() => handleShowProgress(module)}
                      >
                        <BarChart3 className='h-4 w-4' />
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
                      <Button
                        variant='outline'
                        className='border-tekhelet-200 text-tekhelet-400'
                        onClick={() => handleShareModule(module.module_id, module.module_name)}
                      >
                        <Share2 className='h-4 w-4' />
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

        <TabsContent value='shared' className='space-y-6'>
          <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
            <CardHeader>
              <CardTitle className='text-tekhelet-400 flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                Modules Shared with Me
              </CardTitle>
              <CardDescription className='text-medium-slate-blue-500'>
                Modules that other users have shared with you and you've accepted
              </CardDescription>
            </CardHeader>
          </Card>

          {moduleLoading.getMySharedModules ? (
            <div className='flex justify-center py-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-tekhelet-400 mx-auto mb-4'></div>
                <p className='text-medium-slate-blue-500'>Loading shared modules...</p>
              </div>
            </div>
          ) : sharedModules.length === 0 ? (
            <div className='text-center py-8'>
              <Users className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
              <p className='text-medium-slate-blue-500 mb-2'>No shared modules yet</p>
              <p className='text-sm text-medium-slate-blue-400'>
                When other users share modules with you, they'll appear here
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {sharedModules.map((moduleShare) => (
                <ModuleShareCard
                  key={moduleShare.module_id}
                  moduleShare={moduleShare}
                  type='accepted'
                  onUpdate={handleRequestUpdate}
                  onStudy={handleStartStudy}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='requests' className='space-y-6'>
          <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
            <CardHeader>
              <CardTitle className='text-tekhelet-400 flex items-center'>
                <Share2 className='h-5 w-5 mr-2' />
                Sharing Requests
                {shareRequests.length > 0 && (
                  <Badge className='ml-2 bg-red-500 text-white'>{shareRequests.length}</Badge>
                )}
              </CardTitle>
              <CardDescription className='text-medium-slate-blue-500'>
                Module sharing requests that are waiting for your response
              </CardDescription>
            </CardHeader>
          </Card>

          {moduleLoading.getSharedModuleRequests ? (
            <div className='flex justify-center py-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-tekhelet-400 mx-auto mb-4'></div>
                <p className='text-medium-slate-blue-500'>Loading requests...</p>
              </div>
            </div>
          ) : shareRequests.length === 0 ? (
            <div className='text-center py-8'>
              <Share2 className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
              <p className='text-medium-slate-blue-500 mb-2'>No pending requests</p>
              <p className='text-sm text-medium-slate-blue-400'>
                Module sharing requests will appear here
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {shareRequests.map((moduleShare) => (
                <ModuleShareCard
                  key={moduleShare.module_id}
                  moduleShare={moduleShare}
                  type='received'
                  onUpdate={handleRequestUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='myshared' className='space-y-6'>
          <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl'>
            <CardHeader>
              <CardTitle className='text-tekhelet-400 flex items-center'>
                <Share2 className='h-5 w-5 mr-2' />
                My Shared Modules
              </CardTitle>
              <CardDescription className='text-medium-slate-blue-500'>
                Modules you've shared with other users and their response status
              </CardDescription>
            </CardHeader>
          </Card>

          {moduleLoading.getMyRequestedModules ? (
            <div className='flex justify-center py-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-tekhelet-400 mx-auto mb-4'></div>
                <p className='text-medium-slate-blue-500'>Loading shared modules...</p>
              </div>
            </div>
          ) : mySharedModules.length === 0 ? (
            <div className='text-center py-8'>
              <Share2 className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
              <p className='text-medium-slate-blue-500 mb-2'>No shared modules yet</p>
              <p className='text-sm text-medium-slate-blue-400'>
                Start sharing your modules with other users to help them learn
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {mySharedModules.map((moduleShare) => (
                <ModuleShareCard
                  key={moduleShare.module_id}
                  moduleShare={moduleShare}
                  type='sent'
                  onUpdate={handleRequestUpdate}
                />
              ))}
            </div>
          )}
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

      {/* Share Module Modal */}
      {selectedModuleForShare && (
        <ShareModuleModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedModuleForShare(null);
          }}
          moduleId={selectedModuleForShare.id}
          moduleName={selectedModuleForShare.name}
          onSuccess={handleShareSuccess}
        />
      )}

      {/* Progress Modal */}
      {selectedModuleForProgress && (
        <ModuleProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedModuleForProgress(null);
          }}
          module={selectedModuleForProgress}
          onStartStudy={() => handleStartStudy(selectedModuleForProgress)}
        />
      )}

      {/* Study Session Modal/Overlay */}
      {selectedModuleForStudy && isStudySessionOpen && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <StudySession
              module={selectedModuleForStudy}
              onComplete={handleStudyComplete}
              onExit={() => {
                setIsStudySessionOpen(false);
                setSelectedModuleForStudy(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
