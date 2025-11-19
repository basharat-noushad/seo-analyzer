# Manual QA Checklist - Competitor Page Analyzer

**Tester:** ________________
**Date:** ________________
**Build Version:** ________________
**Browser:** ________________
**Device:** ________________

---

## 1. Core Functionality

### 1.1 Basic Analysis (Single URL)

- [ ] Navigate to the Competitor Analyzer page
- [ ] Enter a valid competitor URL: `https://example.com`
- [ ] Click "Analyze Pages" button
- [ ] **Expected:** Loading state appears with progress indicators
- [ ] **Expected:** Analysis completes within 20 seconds
- [ ] **Expected:** Results page displays with all sections:
  - [ ] Summary cards (6 cards showing key metrics)
  - [ ] Meta Tags tab
  - [ ] Headings tab
  - [ ] Content tab
  - [ ] Links tab
  - [ ] Media tab
  - [ ] Schema tab
  - [ ] Technical tab

**Notes:** _______________________________________________

### 1.2 Comparison Mode (Two URLs)

- [ ] Refresh the page
- [ ] Enter competitor URL: `https://competitor.com`
- [ ] Enter your URL: `https://yoursite.com`
- [ ] Click "Analyze Pages"
- [ ] **Expected:** Both URLs are analyzed
- [ ] **Expected:** Comparison section appears below results
- [ ] **Expected:** Opportunities section lists improvement suggestions
- [ ] **Expected:** Strengths section lists your advantages
- [ ] **Expected:** Comparison score is displayed

**Notes:** _______________________________________________

---

## 2. Validation & Error Handling

### 2.1 Client-Side Validation

**Empty URL:**
- [ ] Leave competitor URL empty
- [ ] Try to submit form
- [ ] **Expected:** Submit button is disabled
- [ ] **Expected:** No API call is made

**Invalid URL Format:**
- [ ] Enter `not-a-valid-url` in competitor URL field
- [ ] **Expected:** Red border appears on input
- [ ] **Expected:** Error message displays: "Invalid URL format"
- [ ] **Expected:** Submit button is disabled

**Localhost URL:**
- [ ] Enter `http://localhost:3000` in competitor URL
- [ ] **Expected:** Error message: "Localhost URLs are not allowed"
- [ ] **Expected:** Submit button is disabled

**Private IP:**
- [ ] Enter `http://192.168.1.1` in competitor URL
- [ ] **Expected:** Error message about private IP
- [ ] **Expected:** Submit button is disabled

**SERP URL:**
- [ ] Enter `https://www.google.com/search?q=test`
- [ ] **Expected:** Error message about SERP URLs not allowed
- [ ] **Expected:** Submit button is disabled

**Identical URLs:**
- [ ] Enter `https://example.com` in both fields
- [ ] **Expected:** Error on "Your URL" field: "URLs must be different"
- [ ] **Expected:** Submit button is disabled

**Notes:** _______________________________________________

### 2.2 Server-Side Errors

**robots.txt Blocked:**
- [ ] Enter a URL known to block crawlers (test site)
- [ ] Submit form
- [ ] **Expected:** Error message: "Competitor URL: Analysis blocked by robots.txt"
- [ ] **Expected:** Error is displayed clearly to user

**Non-existent Domain:**
- [ ] Enter `https://this-domain-definitely-does-not-exist-12345.com`
- [ ] Submit form
- [ ] **Expected:** Error message about network/DNS failure
- [ ] **Expected:** User-friendly error (not raw error message)

**Rate Limiting:**
- [ ] Submit 11 analyses quickly (within 1 hour)
- [ ] **Expected:** 11th request shows rate limit error
- [ ] **Expected:** Error includes retry time

**Notes:** _______________________________________________

---

## 3. UI/UX Quality

### 3.1 Loading States

- [ ] Submit a valid URL
- [ ] **Check:** Loading progress component appears
- [ ] **Check:** Shows steps: "Validating URLs" → "Checking robots.txt" → "Fetching content" → "Analyzing"
- [ ] **Check:** URLs being analyzed are displayed
- [ ] **Check:** No content jumps or layout shifts during loading
- [ ] **Check:** Submit button is disabled during loading
- [ ] **Check:** Inputs are disabled during loading

**Notes:** _______________________________________________

### 3.2 Empty State

