// ============================================================
// Learnhub — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const popularCourses = [
  { title: 'Full-Stack Web Development', instructor: 'Jason Park', rating: 4.8, students: 12400, price: '$79', thumb: 'bg-gradient-to-br from-primary/20 to-primary/5' },
  { title: 'UI/UX Design Fundamentals', instructor: 'Maria Santos', rating: 4.9, students: 8900, price: '$49', thumb: 'bg-gradient-to-br from-[hsl(var(--chart-2))]/20 to-[hsl(var(--chart-2))]/5' },
  { title: 'Data Science with Python', instructor: 'Dr. Lin Wei', rating: 4.7, students: 15200, price: '$99', thumb: 'bg-gradient-to-br from-[hsl(var(--chart-3))]/20 to-[hsl(var(--chart-3))]/5' },
  { title: 'Digital Marketing Strategy', instructor: 'Sophie Turner', rating: 4.6, students: 6300, price: '$19', thumb: 'bg-gradient-to-br from-[hsl(var(--chart-4))]/20 to-[hsl(var(--chart-4))]/5' },
]

export const categories = ['Programming', 'Design', 'Business', 'Science', 'Language', 'Marketing', 'Music', 'Photography']

export const allCourses = [
  { title: 'Full-Stack Web Development', instructor: 'Jason Park', rating: 4.8, students: 12400, price: '$79', category: 'Programming', color: 'from-primary/20 to-primary/5' },
  { title: 'UI/UX Design Fundamentals', instructor: 'Maria Santos', rating: 4.9, students: 8900, price: '$49', category: 'Design', color: 'from-[hsl(var(--chart-2))]/20 to-[hsl(var(--chart-2))]/5' },
  { title: 'Data Science with Python', instructor: 'Dr. Lin Wei', rating: 4.7, students: 15200, price: '$99', category: 'Programming', color: 'from-[hsl(var(--chart-3))]/20 to-[hsl(var(--chart-3))]/5' },
  { title: 'Digital Marketing Strategy', instructor: 'Sophie Turner', rating: 4.6, students: 6300, price: '$19', category: 'Business', color: 'from-[hsl(var(--chart-4))]/20 to-[hsl(var(--chart-4))]/5' },
  { title: 'React & Next.js Masterclass', instructor: 'Jason Park', rating: 4.9, students: 9800, price: '$89', category: 'Programming', color: 'from-primary/20 to-primary/5' },
  { title: 'Graphic Design for Beginners', instructor: 'Alex Rivera', rating: 4.5, students: 4200, price: '$29', category: 'Design', color: 'from-[hsl(var(--chart-5))]/20 to-[hsl(var(--chart-5))]/5' },
  { title: 'Business Analytics & BI', instructor: 'Emma Clarke', rating: 4.7, students: 7100, price: '$69', category: 'Business', color: 'from-[hsl(var(--chart-3))]/20 to-[hsl(var(--chart-3))]/5' },
  { title: 'Introduction to Physics', instructor: 'Dr. Raj Mehta', rating: 4.8, students: 3400, price: '$39', category: 'Science', color: 'from-[hsl(var(--chart-2))]/20 to-[hsl(var(--chart-2))]/5' },
  { title: 'Spanish for Professionals', instructor: 'Carmen Lopez', rating: 4.6, students: 5600, price: '$29', category: 'Language', color: 'from-[hsl(var(--chart-4))]/20 to-[hsl(var(--chart-4))]/5' },
  { title: 'Machine Learning Fundamentals', instructor: 'Dr. Lin Wei', rating: 4.8, students: 11300, price: '$99', category: 'Programming', color: 'from-primary/20 to-primary/5' },
]

export const curriculum = [
  {
    section: 'Getting Started',
    lessons: [
      { title: 'Welcome & Course Overview', duration: '5 min', locked: false },
      { title: 'Setting Up Your Environment', duration: '12 min', locked: false },
      { title: 'Your First Project', duration: '18 min', locked: false },
    ],
  },
  {
    section: 'Core Concepts',
    lessons: [
      { title: 'Understanding Components', duration: '22 min', locked: false },
      { title: 'State Management Deep Dive', duration: '28 min', locked: true },
      { title: 'Routing & Navigation', duration: '20 min', locked: true },
      { title: 'API Integration', duration: '25 min', locked: true },
    ],
  },
  {
    section: 'Advanced Topics',
    lessons: [
      { title: 'Performance Optimization', duration: '30 min', locked: true },
      { title: 'Testing Strategies', duration: '24 min', locked: true },
      { title: 'Deployment & CI/CD', duration: '18 min', locked: true },
    ],
  },
  {
    section: 'Final Project',
    lessons: [
      { title: 'Project Requirements', duration: '10 min', locked: true },
      { title: 'Building the Application', duration: '45 min', locked: true },
      { title: 'Code Review & Wrap Up', duration: '15 min', locked: true },
    ],
  },
]

export const reviews = [
  { name: 'Alex Kim', rating: 5, text: 'Best course I have taken on web development. Jason explains complex topics in a very approachable way.', date: 'Mar 15, 2026' },
  { name: 'Sarah Johnson', rating: 5, text: 'The projects were incredibly practical. I built my portfolio site during the course and landed a job.', date: 'Feb 28, 2026' },
  { name: 'David Chen', rating: 4, text: 'Great content overall. Would love to see more content on server-side rendering in the next update.', date: 'Feb 10, 2026' },
]
