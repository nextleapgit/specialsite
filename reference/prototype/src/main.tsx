import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { StudioProvider } from './store';
import { App, DesignSystem } from './App';
import {
  Home,
  Articles,
  ArticleDetails,
  Projects,
  Newsletter,
  About,
  NotFound,
} from './public-pages';
import { Auth, Dashboard, Accounts } from './account-pages';
import { Loading, academyPage } from './components';
import './styles.css';
import './revision.css';
import './preferences.css';
import { Appearance } from './appearance';
import { Preferences } from './preferences';
const CurriculumAssistant = lazy(() =>
  import('./curriculum-assistant').then((m) => ({ default: m.CurriculumAssistant })),
);
const Training = lazy(() => import('./training-pages').then((m) => ({ default: m.Training })));
const Course = lazy(() => import('./training-pages').then((m) => ({ default: m.Course })));
const Lesson = lazy(() => import('./training-pages').then((m) => ({ default: m.LessonPage })));
const Progress = lazy(() => import('./training-pages').then((m) => ({ default: m.Progress })));
const Admin = lazy(() => import('./admin-pages').then((m) => ({ default: m.Admin })));
const Editor = lazy(() => import('./admin-pages').then((m) => ({ default: m.Editor })));
const Courses = lazy(() => import('./admin-pages').then((m) => ({ default: m.CourseManagement })));
const rootRoute = createRootRoute({ component: App, notFoundComponent: NotFound });
const lessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lesson/$id',
  component: () => {
    const { id } = lessonRoute.useParams();
    return <Lesson id={id} />;
  },
});
const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles/$id',
  component: () => {
    const { id } = articleRoute.useParams();
    return <ArticleDetails id={id} />;
  },
});
const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$id',
  component: () => {
    const { id } = projectRoute.useParams();
    return <Projects id={id} />;
  },
});
const additionalCourseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/training/course/$id',
  component: Course,
});
const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/preferences', component: Preferences }),
  additionalCourseRoute,
  createRoute({ getParentRoute: () => rootRoute, path: '/appearance', component: Appearance }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/curriculum-ai',
    component: CurriculumAssistant,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (academyPage() ? <Training /> : <Home />),
  }),
  createRoute({ getParentRoute: () => rootRoute, path: '/articles', component: Articles }),
  articleRoute,
  createRoute({ getParentRoute: () => rootRoute, path: '/projects', component: Projects }),
  projectRoute,
  createRoute({ getParentRoute: () => rootRoute, path: '/newsletter', component: Newsletter }),
  createRoute({ getParentRoute: () => rootRoute, path: '/training', component: Training }),
  createRoute({ getParentRoute: () => rootRoute, path: '/training/csharp', component: Course }),
  lessonRoute,
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <Auth key="login" mode="login" />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: () => <Auth key="register" mode="register" />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/forgot',
    component: () => <Auth key="forgot" mode="forgot" />,
  }),
  createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: Dashboard }),
  createRoute({ getParentRoute: () => rootRoute, path: '/progress', component: Progress }),
  createRoute({ getParentRoute: () => rootRoute, path: '/accounts', component: Accounts }),
  createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: Admin }),
  createRoute({ getParentRoute: () => rootRoute, path: '/admin/editor', component: Editor }),
  createRoute({ getParentRoute: () => rootRoute, path: '/admin/courses', component: Courses }),
  createRoute({ getParentRoute: () => rootRoute, path: '/about', component: About }),
  createRoute({ getParentRoute: () => rootRoute, path: '/design-system', component: DesignSystem }),
]);
if (location.pathname.endsWith('/academy.html') && !location.hash) location.hash = '/training';
const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultNotFoundComponent: NotFound,
});
createRoot(document.getElementById('root')!).render(
  <StudioProvider>
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  </StudioProvider>,
);
