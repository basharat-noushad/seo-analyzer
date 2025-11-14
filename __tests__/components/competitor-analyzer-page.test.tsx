/**
 * Frontend Tests: Competitor Analyzer Page
 *
 * Tests the main page component using React Testing Library.
 * Covers rendering, user interactions, and API integration.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CompetitorAnalyzerPage from '@/app/competitor-analyzer/page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock AdSlot component to avoid rendering issues in tests
jest.mock('@/components/AdSlot', () => ({
  AdSlot: ({ position }: { position: string }) => (
    <div data-testid={`ad-slot-${position}`}>Ad Slot {position}</div>
  ),
}));

// Mock LoadingSkeleton components
jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
  LoadingProgress: ({ competitorUrl, myUrl }: any) => (
    <div data-testid="loading-progress">
      Analyzing {competitorUrl} {myUrl && `and ${myUrl}`}
    </div>
  ),
}));

// ============================================================================
// TEST FIXTURES
// ============================================================================

const MOCK_SUCCESS_RESPONSE = {
  competitor: {
    url: 'https://example.com',
    originalUrl: 'https://example.com',
    timestamp: new Date().toISOString(),
    success: true,
    basicInfo: {
      httpStatus: 200,
      finalUrl: 'https://example.com',
      wasRedirected: false,
      contentType: 'text/html',
      contentLength: 5000,
      responseTime: 500,
    },
    seo: {
      title: {
        content: 'Example Page Title',
        length: 18,
        quality: {
          exists: true,
          withinIdealLength: false,
          tooShort: true,
          tooLong: false,
        },
        recommendations: ['Title is too short'],
      },
      metaDescription: {
        content: 'Example meta description',
        length: 24,
        quality: {
          exists: true,
          withinIdealLength: false,
          tooShort: true,
          tooLong: false,
        },
        recommendations: [],
      },
      metaRobots: {
        content: 'index, follow',
        directives: ['index', 'follow'],
        hasNoindex: false,
        hasNofollow: false,
      },
      canonical: {
        exists: true,
        url: 'https://example.com',
        isSelfReferencing: true,
      },
      lang: 'en',
      openGraph: {
        title: 'OG Title',
        description: 'OG Desc',
        image: 'https://example.com/image.jpg',
        isComplete: true,
      },
      twitterCard: {
        card: 'summary',
        isComplete: false,
      },
    },
    headings: {
      h1: ['Main Heading'],
      h2: ['Subheading 1', 'Subheading 2'],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      structure: [],
      quality: {
        hasH1: true,
        h1Count: 1,
        multipleH1Warning: false,
        missingH1Warning: false,
        totalCount: 3,
      },
    },
    content: {
      wordCount: 250,
      characterCount: 1500,
      paragraphCount: 5,
      textToHtmlRatio: 0.3,
      topKeywords: [
        { keyword: 'seo', count: 10, density: 4 },
        { keyword: 'analysis', count: 8, density: 3.2 },
      ],
      readingTime: 1.2,
    },
    links: {
      total: 15,
      internal: 10,
      external: 5,
      follow: 12,
      nofollow: 3,
      internalPercentage: 66.7,
      nofollowPercentage: 20,
      internalLinks: [],
      externalLinks: [],
    },
    media: {
      totalImages: 5,
      imagesWithAlt: 4,
      imagesWithoutAlt: 1,
      altPercentage: 80,
      images: [],
    },
    structuredData: {
      hasStructuredData: true,
      jsonLd: [{ type: 'Article', raw: {} }],
      total: 1,
      schemaTypes: ['Article'],
    },
    technical: {
      viewport: {
        exists: true,
        content: 'width=device-width',
        isMobileFriendly: true,
      },
      charset: 'UTF-8',
      hasDoctype: true,
      favicon: {
        exists: true,
        href: '/favicon.ico',
      },
    },
    warnings: [],
    errors: [],
  },
  meta: {
    timestamp: new Date().toISOString(),
    processingTime: 1500,
    version: '1.0',
    urlsAnalyzed: 1,
  },
};

const MOCK_ERROR_RESPONSE = {
  error: true,
  message: 'Analysis blocked: robots.txt disallows crawling of competitor URL',
  code: 'ROBOTS_TXT_DISALLOWED',
  urlContext: 'competitor',
  timestamp: new Date().toISOString(),
};

// ============================================================================
// TESTS
// ============================================================================

describe('CompetitorAnalyzerPage', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Initial Rendering', () => {
    it('should render the page without crashing', () => {
      render(<CompetitorAnalyzerPage />);
      expect(screen.getByText(/Competitor Page Analyzer/i)).toBeInTheDocument();
    });

    it('should render the form with required inputs', () => {
      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      const myUrlInput = screen.getByLabelText(/Your URL/i);
      const submitButton = screen.getByRole('button', { name: /Analyze Pages/i });

      expect(competitorInput).toBeInTheDocument();
      expect(myUrlInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('should show empty state on initial load', () => {
      render(<CompetitorAnalyzerPage />);
      expect(screen.getByText(/Ready to Analyze/i)).toBeInTheDocument();
    });

    it('should have submit button disabled initially', () => {
      render(<CompetitorAnalyzerPage />);
      const submitButton = screen.getByRole('button', { name: /Analyze Pages/i });
      // Button should be disabled because form is invalid
      expect(submitButton).toBeDisabled();
    });
  });

  describe('User Input', () => {
    it('should update competitor URL input on change', async () => {
      const user = userEvent.setup();
      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      await user.type(competitorInput, 'https://example.com');

      expect(competitorInput).toHaveValue('https://example.com');
    });

    it('should update my URL input on change', async () => {
      const user = userEvent.setup();
      render(<CompetitorAnalyzerPage />);

      const myUrlInput = screen.getByLabelText(/Your URL/i);
      await user.type(myUrlInput, 'https://mysite.com');

      expect(myUrlInput).toHaveValue('https://mysite.com');
    });

    it('should show validation error for invalid URL', async () => {
      const user = userEvent.setup();
      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      await user.type(competitorInput, 'not-a-valid-url');
      await user.tab(); // Trigger blur/validation

      await waitFor(() => {
        expect(screen.getByText(/Invalid URL format/i)).toBeInTheDocument();
      });
    });

    it('should enable submit button when valid URL is entered', async () => {
      const user = userEvent.setup();
      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      const submitButton = screen.getByRole('button', { name: /Analyze Pages/i });

      await user.type(competitorInput, 'https://example.com');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission - Success', () => {
    it('should show loading state during analysis', async () => {
      const user = userEvent.setup();

      // Mock a delayed response
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ json: async () => MOCK_SUCCESS_RESPONSE }), 100)
          )
      );

      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      const submitButton = screen.getByRole('button', { name: /Analyze Pages/i });

      await user.type(competitorInput, 'https://example.com');
      await user.click(submitButton);

      // Should show loading progress
      await waitFor(() => {
        expect(screen.getByTestId('loading-progress')).toBeInTheDocument();
      });
    });

    it('should display results after successful analysis', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_SUCCESS_RESPONSE,
      });

      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      const submitButton = screen.getByRole('button', { name: /Analyze Pages/i });

      await user.type(competitorInput, 'https://example.com');
      await user.click(submitButton);

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
      });

      // Check that summary cards are displayed
      expect(screen.getByText(/Title Tag/i)).toBeInTheDocument();
      expect(screen.getByText(/Meta Desc/i)).toBeInTheDocument();
    });

    it('should make API call with correct data', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_SUCCESS_RESPONSE,
      });

      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      await user.type(competitorInput, 'https://example.com');
      await user.click(screen.getByRole('button', { name: /Analyze Pages/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/analyze',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              competitorUrl: 'https://example.com',
              myUrl: undefined,
            }),
          })
        );
      });
    });

    it('should include myUrl in API call when provided', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_SUCCESS_RESPONSE,
      });

      render(<CompetitorAnalyzerPage />);

      await user.type(screen.getByLabelText(/Competitor URL/i), 'https://competitor.com');
      await user.type(screen.getByLabelText(/Your URL/i), 'https://mysite.com');
      await user.click(screen.getByRole('button', { name: /Analyze Pages/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/analyze',
          expect.objectContaining({
            body: JSON.stringify({
              competitorUrl: 'https://competitor.com',
              myUrl: 'https://mysite.com',
            }),
          })
        );
      });
    });
  });

  describe('Form Submission - Error Handling', () => {
    it('should display error message when API returns error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => MOCK_ERROR_RESPONSE,
      });

      render(<CompetitorAnalyzerPage />);

      await user.type(screen.getByLabelText(/Competitor URL/i), 'https://example.com');
      await user.click(screen.getByRole('button', { name: /Analyze Pages/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/Competitor URL.*robots\.txt disallows/i)
        ).toBeInTheDocument();
      });
    });

    it('should distinguish error context (competitor vs mine)', async () => {
      const user = userEvent.setup();

      const myUrlError = {
        ...MOCK_ERROR_RESPONSE,
        urlContext: 'mine',
        message: 'Your URL is blocked',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => myUrlError,
      });

      render(<CompetitorAnalyzerPage />);

      await user.type(screen.getByLabelText(/Competitor URL/i), 'https://competitor.com');
      await user.type(screen.getByLabelText(/Your URL/i), 'https://mysite.com');
      await user.click(screen.getByRole('button', { name: /Analyze Pages/i }));

      await waitFor(() => {
        expect(screen.getByText(/Your URL.*blocked/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<CompetitorAnalyzerPage />);

      await user.type(screen.getByLabelText(/Competitor URL/i), 'https://example.com');
      await user.click(screen.getByRole('button', { name: /Analyze Pages/i }));

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should not submit form with validation errors', async () => {
      const user = userEvent.setup();
      render(<CompetitorAnalyzerPage />);

      // Enter invalid URL
      await user.type(screen.getByLabelText(/Competitor URL/i), 'invalid-url');
      await user.click(screen.getByRole('button', { name: /Analyze Pages/i }));

      // Should not call fetch
      expect(global.fetch).not.toHaveBeenCalled();

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Please fix the validation errors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      const myUrlInput = screen.getByLabelText(/Your URL/i);

      expect(competitorInput).toHaveAttribute('id');
      expect(myUrlInput).toHaveAttribute('id');
    });

    it('should indicate invalid inputs with aria-invalid', async () => {
      const user = userEvent.setup();
      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      await user.type(competitorInput, 'invalid-url');
      await user.tab();

      await waitFor(() => {
        expect(competitorInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should associate error messages with inputs using aria-describedby', async () => {
      const user = userEvent.setup();
      render(<CompetitorAnalyzerPage />);

      const competitorInput = screen.getByLabelText(/Competitor URL/i);
      await user.type(competitorInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        const describedBy = competitorInput.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy!)).toBeInTheDocument();
      });
    });
  });
});
