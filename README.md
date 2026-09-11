# A11y Form Wizard

Accessible, reusable, vanilla TypeScript multistep form wizard behavior for semantic HTML forms. The widget progressively enhances native markup, keeps state local to each instance, and uses real form controls, validation, focus movement, and live announcements.

## Installation

```bash
npm install a11y-form-wizard
pnpm add a11y-form-wizard
yarn add a11y-form-wizard
```

This repository documents the `1.0.0` package contract. The commands above
show the intended package usage; verify registry availability before presenting
them as a confirmed public release.

## Usage

```ts
import { createA11yFormWizard } from "a11y-form-wizard";
import "a11y-form-wizard/styles.css";

const root = document.querySelector("[data-a11y-form-wizard]");

if (root instanceof HTMLElement) {
  createA11yFormWizard(root, {
    preventSubmit: true,
    autoAdvanceChoice: false
  });
}
```

Use `initA11yFormWizardAll()` when a page contains multiple wizard roots:

```ts
import { initA11yFormWizardAll } from "a11y-form-wizard";

initA11yFormWizardAll();
```

The package does not auto-initialize on import.

## CSS

Default CSS is shipped as:

```ts
import "a11y-form-wizard/styles.css";
```

The stylesheet uses the `.a11y-form-wizard` BEM block, public custom properties with the `--afw-*` prefix, and private implementation variables with the `--_*` prefix. Focus outlines are preserved, error states do not rely on color alone, and transitions respect `prefers-reduced-motion`.

Useful public CSS hooks include:

| Hook | Purpose |
| --- | --- |
| `--afw-accent`, `--afw-accent-strong`, `--afw-focus` | Main action, emphasis, and focus colors. |
| `--afw-text`, `--afw-muted`, `--afw-surface`, `--afw-panel`, `--afw-border` | Core text, surface, and decorative border colors. |
| `--afw-control-border` | Field-shell and secondary-button boundary color; defaults to `var(--afw-muted)`. |
| `--afw-placeholder` | Placeholder text color; defaults to `var(--afw-muted)`. |
| `--afw-error`, `--afw-success-surface`, `--afw-success-border` | Error and prevented-submit success states. |
| `--afw-radius`, `--afw-card-width`, `--afw-form-padding` | Shape, measure, and component spacing. |
| `data-density="compact"` or `data-density="spacious"` | Built-in spacing presets. |
| `data-skin="bento"`, `data-skin="timeline"`, `data-skin="terminal"` | CSS-only layout treatments. |
| `.is-active`, `.is-complete`, `.is-pending`, `.has-error` | State classes applied by the plugin. |

Existing theme files remain in `src/themes/` for the static demos in this repository. The npm package exports the base `styles.css`.

## HTML Structure

Start with a real form and one `fieldset` per step:

```html
<section class="a11y-form-wizard" data-a11y-form-wizard>
  <form action="/apply" method="post">
    <progress aria-label="Form progress" data-a11y-form-wizard-progress max="2" value="1"></progress>
    <span data-a11y-form-wizard-current-step>1</span>
    <span data-a11y-form-wizard-total-steps>2</span>
    <div data-a11y-form-wizard-error-summary hidden></div>
    <div data-a11y-form-wizard-live></div>

    <fieldset data-a11y-form-wizard-step>
      <legend>Preference</legend>
      <h2 data-a11y-form-wizard-step-heading>Choose an option</h2>
      <label>
        <input
          type="radio"
          name="preference"
          value="email"
          required
          data-a11y-form-wizard-choice-input
        />
        Email
      </label>
      <button type="button" data-a11y-form-wizard-next>Continue</button>
    </fieldset>

    <fieldset data-a11y-form-wizard-step>
      <legend>Contact</legend>
      <h2 data-a11y-form-wizard-step-heading>Your contact details</h2>
      <label>
        Full name
        <input name="name" autocomplete="name" required />
      </label>
      <button type="button" data-a11y-form-wizard-previous>Back</button>
      <button type="submit">Submit</button>
      <p data-a11y-form-wizard-success tabindex="-1" hidden></p>
    </fieldset>
  </form>
</section>
```

