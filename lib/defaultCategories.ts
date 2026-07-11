import { Category } from './types';

let order = 0;
const next = () => order++
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'education',
    ownerId: 'default',
    name: 'Education',
    group: 'Education',
    color: '#8b5cf6',
    icon: 'GraduationCap',
    order: next(),
    subcategories: [
      'English',
      'Urdu',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Computer Science',
      'Islamiat',
      'Pakistan Studies 1',
      'Pakistan Studies 2'
    ]
  },
  {
    id: 'entertainment',
    ownerId: 'default',
    name: 'Entertainment',
    group: 'Entertainment',
    color: '#2dd4bf',
    icon: 'Clapperboard',
    order: next(),
    subcategories: [
      'Anime',
      'Movies & TV Shows',
      'Video Games',
      'Social Media',
      'Music',
      'Books & Manga'
    ]
  },
  {
    id: 'personal',
    ownerId: 'default',
    name: 'Personal',
    group: 'Personal',
    color: '#f472b6',
    icon: 'Heart',
    order: next(),
    subcategories: [
      'Chores',
      'Exercise',
      'Health',
      'Reading',
      'Family',
      'Shopping',
      'Self-Care'
    ]
  }
];

export const MOTIVATIONAL_QUOTES = [
  'Small steps every day lead to big results.',
  'Discipline is choosing between what you want now and what you want most.',
  "Done is better than perfect — ship today's tasks.",
  'Your future is built by what you do today, not someday.',
  'Progress, not perfection.',
  'Focus on being productive instead of busy.',
  'The secret of getting ahead is getting started.',
  'Consistency beats intensity.',
  'A little progress each day adds up to big results.',
  'You do not have to be great to start, but you have to start to be great.'
];

export function quoteOfTheDay(): string {
  const day = new Date().getDate() + new Date().getMonth() * 31;
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
}
