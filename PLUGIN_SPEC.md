# Plugin Spec - A11y Form Wizard

## Goal

Create a reusable multistep form widget that can power accessible funnels such as job applications, onboarding forms, quote flows, eligibility checks, and intake forms.

The included example is an English job-application wizard for a Customer Support Specialist role.

## Public Contract

| Surface | Required name |
| --- | --- |
| JavaScript class | `A11yFormWizard` |
| CSS block | `.a11y-form-wizard` |
| Root data attribute | `data-a11y-form-wizard` |
| Palette attribute | `data-theme` |
| Skin attribute | `data-skin` |
| Density attribute | `data-density` |
| Events | `a11y-form-wizard:init`, `a11y-form-wizard:step-change`, `a11y-form-wizard:submit`, etc. |

## Content Model

Each wizard form should contain:

1. Optional hidden metadata fields.
2. One `fieldset` per step.
3. Native controls for all answers.
4. A progress indicator.
5. An error summary.
6. A polite live region.
7. Previous and next controls where manual navigation is useful.
8. A final submit step.

For job application examples, also include:

1. Hidden job metadata fields.
2. Radio-card steps for short single-choice questions.
3. A final contact-data fieldset.
4. Required privacy consent.
5. Optional talent-pool consent.
6. Honeypot field for basic spam mitigation.

## Default Example Steps

| Step | Purpose | Input type |
| ---: | --- | --- |
| 1 | Support background | Radio cards |
| 2 | Experience level | Radio cards |
| 3 | Schedule preference | Radio cards |
| 4 | Contact and consent | Text, email, tel, checkbox |

## Required Markup Contract

```html
<section class="a11y-form-wizard" data-a11y-form-wizard>
  <form action="/api/job-application" method="post">
    <progress aria-label="Form progress" data-a11y-form-wizard-progress></progress>
    <span data-a11y-form-wizard-current-step></span>
    <span data-a11y-form-wizard-total-steps></span>
    <div data-a11y-form-wizard-error-summary hidden></div>
    <div data-a11y-form-wizard-live aria-live="polite"></div>

    <fieldset data-a11y-form-wizard-step>
      <legend>Step label</legend>
      <h2 data-a11y-form-wizard-step-heading>Visible step title</h2>
      <label data-a11y-form-wizard-error-container>
        <input
          type="radio"
          name="question"
          required
          data-a11y-form-wizard-choice-input
        />
        <span>Choice text</span>
      </label>
      <button type="button" data-a11y-form-wizard-next>Continue</button>
    </fieldset>
  </form>
</section>
```

## Adaptation Rules

- Change hidden metadata such as `job_title`, `department`, `location`, and `employment_type` for each role.
- Use `data-theme` for palette, `data-skin` for layout/visual language, and `data-density` for spacing.
- Use `data-a11y-form-wizard-error-container` on custom field wrappers that should receive error state.
- Keep BEM classes optional for styling; JavaScript behavior should depend on data hooks and native semantics.
- Keep radio groups under six options when possible.
- Use a `select` only for longer option lists.
- Keep contact fields near the final step.
- Do not hide labels. Placeholders are examples only.
- Do not disable submit before validation; let users submit and receive clear errors.
- Validate all submitted values on the server.

## Event Integration Example

```js
const wizard = document.querySelector('[data-a11y-form-wizard]');

wizard.addEventListener('a11y-form-wizard:submit', (event) => {
  console.log(event.detail.data);
});
```

## Production Backend Notes

- Use `method="post"`.
- Validate all submitted values on the server.
- Add CSRF protection.
- Add rate limiting or CAPTCHA if exposed publicly.
- Do not store optional talent-pool consent unless the checkbox was selected.
