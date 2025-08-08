# Branch: aug-updates - Pre-merge Plan

Created: 2025-07-29
Target Merge: Before August 2025

## Overview

This plan outlines the tasks to be completed on the `aug-updates` branch before merging with `main`.

### Completed Tasks

- ✅ **Saumili Graduation Post** - Added July 2025 news about best master's thesis award
- ✅ **Fix Failing CI Tests** - Fixed CSS linting issues for weekly tests
- ✅ **Quick performance pass** - Implemented lazy-loading/decoding for news, history, about images; set footer logos to lazy with low fetchpriority; added rel="noopener noreferrer" to external links
- ✅ **Durham links update** - Pointed all Durham University links to staff profile: [durham.ac.uk/staff/vatsal-sanjay](https://www.durham.ac.uk/staff/vatsal-sanjay/)

## Tasks

### 1. Revamp Join Us Page

**Priority:** High  
**Estimated Time:** 2-3 hours  
**Status:** Pending

#### Subtasks:

- [ ] Review current join us page structure and content
- [ ] Design improved layout with better visual hierarchy
- [ ] Update content for clarity and engagement
- [ ] Add clear sections for:
  - [ ] PhD positions
  - [ ] Postdoc opportunities
  - [ ] Master's projects
  - [ ] Undergraduate research
- [ ] Implement responsive design improvements
- [ ] Add call-to-action buttons or contact information
- [ ] Test on multiple devices

#### Details:

- Focus on making the page more inviting and informative
- Consider adding testimonials or current member quotes
- Ensure consistency with overall site design

---

### 2. Optimization and Page Rendering Improvements

**Priority:** Medium  
**Estimated Time:** 3-4 hours  
**Status:** In Progress

#### Subtasks:

- [ ] Audit current page load times
- [ ] Optimize image assets:
  - [ ] Convert remaining images to WebP format
  - [x] Implement proper lazy loading
  - [ ] Ensure appropriate image dimensions
- [ ] Review and optimize CSS:
  - [ ] Remove unused styles
  - [ ] Consolidate media queries
  - [ ] Minify CSS files
- [ ] JavaScript optimization:
  - [ ] Check script loading order
  - [ ] Remove any unused dependencies
  - [ ] Ensure proper async/defer attributes
- [ ] Implement caching strategies
- [ ] Test improvements with Lighthouse

#### Details:

- Focus on Core Web Vitals metrics
- Prioritize changes that impact user experience
- Document performance improvements

---

### 3. Fix Failing Test Cases in CI

**Priority:** Critical  
**Estimated Time:** 1-2 hours  
**Status:** ✅ Completed

#### Subtasks:

- [x] Review current CI failures in GitHub Actions
- [x] Run tests locally to reproduce issues:

  ```bash
  npm test
  ./scripts/lint-check.sh
  ```

- [x] Common issues to check:
  - [x] Script loading order (command-palette.js before command-data.js)
  - [x] Line length violations (80 character limit)
  - [x] Quote consistency (double quotes)
  - [x] Missing test mocks
- [x] Fix identified issues
- [x] Update tests if needed
- [x] Verify all tests pass locally
- [x] Push fixes and monitor CI

#### Details:

- ✅ Fixed CSS linting issues by updating .stylelintrc.json for stylelint v16 compatibility
- ✅ Excluded vendor CSS files (fontello, academicons) from linting
- ✅ Auto-fixed style issues across all CSS files
- ✅ All tests now pass: `npm test` and `npm run lint:css`

---

## Timeline

**Total Estimated Time:** 6.5 - 9.5 hours

### Suggested Order:

1. ✅ **Fix CI tests first** (Critical blocker) - Completed
2. ✅ **Add Saumili graduation post** (Quick win) - Completed
3. **Revamp Join Us page** (High visibility)
4. **Optimization improvements** (Performance enhancement)

## Pre-merge Checklist

- [x] All CI tests passing
- [ ] Run full build locally: `./scripts/build.sh`
- [ ] Test site locally: `bundle exec jekyll serve`
- [ ] Review changes on different devices
- [ ] Update any relevant documentation
- [ ] Create PR with detailed description
- [ ] Request review if needed

## Notes

- Keep commits atomic and well-documented
- Run `./scripts/lint-check.sh` before each commit
- Test thoroughly on both development and production builds
- Consider creating a staging deployment for review
