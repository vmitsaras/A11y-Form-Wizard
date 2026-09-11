# Manual QA And Accessibility Scenarios

## Summary

This script covers the A11y Form Wizard package, editable example sources, generated GitHub Pages output, and the package-style `examples/basic` integration. It is release evidence, not a claim of complete accessibility compliance.

## Test Scope

- In scope: editable sources in `examples/`, generated output in `docs/`, `examples/basic`, `examples/async-validation.html`, package exports, CSS import, keyboard flow, synchronous and asynchronous form validation, live updates, responsive layout, and Pages publishing from `/docs`.
- Out of scope: real backend submission, npm publishing, GitHub deployment, analytics, persistence, and server-side validation.
- Main user goals: install or import the package, initialize a semantic form wizard, complete a wizard with keyboard or touch, understand static demo limitations, and publish the static docs from `/docs`.
- Risk areas: stale docs metadata, hidden/focused step state, invalid field announcements, static `/api/...` demo actions, responsive overflow, package exports, and unchecked public-release claims.

## Test Environment

- Browser/device: Chrome latest, Firefox latest, Safari latest when available, iOS Safari or Android Chrome for touch.
- Viewports: 320px, 390px, 768px, 1024px, 1280px.
- Assistive technology spot checks: NVDA + Firefox or Chrome on Windows, VoiceOver + Safari on macOS or iOS.
- Browser settings: 200% zoom, forced colors or high contrast, `prefers-reduced-motion: reduce`.
- Required setup: run `npm run build`, then serve docs with `npm run docs:serve` and the repo root with `npm run start` when checking `examples/basic`.
- Required test data: `Ada Lovelace`, `ada@example.com`, `very.long.email.address.with.many.parts@example-company-domain.com`, `Invalid email`, empty required fields, and `Donaudampfschifffahrtsgesellschaftskapitan`.

## Scenario Index

| ID | Scenario | Priority | Area |
|---|---|---:|---|
| QA-001 | Build and package smoke check | Critical | Package |
| QA-002 | Docs home live demo happy path | Critical | Docs demo |
| QA-003 | Basic example dist import check | High | Package example |
| QA-DOCS-001 | README and docs metadata consistency | High | Documentation |
| QA-EDGE-001 | Missing required choice blocks progress | Critical | Validation |
| QA-EDGE-002 | Invalid email blocks submit | High | Validation |
| QA-A11Y-001 | Keyboard-only completion | Critical | Accessibility |
| QA-A11Y-002 | Screen reader names, roles, and announcements | High | Accessibility |
| QA-A11Y-003 | Stacked accordion step controls | High | Accessibility |
| QA-RWD-001 | Responsive and zoom reflow | High | Responsive |
| QA-RWD-002 | Long text and long email wrapping | Medium | Responsive |
| QA-RM-001 | Reduced motion behavior | Medium | Motion |
| QA-HC-001 | Forced colors and visible states | High | Accessibility |
| QA-DOCS-002 | GitHub Pages static asset links | High | Pages |
| QA-REG-001 | Destroy/reset behavior still cleans up | High | Regression |
| QA-ASYNC-001 | Async adapter pending, error, cancellation, and submit flow | Critical | Async validation |

## Test Scenarios

### QA-001 - Build and package smoke check

**Priority:** Critical  
**Area:** Package/build  
**User goal:** Confirm the package can be built and dry-packed before release.  
**Preconditions:** Dependencies are installed.  
**Test data:** Not applicable.  
**Steps:**
1. Run `npm run build`.
2. Run `npm run typecheck`.
3. Run `npm run test`.
4. Run `npm run pack:check`.
5. Inspect the dry-run pack list.

**Expected result:**
- Build, typecheck, tests, and pack check complete successfully.
- Pack contents include `dist/index.js`, `dist/index.d.ts`, `dist/docs.js`, `dist/docs.d.ts`, `dist/styles.css`, `README.md`, `CHANGELOG.md`, `LICENSE`, and `package.json`.
- Pack contents exclude `node_modules`, tests, local screenshots, `.env`, and source examples.