Useful data attributes:

| Attribute | Purpose |
| --- | --- |
| `data-a11y-form-wizard` | Wizard root. |
| `data-a11y-form-wizard-step` | Step container, usually a `fieldset`. |
| `data-a11y-form-wizard-step-heading` | Preferred focus target after step changes. |
| `data-a11y-form-wizard-step-panel` | Optional collapsible panel for stacked display mode. |
| `data-a11y-form-wizard-step-trigger` | Optional native button trigger for stacked steps. |
| `data-a11y-form-wizard-step-status` | Optional visible step status text for stacked steps. |
| `data-a11y-form-wizard-step-name` | Optional human-readable step name for announcements. |
| `data-a11y-form-wizard-choice-input` | Radio input eligible for auto-advance. |
| `data-a11y-form-wizard-next` | Validates and moves to the next step. |
| `data-a11y-form-wizard-previous` | Moves to the previous step. |
| `data-a11y-form-wizard-reset` | Resets the wizard. |
| `data-a11y-form-wizard-review-step` | Marks an author provided review step that is populated when opened. |
| `data-a11y-form-wizard-review-value` | Maps a text target to a form control name. |
| `data-a11y-form-wizard-edit-step` | Maps a native edit button to an author provided step ID. |
| `data-a11y-form-wizard-progress` | Native progress element. |
| `data-a11y-form-wizard-progress-item` | Optional progress-list item updated with current/completed state. |
| `data-a11y-form-wizard-current-step` | Text target for the current one-based step number. |
| `data-a11y-form-wizard-total-steps` | Text target for the total step count. |
| `data-a11y-form-wizard-error-summary` | Empty block container where the plugin renders the active step's error heading and linked list. Do not add `role` or `aria-live`; the dedicated wizard live region handles announcements. |
| `data-a11y-form-wizard-error-container` | Optional wrapper that receives error state. |
| `data-a11y-form-wizard-live` | Polite live region for step updates. |
| `data-a11y-form-wizard-success` | Success message for prevented demo submits. |
| `data-start-step` | Zero-based starting step. |
| `data-display-mode` | `single` or `stacked`. |
| `data-auto-advance-choice` | `true` or `false`. |
| `data-auto-advance-delay` | Auto-advance delay in milliseconds. |
| `data-prevent-submit` | `true` for demos, `false` for native production submit. |
| `data-focus-step-on-change` | `true` or `false`. |
| `data-scroll-on-step-change` | `true` or `false`. |
| `data-validation-focus` | `first-invalid` or `summary`. Defaults to `first-invalid`. |
| `data-completed-message` | Custom prevented-submit success text. |

Radio auto-advance is disabled by default to avoid an unexpected context change when a choice is selected. Enable it only when the interface explains that behavior before the radio group. When enabled globally, set `data-a11y-form-wizard-auto-advance="false"` on any step that should retain an explicit Continue action.

Keep the error summary container empty and use a block element such as `div`, because the plugin inserts a heading and list. A failed validation attempt lists every distinct error in the active step in document order. Radio groups produce one error link. Each link moves focus to its associated control, and existing `aria-describedby` values are preserved. The default focus policy moves directly to the first invalid control; set `data-validation-focus="summary"` when you want the generated summary to receive focus first.

## Review and edit step

Review is an optional markup feature. You provide the headings, groups, terms,
fallback values, and native buttons. The plugin only copies values from fields
that you map explicitly.

```html
<fieldset
  id="review-step"
  data-a11y-form-wizard-step
  data-a11y-form-wizard-review-step
>
  <legend>Review</legend>
  <h2 data-a11y-form-wizard-step-heading>Review your answers</h2>

  <section aria-labelledby="review-contact-heading">
    <h3 id="review-contact-heading">Contact details</h3>
    <dl>
      <div>
        <dt>Email</dt>
        <dd data-a11y-form-wizard-review-value="email">Not provided</dd>
      </div>
    </dl>

    <button
      type="button"
      data-a11y-form-wizard-edit-step="contact-step"
      hidden
    >
      Edit contact details
    </button>
  </section>
</fieldset>
```

