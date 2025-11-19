/**
 * Loading Skeleton Component
 *
 * Shows placeholder while analysis is loading.
 * Better UX than just a spinner.
 */

export function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 h-32">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4 flex space-x-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-6 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Progress Component
 *
 * Shows analysis progress with steps.
 */

interface LoadingProgressProps {
  competitorUrl: string;
  myUrl?: string;
}

export function LoadingProgress({ competitorUrl, myUrl }: LoadingProgressProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Pages...</h3>
          <p className="text-sm text-gray-600">This may take up to 15 seconds</p>
        </div>

        <div className="space-y-3">
          <ProgressStep label="Validating URLs" status="completed" />
          <ProgressStep label="Checking robots.txt" status="in-progress" />
          <ProgressStep label="Fetching page content" status="pending" />
          <ProgressStep label="Analyzing SEO metrics" status="pending" />
          {myUrl && <ProgressStep label="Generating comparison" status="pending" />}
        </div>

        <div className="mt-6">
          <div className="text-xs text-gray-500 mb-2">Analyzing:</div>
          <div className="text-sm font-mono text-gray-700 break-all bg-gray-50 p-2 rounded">
            {competitorUrl}
          </div>
          {myUrl && (
            <div className="text-sm font-mono text-gray-700 break-all bg-gray-50 p-2 rounded mt-2">
              {myUrl}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressStep({ label, status }: { label: string; status: 'completed' | 'in-progress' | 'pending' }) {
  return (
    <div className="flex items-center">
      {status === 'completed' && (
        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {status === 'in-progress' && (
        <svg className="animate-spin w-5 h-5 text-primary-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {status === 'pending' && (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0"></div>
      )}
      <span className={`text-sm ${status === 'pending' ? 'text-gray-400' : 'text-gray-700'}`}>
        {label}
      </span>
    </div>
  );
}