**Failure signs:**
- Missing declarations, missing CSS, failed tests, or unrelated files in pack output.

**Regression notes:**
- Package exports must continue to match README imports.

**Likely files:**
- `package.json`, `tsdown.config.ts`, `src/index.ts`, `src/docs.ts`, `src/styles.css`.

### QA-002 - Docs home live demo happy path

**Priority:** Critical  
**Area:** Docs demo  
**User goal:** Complete the embedded static demo without a backend.  
**Preconditions:** Run `npm run docs:serve` and open `http://127.0.0.1:4173/`.  
**Test data:** `ada@example.com`.  
**Steps:**
1. Choose "Job application" or "Customer intake".
2. Activate Continue.
3. Enter `ada@example.com`.
4. Submit the demo.

**Expected result:**
- Step text changes from 1 of 2 to 2 of 2.
- Focus moves intentionally to the active step heading or invalid control.
- Submit is prevented and a success message appears.
- No real network request is required for success.

**Failure signs:**
- Page navigates to `/api/demo-intake`, success is not shown, focus disappears, or console shows a module error.

**Regression notes:**
- Static Pages must remain usable without a server backend.

**Likely files:**
- `docs/index.html`, `docs/dist/index.js`, `docs/dist/styles.css`.

### QA-003 - Basic example dist import check

**Priority:** High  
**Area:** Package example  
**User goal:** Confirm the package-style example works after build.  
**Preconditions:** Run `npm run build` and `npm run start`, then open `http://127.0.0.1:4173/examples/basic/index.html`.  
**Test data:** `Ada Lovelace`, `ada@example.com`.  
**Steps:**
1. Open DevTools Console.
2. Complete the two-step example.
3. Reload the page and repeat once.

**Expected result:**
- The page imports `../../dist/index.js` and `../../dist/styles.css` without errors.
- The wizard initializes on each reload.
- No duplicate initialization symptoms appear.

**Failure signs:**
- Module import failure, unstyled form, duplicated events, or broken progress state.

**Regression notes:**
- `examples/basic` is the consumer-style import check.

**Likely files:**
- `examples/basic/index.html`, `dist/index.js`, `dist/styles.css`.

## Edge Case Scenarios

### QA-EDGE-001 - Missing required choice blocks progress

**Priority:** Critical  
**Area:** Validation  
**User goal:** Understand and fix a missing required radio choice.  
**Preconditions:** Open the docs home demo or `examples/basic`.  
**Test data:** Leave the first step blank.  
**Steps:**
1. Do not choose a radio option.
2. Activate Continue.
3. Observe focus and the error summary.
4. Choose an option.

**Expected result:**
- The wizard stays on the current step.
- Focus moves to the first invalid radio in the group.
- The error summary is visible and useful.
- Correcting the choice clears the relevant error state.

**Failure signs:**
- Progress advances, no error appears, focus moves to a hidden field, or error styling relies on color alone.

**Regression notes:**
- Tests cover invalid fields and clearing corrected choice errors.

**Likely files:**
- `src/index.ts`, `test/index.test.ts`.

### QA-EDGE-002 - Invalid email blocks submit

**Priority:** High  
**Area:** Validation  
**User goal:** Correct an invalid final-step email.  
**Preconditions:** Reach the final step of a demo.  
**Test data:** `Invalid email`, then `very.long.email.address.with.many.parts@example-company-domain.com`.  
**Steps:**
1. Enter `Invalid email` in the email field.
2. Submit.
3. Replace it with the long valid email.
4. Submit again.

**Expected result:**
- Invalid email blocks submit and focuses the email control.
- Error text is announced or available in the error summary.
- Valid replacement submits or shows the prevented-submit success state.

**Failure signs:**
- Invalid input submits, error text is not connected, or long valid email breaks layout.