The review value must match a native form control `name`. Text inputs and
textareas use their current text. Selected radio buttons and checkboxes use
their associated label text. Select controls use the selected option text.
Grouped values are joined in document order.

Empty or missing values retain the target's original author provided content.
Mapped values are assigned with `textContent`, so user input is never parsed as
HTML. Edit targets are matched against step IDs inside the current wizard
instance. Activating an edit button uses the existing step navigation and moves
focus to that step's heading. No extra review live region is added.

Add `hidden` to review edit buttons for a meaningful fallback when JavaScript
does not run. Initialization reveals those buttons and `destroy()` restores
their original hidden state. Reset and destroy also restore the original review
value markup.

### Sensitive data

Review content creates another visible copy of a form value. Map only values
that are appropriate to repeat on screen. Password, file, hidden, submit,
reset, image, and button inputs are never copied into review output.

For redaction, omit the mapping and provide static author controlled text such
as `Provided, not displayed`. Visual masking is not a security boundary because
the original control still contains its value. The review feature does not use
storage, the clipboard, analytics, or the network.

## API

```ts
import {
  A11yFormWizard,
  createA11yFormWizard,
  initA11yFormWizardAll
} from "a11y-form-wizard";
```

### `createA11yFormWizard(root, options)`

Initializes a single root and returns an `A11yFormWizardInstance`. Duplicate initialization returns the existing instance for the same root.

### `initA11yFormWizardAll(options)`

Initializes every `[data-a11y-form-wizard]` root in the current document.

### `A11yFormWizard.initAll(options)`

Static alias for `initA11yFormWizardAll(options)`.

### Options

```ts
interface A11yFormWizardOptions {
  startStep?: number | string;
  displayMode?: "single" | "stacked" | string;
  autoAdvanceChoice?: boolean | string;
  autoAdvanceDelay?: number | string;
  preventSubmit?: boolean | string;
  focusStepOnChange?: boolean | string;
  scrollOnStepChange?: boolean | string;
  validationFocus?: "first-invalid" | "summary" | string;
  validationOwner?: "wizard" | "external";
  completedMessage?: string;
  validationAdapter?: A11yFormWizardValidationAdapter | null;
}
```

Options can also be provided through matching `data-*` attributes on the root. Dataset values are parsed safely with fallbacks.

`validationAdapter` is programmatic only. It is not parsed from HTML attributes.

### Async Validation Adapter

Use an adapter for optional server checks, cross-field rules, or other validation that may finish synchronously or asynchronously. The plugin does not make network requests or add a runtime dependency.

```ts
const wizard = createA11yFormWizard(root, {
  validationAdapter: {
    timeoutMs: 10_000,

    async validateStep(context) {
      const response = await fetch("/validate-step", {
        method: "POST",
        body: JSON.stringify(context.data),
        signal: context.signal,
        headers: { "content-type": "application/json" }
      });

      return response.ok ? { valid: true } : { valid: false };
    },

    validateForm(context) {
      return Promise.resolve({ valid: true });
    },

    focusError({ result }) {
      // Render and announce the adapter-owned error first.
      result.errorTarget?.focus();
    },

    reset() {
      // Clear adapter-owned error markup and local state.
    }
  }
});

await wizard.nextAsync();
```

Adapter validators receive the instance, root, form, current step, zero-based step index, a data snapshot, an `AbortSignal`, the initiating control when available, and the validation phase. Step validation receives only current-step data. Form validation receives the complete form data.

A validator may return its result directly or through a promise:

```ts
type A11yFormWizardValidationResult =
  | { valid: true }
  | {
      valid: false;
      stepIndex?: number;
      errorTarget?: HTMLElement;
    };
```

