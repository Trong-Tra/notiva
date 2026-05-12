import { Board, Space, Label } from '../types';
import { generateId } from '../utils/helpers';

const LABELS: Label[] = [
  { id: 'l1', name: 'High Priority', color: '#EF4444' },
  { id: 'l2', name: 'Medium', color: '#F59E0B' },
  { id: 'l3', name: 'Low', color: '#10B981' },
  { id: 'l4', name: 'Design', color: '#8B5CF6' },
  { id: 'l5', name: 'Dev', color: '#3B82F6' },
  { id: 'l6', name: 'Bug', color: '#DC2626' },
  { id: 'l7', name: 'Feature', color: '#059669' },
  { id: 'l8', name: 'Docs', color: '#6B7280' },
];

function daysFromNow(days: number): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function createMockSpace(): Space {
  return { name: 'Acme Corp', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30 };
}

export function createMockBoards(): Board[] {
  const b1id = generateId();
  const b1l1 = generateId();
  const b1l2 = generateId();
  const b1l3 = generateId();
  const b1l4 = generateId();

  const b2id = generateId();
  const b2l1 = generateId();
  const b2l2 = generateId();
  const b2l3 = generateId();
  const b2l4 = generateId();

  const b3id = generateId();
  const b3l1 = generateId();
  const b3l2 = generateId();
  const b3l3 = generateId();

  const b4id = generateId();
  const b4l1 = generateId();
  const b4l2 = generateId();
  const b4l3 = generateId();
  const b4l4 = generateId();

  const boards: Board[] = [
    {
      id: b1id,
      title: 'Product Roadmap',
      backgroundColor: '#0052CC',
      isStarred: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
      lists: [
        {
          id: b1l1,
          boardId: b1id,
          title: 'Backlog',
          position: 0,
          cards: [
            {
              id: generateId(),
              listId: b1l1,
              title: 'Dark mode support',
              description: 'Implement system-wide dark mode toggle with persistent preference.',
              position: 0,
              dueDate: daysFromNow(14),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[4], LABELS[6]],
              checklists: [
                {
                  id: generateId(),
                  title: 'Tasks',
                  items: [
                    { id: generateId(), title: 'Design color tokens', isChecked: true },
                    { id: generateId(), title: 'Update theme provider', isChecked: false },
                    { id: generateId(), title: 'Test on both platforms', isChecked: false },
                  ],
                },
              ],
            },
            {
              id: generateId(),
              listId: b1l1,
              title: 'Export to PDF',
              description: 'Allow users to export board summaries and reports as PDF.',
              position: 1,
              dueDate: daysFromNow(21),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[1], LABELS[4]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b1l1,
              title: 'Team activity feed',
              description: 'Global activity feed showing recent changes across all boards.',
              position: 2,
              dueDate: null,
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[2]],
              checklists: [],
            },
          ],
        },
        {
          id: b1l2,
          boardId: b1id,
          title: 'In Progress',
          position: 1,
          cards: [
            {
              id: generateId(),
              listId: b1l2,
              title: 'Board templates',
              description: 'Pre-built templates for common workflows: Kanban, Scrum, Simple List.',
              position: 0,
              dueDate: daysFromNow(3),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[0], LABELS[6]],
              checklists: [
                {
                  id: generateId(),
                  title: 'Tasks',
                  items: [
                    { id: generateId(), title: 'Define template schema', isChecked: true },
                    { id: generateId(), title: 'Build template picker UI', isChecked: true },
                    { id: generateId(), title: 'Seed default templates', isChecked: false },
                  ],
                },
              ],
            },
            {
              id: generateId(),
              listId: b1l2,
              title: 'Card attachments',
              description: 'Support image and file attachments on cards via camera roll.',
              position: 1,
              dueDate: daysFromNow(7),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[4]],
              checklists: [],
            },
          ],
        },
        {
          id: b1l3,
          boardId: b1id,
          title: 'Review',
          position: 2,
          cards: [
            {
              id: generateId(),
              listId: b1l3,
              title: 'Push notifications',
              description: 'Local push reminders for due dates and mentions.',
              position: 0,
              dueDate: daysFromNow(-2),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[0], LABELS[5]],
              checklists: [
                {
                  id: generateId(),
                  title: 'Tasks',
                  items: [
                    { id: generateId(), title: 'Request permissions', isChecked: true },
                    { id: generateId(), title: 'Schedule local notifications', isChecked: true },
                    { id: generateId(), title: 'Handle notification tap', isChecked: false },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: b1l4,
          boardId: b1id,
          title: 'Done',
          position: 3,
          cards: [
            {
              id: generateId(),
              listId: b1l4,
              title: 'Onboarding flow',
              description: '3-step onboarding for new users: workspace name, first board, first task.',
              position: 0,
              dueDate: daysFromNow(-5),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[6]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b1l4,
              title: 'Calendar view',
              description: 'Month-view calendar with dots on cards that have due dates.',
              position: 1,
              dueDate: daysFromNow(-8),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[4]],
              checklists: [],
            },
          ],
        },
      ],
    },
    {
      id: b2id,
      title: 'Sprint 24',
      backgroundColor: '#059669',
      isStarred: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      lists: [
        {
          id: b2l1,
          boardId: b2id,
          title: 'To Do',
          position: 0,
          cards: [
            {
              id: generateId(),
              listId: b2l1,
              title: 'Refactor auth store',
              description: 'Move auth logic from components into a dedicated store module.',
              position: 0,
              dueDate: daysFromNow(2),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[4]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b2l1,
              title: 'Update API types',
              description: 'Sync TypeScript interfaces with latest backend OpenAPI spec.',
              position: 1,
              dueDate: daysFromNow(4),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[7]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b2l1,
              title: 'Write unit tests for utils',
              description: 'Achieve 80% coverage on helper functions.',
              position: 2,
              dueDate: null,
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[2]],
              checklists: [],
            },
          ],
        },
        {
          id: b2l2,
          boardId: b2id,
          title: 'In Progress',
          position: 1,
          cards: [
            {
              id: generateId(),
              listId: b2l2,
              title: 'Performance audit',
              description: 'Profile render times and optimize heavy list renders.',
              position: 0,
              dueDate: daysFromNow(1),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[0]],
              checklists: [
                {
                  id: generateId(),
                  title: 'Tasks',
                  items: [
                    { id: generateId(), title: 'Run React DevTools profiler', isChecked: true },
                    { id: generateId(), title: 'Memoize expensive components', isChecked: false },
                    { id: generateId(), title: 'Virtualize long lists', isChecked: false },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: b2l3,
          boardId: b2id,
          title: 'Testing',
          position: 2,
          cards: [
            {
              id: generateId(),
              listId: b2l3,
              title: 'E2E login flow',
              description: 'Cypress tests covering happy path and error states.',
              position: 0,
              dueDate: daysFromNow(5),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[1]],
              checklists: [],
            },
          ],
        },
        {
          id: b2l4,
          boardId: b2id,
          title: 'Done',
          position: 3,
          cards: [
            {
              id: generateId(),
              listId: b2l4,
              title: 'Setup CI pipeline',
              description: 'GitHub Actions workflow for lint, typecheck, and test.',
              position: 0,
              dueDate: daysFromNow(-3),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[4]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b2l4,
              title: 'Upgrade to RN 0.81',
              description: 'Migrate codebase to React Native 0.81 and fix breaking changes.',
              position: 1,
              dueDate: daysFromNow(-6),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[4]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b2l4,
              title: 'Add Storybook',
              description: 'Component library docs with interactive stories.',
              position: 2,
              dueDate: daysFromNow(-10),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[3]],
              checklists: [],
            },
          ],
        },
      ],
    },
    {
      id: b3id,
      title: 'Marketing Q2',
      backgroundColor: '#7C3AED',
      isStarred: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      lists: [
        {
          id: b3l1,
          boardId: b3id,
          title: 'Ideas',
          position: 0,
          cards: [
            {
              id: generateId(),
              listId: b3l1,
              title: 'LinkedIn campaign',
              description: 'Targeted ads for engineering managers and product leads.',
              position: 0,
              dueDate: daysFromNow(10),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[1]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b3l1,
              title: 'Partner webinar series',
              description: 'Monthly webinars with integration partners.',
              position: 1,
              dueDate: null,
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[2]],
              checklists: [],
            },
          ],
        },
        {
          id: b3l2,
          boardId: b3id,
          title: 'In Progress',
          position: 1,
          cards: [
            {
              id: generateId(),
              listId: b3l2,
              title: 'Redesign landing page',
              description: 'New hero section, testimonials, and pricing table.',
              position: 0,
              dueDate: daysFromNow(0),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[0], LABELS[3]],
              checklists: [
                {
                  id: generateId(),
                  title: 'Tasks',
                  items: [
                    { id: generateId(), title: 'Wireframes', isChecked: true },
                    { id: generateId(), title: 'Hi-fi mockups', isChecked: true },
                    { id: generateId(), title: 'Copy review', isChecked: false },
                    { id: generateId(), title: 'Implement in Next.js', isChecked: false },
                  ],
                },
              ],
            },
            {
              id: generateId(),
              listId: b3l2,
              title: 'Q2 content calendar',
              description: 'Plan blog posts, tweets, and newsletters for the quarter.',
              position: 1,
              dueDate: daysFromNow(-1),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[1]],
              checklists: [],
            },
          ],
        },
        {
          id: b3l3,
          boardId: b3id,
          title: 'Published',
          position: 2,
          cards: [
            {
              id: generateId(),
              listId: b3l3,
              title: 'April newsletter',
              description: 'Product updates and customer spotlight.',
              position: 0,
              dueDate: daysFromNow(-4),
              hasTime: false,
              isCompleted: true,
              labels: [],
              checklists: [],
            },
          ],
        },
      ],
    },
    {
      id: b4id,
      title: 'Bug Tracker',
      backgroundColor: '#DC2626',
      isStarred: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      lists: [
        {
          id: b4l1,
          boardId: b4id,
          title: 'Open',
          position: 0,
          cards: [
            {
              id: generateId(),
              listId: b4l1,
              title: 'Crash on cold start',
              description: 'App crashes when launched without internet connection. Stack trace points to AsyncStorage init.',
              position: 0,
              dueDate: daysFromNow(0),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[0], LABELS[5]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b4l1,
              title: 'Calendar scroll lag',
              description: 'Month view stutters when scrolling quickly through many months.',
              position: 1,
              dueDate: daysFromNow(3),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[1], LABELS[5]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b4l1,
              title: 'Wrong badge count',
              description: 'Notification badge shows 0 when there are unread alerts.',
              position: 2,
              dueDate: daysFromNow(-2),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[5]],
              checklists: [],
            },
          ],
        },
        {
          id: b4l2,
          boardId: b4id,
          title: 'In Progress',
          position: 1,
          cards: [
            {
              id: generateId(),
              listId: b4l2,
              title: 'Card delete not syncing',
              description: 'Deleting a card does not remove it from the calendar view until restart.',
              position: 0,
              dueDate: daysFromNow(2),
              hasTime: false,
              isCompleted: false,
              labels: [LABELS[5]],
              checklists: [],
            },
          ],
        },
        {
          id: b4l3,
          boardId: b4id,
          title: 'Resolved',
          position: 2,
          cards: [
            {
              id: generateId(),
              listId: b4l3,
              title: 'Checklist items not saving',
              description: 'Toggling checklist items reverts after navigating away.',
              position: 0,
              dueDate: daysFromNow(-1),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[5]],
              checklists: [],
            },
          ],
        },
        {
          id: b4l4,
          boardId: b4id,
          title: 'Closed',
          position: 3,
          cards: [
            {
              id: generateId(),
              listId: b4l4,
              title: 'Typo in onboarding',
              description: 'Welcome screen says "Boardds" instead of "Boards".',
              position: 0,
              dueDate: daysFromNow(-7),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[2], LABELS[5]],
              checklists: [],
            },
            {
              id: generateId(),
              listId: b4l4,
              title: 'Login button unresponsive',
              description: 'Touch target too small on smaller iPhone screens.',
              position: 1,
              dueDate: daysFromNow(-12),
              hasTime: false,
              isCompleted: true,
              labels: [LABELS[5]],
              checklists: [],
            },
          ],
        },
      ],
    },
  ];

  return boards;
}