**Regression notes:**
- Native validation remains the source of field validity.

**Likely files:**
- `src/index.ts`, `docs/index.html`, `examples/basic/index.html`.

### QA-EDGE-003 - Multiple errors stay navigable and current

**Priority:** Critical  
**Area:** Validation  
**User goal:** Review and correct every error in the active step.  
**Preconditions:** Reach the empty final step of `examples/basic`.  
**Test data:** Leave name and email empty, then correct them one at a time.  
**Steps:**
1. Submit the empty step.
2. Confirm the summary heading reports two errors.
3. Activate each summary link and observe focus.
4. Correct the name field.
5. Correct the email field.

**Expected result:**
- The summary contains one linked item per invalid field in document order.
- Focus initially moves to the name field unless summary focus was explicitly configured.
- Each link moves focus to its associated control.
- Correcting the name removes only the name error.
- Correcting the final error hides and clears the summary.
- Existing field descriptions remain connected throughout.

**Failure signs:**
- Only the first error appears, a link misses its target, focus enters a hidden step, the full summary is repeated for every field, or corrected errors remain visible.

**Regression notes:**
- Automated tests cover multiple fields, link targets, radio grouping, correction, hidden steps, explicit summary focus, and destroy restoration.

**Likely files:**
- `src/index.ts`, `src/styles.css`, `test/index.test.ts`, `examples/basic/index.html`.

## Accessibility Spot Checks

### QA-ASYNC-001 - Async adapter pending, error, cancellation, and submit flow

**Priority:** Critical  
**Area:** Async validation  
**User goal:** Complete remote-style checks without duplicate requests, lost focus, stale navigation, or repeated announcements.  
**Setup:** Build and serve the repository, then open `examples/async-validation.html`.  
**Steps:**
1. Enter `taken` and activate Check and continue twice quickly.
2. Confirm focus remains on the button while the check is pending.
3. Correct the username and continue.
4. Enter `person@blocked.example` and submit.
5. Confirm the final step remains visible before focus moves to the email field.
6. Start another check and activate Reset before it resolves.
7. Complete the form with accepted values.

**Expected result:**
- One validation operation starts for repeated activation.
- The initiating button has an understandable visible pending label and exposes busy state without leaving the focus order.
- Pending status is announced once.
- Adapter errors are announced once by adapter-owned output.
- Hidden invalid content is revealed before error focus moves.
- Reset aborts the active signal and a late result does not navigate or announce.
- Valid form validation reaches the prevented-submit success message.

**Failure signs:**
- Duplicate validation calls, focus loss, competing error announcements, a hidden focused field, stale navigation after reset, or controls that remain busy.

**Likely files:**
- `src/index.ts`, `src/styles.css`, `examples/async-validation.html`, `test/index.test.ts`.

### QA-A11Y-001 - Keyboard-only completion

**Priority:** Critical  
**Area:** Keyboard  
**User goal:** Complete the wizard without a mouse.  
**Setup:** Desktop browser, mouse untouched.  
**Steps:**
1. Tab from the browser address bar into the page.
2. Move through links, radio controls, Continue, Back, and Submit.
3. Use Space or Enter to activate radio choices and buttons.
4. Complete the form.

**Expected result:**
- Focus order follows visible content.
- Focus indicator is visible at all times.
- Selecting a radio does not change steps unless auto-advance was explicitly enabled and explained beforehand.
- Hidden inactive-step controls are not reached in single-step mode.
- There is no keyboard trap.

**Failure signs:**
- Focus lands in hidden content, active control has no visible focus style, or a user cannot finish by keyboard.

**Likely files:**
- `src/styles.css`, `src/index.ts`, `docs/index.html`, `examples/*.html`.

### QA-A11Y-002 - Screen reader names, roles, and announcements

