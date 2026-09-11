import type {
  A11yFormWizardInstance,
  A11yFormWizardValidationAdapter,
  A11yFormWizardValidationContext,
  A11yFormWizardValidationResult,
} from "../index.js";

export type A11yFormValidatorBridgeOutput =
  | "validator-inline"
  | "validator-summary";

export type A11yFormValidatorBridgeLifecycle = "borrowed" | "transferred";

export interface A11yFormValidatorBridgeOwnership {
  validator: A11yFormValidatorBridgeLifecycle;
  output: A11yFormValidatorBridgeOutput;
}

export interface A11yFormValidatorBridgeMessages {
  pending?: string;
  operationalFailure?: string;
}

export interface A11yFormValidatorBridgeValidator {
  readonly options?: {
    validateOn?: string | string[];
    focusOnError?: "summary" | "first-invalid" | false;
    disableNativeUI?: boolean;
    validateHidden?: boolean;
  };
  validate(options?: { reason?: string }): Promise<boolean>;
  validateField(
    input: HTMLElement,
    options?: { reason?: string }
  ): Promise<boolean>;
  setErrors(errors?: {
    fields?: Record<string, string | string[] | undefined>;
    form?: string | string[];
    _form?: string | string[];
  }): unknown;
  focusOnError(): void;
  reset(): unknown;
  destroy(): void;
}

export interface A11yFormValidatorBridgeOptions {
  root: HTMLElement;
  wizard: A11yFormWizardInstance;
  validator: A11yFormValidatorBridgeValidator;
  ownership: A11yFormValidatorBridgeOwnership;
  messages?: A11yFormValidatorBridgeMessages;
}

export interface A11yFormValidatorBridgeInstance {
  readonly wizard: A11yFormWizardInstance;
  readonly validator: A11yFormValidatorBridgeValidator;
  readonly ownership: A11yFormValidatorBridgeOwnership;
}

interface ManagedAttribute {
  element: HTMLElement;
  name: string;
  value: string | null;
}

const ROOT_SELECTOR = "[data-a11y-form-wizard]";
const STEP_SELECTOR = "[data-a11y-form-wizard-step]";
const LIVE_SELECTOR = "[data-a11y-form-wizard-live]";
const VALIDATOR_SUMMARY_SELECTOR = ".a11y-form-validator__summary";
const VALIDATOR_SUMMARY_LINK_SELECTOR =
  ".a11y-form-validator__summary-link[href^='#']";
const PENDING_CONTROL_SELECTOR = [
  "[data-a11y-form-wizard-next]",
  "[data-a11y-form-wizard-previous]",
  "[data-a11y-form-wizard-step-trigger]",
  'button[type="submit"]',
  'input[type="submit"]',
].join(", ");
const NAVIGATION_CONTROL_SELECTOR = [
  "[data-a11y-form-wizard-next]",
  "[data-a11y-form-wizard-previous]",
  "[data-a11y-form-wizard-step-trigger]",
].join(", ");
const FORM_CONTROL_SELECTOR = "input, select, textarea";
const INVALID_CONTROL_SELECTOR =
  'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]';

const VALIDATOR_EVENTS = Object.freeze({
  beforeValidate: "a11y-form-validator:before-validate",
  fieldInvalid: "a11y-form-validator:field-invalid",
  formInvalid: "a11y-form-validator:form-invalid",
  submitBlocked: "a11y-form-validator:submit-blocked",
  submitReady: "a11y-form-validator:submit-ready",
  reset: "a11y-form-validator:reset",
  destroy: "a11y-form-validator:destroy",
});

const DEFAULT_MESSAGES = Object.freeze({
  pending: "Validating the form. Please wait.",
  operationalFailure:
    "We could not validate your information. Please try again.",
});

const bridges = new WeakMap<
  A11yFormWizardInstance,
  A11yFormValidatorBridgeInstance
>();

function eventDetail(event: Event): Record<string, unknown> {
  return event instanceof CustomEvent && event.detail && typeof event.detail === "object"
    ? (event.detail as Record<string, unknown>)
    : {};
}