For a form-level invalid result, return `stepIndex` or an `errorTarget` inside that step. The wizard reveals the hidden step before it calls `focusError()`.

#### Validation ownership

- Native constraints always run first. When they fail, the wizard owns the error summary, announcement, `aria-invalid`, and focus.
- When an adapter returns `{ valid: false }`, the adapter owns its error rendering and announcement. The wizard does not create a second adapter-error message.
- A rejection, invalid adapter result, or timeout is an operational failure owned by the wizard. It shows one generic retry message and leaves focus on the initiating control.
- Server-side validation remains authoritative. Client and adapter validation are user-experience helpers only.

#### Pending, cancellation, and timeout behavior

- Only one adapter operation can be pending per wizard instance. Repeated Continue or Submit activation is ignored.
- The form receives `aria-busy="true"`; managed navigation controls receive `aria-disabled="true"`; the initiating button gets a visible `Validating…` label without losing focus.
- Editing a control, calling `reset()`, or calling `destroy()` aborts the current signal and invalidates its result.
- The adapter's `reset()` hook runs during both wizard reset and destroy so adapter-owned state can be cleared.
- Late or stale results cannot navigate, focus, announce, or update wizard state.
- The default timeout is 15 seconds. Set a positive finite `validationAdapter.timeoutMs` to override it.
- Aborting the signal prevents plugin updates immediately. The adapter must pass that signal to `fetch()` or otherwise honor it to stop its own work.

#### Lifecycle sequence

1. Native step or form constraints run.
2. The wizard enters one pending state and dispatches `a11y-form-wizard:validation-start`.
3. The selected adapter validator receives a data snapshot and `AbortSignal`.
4. The current result is checked; stale results are ignored.
5. A valid result navigates or resumes submission. An invalid result reveals its target step before adapter focus runs.
6. Pending state is restored and `a11y-form-wizard:validation-end` reports `valid`, `invalid`, `error`, `timeout`, or `aborted`.

### A11y Form Validator bridge

The optional bridge composes this package with A11y Form Validator without loading the validator from the main wizard entry.

#### Package and peer versions

The current repository package contract is A11y Form Wizard `1.0.0`.
`package.json` declares A11y Form Validator `1.0.19` as an exact optional peer
dependency until a wider compatibility range is tested.

| A11y Form Wizard | A11y Form Validator |
| --- | --- |
| `1.0.0` | `1.0.19` |

Install both packages when you use the bridge.

```bash
npm install a11y-form-wizard a11y-form-validator@1.0.19
```

Import both style sheets when validator inline errors or its summary should use the provided presentation.

```js
import "a11y-form-wizard/styles.css";
import "a11y-form-validator/styles.css";
```

#### Validator first initialization

```ts
import { createA11yFormWizard } from "a11y-form-wizard";
import {
  createFormValidator,
  createNoSummaryPreset
} from "a11y-form-validator";
import { createA11yFormValidatorBridge } from
  "a11y-form-wizard/integrations/a11y-form-validator";

const root = document.querySelector<HTMLElement>("[data-a11y-form-wizard]");
const form = root?.querySelector<HTMLFormElement>("form");

if (root && form) {
  const validator = createFormValidator(form, {
    ...createNoSummaryPreset(),
    validateHidden: true
  });
  const wizard = createA11yFormWizard(root, {
    validationOwner: "external"
  });

  createA11yFormValidatorBridge({
    root,
    wizard,
    validator,
    ownership: {
      validator: "borrowed",
      output: "validator-inline"
    }
  });
}
```

#### Wizard first initialization

The wizard may initialize first when external ownership is selected at construction. It will not set `novalidate` or generate validation ARIA while it waits for the bridge.

```ts
const wizard = createA11yFormWizard(root, {
  validationOwner: "external"
});

const validator = createFormValidator(form, {
  ...createNoSummaryPreset(),
  validateHidden: true
});

createA11yFormValidatorBridge({
  root,
  wizard,
  validator,
  ownership: {
    validator: "borrowed",
    output: "validator-inline"
  }
});
```