**Priority:** High  
**Area:** Screen reader  
**User goal:** Understand step changes and errors with assistive technology.  
**Setup:** NVDA + Firefox/Chrome or VoiceOver + Safari.  
**Steps:**
1. Navigate by headings and form controls on the docs home demo.
2. Trigger a missing-choice error.
3. Correct the choice and move to the next step.
4. Submit successfully.

**Expected result:**
- The page has a clear heading structure and landmarks.
- Fieldsets expose useful legends or group context.
- Error and status regions announce useful updates without excessive repetition.
- Success messaging is reachable and understandable.

**Failure signs:**
- Controls are unnamed, error summary is silent, or step changes are confusing.

**Likely files:**
- `docs/index.html`, `src/index.ts`, `src/styles.css`.

### QA-A11Y-003 - Stacked accordion step controls

**Priority:** High  
**Area:** Stacked mode  
**User goal:** Navigate stacked steps with native button controls.  
**Setup:** Open `docs/examples/stacked-application-accordion.html`.  
**Steps:**
1. Tab through step trigger buttons.
2. Activate the first step trigger.
3. Complete a step and move forward.
4. Reopen a completed step with its trigger.

**Expected result:**
- Step triggers are buttons with visible focus.
- Expanded/collapsed state changes are reflected visually and programmatically.
- Locked future steps are not falsely presented as available.

**Failure signs:**
- Step trigger cannot be reached, future step opens unexpectedly, or `aria-expanded` state is stale.

**Likely files:**
- `examples/stacked-application-accordion.html`, `src/index.ts`, `src/styles.css`.

### QA-HC-001 - Forced colors and visible states

**Priority:** High  
**Area:** Forced colors / high contrast  
**User goal:** Use the wizard when custom colors are overridden.  
**Setup:** Windows forced colors or browser high-contrast emulation.  
**Steps:**
1. Open the docs home demo.
2. Tab through controls.
3. Trigger an error.
4. Select a radio and a checkbox, then compare each selected control with its unselected state.
5. Inspect the progress list after completing a step.
6. Repeat with the bundled contrast theme.

**Expected result:**
- Text, control boundaries, controls, focus, selected, disabled, and error states remain perceivable.
- Custom radio dots and checkbox checks remain visible with system `Canvas`, `CanvasText`, and `Highlight` colors.
- Field and secondary-button boundaries have at least 3:1 contrast against adjacent surfaces.
- The visible focus indicator has at least 3:1 contrast against adjacent colors.
- Active progress items are underlined and completed progress items have a check-shaped marker, so state is not communicated by color alone.

**Failure signs:**
- Focus disappears, selected radios are unclear, or error state becomes invisible.

**Likely files:**
- `src/styles.css`, `docs/dist/styles.css`.

## Responsive Spot Checks

### QA-RWD-001 - Responsive and zoom reflow

**Priority:** High  
**Area:** Responsive layout  
**User goal:** Complete demos on narrow and zoomed screens.  
**Setup:** 320px, 390px, 768px, 1024px, 1280px, plus 200% browser zoom.  
**Steps:**
1. Open `docs/`.
2. Check the hero, live demo, API table, markup table, and examples grid.
3. Complete the live demo at 320px and at 200% zoom.

**Expected result:**
- No page-level horizontal scrolling from code blocks or tables beyond their own scroll wrappers.
- Buttons and inputs remain reachable and readable.
- Sticky or fixed UI does not cover fields.

**Failure signs:**
- Text overlaps, controls clip, table breaks the page, or submit is unreachable.

**Likely files:**
- `docs/index.html`, `docs/assets/docs.css`, `src/styles.css`.

### QA-RWD-002 - Long text and long email wrapping

**Priority:** Medium  
**Area:** Responsive content  
**User goal:** Avoid layout breakage from long real-world strings.  
**Setup:** 320px viewport.  
**Test data:** `Donaudampfschifffahrtsgesellschaftskapitan`, `very.long.email.address.with.many.parts@example-company-domain.com`.  
**Steps:**
1. Enter the long name and email in a demo with contact fields.
2. Trigger validation and success states.
3. Inspect labels, fields, buttons, and status messages.