- [ ] Load the page for the first time
- [ ] **Check:** "Ready to Analyze" message is displayed
- [ ] **Check:** Helpful icon is shown
- [ ] **Check:** Description text explains what the tool does
- [ ] **Check:** List of features is visible

**Notes:** _______________________________________________

### 3.3 Results Display

- [ ] Complete a successful analysis
- [ ] **Check:** Page auto-scrolls to results
- [ ] **Check:** All summary cards display correct data
- [ ] **Check:** Tabs are clearly visible and clickable
- [ ] **Check:** Clicking each tab shows different content
- [ ] **Check:** Data in each tab is formatted properly
- [ ] **Check:** No data is cut off or overflowing
- [ ] **Check:** Colors indicate status (green=good, yellow=warning, red=error)

**Notes:** _______________________________________________

---

## 4. Responsive Design

### 4.1 Mobile (320px - 767px)

**Layout:**
- [ ] Open page on mobile device or resize browser to 375px
- [ ] **Check:** Header is readable and properly sized
- [ ] **Check:** Form inputs are full width
- [ ] **Check:** Submit button is easily tappable (min 44x44px)
- [ ] **Check:** Summary cards stack vertically (1 per row)
- [ ] **Check:** Tabs are horizontally scrollable
- [ ] **Check:** Results text is readable without zooming
- [ ] **Check:** No horizontal scrolling required

**Interactions:**
- [ ] Fill out form on mobile
- [ ] **Check:** Keyboard opens and inputs are visible
- [ ] **Check:** Can scroll to submit button
- [ ] **Check:** Tapping submit works
- [ ] **Check:** Can navigate tabs easily

**Notes:** _______________________________________________

### 4.2 Tablet (768px - 1023px)

- [ ] Resize to 768px width
- [ ] **Check:** Summary cards show 3 per row
- [ ] **Check:** Form layout is comfortable
- [ ] **Check:** Tabs are visible without scrolling
- [ ] **Check:** Comparison section (if shown) is readable

**Notes:** _______________________________________________

### 4.3 Desktop (1024px+)

- [ ] View on desktop at 1280px width
- [ ] **Check:** Content is centered with max-width
- [ ] **Check:** All 6 summary cards visible in one row
- [ ] **Check:** Tabs are horizontally aligned
- [ ] **Check:** Comparison table (if shown) is properly formatted
- [ ] **Check:** Ample white space, not cramped

**Notes:** _______________________________________________

---

## 5. Ad Slots & CLS Prevention

### 5.1 Ad Slot Presence

- [ ] Complete an analysis
- [ ] **Check:** Top ad slot appears after form section
- [ ] **Check:** Middle ad slots appear within results
- [ ] **Check:** Bottom ad slot appears after all results
- [ ] Inspect ad slots with DevTools
- [ ] **Check:** Ad containers have `min-height` set
- [ ] **Check:** Ad containers have reserved space (visible placeholder)

**Notes:** _______________________________________________

### 5.2 Cumulative Layout Shift (CLS)

- [ ] Open Chrome DevTools → Performance → Record
- [ ] Complete an analysis
- [ ] Stop recording
- [ ] **Check:** Look for layout shift warnings
- [ ] Run Lighthouse test
- [ ] **Check:** CLS score < 0.1 (Good)
- [ ] **Expected:** No content jumps when scrolling to results
- [ ] **Expected:** Ad slots don't push content down when loading

**Notes:** _______________________________________________

---

## 6. Accessibility

### 6.1 Keyboard Navigation

- [ ] Navigate to the page
- [ ] Press Tab repeatedly
- [ ] **Check:** Focus moves through: Competitor URL → Your URL → Submit button
- [ ] **Check:** Focus indicators are visible
- [ ] **Check:** Can submit form by pressing Enter in input field
- [ ] After results load, press Tab
- [ ] **Check:** Can navigate to tabs with Tab
- [ ] **Check:** Can activate tabs with Enter or Space

**Notes:** _______________________________________________

### 6.2 Screen Reader

- [ ] Enable screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Navigate to the page
- [ ] **Check:** Page title is announced
- [ ] **Check:** Form labels are announced ("Competitor URL", "Your URL")
- [ ] Enter invalid URL
- [ ] **Check:** Error message is announced
- [ ] Submit valid URL and wait for results
- [ ] **Check:** Results heading is announced
- [ ] **Check:** Can navigate through result sections