function normalizeTriggers(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? [value] : [];
}

function getForm(root: HTMLElement): HTMLFormElement {
  const form =
    root instanceof HTMLFormElement
      ? root
      : root.querySelector<HTMLFormElement>("form");

  if (!(form instanceof HTMLFormElement)) {
    throw new TypeError("The validator bridge requires a form inside the wizard root.");
  }

  return form;
}

function validateConfiguration(
  root: HTMLElement,
  form: HTMLFormElement,
  validator: A11yFormValidatorBridgeValidator,
  ownership: A11yFormValidatorBridgeOwnership
): void {
  if (!root.matches(ROOT_SELECTOR)) {
    throw new TypeError(
      "The validator bridge root must match [data-a11y-form-wizard]."
    );
  }

  if (!form.noValidate) {
    throw new Error(
      "The validator must own novalidate before the bridge is connected."
    );
  }

  const options = validator.options;

  if (options) {
    if (!normalizeTriggers(options.validateOn).includes("submit")) {
      throw new Error(
        "The validator bridge requires validator submit validation."
      );
    }

    if (options.disableNativeUI !== true) {
      throw new Error(
        "The validator bridge requires disableNativeUI: true."
      );
    }

    if (options.validateHidden !== true) {
      throw new Error(
        "The validator bridge requires validateHidden: true so final submission includes every step."
      );
    }

    const expectedFocus =
      ownership.output === "validator-summary" ? "summary" : "first-invalid";

    if (options.focusOnError !== expectedFocus) {
      throw new Error(
        `The ${ownership.output} bridge mode requires focusOnError: "${expectedFocus}".`
      );
    }
  }

  const hasSummary = Boolean(form.querySelector(VALIDATOR_SUMMARY_SELECTOR));

  if (ownership.output === "validator-summary" && !hasSummary) {
    throw new Error(
      "The validator-summary bridge mode requires the validator error summary addon."
    );
  }

  if (ownership.output === "validator-inline" && hasSummary) {
    throw new Error(
      "The validator-inline bridge mode cannot be used with a validator error summary."
    );
  }
}

function distinctStepControls(step: HTMLElement): HTMLElement[] {
  const seen = new Set<string | HTMLElement>();

  return Array.from(step.querySelectorAll<HTMLElement>(FORM_CONTROL_SELECTOR)).filter(
    (control) => {
      const key =
        control instanceof HTMLInputElement &&
        (control.type === "radio" || control.type === "checkbox") &&
        control.name
          ? `${control.type}:${control.name}`
          : control;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }
  );
}