**Expected result:**
- Long strings do not cause unrecoverable horizontal page scrolling.
- Error and success text wraps legibly.

**Failure signs:**
- Field text escapes its container or pushes buttons off screen.

**Likely files:**
- `src/styles.css`, `docs/assets/docs.css`.

## Reduced Motion Scenarios

### QA-RM-001 - Reduced motion behavior

**Priority:** Medium  
**Area:** Motion  
**User goal:** Change steps without unnecessary smooth motion.  
**Setup:** Enable `prefers-reduced-motion: reduce`.  
**Steps:**
1. Open the docs home demo.
2. Move from step 1 to step 2.
3. Trigger an error and correct it.

**Expected result:**
- Step changes remain understandable.
- Scroll behavior avoids smooth animation when reduced motion is requested.
- CSS transitions do not create large or distracting motion.

**Failure signs:**
- Smooth scrolling persists or focus movement feels disorienting.

**Likely files:**
- `src/index.ts`, `src/styles.css`.

## Dynamic Content Scenarios

### QA-DYN-001 - Live regions and progress updates

**Priority:** High  
**Area:** Dynamic content  
**User goal:** Receive useful updates when the wizard changes.  
**Setup:** Screen reader optional, visual inspection required.  
**Steps:**
1. Complete the first step.
2. Observe progress text and progress value.
3. Trigger a validation error.
4. Submit successfully with prevented submit enabled.
5. Confirm the error summary has no `role` or `aria-live` attribute and listen for duplicate error announcements.

**Expected result:**
- Current step text, progress value, step classes, live region text, error summary, and success region update together.
- The dedicated wizard live region is the single announcement channel; the visible error summary is not a second live region.
- Updates are useful, ordered, and not duplicated.

**Failure signs:**
- Progress and visible step disagree, live text is stale, or success remains after reset/destroy.

**Likely files:**
- `src/index.ts`, `test/index.test.ts`.

## Documentation And Pages Checks

### QA-DOCS-001 - README and docs metadata consistency

**Priority:** High  
**Area:** Documentation  
**Steps:**
1. Confirm `package.json` identifies the package as `a11y-form-wizard` version `1.0.0`.
2. Search README, `src/docs.ts`, `examples/`, generated `docs/`, and this QA guide for stale claims that A11y Form Wizard itself is `1.0.19`.
3. Compare README install/import examples with `package.json` exports and the exact optional `a11y-form-validator@1.0.19` peer dependency.
4. Compare `src/docs.ts` selectors, options, methods, events, examples, and limitations with source and examples.
5. Compare the demo API tables with current options and methods, including `validationFocus`, `validationOwner`, `setValidationAdapter()`, and `completeExternalSubmit()`.
6. Confirm no docs claim complete WCAG compliance, live npm availability, or deployed Pages availability without verification.

**Expected result:**
- README, `src/docs.ts`, examples, and package metadata agree.
- Public docs identify the repository package contract as A11y Form Wizard `1.0.0`; `1.0.19` appears only where it identifies the exact A11y Form Validator peer.
- Any pre-release caveats are clearly stated.

**Failure signs:**
- A documented selector is not implemented, an example path is missing, demo API tables omit current public behavior, A11y Form Wizard is mislabeled as `1.0.19`, or install instructions imply a verified public release when none has been confirmed.

**Likely files:**
- `README.md`, `src/docs.ts`, `package.json`.

### QA-DOCS-002 - GitHub Pages static asset links

**Priority:** High  
**Area:** GitHub Pages  
**Preconditions:** Run `npm run pages:build` and `npm run docs:serve`.  
**Steps:**
1. Confirm documentation edits were made in `examples/` and that `docs/` was regenerated rather than patched manually.
2. Open `/`.
3. Open every example link in the Examples section.
4. Open `./dist/index.js`, `./dist/styles.css`, and each theme link in the Source section.
5. Review the console for missing asset or module errors.

