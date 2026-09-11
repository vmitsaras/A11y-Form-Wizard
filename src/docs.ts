export interface PluginDocs {
  slug: string;
  name: string;
  packageName: string;
  description: string;
  repo?: string;
  npm?: string;
  install: {
    npm: string;
    pnpm: string;
    yarn: string;
  };
  usage: string;
  selectors?: string[];
  css?: {
    importPath: string;
    blockClass: string;
    publicProperties: string[];
    stateClasses: string[];
    variants: string[];
  };
  keyboard?: Array<{
    key: string;
    description: string;
  }>;
  options?: Array<{
    name: string;
    default: string;
    dataset?: string;
    description: string;
  }>;
  api: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  events?: Array<{
    name: string;
    description: string;
  }>;
  limitations?: string[];
  examples?: Array<{
    name: string;
    description: string;
    path: string;
  }>;
}

export const docs = {
  slug: "a11y-form-wizard",
  name: "A11y Form Wizard",
  packageName: "a11y-form-wizard",
  description:
    "Accessible, progressively enhanced multistep form wizard behavior for semantic HTML forms.",
  repo: "https://github.com/vmitsaras/A11y-Form-Wizard",
  install: {
    npm: "npm install a11y-form-wizard",
    pnpm: "pnpm add a11y-form-wizard",
    yarn: "yarn add a11y-form-wizard"
  },
  usage: `import { createA11yFormWizard } from "a11y-form-wizard";
import "a11y-form-wizard/styles.css";

const root = document.querySelector("[data-a11y-form-wizard]");
if (root instanceof HTMLElement) {
  createA11yFormWizard(root);
}`,
  selectors: [
    "[data-a11y-form-wizard]",
    "[data-a11y-form-wizard-step]",
    "[data-a11y-form-wizard-step-heading]",
    "[data-a11y-form-wizard-step-panel]",
    "[data-a11y-form-wizard-step-trigger]",
    "[data-a11y-form-wizard-step-status]",
    "[data-a11y-form-wizard-step-name]",
    "[data-a11y-form-wizard-choice-input]",
    "[data-a11y-form-wizard-next]",
    "[data-a11y-form-wizard-previous]",
    "[data-a11y-form-wizard-reset]",
    "[data-a11y-form-wizard-review-step]",
    "[data-a11y-form-wizard-review-value]",
    "[data-a11y-form-wizard-edit-step]",
    "[data-a11y-form-wizard-progress]",
    "[data-a11y-form-wizard-progress-item]",
    "[data-a11y-form-wizard-current-step]",
    "[data-a11y-form-wizard-total-steps]",
    "[data-a11y-form-wizard-error-summary]",
    "[data-a11y-form-wizard-error-container]",
    "[data-a11y-form-wizard-live]",
    "[data-a11y-form-wizard-success]",
    "[data-a11y-form-wizard-auto-advance]"
  ],
  css: {
    importPath: "a11y-form-wizard/styles.css",
    blockClass: "a11y-form-wizard",
    publicProperties: [
      "--afw-accent",
      "--afw-accent-strong",
      "--afw-text",
      "--afw-muted",
      "--afw-surface",
      "--afw-panel",
      "--afw-border",
      "--afw-control-border",
      "--afw-placeholder",
      "--afw-error",
      "--afw-focus",
      "--afw-radius",
      "--afw-card-width",
      "--afw-form-padding"
    ],
    stateClasses: [
      "is-initialized",
      "a11y-form-wizard--stacked",
      "is-active",
      "is-complete",
      "is-pending",
      "has-error",
      "is-submitting",
      "is-validating"
    ],
    variants: [
      "data-display-mode=\"stacked\"",
      "data-density=\"compact\"",
      "data-density=\"spacious\"",
      "data-skin=\"editorial-split\"",
      "data-skin=\"bento\"",
      "data-skin=\"timeline\"",
      "data-skin=\"terminal\"",
      "data-skin=\"mobile-sheet\""
    ]
  },
  keyboard: [
    {
      key: "Tab / Shift+Tab",
      description:
        "Moves through native form controls and wizard navigation controls in document order."
    },
    {
      key: "Space / Enter",
      description:
        "Activates native buttons, radios, checkboxes, and submit controls."
    },
    {
      key: "Radio choice",
      description:
        "Marked radio choices keep focus in place by default and can auto-advance only when explicitly enabled."
    },
    {
      key: "Enter",
      description:
        "Submits the form from native controls, validates all steps, and moves focus to the first invalid field when needed."
    },
    {
      key: "Error summary link",
      description:
        "Uses a native link to move focus to the associated invalid control."
    },
    {
      key: "Stacked step trigger",
      description:
        "In stacked mode, native button triggers can reopen completed or current steps without custom keyboard handling."
    }
  ],
  options: [
    {
      name: "startStep",
      default: "0",
      dataset: "data-start-step",
      description: "Zero-based step shown first."
    },
    {
      name: "displayMode",
      default: "single",
      dataset: "data-display-mode",
      description: "Use single-step or stacked display mode."
    },
    {
      name: "autoAdvanceChoice",
      default: "false",
      dataset: "data-auto-advance-choice",
      description:
        "Opt-in context change that advances after a valid marked radio choice."
    },
    {
      name: "autoAdvanceDelay",
      default: "140",
      dataset: "data-auto-advance-delay",
      description: "Delay in milliseconds before radio auto-advance."
    },
    {
      name: "preventSubmit",
      default: "true",
      dataset: "data-prevent-submit",
      description: "Prevents native submit and shows the success region for demos."
    },
    {
      name: "focusStepOnChange",
      default: "true",
      dataset: "data-focus-step-on-change",
      description: "Moves focus to the active step heading after step changes."
    },
    {
      name: "scrollOnStepChange",
      default: "true",
      dataset: "data-scroll-on-step-change",
      description: "Scrolls the focused heading into view after step changes."
    },
    {
      name: "validationFocus",
      default: "first-invalid",
      dataset: "data-validation-focus",
      description:
        "Moves focus to the first invalid control by default, or to the linked error summary when set to summary."
    },
    {
      name: "validationOwner",
      default: "wizard",
      description:
        "Programmatic-only ownership mode. Use external before connecting the optional A11y Form Validator bridge."
    },
    {
      name: "completedMessage",
      default: "built-in message",
      dataset: "data-completed-message",
      description: "Success text shown when demo submissions are prevented."
    },
    {
      name: "validationAdapter",
      default: "null",
      description:
        "Programmatic-only adapter for optional synchronous or asynchronous step and form validation."
    }
  ],
  api: [
    {
      name: "createA11yFormWizard(root, options)",
      type: "(root: HTMLElement, options?: A11yFormWizardOptions) => A11yFormWizardInstance",
      description: "Initializes the form wizard on a root element."
    },
    {
      name: "initA11yFormWizardAll(options)",
      type: "(options?: A11yFormWizardOptions) => A11yFormWizardInstance[]",
      description: "Initializes every [data-a11y-form-wizard] root in the document."
    },
    {
      name: "A11yFormWizard.initAll(options)",
      type: "(options?: A11yFormWizardOptions) => A11yFormWizardInstance[]",
      description: "Static alias for initA11yFormWizardAll(options)."
    },
    {
      name: "A11yFormWizard",
      type: "class",
      description:
        "Plugin class with duplicate initialization protection and lifecycle events."
    },
    {
      name: "createA11yFormValidatorBridge(options)",
      type: "(options: A11yFormValidatorBridgeOptions) => A11yFormValidatorBridgeInstance",
      description:
        "Optional integration exported from a11y-form-wizard/integrations/a11y-form-validator for the exact optional peer A11y Form Validator 1.0.19."
    },
    {
      name: "next(options)",
      type: "(options?: A11yFormWizardNavigationOptions) => boolean",
      description:
        "Runs native validation synchronously and moves to the next step without invoking an adapter."
    },
    {
      name: "nextAsync(options)",
      type: "(options?: A11yFormWizardNavigationOptions) => Promise<boolean>",
      description:
        "Runs native validation first, then the configured adapter, and moves only after the current result resolves valid."
    },
    {
      name: "previous(options)",
      type: "(options?: A11yFormWizardNavigationOptions) => boolean",
      description: "Moves to the previous step."
    },
    {
      name: "goToStep(index, options)",
      type: "(index: number, options?: A11yFormWizardNavigationOptions) => boolean",
      description: "Moves to a zero-based step index."
    },
    {
      name: "setValidationAdapter(adapter, owner)",
      type: "(adapter: A11yFormWizardValidationAdapter | null, owner?: 'wizard' | 'external') => void",
      description:
        "Connects an adapter or restores wizard validation. External ownership must be selected during initialization."
    },
    {
      name: "completeExternalSubmit(event)",
      type: "(event: SubmitEvent) => void",
      description:
        "Completes wizard submit behavior after an external validator replays a valid submission."
    },
    {
      name: "getData()",
      type: "() => Record<string, FormDataEntryValue | FormDataEntryValue[]>",
      description: "Returns the current FormData values as a plain object."
    },
    {
      name: "reset()",
      type: "() => void",
      description: "Resets form state and returns to the configured start step."
    },
    {
      name: "destroy()",
      type: "() => void",
      description:
        "Removes event listeners, restores managed attributes, and reveals all steps."
    }
  ],
  events: [
    {
      name: "a11y-form-wizard:init",
      description: "Widget initialized."
    },
    {
      name: "a11y-form-wizard:step-change",
      description: "Active step changed."
    },
    {
      name: "a11y-form-wizard:choice-change",
      description: "Marked radio choice changed."
    },
    {
      name: "a11y-form-wizard:validation-error",
      description: "Invalid data blocked progress or submit."
    },
    {
      name: "a11y-form-wizard:validation-start",
      description:
        "An adapter validation operation entered its single pending state."
    },
    {
      name: "a11y-form-wizard:validation-end",
      description:
        "Adapter validation ended as valid, invalid, error, timeout, or aborted."
    },
    {
      name: "a11y-form-wizard:submit",
      description: "Valid form submission attempted."
    },
    {
      name: "a11y-form-wizard:reset",
      description: "Widget reset."
    },
    {
      name: "a11y-form-wizard:destroy",
      description: "Widget destroyed."
    }
  ],
  limitations: [
    "The plugin enhances existing form markup; it does not create a backend, persist data, or replace server-side validation.",
    "The plugin never performs network requests. A validation adapter controls any remote work and is responsible for the privacy and security of transmitted form values.",
    "Review mappings copy only explicitly named, reviewable native control values into author-provided text targets. Password, file, hidden, and button-style inputs are excluded.",
    "Review output duplicates values in visible DOM. Authors must omit sensitive mappings or provide static redacted wording, and reset and destroy restore the original review markup.",
    "Native errors are announced and focused by the wizard. Adapter errors are rendered and announced by the adapter, while the wizard only reveals the requested step before adapter focus runs.",
    "The native error summary lists all distinct errors in the active step, keeps radio groups together, and preserves author-provided descriptions. Its behavior supports WCAG 3.3.1 and 3.3.3 but does not by itself establish conformance.",
    "Adapter validation uses a 15 second default timeout unless timeoutMs is a positive finite number. Reset and destroy abort the current signal, but an adapter must honor AbortSignal to stop its own network work.",
    "The A11y Form Wizard 1.0.0 package contract declares A11y Form Validator 1.0.19 as the exact optional peer for the bridge. The bridge requires validator submit ownership, disableNativeUI, and hidden-field validation.",
    "The package does not auto-initialize on import.",
    "Static demos use prevented submissions and placeholder form actions; production forms need real server endpoints.",
    "Accessibility behavior should be tested with the target browser and assistive technology combinations before release."
  ],
  examples: [
    {
      name: "Basic",
      description: "Package-style two-step semantic form wizard using dist imports.",
      path: "examples/basic"
    },
    {
      name: "Validator integration laboratory",
      description:
        "Native-only, synchronous, asynchronous, operational-failure, and teardown validation cases with screen reader expectations.",
      path: "examples/async-validation.html"
    },
    {
      name: "Review and edit",
      description:
        "Author-provided semantic review groups with safe field mappings and native edit buttons.",
      path: "examples/review-and-edit.html"
    },
    {
      name: "Print-friendly application review",
      description:
        "Semantic review markup and print CSS using only the browser-native print dialog.",
      path: "examples/print-friendly-review.html"
    },
    {
      name: "Minimal job form",
      description: "Compact two-step sample using the compiled dist entry and repository demo CSS.",
      path: "examples/minimal-job-form.html"
    },
    {
      name: "Customer support application",
      description: "Three-step application flow with radio choices and consent.",
      path: "examples/customer-support-application.html"
    },
    {
      name: "Split job application",
      description: "Editorial split-layout job application sample.",
      path: "examples/job-application.html"
    },
    {
      name: "Markup flexibility",
      description: "BEM, classless, split, timeline, and compact markup variants.",
      path: "examples/markup-flexibility.html"
    },
    {
      name: "Theme gallery",
      description: "Theme, skin, and density combinations.",
      path: "examples/theme-gallery.html"
    },
    {
      name: "Stacked application accordion",
      description: "Stacked display mode with step triggers, panels, and status text.",
      path: "examples/stacked-application-accordion.html"
    }
  ]
} satisfies PluginDocs;
