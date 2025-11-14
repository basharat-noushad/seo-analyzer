/**
 * URL Validation Hook
 *
 * Client-side URL validation before sending to API.
 * Provides immediate feedback to users.
 */

import { useState, useEffect } from 'react';
import { validateUrl, validateDifferentUrls } from '@/lib/url-validator';
import { ValidationResult } from '@/types/shared';

interface UseUrlValidationResult {
  competitorError: string | null;
  myUrlError: string | null;
  isValid: boolean;
  validate: () => boolean;
}

export function useUrlValidation(
  competitorUrl: string,
  myUrl: string
): UseUrlValidationResult {
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [myUrlError, setMyUrlError] = useState<string | null>(null);

  // Clear errors when URLs change
  useEffect(() => {
    setCompetitorError(null);
  }, [competitorUrl]);

  useEffect(() => {
    setMyUrlError(null);
  }, [myUrl]);

  const validate = (): boolean => {
    let valid = true;

    // Validate competitor URL
    if (competitorUrl.trim()) {
      const result = validateUrl(competitorUrl);
      if (!result.valid) {
        setCompetitorError(result.error || 'Invalid URL');
        valid = false;
      }
    }

    // Validate my URL if provided
    if (myUrl.trim()) {
      const result = validateUrl(myUrl);
      if (!result.valid) {
        setMyUrlError(result.error || 'Invalid URL');
        valid = false;
      }

      // Check if URLs are different
      if (competitorUrl.trim() && valid) {
        const diffResult = validateDifferentUrls(competitorUrl, myUrl);
        if (!diffResult.valid) {
          setMyUrlError(diffResult.error || 'URLs must be different');
          valid = false;
        }
      }
    }

    return valid;
  };

  const isValid = !competitorError && !myUrlError;

  return {
    competitorError,
    myUrlError,
    isValid,
    validate,
  };
}
