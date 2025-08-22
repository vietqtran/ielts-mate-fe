'use client';

import ModuleProgressBar from '@/components/features/modules/ModuleProgressBar';
import ModuleProgressModal from '@/components/features/modules/ModuleProgressModal';
import ModuleShareCard from '@/components/features/modules/ModuleShareCard';
import ShareModuleModal from '@/components/features/modules/ShareModuleModal';

import VocabularyCreateModal from '@/components/features/vocabulary/VocabularyCreateModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Wavy from '@/components/ui/custom-icons/wavy';
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
import { useAppSelector } from '@/hooks';
import { useModules } from '@/hooks/apis/modules/useModules';
import { useVocabulary } from '@/hooks/apis/vocabulary/useVocabulary';
import { ModuleResponse, ModuleUserResponse } from '@/lib/api/modules';
import { VocabularyResponse } from '@/lib/api/vocabulary';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  Globe,
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
  Timer,
  TrendingUp,
  User2,
  UserPlus,
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

interface FilterOptions {
  visibility: 'all' | 'public' | 'private';
  sortBy: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'vocab-asc' | 'vocab-desc';
}

export default function PersonalizedPage() {
  // Helper function to format time spent
  const formatTimeSpent = (timeInMs: number) => {
    const timeInSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Helper function to check if module is created by current user
  const isMyModule = (moduleCreatedBy: string) => {
    return user?.id === moduleCreatedBy;
  };

  // Calculate statistics from modules
  const calculateStats = () => {
    const totalModules = modules.length;
    const totalProgress = modules.reduce((sum, module) => sum + (module.progress || 0), 0);
    const avgProgress = totalModules > 0 ? Math.round(totalProgress / totalModules) : 0;
    const totalTimeSpent = modules.reduce((sum, module) => sum + (module.time_spent || 0), 0);
    const totalVocabulary = modules.reduce((sum, module) => sum + module.flash_card_ids.length, 0);

    return {
      totalModules,
      avgProgress,
      totalTimeSpent,
      totalVocabulary,
    };
  };

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
  const [selectedModuleForShare, setSelectedModuleForShare] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedModuleForProgress, setSelectedModuleForProgress] = useState<ModuleResponse | null>(
    null
  );
  const [isResetPromptOpen, setIsResetPromptOpen] = useState(false);
  const [pendingModuleForReset, setPendingModuleForReset] = useState<
    ModuleResponse | ModuleUserResponse | null
  >(null);
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [sharedModules, setSharedModules] = useState<ModuleUserResponse[]>([]);
  const [shareRequests, setShareRequests] = useState<ModuleUserResponse[]>([]);
  const [mySharedModules, setMySharedModules] = useState<ModuleUserResponse[]>([]);
  const [_, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const { user } = useAppSelector((state) => state.auth);
  const { getMyVocabulary } = useVocabulary();
  const {
    getMyModules,
    getMySharedModules,
    getSharedModuleRequests,
    getMyRequestedModules,
    getModuleProgress,
    refreshModuleProgress,
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
    <div className='relative isolate'>
      <Wavy className='pointer-events-none absolute inset-x-0 -top-4 -z-10' />
      <div className='container mx-auto p-6 pt-12 space-y-6 min-h-screen'>
        {/* Header */}
        <div className='flex flex-col space-y-4'>
          <div className='flex items-center space-x-3'>
            <div className='p-3 rounded-xl ring-2 ring-persimmon-200/50'>
              <Lightbulb className='h-6 w-6 text-persimmon-300' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-tekhelet-400'>Personalized Learning</h1>
              <p className='text-tekhelet-300/70 font-medium'>
                Track your progress and manage your learning journey
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200/95'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-3 bg-persimmon-700 rounded-xl'>
                  <BookOpen className='h-5 w-5 text-tekhelet-400' />
                </div>
                <div>
                  <p className='text-sm text-tekhelet-300 font-medium'>Active Modules</p>
                  <p className='text-2xl font-bold text-tekhelet-600'>
                    {calculateStats().totalModules}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-3 bg-persimmon-700 rounded-xl'>
                  <Target className='h-5 w-5 text-tekhelet-400' />
                </div>
                <div>
                  <p className='text-sm text-tekhelet-300 font-medium'>Avg. Progress</p>
                  <p className='text-2xl font-bold text-tekhelet-600'>
                    {calculateStats().avgProgress}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-3 bg-persimmon-700 rounded-xl'>
                  <Award className='h-5 w-5 text-tekhelet-400' />
                </div>
                <div>
                  <p className='text-sm text-tekhelet-300 font-medium'>Total Vocabulary</p>
                  <p className='text-2xl font-bold text-tekhelet-600'>
                    {calculateStats().totalVocabulary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white backdrop-blur-xl ring ring-persimmon-200'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-3 bg-persimmon-700 rounded-xl'>
                  <Timer className='h-5 w-5 text-tekhelet-400' />
                </div>
                <div>
                  <p className='text-sm text-tekhelet-300 font-medium'>Study Time</p>
                  <p className='text-2xl font-bold text-tekhelet-600'>
                    {calculateStats().totalTimeSpent > 0
                      ? formatTimeSpent(calculateStats().totalTimeSpent)
                      : '0m'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue='modules' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-5 border rounded-xl'>
            <TabsTrigger
              value='modules'
              className='rounded-xl data-[state=active]:bg-selective-yellow-200 data-[state=active]:text-selective-yellow-600'
            >
              My Modules
            </TabsTrigger>
            <TabsTrigger
              value='vocabulary'
              className='rounded-xl data-[state=active]:bg-selective-yellow-200 data-[state=active]:text-selective-yellow-600'
            >
              Vocabulary
            </TabsTrigger>
            <TabsTrigger
              value='shared'
              className='rounded-xl data-[state=active]:bg-selective-yellow-200 data-[state=active]:text-selective-yellow-600 flex items-center'
            >
              <Users className='h-4 w-4 mr-1' />
              Shared with me
            </TabsTrigger>
            <TabsTrigger
              value='requests'
              className='rounded-xl data-[state=active]:bg-selective-yellow-200 data-[state=active]:text-selective-yellow-600 flex items-center'
            >
              <Share2 className='h-4 w-4 mr-1' />
              Requests
              {shareRequests.length > 0 && (
                <Badge variant={'outline'} className='ml-1 bg-red-500 text-white text-xs px-1 py-0'>
                  {shareRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='myshared'
              className='rounded-xl data-[state=active]:bg-selective-yellow-200 data-[state=active]:text-selective-yellow-600'
            >
              My Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent value='modules' className='space-y-6'>
            {/* Header Description */}
            <Card className='backdrop-blur-lg border rounded-2xl'>
              <CardHeader>
                <CardTitle className='text-tekhelet-400 flex items-center'>
                  <BookOpen className='h-5 w-5 mr-2' />
                  My Modules
                </CardTitle>
                <CardDescription className='text-[#0074b7]'>
                  Modules you've created and modules shared with you that you've accepted
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Search and Filter */}
            <Card className='border rounded-2xl'>
              <CardContent className='px-6'>
                <div className='flex flex-col md:flex-row gap-4'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-slate-blue-400' />
                    <Input
                      placeholder='Search modules...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-10 bg-white/80'
                    />
                  </div>
                  <div className='flex gap-2'>
                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <PopoverTrigger asChild>
                        <Button variant='outline' className='text-tekhelet-400 relative'>
                          <Filter className='h-4 w-4 mr-2' />
                          Filter
                          {getActiveFilterCount() > 0 && (
                            <Badge
                              variant={'outline'}
                              className='bg-tekhelet-500 text-white text-xs px-1 py-0'
                            >
                              {getActiveFilterCount()}
                            </Badge>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-80 p-4 bg-white/95 backdrop-blur-lg border'>
                        <div className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-medium text-tekhelet-400'>Filter Options</h4>
                            {getActiveFilterCount() > 0 && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={clearFilters}
                                className='text-[#0074b7] hover:text-tekhelet-400'
                              >
                                <X className='h-3 w-3 mr-1' />
                                Clear
                              </Button>
                            )}
                          </div>

                          {/* Visibility Filter */}
                          <div className='space-y-2'>
                            <Label className='text-sm font-medium text-tekhelet-500'>
                              Visibility
                            </Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='outline'
                                  className='w-full justify-between border-[#bfd7ed]/40'
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
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      visibility: 'all',
                                    }))
                                  }
                                >
                                  <Globe className='h-4 w-4 mr-2' />
                                  All Modules
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      visibility: 'public',
                                    }))
                                  }
                                >
                                  <Globe className='h-4 w-4 mr-2' />
                                  Public Only
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      visibility: 'private',
                                    }))
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
                            <Label className='text-sm font-medium text-tekhelet-500'>Sort By</Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='outline'
                                  className='w-full justify-between border-[#bfd7ed]/40'
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
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      sortBy: 'newest',
                                    }))
                                  }
                                >
                                  <Calendar className='h-4 w-4 mr-2' />
                                  Newest First
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      sortBy: 'oldest',
                                    }))
                                  }
                                >
                                  <Calendar className='h-4 w-4 mr-2' />
                                  Oldest First
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Name</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      sortBy: 'name-asc',
                                    }))
                                  }
                                >
                                  <SortAsc className='h-4 w-4 mr-2' />A to Z
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      sortBy: 'name-desc',
                                    }))
                                  }
                                >
                                  <SortDesc className='h-4 w-4 mr-2' />Z to A
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Vocabulary Count</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      sortBy: 'vocab-desc',
                                    }))
                                  }
                                >
                                  <BookOpen className='h-4 w-4 mr-2' />
                                  More Vocabulary
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setFilterOptions((prev) => ({
                                      ...prev,
                                      sortBy: 'vocab-asc',
                                    }))
                                  }
                                >
                                  <BookOpen className='h-4 w-4 mr-2' />
                                  Fewer Vocabulary
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Results Summary */}
                          <div className='pt-2 border-t border-[#bfd7ed]/40'>
                            <p className='text-xs text-[#0074b7]'>
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
                <span className='text-sm text-selective-yellow-300'>Active filters:</span>
                {filterOptions.visibility !== 'all' && (
                  <Badge
                    variant='outline'
                    className='bg-selective-yellow-200 text-selective-yellow-600'
                  >
                    <Globe className='h-3 w-3 mr-1' />
                    {filterOptions.visibility === 'public' ? 'Public' : 'Private'}
                    <button
                      onClick={() =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          visibility: 'all',
                        }))
                      }
                      className='ml-1 hover:text-red-600 transition-colors'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                )}
                {filterOptions.sortBy !== 'newest' && (
                  <Badge
                    variant='outline'
                    className='bg-selective-yellow-200 text-selective-yellow-600'
                  >
                    <Calendar className='h-3 w-3 mr-1' />
                    {getSortLabel(filterOptions.sortBy)}
                    <button
                      onClick={() =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          sortBy: 'newest',
                        }))
                      }
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
                  className='h-6 px-2 text-xs text-persimmon-400 hover:text-persimmon-500'
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Modules Grid */}
            {moduleLoading.getMyModules ? (
              <div className='flex justify-center py-8'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-4 border-[#bfd7ed] border-t-[#0074b7] mx-auto mb-4'></div>
                  <p className='text-tekhelet-400'>Loading modules...</p>
                </div>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className='text-center py-8'>
                <BookOpen className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
                {modules.length === 0 ? (
                  <>
                    <p className='text-tekhelet-400 mb-2'>No modules found</p>
                    <Button asChild className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'>
                      <Link href='/personalized/create-module'>
                        <Plus className='h-4 w-4' />
                        Create Your First Module
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className='text-tekhelet-400 mb-2'>No modules match your filters</p>
                    <p className='text-sm text-medium-slate-blue-400 mb-4'>
                      Try adjusting your search or filter criteria
                    </p>
                    <Button
                      variant='outline'
                      onClick={clearFilters}
                      className='border-[#bfd7ed]/40 text-tekhelet-400'
                    >
                      <X className='h-4 w-4' />
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
                    className='border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300'
                  >
                    <CardHeader className='pb-4'>
                      <div className='flex items-center justify-between mb-5'>
                        <div className='flex items-center gap-1 flex-wrap'>
                          <BookOpen className='h-4 w-4 text-tekhelet-400 mr-2' />
                          <Badge
                            variant={'outline'}
                            className={
                              module.is_public
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {module.is_public ? 'Public' : 'Private'}
                          </Badge>
                          {isMyModule(module.created_by) ? (
                            <Badge variant={'outline'} className='bg-blue-100 text-blue-800'>
                              <User2 className='h-3 w-3 mr-1' />
                              Created by me
                            </Badge>
                          ) : (
                            <Badge variant={'outline'} className='bg-orange-100 text-orange-800'>
                              <UserPlus className='h-3 w-3 mr-1' />
                              Shared with me
                            </Badge>
                          )}
                        </div>
                        <span className='text-xs text-[#0074b7] flex items-center'>
                          <Clock className='h-3 w-3 mr-1' />
                          {new Date(module.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className='text-lg text-tekhelet-400'>
                        {module.module_name}
                      </CardTitle>
                      <CardDescription className='text-[#0074b7]'>
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-[#0074b7]'>Vocabulary Count</span>
                          <span className='text-tekhelet-400 font-medium'>
                            {module.flash_card_ids.length}
                          </span>
                        </div>
                        {module.progress !== undefined && (
                          <div className='flex justify-between text-sm'>
                            <span className='text-[#0074b7] flex items-center'>
                              <TrendingUp className='h-3 w-3 mr-1' />
                              Progress
                            </span>
                            <span className='text-tekhelet-400 font-medium'>
                              {module.progress}%
                            </span>
                          </div>
                        )}
                        {module.time_spent !== undefined && (
                          <div className='flex justify-between text-sm'>
                            <span className='text-[#0074b7] flex items-center'>
                              <Timer className='h-3 w-3 mr-1' />
                              Time Spent
                            </span>
                            <span className='text-tekhelet-400 font-medium'>
                              {formatTimeSpent(module.time_spent)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <ModuleProgressBar
                        totalCards={module.flash_card_ids.length}
                        progress={
                          module.progress !== undefined
                            ? {
                                module_id: module.module_id,
                                user_id: module.created_by,
                                progress_percentage: module.progress,
                                cards_completed: Math.round(
                                  ((module.progress || 0) / 100) * module.flash_card_ids.length
                                ),
                                total_cards: module.flash_card_ids.length,
                                time_spent: module.time_spent || 0,
                                last_studied: module.updated_at || module.created_at,
                                streak_count: 0,
                                created_at: module.created_at,
                                updated_at: module.updated_at || module.created_at,
                              }
                            : undefined
                        }
                        compact={true}
                      />

                      <div className='flex gap-2'>
                        <Button
                          className='flex-1 bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                          asChild
                        >
                          <Link href={`/personalized/study/${module.module_id}`}>
                            <Play className='h-4 w-4 mr-2' />
                            Study
                          </Link>
                        </Button>
                        <Button
                          variant='outline'
                          className='border-[#bfd7ed]/40 text-tekhelet-400'
                          onClick={() => handleShowProgress(module)}
                        >
                          <BarChart3 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          className='border-[#bfd7ed]/40 text-tekhelet-400'
                          asChild
                        >
                          <Link href={`/personalized/update-module?id=${module.module_id}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant='outline'
                          className='border-[#bfd7ed]/40 text-tekhelet-400'
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
            <Card className='border rounded-2xl'>
              <CardContent className='px-6'>
                <div className='flex flex-col md:flex-row gap-4'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-slate-blue-400' />
                    <Input
                      placeholder='Search vocabulary...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-10 bg-white/80 border-[#bfd7ed]/40'
                    />
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' className='border-[#bfd7ed]/40 text-tekhelet-400'>
                      <Filter className='h-4 w-4' />
                      Filter
                    </Button>
                    <Button
                      className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className='h-4 w-4' />
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
                  className='backdrop-blur-lg border rounded-2xl hover:shadow-lg transition-all duration-300'
                >
                  <CardContent className='px-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-xl font-semibold text-tekhelet-400'>{vocab.word}</h3>
                          {vocab.mastered && (
                            <Badge
                              variant={'outline'}
                              className='bg-selective-yellow-100 text-selective-yellow-800'
                            >
                              <Star className='h-3 w-3 mr-1' />
                              Mastered
                            </Badge>
                          )}
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <p className='text-sm font-medium text-tekhelet-400 mb-1'>Meaning</p>
                            <p className='text-selective-yellow-200'>{vocab.meaning}</p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-tekhelet-400 mb-1'>Context</p>
                            <p className='text-sm text-selective-yellow-200 italic'>
                              "{vocab.context}"
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-5 items-center'>
                        <p className='text-xs text-selective-yellow-100'>
                          Created: {new Date(vocab.created_at).toLocaleDateString()}
                        </p>
                        <Button variant='outline' size='sm' className='text-tekhelet-400'>
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
            <Card className='border rounded-2xl'>
              <CardHeader>
                <CardTitle className='text-tekhelet-400 flex items-center'>
                  <Users className='h-5 w-5 mr-2' />
                  Shared with me
                </CardTitle>
                <CardDescription className='text-[#0074b7]'>
                  Modules that other users have shared with you and you've accepted
                </CardDescription>
              </CardHeader>
            </Card>

            {moduleLoading.getMySharedModules ? (
              <div className='flex justify-center py-8'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-4 border-[#bfd7ed] border-t-[#0074b7] mx-auto mb-4'></div>
                  <p className='text-[#0074b7]'>Loading shared modules...</p>
                </div>
              </div>
            ) : sharedModules.length === 0 ? (
              <div className='text-center py-8'>
                <Users className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
                <p className='text-[#0074b7] mb-2'>No shared modules yet</p>
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
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='requests' className='space-y-6'>
            <Card className='border rounded-2xl'>
              <CardHeader>
                <CardTitle className='text-tekhelet-400 flex items-center'>
                  <Share2 className='h-5 w-5 mr-3' />
                  Sharing Requests
                  {shareRequests.length > 0 && (
                    <Badge variant={'outline'} className='ml-2 bg-red-500 text-white'>
                      {shareRequests.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className='text-[#0074b7]'>
                  Module sharing requests that are waiting for your response
                </CardDescription>
              </CardHeader>
            </Card>

            {moduleLoading.getSharedModuleRequests ? (
              <div className='flex justify-center py-8'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-4 border-[#bfd7ed] border-t-[#0074b7] mx-auto mb-4'></div>
                  <p className='text-[#0074b7]'>Loading requests...</p>
                </div>
              </div>
            ) : shareRequests.length === 0 ? (
              <div className='text-center py-8'>
                <Share2 className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
                <p className='text-tekhelet-400 mb-2'>No pending requests</p>
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
            <Card className='border rounded-2xl'>
              <CardHeader>
                <CardTitle className='text-tekhelet-400 flex items-center'>
                  <Share2 className='h-5 w-5 mr-2' />
                  My Shared Modules
                </CardTitle>
                <CardDescription className='text-[#0074b7]'>
                  Modules you've shared with other users and their response status
                </CardDescription>
              </CardHeader>
            </Card>

            {moduleLoading.getMyRequestedModules ? (
              <div className='flex justify-center py-8'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-4 border-[#bfd7ed] border-t-[#0074b7] mx-auto mb-4'></div>
                  <p className='text-[#0074b7]'>Loading shared modules...</p>
                </div>
              </div>
            ) : mySharedModules.length === 0 ? (
              <div className='text-center py-8'>
                <Share2 className='h-12 w-12 text-medium-slate-blue-300 mx-auto mb-4' />
                <p className='text-tekhelet-400 mb-2'>No shared modules yet</p>
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
          />
        )}

        {/* Reset Progress Prompt */}
        <AlertDialog open={isResetPromptOpen} onOpenChange={setIsResetPromptOpen}>
          <AlertDialogContent className='bg-white/90 backdrop-blur-lg border border-tekhelet-200 rounded-2xl'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-tekhelet-400'>Reset progress?</AlertDialogTitle>
              <AlertDialogDescription className='text-medium-slate-blue-500'>
                This module is already at 100% progress. Do you want to reset progress and start
                over?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className='border-medium-slate-blue-200 text-medium-slate-blue-600'
                onClick={async () => {
                  if (!pendingModuleForReset) return;
                  setIsResetPromptOpen(false);
                  setPendingModuleForReset(null);
                }}
              >
                Keep Progress
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!pendingModuleForReset) return;
                  const res = await refreshModuleProgress(
                    (pendingModuleForReset as any).module_id,
                    'NEW'
                  );
                  if (res) {
                    setIsResetPromptOpen(false);
                    setPendingModuleForReset(null);
                  }
                }}
                className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
              >
                Reset Progress
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