**Notes:** _______________________________________________

### 6.3 Color Contrast

- [ ] Inspect text with contrast checker
- [ ] **Check:** Body text has contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] **Check:** Headings have contrast ratio ≥ 4.5:1
- [ ] **Check:** Error text is readable (not just red, has icon)
- [ ] **Check:** Button text is readable on colored background

**Notes:** _______________________________________________

---

## 7. Browser Compatibility

Test the following on each browser:

### Chrome (latest)
- [ ] Page loads correctly
- [ ] All features work
- [ ] No console errors

### Firefox (latest)
- [ ] Page loads correctly
- [ ] All features work
- [ ] No console errors

### Safari (latest)
- [ ] Page loads correctly
- [ ] All features work
- [ ] No console errors

### Edge (latest)
- [ ] Page loads correctly
- [ ] All features work
- [ ] No console errors

### Mobile Safari (iOS)
- [ ] Page loads correctly
- [ ] Touch interactions work
- [ ] Form submission works

### Mobile Chrome (Android)
- [ ] Page loads correctly
- [ ] Touch interactions work
- [ ] Form submission works

**Notes:** _______________________________________________

---

## 8. Edge Cases

### 8.1 Content Edge Cases

**Page with no title:**
- [ ] Analyze a page without `<title>` tag
- [ ] **Expected:** Shows "No title found" or similar
- [ ] **Expected:** Recommendations suggest adding title

**Page with multiple H1s:**
- [ ] Analyze a page with 2+ H1 tags
- [ ] **Expected:** Warning displayed about multiple H1s
- [ ] **Expected:** Count is accurate

**Page with no structured data:**
- [ ] Analyze a simple page without JSON-LD
- [ ] **Expected:** Shows "No structured data found"
- [ ] **Expected:** Doesn't crash or show error

**Very large page:**
- [ ] Analyze a page >5MB in size
- [ ] **Expected:** Analysis completes or shows size limit error
- [ ] **Expected:** Doesn't hang indefinitely

**Notes:** _______________________________________________

### 8.2 URL Edge Cases

**URL with query parameters:**
- [ ] Analyze `https://example.com/page?id=123&sort=date`
- [ ] **Expected:** Analysis works correctly
- [ ] **Expected:** Query params are preserved in results

**URL with fragment:**
- [ ] Analyze `https://example.com/page#section`
- [ ] **Expected:** Fragment is removed before analysis
- [ ] **Expected:** Analysis completes successfully

**URL with trailing slash:**
- [ ] Analyze `https://example.com/page/`
- [ ] **Expected:** Works same as without trailing slash

**Very long URL:**
- [ ] Analyze a URL >2000 characters
- [ ] **Expected:** Rejected with "URL too long" error

**Notes:** _______________________________________________

---

## 9. Performance

- [ ] Open Chrome DevTools → Network tab
- [ ] Complete an analysis
- [ ] **Check:** API response time < 15 seconds
- [ ] **Check:** Page doesn't freeze during analysis
- [ ] **Check:** Memory usage is reasonable (check Task Manager)
- [ ] Run Lighthouse audit
- [ ] **Check:** Performance score > 80
- [ ] **Check:** First Contentful Paint < 2s
- [ ] **Check:** Time to Interactive < 4s

**Notes:** _______________________________________________

---

## 10. Data Accuracy

### 10.1 Known Good Page

Analyze a known page (e.g., your own site) and verify:

- [ ] **Title extraction:** Matches actual `<title>` tag
- [ ] **Meta description:** Matches actual meta description
- [ ] **H1 count:** Matches actual number of H1s on page
- [ ] **Word count:** Roughly accurate (within 10%)
- [ ] **Link count:** Roughly accurate
- [ ] **Image count:** Matches actual number of images
- [ ] **Structured data:** Detects known schema markup

**Notes:** _______________________________________________

---

## Summary

**Total Tests:** ______
**Passed:** ______
**Failed:** ______
**Blocked:** ______

**Critical Issues Found:**
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

**Minor Issues Found:**
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

**Overall Assessment:**
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes
- [ ] Blocked by critical issues

**Tester Signature:** ________________
**Date:** ________________
