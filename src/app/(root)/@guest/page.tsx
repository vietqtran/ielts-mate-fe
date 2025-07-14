'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Headphones,
  Menu,
  MessageSquare,
  PenTool,
  Play,
  Star,
  Target,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const GuestPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      {/* Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <div className='flex items-center space-x-2'>
              <div className='w-12 h-8'>
                <Image src='/logo.svg' alt='IeltsMate Logo' width={48} height={32} />
              </div>
              <span className='text-xl font-bold text-gray-900'>IeltsMate</span>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-8'>
              <Link
                href='#features'
                className='text-gray-600 hover:text-blue-600 transition-colors'
              >
                Features
              </Link>
              <Link
                href='#testimonials'
                className='text-gray-600 hover:text-blue-600 transition-colors'
              >
                Testimonials
              </Link>
              <Link href='#about' className='text-gray-600 hover:text-blue-600 transition-colors'>
                About
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className='hidden md:flex items-center space-x-4'>
              <Button
                variant='ghost'
                className='text-gray-600 hover:text-blue-600'
                onClick={() => router.push('/sign-in')}
              >
                Sign In
              </Button>
              <Button className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'>
                Start Learning Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className='md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className='h-6 w-6 text-gray-600' />
              ) : (
                <Menu className='h-6 w-6 text-gray-600' />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className='md:hidden border-t border-gray-200 py-4'>
              <div className='flex flex-col space-y-4'>
                <Link
                  href='#features'
                  className='text-gray-600 hover:text-blue-600 transition-colors px-4 py-2'
                >
                  Features
                </Link>
                <Link
                  href='#testimonials'
                  className='text-gray-600 hover:text-blue-600 transition-colors px-4 py-2'
                >
                  Testimonials
                </Link>
                <Link
                  href='#about'
                  className='text-gray-600 hover:text-blue-600 transition-colors px-4 py-2'
                >
                  About
                </Link>
                <div className='flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200'>
                  <Button
                    variant='ghost'
                    className='text-gray-600 hover:text-blue-600 justify-start'
                  >
                    Sign In
                  </Button>
                  <Button className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'>
                    Start Learning Free
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative overflow-hidden pt-32 pb-32'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10'></div>
        <div className='relative container mx-auto px-4'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div className='text-center lg:text-left'>
              <Badge className='mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200'>
                🚀 Master IELTS with Confidence
              </Badge>
              <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
                Your Journey to
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                  {' '}
                  IELTS Success{' '}
                </span>
                Starts Here
              </h1>
              <p className='text-xl text-gray-600 mb-8 max-w-2xl'>
                Join thousands of successful test-takers with our comprehensive, AI-powered IELTS
                preparation platform. Practice with real test scenarios, get instant feedback, and
                achieve your target score.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                <Button
                  size='lg'
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg'
                >
                  Start Learning Free
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
                <Button size='lg' variant='outline' className='px-8 py-6 text-lg'>
                  <Play className='mr-2 h-5 w-5' />
                  Watch Demo
                </Button>
              </div>
              <div className='mt-8 flex items-center gap-8 justify-center lg:justify-start'>
                <div className='flex items-center gap-2'>
                  <div className='flex -space-x-2'>
                    <div className='w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white'></div>
                    <div className='w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full border-2 border-white'></div>
                    <div className='w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white'></div>
                  </div>
                  <p className='text-sm text-gray-600'>
                    <span className='font-semibold'>10,000+</span> students
                  </p>
                </div>
                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 text-yellow-500 fill-current' />
                  <span className='font-semibold'>4.9</span>
                  <span className='text-gray-600 text-sm'>(2,341 reviews)</span>
                </div>
              </div>
            </div>
            <div className='relative'>
              <div className='relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center'>
                      <BookOpen className='h-6 w-6 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>Reading Practice</h3>
                      <p className='text-sm text-gray-600'>Complete with 150+ passages</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center'>
                      <Headphones className='h-6 w-6 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>Listening Tests</h3>
                      <p className='text-sm text-gray-600'>Audio from native speakers</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                      <PenTool className='h-6 w-6 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>Writing Tasks</h3>
                      <p className='text-sm text-gray-600'>AI-powered feedback</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center'>
                      <MessageSquare className='h-6 w-6 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>Speaking Practice</h3>
                      <p className='text-sm text-gray-600'>Real-time conversation</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl transform -rotate-6 -z-10'></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <Badge className='mb-4 bg-indigo-100 text-indigo-700'>Why Choose IeltsMate?</Badge>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Everything You Need to Succeed
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Our comprehensive platform combines advanced AI technology with proven teaching
              methods to give you the edge in your IELTS preparation.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardHeader>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4'>
                  <Target className='h-6 w-6 text-white' />
                </div>
                <CardTitle className='text-xl'>Personalized Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  AI-powered assessment identifies your strengths and weaknesses, creating a
                  customized study plan just for you.
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardHeader>
                <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4'>
                  <Clock className='h-6 w-6 text-white' />
                </div>
                <CardTitle className='text-xl'>Real-time Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Get instant feedback on your performance with detailed explanations and
                  improvement suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardHeader>
                <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4'>
                  <Award className='h-6 w-6 text-white' />
                </div>
                <CardTitle className='text-xl'>Expert Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Practice with authentic materials created by IELTS experts and experienced
                  teachers.
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardHeader>
                <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <CardTitle className='text-xl'>Study Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Join study groups with other learners, practice together, and learn from each
                  other's experiences.
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardHeader>
                <div className='w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-4'>
                  <BookOpen className='h-6 w-6 text-white' />
                </div>
                <CardTitle className='text-xl'>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Monitor your progress with detailed analytics and see how you're improving over
                  time.
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardHeader>
                <div className='w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4'>
                  <Star className='h-6 w-6 text-white' />
                </div>
                <CardTitle className='text-xl'>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Get help whenever you need it with our round-the-clock support team and community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 bg-gradient-to-r from-blue-600 to-indigo-600'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-4 gap-8 text-center'>
            <div className='text-white'>
              <div className='text-4xl font-bold mb-2'>10,000+</div>
              <div className='text-blue-100'>Students Trained</div>
            </div>
            <div className='text-white'>
              <div className='text-4xl font-bold mb-2'>95%</div>
              <div className='text-blue-100'>Success Rate</div>
            </div>
            <div className='text-white'>
              <div className='text-4xl font-bold mb-2'>8.5+</div>
              <div className='text-blue-100'>Average Score</div>
            </div>
            <div className='text-white'>
              <div className='text-4xl font-bold mb-2'>50+</div>
              <div className='text-blue-100'>Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id='testimonials' className='py-20 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <Badge className='mb-4 bg-green-100 text-green-700'>Success Stories</Badge>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              What Our Students Say
            </h2>
            <p className='text-xl text-gray-600'>
              Real stories from real students who achieved their IELTS goals
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 text-yellow-500 fill-current' />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "IeltsMate helped me improve from 6.5 to 8.5 in just 3 months! The personalized
                  feedback was incredibly helpful."
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center'>
                    <span className='text-white font-semibold'>S</span>
                  </div>
                  <div>
                    <div className='font-semibold'>Sarah Johnson</div>
                    <div className='text-sm text-gray-500'>Score: 8.5</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 text-yellow-500 fill-current' />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "The speaking practice sessions were amazing. I felt confident on test day and
                  scored 8.0 in speaking!"
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center'>
                    <span className='text-white font-semibold'>M</span>
                  </div>
                  <div>
                    <div className='font-semibold'>Michael Chen</div>
                    <div className='text-sm text-gray-500'>Score: 8.0</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-md'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 text-yellow-500 fill-current' />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "The comprehensive practice tests and detailed explanations made all the
                  difference. Highly recommended!"
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center'>
                    <span className='text-white font-semibold'>A</span>
                  </div>
                  <div>
                    <div className='font-semibold'>Aisha Patel</div>
                    <div className='text-sm text-gray-500'>Score: 7.5</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-br from-blue-600 to-indigo-600'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
            Ready to Start Your IELTS Journey?
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Join thousands of successful students and master IELTS completely free. Start your
            journey to success today!
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              size='lg'
              className='bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg'
              variant={'ghost'}
            >
              Start Learning Free
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </div>
          <div className='mt-8 flex items-center justify-center gap-6 text-blue-100'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5' />
              <span>100% Free Forever</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5' />
              <span>No hidden fees</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5' />
              <span>Full access to all features</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuestPage;