**Expected result:**
- All links resolve under `/docs`.
- Paths are relative and safe for project Pages.
- `docs/.nojekyll` exists.
- Generated Pages contain the synchronized version, API, review, validation, privacy, and limitations guidance from `examples/index.html`.

**Failure signs:**
- Broken links, root-relative asset paths, or missing generated docs copies.

**Likely files:**
- `docs/index.html`, `scripts/build-pages.mjs`, `docs/.nojekyll`.

## Data Persistence / State Checks

Not applicable - no persistence, localStorage, sessionStorage, cookies, or server save behavior is implemented by the plugin.

## Negative / Failure Checks

### QA-ERROR-001 - Static backend caveat

**Priority:** Medium  
**Area:** Static docs  
**User goal:** Understand what happens if JavaScript is unavailable.  
**Steps:**
1. Disable JavaScript in the browser.
2. Open the docs home demo.
3. Inspect the form action and static page copy.

**Expected result:**
- Markup remains meaningful.
- Docs clearly state static demos do not provide a backend.
- Production docs direct users to real server endpoints and server-side validation.

**Failure signs:**
- Static page implies submissions are really sent or saved.

**Likely files:**
- `README.md`, `docs/index.html`, `examples/*.html`.

## Regression Checks

### QA-REG-001 - Destroy/reset behavior still cleans up

**Priority:** High  
**Area:** Public API regression  
**Steps:**
1. Run `npm run test`.
2. In a browser console on a demo page, initialize a wizard and call `destroy()`.
3. Confirm all steps are visible and disabled state is restored.
4. Initialize the same root again.

**Expected result:**
- Tests pass.
- Destroy removes listeners and managed state.
- Duplicate initialization still returns the existing instance until destroy removes it.

**Failure signs:**
- Hidden steps remain hidden, Back button remains disabled, duplicate listeners fire, or reinitialization fails.

**Likely files:**
- `src/index.ts`, `test/index.test.ts`.

## Release Decision

- Pass criteria: all critical and high scenarios pass, package checks pass, docs/metadata match source, and Pages links work under `/docs`.
- Blockers: failed build/typecheck/test/pack, missing package files, broken demo imports, keyboard trap, invisible focus, broken Pages asset paths, or unsupported public claims.
- Nice-to-fix issues: minor copy clarity, non-blocking responsive polish, or additional screenshots.
- Suggested next tests: browser automation screenshot pass at 320px and 1280px, plus a screen reader smoke test before public launch.

## Final QA Checklist

- [ ] Main happy path works.
- [ ] Required-field errors are clear and recoverable.
- [ ] Keyboard-only completion works.
- [ ] Focus order is logical and visible.
- [ ] Screen reader names, roles, states, and announcements are useful.
- [ ] Touch users can complete the same task.
- [ ] 320px, 390px, 768px, 1024px, and 1280px layouts work.
- [ ] Page works at 200% zoom.
- [ ] Forced colors preserve text, controls, focus, and state.
- [ ] Forced colors preserve visible radio selection and checkbox checks.
- [ ] Field and secondary-button boundaries meet 3:1 non-text contrast.
- [ ] Focus indicators meet 3:1 contrast against adjacent colors.
- [ ] Active and completed progress states have non-color indicators.
- [ ] Error updates use one live announcement channel without duplicates.
- [ ] Reduced motion users do not receive unnecessary smooth motion.
- [ ] Dynamic step, progress, error, and success updates stay in sync.
- [ ] No keyboard trap exists.
- [ ] Package build, typecheck, tests, and pack check pass.
- [ ] README, `src/docs.ts`, and examples agree with source.
- [ ] GitHub Pages asset paths are relative and static-safe.
- [ ] No console errors affect user behavior.
- [ ] No broken docs/examples remain.
