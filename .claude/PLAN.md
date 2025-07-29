# Branch: aug-updates - Pre-merge Plan

Created: 2025-07-29
Target Merge: Before August 2025

## Overview
This plan outlines the tasks to be completed on the `aug-updates` branch before merging with `main`.

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
**Status:** Pending

#### Subtasks:
- [ ] Audit current page load times
- [ ] Optimize image assets:
  - [ ] Convert remaining images to WebP format
  - [ ] Implement proper lazy loading
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
**Status:** Pending

#### Subtasks:
- [ ] Review current CI failures in GitHub Actions
- [ ] Run tests locally to reproduce issues:
  ```bash
  npm test
  ./scripts/lint-check.sh
  ```
- [ ] Common issues to check:
  - [ ] Script loading order (command-palette.js before command-data.js)
  - [ ] Line length violations (80 character limit)
  - [ ] Quote consistency (double quotes)
  - [ ] Missing test mocks
- [ ] Fix identified issues
- [ ] Update tests if needed
- [ ] Verify all tests pass locally
- [ ] Push fixes and monitor CI

#### Details:
- Use `npm test -- --coverage` to check test coverage
- Run individual tests with `npm test -- [test-file-name]`
- Check `setup.js` for browser API mocks

---

## Timeline

**Total Estimated Time:** 6.5 - 9.5 hours

### Suggested Order:
1. **Fix CI tests first** (Critical blocker)
2. **Add Saumili graduation post** (Quick win)
3. **Revamp Join Us page** (High visibility)
4. **Optimization improvements** (Performance enhancement)

## Pre-merge Checklist

- [ ] All CI tests passing
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