Do not initialize the wizard with its default validation ownership and transfer ownership later. The bridge rejects that setup because the validator could not reliably claim an existing `novalidate` attribute.

#### Summary output

Use the validator default preset when the validator summary should own error output and submit focus.

```ts
const validator = createFormValidator(form, {
  ...createDefaultPreset(),
  validateHidden: true
});

createA11yFormValidatorBridge({
  root,
  wizard,
  validator,
  ownership: {
    validator: "borrowed",
    output: "validator-summary"
  }
});
```

The bridge reveals the first invalid step before the validator focuses its summary or first invalid field. A summary link also reveals its target step before the validator moves focus.

During current step validation in summary mode, the bridge removes live region attributes from newly rendered validator inline errors before the browser presents the accessibility tree update. The field associations remain, while summary focus provides the single batch error presentation.

#### Ownership

| Concern | Owner |
| --- | --- |
| Step visibility, progress, and navigation | Wizard |
| Native rules, custom rules, inline errors, summary, validation ARIA, and server errors | Validator |
| `novalidate`, final submit prevention, and submit replay | Validator |
| Reveal before focus and pending submit status | Bridge |
| Validator destruction in `borrowed` mode | Consumer |
| Validator destruction in `transferred` mode | Bridge |

The bridge requires validator submit validation, `disableNativeUI: true`, and `validateHidden: true`. Inline mode requires `focusOnError: "first-invalid"` and no summary addon. Summary mode requires `focusOnError: "summary"` and the summary addon.

#### Validation behavior

Continue validates only distinct fields in the current step. Final submission stays with the validator and validates fields in every step. The wizard does not create validation messages, change `aria-invalid`, or connect its error summary while `validationOwner` is `external`.

The bridge uses the wizard live region for pending submit status. Validator errors remain the only field error and summary system. A rejected step rule or validator submit failure becomes one validator owned form error. Inline mode announces that operational failure in the existing wizard status region because it has no validator summary target.

Remote rules must provide their own bounded request timeout and cancellation. The bridge disables the wizard adapter timeout because A11y Form Validator 1.0.19 does not accept the wizard `AbortSignal`. Input, reset, and validator destruction still invalidate validator work through the validator lifecycle.

If the validator is destroyed first, the bridge restores built in wizard validation and the wizard takes ownership of `novalidate`. If the wizard is destroyed first, a borrowed validator remains active and a transferred validator is destroyed once.

Server validation remains authoritative. Apply backend errors with the validator `setErrors()` API, then call `focusOnError()` when immediate presentation is needed. The bridge will reveal the first affected hidden step before focus moves.

### Instance Methods

| Method | Description |
| --- | --- |
| `next(options?)` | Runs native validation synchronously and moves forward. It never invokes the adapter. |
| `nextAsync(options?)` | Runs native validation first, then the configured adapter, and resolves after navigation succeeds or fails. |
| `previous(options?)` | Moves back one step. |
| `goToStep(index, options?)` | Moves to a zero-based step index. |
| `setValidationAdapter(adapter, owner?)` | Connects an adapter. External ownership must be selected when the wizard is initialized. |
| `completeExternalSubmit(event)` | Completes wizard submit behavior after an external validator replays a valid submit. |
| `reset()` | Resets form state and returns to the configured start step. |
| `getData()` | Returns current `FormData` values as a plain object. |
| `destroy()` | Removes listeners, restores managed attributes, and reveals all steps. |

## Events

All lifecycle events bubble from the wizard root and include the instance in `event.detail.instance`.