export function createA11yFormValidatorBridge(
  options: A11yFormValidatorBridgeOptions
): A11yFormValidatorBridgeInstance {
  const existing = bridges.get(options.wizard);
  if (existing) return existing;

  const { root, wizard, validator, ownership } = options;
  const form = getForm(root);
  const steps = Array.from(root.querySelectorAll<HTMLElement>(STEP_SELECTOR));
  const liveRegion = root.querySelector<HTMLElement>(LIVE_SELECTOR);
  const messages = { ...DEFAULT_MESSAGES, ...options.messages };
  const managedPendingAttributes: ManagedAttribute[] = [];
  let pending = false;
  let expectedReplay = false;
  let detached = false;
  let destroyingTransferredValidator = false;
  let stepValidationPending = false;
  let operationalAnnouncementTimer: number | null = null;

  validateConfiguration(root, form, validator, ownership);

  const announce = (message: string): void => {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    window.requestAnimationFrame(() => {
      if (!detached && liveRegion) liveRegion.textContent = message;
    });
  };

  const setPendingAttribute = (
    element: HTMLElement,
    name: string,
    value: string
  ): void => {
    if (
      !managedPendingAttributes.some(
        (attribute) => attribute.element === element && attribute.name === name
      )
    ) {
      managedPendingAttributes.push({
        element,
        name,
        value: element.getAttribute(name),
      });
    }
    element.setAttribute(name, value);
  };

  const beginPending = (): void => {
    if (pending) return;
    pending = true;
    root.classList.add("is-validating", "is-submitting");
    setPendingAttribute(form, "aria-busy", "true");
    root
      .querySelectorAll<HTMLElement>(PENDING_CONTROL_SELECTOR)
      .forEach((control) => setPendingAttribute(control, "aria-disabled", "true"));
    announce(messages.pending);
  };

  const clearPending = (): void => {
    pending = false;
    root.classList.remove("is-validating", "is-submitting");
    managedPendingAttributes.splice(0).forEach(({ element, name, value }) => {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    });
    if (liveRegion) liveRegion.textContent = "";
  };

  const firstInvalidControl = (
    scope: ParentNode = root
  ): HTMLElement | null => scope.querySelector<HTMLElement>(INVALID_CONTROL_SELECTOR);

  const stepIndexFor = (target: HTMLElement | null): number => {
    const step = target?.closest<HTMLElement>(STEP_SELECTOR);
    return step ? steps.indexOf(step) : -1;
  };

  const revealInvalidStep = (): HTMLElement | null => {
    const target = firstInvalidControl();
    const index = stepIndexFor(target);
    if (index >= 0) {
      wizard.goToStep(index, { focus: false, scroll: false });
    }
    return target;
  };

  const renderOperationalFailure = (): void => {
    validator.setErrors({ form: messages.operationalFailure });
    revealInvalidStep();
    if (ownership.output === "validator-inline") {
      if (operationalAnnouncementTimer !== null) {
        window.clearTimeout(operationalAnnouncementTimer);
      }
      operationalAnnouncementTimer = window.setTimeout(() => {
        operationalAnnouncementTimer = null;
        announce(messages.operationalFailure);
      }, 0);
    }
  };

  const validateStep = async (
    context: A11yFormWizardValidationContext
  ): Promise<A11yFormWizardValidationResult> => {
    if (detached || !context.step) return { valid: false };

    try {
      stepValidationPending = true;
      const results = await Promise.all(
        distinctStepControls(context.step).map((control) =>
          validator.validateField(control, { reason: "wizard-step" })
        )
      );
      const valid = results.every(Boolean);

      if (valid) return { valid: true };

      return {
        valid: false,
        stepIndex: context.stepIndex,
        errorTarget: firstInvalidControl(context.step) ?? undefined,
      };
    } catch {
      renderOperationalFailure();
      return {
        valid: false,
        stepIndex: context.stepIndex,
        errorTarget: firstInvalidControl(context.step) ?? undefined,
      };
    } finally {
      stepValidationPending = false;
    }
  };

  const adapter: A11yFormWizardValidationAdapter = {
    timeoutMs: false,
    validateStep,
    focusError({ result, trigger }) {
      if (ownership.output === "validator-summary") {
        validator.focusOnError();
        return;
      }

      if (result.errorTarget instanceof HTMLElement) {
        result.errorTarget.focus({ preventScroll: false });
        return;
      }

      trigger?.focus({ preventScroll: false });
    },
    reset() {
      clearPending();
      if (operationalAnnouncementTimer !== null) {
        window.clearTimeout(operationalAnnouncementTimer);
        operationalAnnouncementTimer = null;
      }
      validator.reset();
    },
    destroy() {
      detach(false);
      if (ownership.validator === "transferred") {
        destroyingTransferredValidator = true;
        validator.destroy();
        destroyingTransferredValidator = false;
      }
    },
  };

  const handleSubmitCapture = (event: Event): void => {
    if (!(event instanceof SubmitEvent)) return;

    if (expectedReplay) {
      expectedReplay = false;
      clearPending();
      wizard.completeExternalSubmit(event);
      return;
    }

    beginPending();
  };

  const handleNavigationCapture = (event: Event): void => {
    if (!pending || !(event.target instanceof Element)) return;
    if (!event.target.closest(NAVIGATION_CONTROL_SELECTOR)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const handleBeforeValidate = (event: Event): void => {
    if (eventDetail(event).reason === "submit") beginPending();
  };

  const handleFormInvalid = (): void => {
    revealInvalidStep();
  };

  const handleFieldInvalid = (): void => {
    if (
      ownership.output !== "validator-summary" ||
      !stepValidationPending
    ) {
      return;
    }

    form
      .querySelectorAll<HTMLElement>(".a11y-form-validator__error")
      .forEach((error) => {
        error.removeAttribute("role");
        error.removeAttribute("aria-live");
        error.removeAttribute("aria-atomic");
      });
  };

  const handleSubmitBlocked = (event: Event): void => {
    expectedReplay = false;
    clearPending();
    const cause = eventDetail(event).cause;

    if (cause === "validation-error" || cause === "resubmit-error") {
      renderOperationalFailure();
      validator.focusOnError();
    }
  };

  const handleSubmitReady = (): void => {
    expectedReplay = true;
  };

  const handleSummaryLinkCapture = (event: Event): void => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>(
      VALIDATOR_SUMMARY_LINK_SELECTOR
    );
    if (!link || !form.contains(link)) return;

    let targetId = link.hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      return;
    }
    const target = form.ownerDocument.getElementById(targetId);
    if (!(target instanceof HTMLElement) || !form.contains(target)) return;

    const index = stepIndexFor(target);
    if (index >= 0) {
      wizard.goToStep(index, { focus: false, scroll: false });
    }
  };

  const handleValidatorReset = (): void => {
    clearPending();
  };

  const handleValidatorDestroy = (): void => {
    if (destroyingTransferredValidator) return;
    detach(true);
  };

  const detach = (restoreWizardValidation: boolean): void => {
    if (detached) return;
    detached = true;
    clearPending();
    if (operationalAnnouncementTimer !== null) {
      window.clearTimeout(operationalAnnouncementTimer);
      operationalAnnouncementTimer = null;
    }
    form.removeEventListener("submit", handleSubmitCapture, true);
    root.removeEventListener("click", handleNavigationCapture, true);
    form.removeEventListener("click", handleSummaryLinkCapture, true);
    form.removeEventListener(VALIDATOR_EVENTS.beforeValidate, handleBeforeValidate);
    form.removeEventListener(VALIDATOR_EVENTS.fieldInvalid, handleFieldInvalid);
    form.removeEventListener(VALIDATOR_EVENTS.formInvalid, handleFormInvalid);
    form.removeEventListener(VALIDATOR_EVENTS.submitBlocked, handleSubmitBlocked);
    form.removeEventListener(VALIDATOR_EVENTS.submitReady, handleSubmitReady);
    form.removeEventListener(VALIDATOR_EVENTS.reset, handleValidatorReset);
    form.removeEventListener(VALIDATOR_EVENTS.destroy, handleValidatorDestroy);
    bridges.delete(wizard);

    if (restoreWizardValidation) {
      wizard.setValidationAdapter(null, "wizard");
    }
  };

  form.addEventListener("submit", handleSubmitCapture, true);
  root.addEventListener("click", handleNavigationCapture, true);
  form.addEventListener("click", handleSummaryLinkCapture, true);
  form.addEventListener(VALIDATOR_EVENTS.beforeValidate, handleBeforeValidate);
  form.addEventListener(VALIDATOR_EVENTS.fieldInvalid, handleFieldInvalid);
  form.addEventListener(VALIDATOR_EVENTS.formInvalid, handleFormInvalid);
  form.addEventListener(VALIDATOR_EVENTS.submitBlocked, handleSubmitBlocked);
  form.addEventListener(VALIDATOR_EVENTS.submitReady, handleSubmitReady);
  form.addEventListener(VALIDATOR_EVENTS.reset, handleValidatorReset);
  form.addEventListener(VALIDATOR_EVENTS.destroy, handleValidatorDestroy);

  wizard.setValidationAdapter(adapter, "external");

  const bridge = Object.freeze({ wizard, validator, ownership });
  bridges.set(wizard, bridge);
  return bridge;
}

export default createA11yFormValidatorBridge;
