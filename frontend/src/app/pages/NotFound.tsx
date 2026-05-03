import { Link, useRouteError, isRouteErrorResponse } from 'react-router';
import { ArrowLeft, FileQuestion, AlertTriangle } from 'lucide-react';

export function NotFound() {
  const error = useRouteError();
  let errorMessage = "Sorry, we couldn't find the page you're looking for.";
  let title = 'Page not found';
  let Icon = FileQuestion;

  if (isRouteErrorResponse(error)) {
    // 404 or other status code errors
    if (error.status === 404) {
      title = 'Page not found';
      errorMessage = "Sorry, we couldn't find the page you're looking for.";
    } else {
      title = `Error ${error.status}`;
      errorMessage = error.statusText;
      Icon = AlertTriangle;
    }
  } else if (error instanceof Error) {
    // Runtime errors
    title = 'Application Error';
    errorMessage = error.message;
    Icon = AlertTriangle;
  } else if (error) {
    // Unknown errors
    title = 'Unknown Error';
    errorMessage = 'An unexpected error occurred.';
    Icon = AlertTriangle;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Icon className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
          {errorMessage}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