| Event | When it fires |
| --- | --- |
| `a11y-form-wizard:init` | Widget initialized. |
| `a11y-form-wizard:step-change` | Active step changed. |
| `a11y-form-wizard:choice-change` | Marked radio-card value changed. |
| `a11y-form-wizard:validation-error` | Current or submitted step has invalid data. |
| `a11y-form-wizard:validation-start` | Adapter validation entered its pending state. |
| `a11y-form-wizard:validation-end` | Adapter validation ended as `valid`, `invalid`, `error`, `timeout`, or `aborted`. |
| `a11y-form-wizard:submit` | Valid form submission attempted. |
| `a11y-form-wizard:reset` | Widget reset. |
| `a11y-form-wizard:destroy` | Widget destroyed. |

## Accessibility Notes

- Designed to start from native `form`, `fieldset`, `legend`, `label`, `input`, and `button` semantics.
- Keeps keyboard behavior native for Tab, Shift+Tab, Space, and Enter.
- Moves focus to the active step heading after step changes when enabled.
- Renders a heading and linked list for all errors in the active step.
- Moves focus to the first invalid control by default, with opt-in summary focus.
- Announces one concise validation message while each invalid control references its own error text.
- Keeps focus on the initiating control while adapter validation is pending.
- Reveals a hidden adapter-invalid step before delegating error focus to the adapter.
- Updates progress text, progress value, active state, and completion state together.
- Uses live regions for step changes, validation errors, and prevented-submit success messaging.
- Uses ARIA only for state and relationships that native HTML does not provide.
- `destroy()` removes listeners and reveals all steps again.
- Client validation improves the user experience; server-side validation remains required.
- The error-summary behavior supports error identification and correction guidance associated with WCAG 3.3.1 and 3.3.3, but does not by itself establish conformance.
- Test the final form with your target browsers and assistive technologies before shipping.

## Limitations

- The plugin does not create, store, or submit data on its own. Connect production forms to a real server endpoint and keep server-side validation authoritative.
- The plugin never performs validation network requests itself. Any remote request, retry, authentication, privacy notice, and data minimization belongs to consumer adapter code.
- Review mappings duplicate selected values in visible DOM. Map only values that are safe to repeat, and use static author controlled text for redacted fields.
- Password, file, hidden, submit, reset, image, and button inputs are excluded from review mapping.
- Adapter cancellation is cooperative. Pass `context.signal` to abortable work; otherwise the plugin can ignore a stale result but cannot stop the underlying task.
- The adapter API does not provide caching, retries, offline queues, persistence, or backend submission.
- The package does not auto-initialize on import. Call `createA11yFormWizard()` or `initA11yFormWizardAll()` explicitly.
- Static demos use `preventSubmit: true` or `data-prevent-submit="true"` so they can show the success region without a backend.
- The theme files in `src/themes/` and `docs/assets/themes/` support repository demos. The npm package exports the base `styles.css`.
- Install commands show the intended package usage. Before public launch, verify that the npm package is published and reachable.

## Examples

- `examples/basic`: package-style example that imports from `../../dist/index.js` and `../../dist/styles.css`.
- `examples/async-validation.html`: validator integration laboratory covering native-only, synchronous, asynchronous, operational-failure, and teardown behavior with screen reader expectations.
- `examples/review-and-edit.html`: author provided semantic review groups with safe field mappings and native edit buttons.
- `examples/print-friendly-review.html`: semantic application review with a browser-native print action and print-only CSS; it does not generate PDFs or reconstruct wizard state.
- `examples/minimal-job-form.html`: compact job form demo using the compiled `dist` entry and repository demo CSS.
- `examples/customer-support-application.html`: full customer-support application sample.
- `examples/job-application.html`: split-layout job application sample.
- `examples/markup-flexibility.html`: BEM, classless, split, timeline, and compact markup variants.
- `examples/theme-gallery.html`: theme and skin combinations.
- `examples/stacked-application-accordion.html`: stacked accordion-style flow.

Build before opening `examples/basic`:

```bash
npm run build:dist
```

## Docs Metadata

Central documentation sites can import structured metadata:

```ts
import { docs } from "a11y-form-wizard/docs";
```
cks.
