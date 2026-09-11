export type A11yFormWizardDisplayMode = "single" | "stacked";
export type A11yFormWizardValidationFocus = "first-invalid" | "summary";
export type A11yFormWizardValidationOwner = "wizard" | "external";

export interface A11yFormWizardOptions {
  startStep?: number | string;
  displayMode?: A11yFormWizardDisplayMode | string;
  autoAdvanceChoice?: boolean | string;
  autoAdvanceDelay?: number | string;
  preventSubmit?: boolean | string;
  focusStepOnChange?: boolean | string;
  scrollOnStepChange?: boolean | string;
  validationFocus?: A11yFormWizardValidationFocus | string;
  validationOwner?: A11yFormWizardValidationOwner;
  completedMessage?: string;
  validationAdapter?: A11yFormWizardValidationAdapter | null;
}

export type A11yFormWizardData = Record<
  string,
  FormDataEntryValue | FormDataEntryValue[]
>;

export interface A11yFormWizardNavigationOptions {
  focus?: boolean;
  scroll?: boolean;
  triggeredByChoice?: boolean;
}

export type A11yFormWizardValidationPhase = "step" | "form";

export interface A11yFormWizardValidationContext {
  instance: A11yFormWizardInstance;
  root: HTMLElement;
  form: HTMLFormElement;
  step: HTMLElement | null;
  stepIndex: number;
  data: A11yFormWizardData;
  signal: AbortSignal;
  trigger: HTMLElement | null;
  phase: A11yFormWizardValidationPhase;
}

export type A11yFormWizardValidationResult =
  | { valid: true }
  | {
      valid: false;
      stepIndex?: number;
      errorTarget?: HTMLElement;
    };

export interface A11yFormWizardValidationAdapter {
  validateStep?(
    context: A11yFormWizardValidationContext
  ): A11yFormWizardValidationResult | PromiseLike<A11yFormWizardValidationResult>;
  validateForm?(
    context: A11yFormWizardValidationContext
  ): A11yFormWizardValidationResult | PromiseLike<A11yFormWizardValidationResult>;
  focusError?(
    context: A11yFormWizardValidationContext & {
      result: Extract<A11yFormWizardValidationResult, { valid: false }>;
    }
  ): void;
  reset?(): void;
  destroy?(): void;
  timeoutMs?: number | false;
}

export interface A11yFormWizardInstance {
  next(options?: A11yFormWizardNavigationOptions): boolean;
  nextAsync(options?: A11yFormWizardNavigationOptions): Promise<boolean>;
  previous(options?: A11yFormWizardNavigationOptions): boolean;
  goToStep(index: number, options?: A11yFormWizardNavigationOptions): boolean;
  setValidationAdapter(
    adapter: A11yFormWizardValidationAdapter | null,
    owner?: A11yFormWizardValidationOwner
  ): void;
  completeExternalSubmit(event: SubmitEvent): void;
  reset(): void;
  getData(): A11yFormWizardData;
  destroy(): void;
}

interface NormalizedA11yFormWizardOptions {
  startStep: number;
  displayMode: A11yFormWizardDisplayMode;
  autoAdvanceChoice: boolean;
  autoAdvanceDelay: number;
  preventSubmit: boolean;
  focusStepOnChange: boolean;
  scrollOnStepChange: boolean;
  validationFocus: A11yFormWizardValidationFocus;
  validationOwner: A11yFormWizardValidationOwner;
  completedMessage: string;
  validationAdapter: A11yFormWizardValidationAdapter | null;
}

interface StepRenderOptions extends A11yFormWizardNavigationOptions {
  emit?: boolean;
  previousIndex?: number;
}

interface ValidationOptions {
  report?: boolean;
}

interface InvalidStepResult {
  stepIndex: number;
  control: FormControl;
}

interface ValidationError {
  control: FormControl;
  label: string;
  message: string;
}

interface ValidationErrorRenderOptions {
  announce?: boolean;
  dispatch?: boolean;
  focus?: boolean;
}

interface ManagedAttribute {
  element: HTMLElement;
  name: string;
  value: string | null;
}

interface ManagedControlState {
  element: HTMLElement;
  disabled?: boolean;
  ariaDisabled: string | null;
}

interface ManagedContentTarget {
  element: HTMLElement;
  originalChildren: Node[];
}

interface ManagedStyleProperty {
  value: string;
  priority: string;
}

interface StatusRegionConfig {
  idSuffix: string;
  role: string;
  ariaLive: "polite" | "assertive";
  ariaAtomic: "true";
}

interface ActiveValidation {
  id: number;
  phase: A11yFormWizardValidationPhase;
  controller: AbortController;
  trigger: HTMLElement | null;
  pendingAttributes: ManagedAttribute[];
  pendingNodes: HTMLElement[];
  timeoutId: number | null;
  resolveCancellation: () => void;
  cancellation: Promise<void>;
}

type ValidationCompletionStatus =
  | "valid"
  | "invalid"
  | "error"
  | "timeout"
  | "aborted";

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type LifecycleEventName = (typeof EVENTS)[keyof typeof EVENTS];
type LifecycleEventDetail = Record<string, unknown>;

const COMPONENT_NAME = "a11y-form-wizard";
const DEFAULT_VALIDATION_TIMEOUT = 15_000;
const VALIDATION_FAILURE_MESSAGE =
  "We could not validate your information. Please try again.";
const VALIDATION_PENDING_MESSAGES = Object.freeze({
  step: "Validating this step. Please wait.",
  form: "Validating the form. Please wait.",
} satisfies Record<A11yFormWizardValidationPhase, string>);
const VALIDATION_CANCELLED = Symbol("validation-cancelled");
const VALIDATION_TIMED_OUT = Symbol("validation-timed-out");

const DEFAULT_OPTIONS = Object.freeze({
  startStep: 0,
  displayMode: "single",
  autoAdvanceChoice: false,
  autoAdvanceDelay: 140,
  preventSubmit: true,
  focusStepOnChange: true,
  scrollOnStepChange: true,
  validationFocus: "first-invalid",
  validationOwner: "wizard",
  completedMessage:
    "Thanks. Your application has been received. We will contact you soon.",
  validationAdapter: null,
} satisfies NormalizedA11yFormWizardOptions);

const SELECTORS = Object.freeze({
  root: "[data-a11y-form-wizard]",
  form: "form",
  step: "[data-a11y-form-wizard-step]",
  stepHeading: "[data-a11y-form-wizard-step-heading]",
  stepPanel: "[data-a11y-form-wizard-step-panel]",
  stepTrigger: "[data-a11y-form-wizard-step-trigger]",
  stepStatus: "[data-a11y-form-wizard-step-status]",
  choiceInput: "[data-a11y-form-wizard-choice-input]",
  next: "[data-a11y-form-wizard-next]",
  previous: "[data-a11y-form-wizard-previous]",
  reset: "[data-a11y-form-wizard-reset]",
  reviewStep: "[data-a11y-form-wizard-review-step]",
  reviewValue: "[data-a11y-form-wizard-review-value]",
  editStep: "[data-a11y-form-wizard-edit-step]",
  currentStepText: "[data-a11y-form-wizard-current-step]",
  totalStepText: "[data-a11y-form-wizard-total-steps]",
  progressBar: "[data-a11y-form-wizard-progress]",
  progressItem: "[data-a11y-form-wizard-progress-item]",
  errorSummary: "[data-a11y-form-wizard-error-summary]",
  errorSummaryLink: "[data-a11y-form-wizard-error-link]",
  errorContainer: [
    "[data-a11y-form-wizard-error-container]",
    ".a11y-form-wizard__field",
    ".a11y-form-wizard__choice",
    ".a11y-form-wizard__consent",
  ].join(", "),
  liveRegion: "[data-a11y-form-wizard-live]",
  successRegion: "[data-a11y-form-wizard-success]",
  pendingControl: [
    "[data-a11y-form-wizard-next]",
    "[data-a11y-form-wizard-previous]",
    "[data-a11y-form-wizard-step-trigger]",
    "[data-a11y-form-wizard-edit-step]",
    'button[type="submit"]',
    'input[type="submit"]',
  ].join(", "),
});

const CLASSES = Object.freeze({
  initialized: "is-initialized",
  stacked: `${COMPONENT_NAME}--stacked`,
  activeStep: "is-active",
  completedStep: "is-complete",
  pendingStep: "is-pending",
  hasError: "has-error",
  isSubmitting: "is-submitting",
  isValidating: "is-validating",
  validationLabel: `${COMPONENT_NAME}__validation-label`,
  errorSummaryHeading: `${COMPONENT_NAME}__error-summary-heading`,
  errorSummaryList: `${COMPONENT_NAME}__error-summary-list`,
  errorSummaryItem: `${COMPONENT_NAME}__error-summary-item`,
  errorSummaryLink: `${COMPONENT_NAME}__error-summary-link`,
  errorSummaryMessage: `${COMPONENT_NAME}__error-summary-message`,
  isComplete: "is-complete",
});

const ATTRIBUTES = Object.freeze({
  hidden: "hidden",
  role: "role",
  ariaCurrent: "aria-current",
  ariaControls: "aria-controls",
  ariaDescribedBy: "aria-describedby",
  ariaLive: "aria-live",
  ariaAtomic: "aria-atomic",
  ariaExpanded: "aria-expanded",
  ariaInvalid: "aria-invalid",
  ariaDisabled: "aria-disabled",
  ariaBusy: "aria-busy",
  ariaLabelledBy: "aria-labelledby",
  tabIndex: "tabindex",
  dataErrorTarget: "data-a11y-form-wizard-error-target",
  dataStepIndex: "data-a11y-form-wizard-step-index",
});

const DISPLAY_MODES = Object.freeze({
  single: "single",
  stacked: "stacked",
} satisfies Record<A11yFormWizardDisplayMode, A11yFormWizardDisplayMode>);

const STEP_STATUS_TEXT = Object.freeze({
  complete: "Complete",
  current: "Current",
  next: "Next",
  pending: "Pending",
});

const VALIDATION_FOCUS_MODES = Object.freeze({
  firstInvalid: "first-invalid",
  summary: "summary",
} satisfies Record<string, A11yFormWizardValidationFocus>);

const VALIDATION_OWNERS = Object.freeze({
  wizard: "wizard",
  external: "external",
} satisfies Record<string, A11yFormWizardValidationOwner>);

const EVENTS = Object.freeze({
  init: `${COMPONENT_NAME}:init`,
  stepChange: `${COMPONENT_NAME}:step-change`,
  choiceChange: `${COMPONENT_NAME}:choice-change`,
  validationError: `${COMPONENT_NAME}:validation-error`,
  validationStart: `${COMPONENT_NAME}:validation-start`,
  validationEnd: `${COMPONENT_NAME}:validation-end`,
  submit: `${COMPONENT_NAME}:submit`,
  reset: `${COMPONENT_NAME}:reset`,
  destroy: `${COMPONENT_NAME}:destroy`,
});

const STATUS_REGION_CONFIG = Object.freeze({
  liveRegion: Object.freeze({
    idSuffix: "live",
    role: "status",
    ariaLive: "polite",
    ariaAtomic: "true",
  } satisfies StatusRegionConfig),
  successRegion: Object.freeze({
    idSuffix: "success",
    role: "status",
    ariaLive: "polite",
    ariaAtomic: "true",
  } satisfies StatusRegionConfig),
});

const FORM_CONTROL_SELECTOR =
  'input:not([type="hidden"]), select, textarea, button';

export class A11yFormWizard implements A11yFormWizardInstance {
  private static readonly instances = new WeakMap<HTMLElement, A11yFormWizard>();

  private readonly root!: HTMLElement;
  private readonly form!: HTMLFormElement | null;
  private readonly steps!: HTMLElement[];
  private readonly progressItems!: HTMLElement[];
  private readonly currentStepText!: HTMLElement | null;
  private readonly totalStepText!: HTMLElement | null;
  private readonly progressBar!: HTMLProgressElement | null;
  private readonly errorSummary!: HTMLElement | null;
  private readonly liveRegion!: HTMLElement | null;
  private readonly successRegion!: HTMLElement | null;
  private readonly originalErrorSummaryChildren!: Node[];
  private readonly originalErrorSummaryHidden!: boolean | "until-found" | null;
  private readonly instanceId!: string;
  private readonly options!: NormalizedA11yFormWizardOptions;
  private pendingAdvanceTimer!: number | null;
  private hasSubmitted!: boolean;
  private originalNoValidate!: boolean | null;
  private managedAttributes!: ManagedAttribute[];
  private managedControlStates!: ManagedControlState[];
  private managedReviewTargets!: ManagedContentTarget[];
  private managedStatusTargets!: ManagedContentTarget[];
  private originalProgressStyle!: ManagedStyleProperty | null;
  private currentStepIndex!: number;
  private activeValidation!: ActiveValidation | null;
  private validationRequestId!: number;
  private announcementId!: number;
  private submitBypass!: boolean;
  private isDestroyed!: boolean;
  private errorDescriptionIds!: Map<FormControl, Set<string>>;

  constructor(root: HTMLElement, options: A11yFormWizardOptions = {}) {
    if (!(root instanceof HTMLElement)) {
      throw new TypeError("A11yFormWizard requires a root HTMLElement.");
    }

    const existingInstance = A11yFormWizard.instances.get(root);

    if (existingInstance) {
      return existingInstance;
    }

    this.root = root;
    this.form =
      root instanceof HTMLFormElement && root.matches(SELECTORS.form)
        ? root
        : root.querySelector<HTMLFormElement>(SELECTORS.form);
    this.steps = Array.from(root.querySelectorAll<HTMLElement>(SELECTORS.step));
    this.progressItems = Array.from(
      root.querySelectorAll<HTMLElement>(SELECTORS.progressItem)
    );
    this.currentStepText = root.querySelector<HTMLElement>(
      SELECTORS.currentStepText
    );
    this.totalStepText = root.querySelector<HTMLElement>(
      SELECTORS.totalStepText
    );
    this.progressBar = root.querySelector<HTMLProgressElement>(
      SELECTORS.progressBar
    );
    this.errorSummary = root.querySelector<HTMLElement>(SELECTORS.errorSummary);
    this.liveRegion = root.querySelector<HTMLElement>(SELECTORS.liveRegion);
    this.successRegion = root.querySelector<HTMLElement>(
      SELECTORS.successRegion
    );
    this.originalErrorSummaryChildren = this.errorSummary
      ? Array.from(this.errorSummary.childNodes)
      : [];
    this.originalErrorSummaryHidden = this.errorSummary
      ? this.errorSummary.hidden
      : null;
    this.pendingAdvanceTimer = null;
    this.hasSubmitted = false;
    this.instanceId = Math.random().toString(36).slice(2, 9);
    this.originalNoValidate = null;
    this.managedAttributes = [];
    this.managedControlStates = [];
    this.managedReviewTargets = Array.from(
      root.querySelectorAll<HTMLElement>(SELECTORS.reviewValue)
    ).map((element) => ({
      element,
      originalChildren: Array.from(element.childNodes),
    }));
    this.managedStatusTargets = [
      this.currentStepText,
      this.totalStepText,
      ...this.steps.map((step) =>
        step.querySelector<HTMLElement>(SELECTORS.stepStatus)
      ),
    ]
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map((element) => ({
        element,
        originalChildren: Array.from(element.childNodes),
      }));
    this.originalProgressStyle = this.progressBar
      ? {
          value: this.progressBar.style.getPropertyValue("--_progress"),
          priority: this.progressBar.style.getPropertyPriority("--_progress"),
        }
      : null;
    this.activeValidation = null;
    this.validationRequestId = 0;
    this.announcementId = 0;
    this.submitBypass = false;
    this.isDestroyed = false;
    this.errorDescriptionIds = new Map();

    this.options = this.normalizeOptions({
      ...A11yFormWizard.optionsFromDataset(root),
      ...options,
    });

    this.currentStepIndex = this.clampStepIndex(this.options.startStep);

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInvalid = this.handleInvalid.bind(this);

    A11yFormWizard.instances.set(root, this);
    this.init();
  }

  static optionsFromDataset(root: HTMLElement): A11yFormWizardOptions {
    return {
      startStep: root.dataset.startStep,
      displayMode: root.dataset.displayMode,
      autoAdvanceChoice: root.dataset.autoAdvanceChoice,
      autoAdvanceDelay: root.dataset.autoAdvanceDelay,
      preventSubmit: root.dataset.preventSubmit,
      focusStepOnChange: root.dataset.focusStepOnChange,
      scrollOnStepChange: root.dataset.scrollOnStepChange,
      validationFocus: root.dataset.validationFocus,
      completedMessage: root.dataset.completedMessage,
    };
  }

  static initAll(
    options: A11yFormWizardOptions = {}
  ): A11yFormWizardInstance[] {
    return initA11yFormWizardAll(options);
  }

  private normalizeOptions(
    options: A11yFormWizardOptions
  ): NormalizedA11yFormWizardOptions {
    return {
      ...DEFAULT_OPTIONS,
      startStep: this.toSafeInteger(
        options.startStep,
        DEFAULT_OPTIONS.startStep
      ),
      displayMode: this.toSafeChoice(
        options.displayMode,
        DEFAULT_OPTIONS.displayMode,
        Object.values(DISPLAY_MODES)
      ),
      autoAdvanceChoice: this.toSafeBoolean(
        options.autoAdvanceChoice,
        DEFAULT_OPTIONS.autoAdvanceChoice
      ),
      autoAdvanceDelay: this.toSafeInteger(
        options.autoAdvanceDelay,
        DEFAULT_OPTIONS.autoAdvanceDelay
      ),
      preventSubmit: this.toSafeBoolean(
        options.preventSubmit,
        DEFAULT_OPTIONS.preventSubmit
      ),
      focusStepOnChange: this.toSafeBoolean(
        options.focusStepOnChange,
        DEFAULT_OPTIONS.focusStepOnChange
      ),
      scrollOnStepChange: this.toSafeBoolean(
        options.scrollOnStepChange,
        DEFAULT_OPTIONS.scrollOnStepChange
      ),
      validationFocus: this.toSafeChoice(
        options.validationFocus,
        DEFAULT_OPTIONS.validationFocus,
        Object.values(VALIDATION_FOCUS_MODES)
      ),
      validationOwner: this.toSafeChoice(
        options.validationOwner,
        DEFAULT_OPTIONS.validationOwner,
        Object.values(VALIDATION_OWNERS)
      ),
      completedMessage: this.toSafeString(
        options.completedMessage,
        DEFAULT_OPTIONS.completedMessage
      ),
      validationAdapter: this.toValidationAdapter(options.validationAdapter),
    };
  }

  private toValidationAdapter(
    value: A11yFormWizardValidationAdapter | null | undefined
  ): A11yFormWizardValidationAdapter | null {
    if (!value || typeof value !== "object") return null;

    const hasStepValidator = typeof value.validateStep === "function";
    const hasFormValidator = typeof value.validateForm === "function";

    return hasStepValidator || hasFormValidator ? value : null;
  }

  private toSafeBoolean(
    value: boolean | string | undefined,
    fallback: boolean
  ): boolean {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return fallback;
  }

  private toSafeInteger(
    value: number | string | undefined,
    fallback: number,
    options: { min?: number; max?: number } = {}
  ): number {
    const parsed =
      typeof value === "number" ? value : Number.parseInt(String(value), 10);
    const minimum = options.min ?? 0;

    if (!Number.isFinite(parsed)) return fallback;
    if (parsed < minimum) return fallback;
    if (options.max !== undefined && parsed > options.max) return fallback;

    return parsed;
  }

  private toSafeChoice<T extends string>(
    value: string | undefined,
    fallback: T,
    choices: readonly T[]
  ): T {
    if (typeof value !== "string") return fallback;

    const normalized = value.trim().toLowerCase();
    return choices.includes(normalized as T)
      ? (normalized as T)
      : fallback;
  }

  private toSafeString(value: unknown, fallback: string): string {
    if (typeof value !== "string") return fallback;

    const normalized = String(value ?? "").trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  private init(): void {
    if (!this.form || this.steps.length === 0) return;

    if (this.usesWizardValidation()) {
      this.takeNativeValidationOwnership();
    }

    this.root.classList.add(CLASSES.initialized);
    this.root.classList.toggle(CLASSES.stacked, this.isStackedMode());
    this.root.style.setProperty("--_step-count", String(this.steps.length));

    if (this.totalStepText) {
      this.totalStepText.textContent = String(this.steps.length);
    }

    this.setupStatusRegions();

    this.root
      .querySelectorAll<HTMLButtonElement>(SELECTORS.editStep)
      .forEach((button) => {
        if (button instanceof HTMLButtonElement) {
          this.setManagedStateAttribute(button, ATTRIBUTES.hidden, null);
        }
      });

    this.steps.forEach((step, index) => {
      this.setManagedStateAttribute(
        step,
        ATTRIBUTES.dataStepIndex,
        String(index)
      );
      this.syncStepDisclosureSetup(step, index);
      this.syncStepButtons(step, index);
    });

    this.bindEvents();
    this.showStep(this.currentStepIndex, {
      emit: false,
      focus: false,
      scroll: false,
    });
    this.dispatch(EVENTS.init, { currentStep: this.currentStepIndex + 1 });
  }

  private bindEvents(): void {
    this.root.addEventListener("click", this.handleClick);
    this.root.addEventListener("change", this.handleChange);
    this.root.addEventListener("input", this.handleInput);
    this.form?.addEventListener("submit", this.handleSubmit);
    if (this.usesWizardValidation()) {
      this.form?.addEventListener("invalid", this.handleInvalid, true);
    }
  }

  private usesWizardValidation(): boolean {
    return this.options.validationOwner === VALIDATION_OWNERS.wizard;
  }

  private takeNativeValidationOwnership(): void {
    if (!this.form || typeof this.originalNoValidate === "boolean") return;

    this.originalNoValidate = this.form.noValidate;
    this.form.noValidate = true;
  }

  private setupStatusRegions(): void {
    this.configureStatusRegion(
      this.liveRegion,
      STATUS_REGION_CONFIG.liveRegion
    );
    this.configureStatusRegion(
      this.successRegion,
      STATUS_REGION_CONFIG.successRegion
    );
  }

  private configureStatusRegion(
    element: HTMLElement | null,
    config: StatusRegionConfig
  ): void {
    if (!(element instanceof HTMLElement)) return;

    this.ensureElementId(element, config.idSuffix);
    if (!element.hasAttribute(ATTRIBUTES.ariaLive)) {
      this.setManagedAttribute(element, ATTRIBUTES.role, config.role);
    }
    this.setManagedAttribute(element, ATTRIBUTES.ariaLive, config.ariaLive);
    this.setManagedAttribute(element, ATTRIBUTES.ariaAtomic, config.ariaAtomic);
  }

  private ensureElementId(element: HTMLElement, suffix: string): string {
    if (element.id) return element.id;

    this.setManagedAttribute(
      element,
      "id",
      `${COMPONENT_NAME}-${this.instanceId}-${suffix}`
    );

    return element.id;
  }

  private setManagedAttribute(
    element: HTMLElement,
    name: string,
    value: string
  ): void {
    if (element.hasAttribute(name)) return;

    this.managedAttributes.push({ element, name, value: null });
    element.setAttribute(name, value);
  }

  private setManagedStateAttribute(
    element: HTMLElement,
    name: string,
    value: string | null
  ): void {
    if (
      !this.managedAttributes.some(
        (attribute) =>
          attribute.element === element && attribute.name === name
      )
    ) {
      this.managedAttributes.push({
        element,
        name,
        value: element.getAttribute(name),
      });
    }

    if (value === null) {
      element.removeAttribute(name);
      return;
    }

    element.setAttribute(name, value);
  }

  private restoreManagedAttribute(element: HTMLElement, name: string): void {
    const attribute = this.managedAttributes.find(
      (managedAttribute) =>
        managedAttribute.element === element && managedAttribute.name === name
    );

    if (!attribute) return;

    if (attribute.value === null) {
      element.removeAttribute(name);
      return;
    }

    element.setAttribute(name, attribute.value);
  }

  private handleClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;

    const nextButton = event.target.closest<HTMLElement>(SELECTORS.next);
    const previousButton =
      event.target.closest<HTMLElement>(SELECTORS.previous);
    const resetButton = event.target.closest<HTMLElement>(SELECTORS.reset);
    const stepTrigger =
      event.target.closest<HTMLElement>(SELECTORS.stepTrigger);
    const errorSummaryLink =
      event.target.closest<HTMLAnchorElement>(SELECTORS.errorSummaryLink);
    const editButton =
      event.target.closest<HTMLButtonElement>(SELECTORS.editStep);

    if (errorSummaryLink && this.root.contains(errorSummaryLink)) {
      event.preventDefault();
      this.focusErrorSummaryTarget(errorSummaryLink);
      return;
    }

    if (resetButton && this.root.contains(resetButton)) {
      event.preventDefault();
      this.reset();
      return;
    }

    if (
      editButton instanceof HTMLButtonElement &&
      this.root.contains(editButton)
    ) {
      event.preventDefault();
      if (this.activeValidation) return;
      this.activateEditStep(editButton);
      return;
    }

    if (nextButton && this.root.contains(nextButton)) {
      event.preventDefault();
      if (this.activeValidation) return;

      if (this.options.validationAdapter?.validateStep) {
        void this.advanceAsync({}, nextButton);
      } else {
        this.next();
      }
      return;
    }

    if (previousButton && this.root.contains(previousButton)) {
      event.preventDefault();
      if (this.activeValidation) return;
      this.previous();
      return;
    }

    if (stepTrigger && this.root.contains(stepTrigger)) {
      event.preventDefault();
      if (this.activeValidation) return;
      this.activateStepFromTrigger(stepTrigger);
    }
  }

  private handleChange(event: Event): void {
    const control = event.target;

    if (!this.isFormControl(control)) return;

    this.cancelActiveValidation();

    if (this.usesWizardValidation() && control.checkValidity()) {
      this.clearControlError(control);
      this.refreshErrorSummaryAfterCorrection();
    }

    if (!(control instanceof HTMLInputElement)) return;
    if (!control.matches(SELECTORS.choiceInput)) return;

    this.dispatch(EVENTS.choiceChange, {
      currentStep: this.currentStepIndex + 1,
      name: control.name,
      value: control.value,
    });

    if (!this.shouldAutoAdvance(control)) return;

    this.clearPendingAdvance();
    this.pendingAdvanceTimer = window.setTimeout(() => {
      if (this.options.validationAdapter?.validateStep) {
        void this.advanceAsync({ triggeredByChoice: true }, control);
      } else if (
        this.usesWizardValidation() &&
        this.validateCurrentStep({ report: false })
      ) {
        this.next({ triggeredByChoice: true });
      }
    }, this.options.autoAdvanceDelay);
  }

  private handleInput(event: Event): void {
    const control = event.target;

    if (!this.isFormControl(control)) return;

    this.cancelActiveValidation();

    if (this.usesWizardValidation() && control.checkValidity()) {
      this.clearControlError(control);
      this.refreshErrorSummaryAfterCorrection();
    }
  }

  private handleInvalid(event: Event): void {
    if (!this.usesWizardValidation()) return;

    const control = event.target;

    if (!this.isFormControl(control)) return;

    this.markControlError(control);
  }

  private handleSubmit(event: SubmitEvent): void {
    if (!this.usesWizardValidation()) return;

    if (this.submitBypass) {
      this.submitBypass = false;
      this.completeSubmit(event);
      return;
    }

    if (this.activeValidation) {
      event.preventDefault();
      return;
    }

    const invalidResult = this.getFirstInvalidStepResult();

    if (invalidResult) {
      event.preventDefault();
      this.goToStep(invalidResult.stepIndex, { focus: false });
      this.showValidationError();
      return;
    }

    if (this.options.validationAdapter?.validateForm) {
      event.preventDefault();
      const submitter = this.getSubmitter(event);
      void this.submitAsync(event, submitter);
      return;
    }

    this.completeSubmit(event);
  }

  private completeSubmit(event: SubmitEvent): void {

    this.hasSubmitted = true;
    this.dispatch(EVENTS.submit, {
      data: this.getData(),
      nativeEvent: event,
    });

    if (!this.options.preventSubmit) return;

    event.preventDefault();
    this.root.classList.add(CLASSES.isComplete);

    if (this.successRegion) {
      this.successRegion.hidden = false;
      this.successRegion.textContent = this.options.completedMessage;
      this.successRegion.focus({ preventScroll: false });
    }
  }

  setValidationAdapter(
    adapter: A11yFormWizardValidationAdapter | null,
    owner: A11yFormWizardValidationOwner = this.options.validationOwner
  ): void {
    if (this.isDestroyed) return;

    const normalizedOwner = this.toSafeChoice(
      owner,
      this.options.validationOwner,
      Object.values(VALIDATION_OWNERS)
    );

    if (
      normalizedOwner === VALIDATION_OWNERS.external &&
      this.options.validationOwner !== VALIDATION_OWNERS.external
    ) {
      throw new Error(
        'External validation ownership must be selected when the wizard is initialized.'
      );
    }

    this.cancelActiveValidation();
    this.options.validationAdapter = this.toValidationAdapter(adapter);

    if (
      normalizedOwner === VALIDATION_OWNERS.wizard &&
      !this.usesWizardValidation()
    ) {
      this.options.validationOwner = VALIDATION_OWNERS.wizard;
      this.takeNativeValidationOwnership();
      this.form?.addEventListener("invalid", this.handleInvalid, true);
    }
  }

  completeExternalSubmit(event: SubmitEvent): void {
    if (this.isDestroyed || this.usesWizardValidation()) return;

    this.completeSubmit(event);
  }

  private shouldAutoAdvance(control: HTMLInputElement): boolean {
    const step = this.getCurrentStep();

    return (
      this.options.autoAdvanceChoice &&
      control.type === "radio" &&
      control.checked &&
      this.currentStepIndex < this.steps.length - 1 &&
      step?.dataset.a11yFormWizardAutoAdvance !== "false"
    );
  }

  next(options: A11yFormWizardNavigationOptions = {}): boolean {
    if (this.activeValidation || this.isDestroyed) return false;
    if (!this.usesWizardValidation()) return false;
    if (!this.validateCurrentStep({ report: true })) return false;

    return this.goToStep(this.currentStepIndex + 1, options);
  }

  nextAsync(
    options: A11yFormWizardNavigationOptions = {}
  ): Promise<boolean> {
    return this.advanceAsync(options, this.getActiveTrigger());
  }

  private async advanceAsync(
    options: A11yFormWizardNavigationOptions,
    trigger: HTMLElement | null
  ): Promise<boolean> {
    if (this.activeValidation || this.isDestroyed) return false;
    if (
      this.usesWizardValidation() &&
      !this.validateCurrentStep({ report: true })
    ) {
      return false;
    }

    if (!this.options.validationAdapter?.validateStep) {
      return this.usesWizardValidation()
        ? this.goToStep(this.currentStepIndex + 1, options)
        : false;
    }

    const result = await this.runAdapterValidation("step", trigger);

    if (!result || this.isDestroyed) return false;

    if (!result.valid) {
      this.handleAdapterInvalidResult(result, "step", trigger);
      return false;
    }

    return this.goToStep(this.currentStepIndex + 1, options);
  }

  private async submitAsync(
    event: SubmitEvent,
    submitter: HTMLButtonElement | HTMLInputElement | null
  ): Promise<boolean> {
    const result = await this.runAdapterValidation("form", submitter);

    if (!result || this.isDestroyed) return false;

    if (!result.valid) {
      this.handleAdapterInvalidResult(result, "form", submitter);
      return false;
    }

    if (this.options.preventSubmit) {
      this.completeSubmit(event);
      return true;
    }

    if (!this.form) return false;

    this.submitBypass = true;

    try {
      if (submitter) {
        this.form.requestSubmit(submitter);
      } else {
        this.form.requestSubmit();
      }
    } catch {
      this.submitBypass = false;
      this.showAsyncValidationFailure();
      return false;
    }

    return true;
  }

  private async runAdapterValidation(
    phase: A11yFormWizardValidationPhase,
    trigger: HTMLElement | null
  ): Promise<A11yFormWizardValidationResult | null> {
    const adapter = this.options.validationAdapter;
    const validator =
      phase === "step" ? adapter?.validateStep : adapter?.validateForm;

    if (!adapter || !validator || !this.form || this.activeValidation) {
      return null;
    }

    const operation = this.beginValidation(phase, trigger);
    const context = this.createValidationContext(
      phase,
      trigger,
      operation.controller.signal
    );
    const timeoutMs = this.getValidationTimeout(adapter);

    try {
      const validationPromise = Promise.resolve(
        validator.call(adapter, context)
      );
      const validationRaces: Array<
        Promise<A11yFormWizardValidationResult | symbol>
      > = [
        validationPromise,
        operation.cancellation.then(() => VALIDATION_CANCELLED),
      ];

      if (timeoutMs !== null) {
        validationRaces.push(
          new Promise<typeof VALIDATION_TIMED_OUT>((resolve) => {
            operation.timeoutId = window.setTimeout(
              () => resolve(VALIDATION_TIMED_OUT),
              timeoutMs
            );
          })
        );
      }

      const outcome = await Promise.race(validationRaces);

      if (outcome === VALIDATION_CANCELLED) return null;

      if (outcome === VALIDATION_TIMED_OUT) {
        operation.controller.abort();

        if (this.isCurrentValidation(operation)) {
          this.finishValidation(operation, "timeout");
          this.showAsyncValidationFailure();
        }

        return null;
      }

      if (!this.isCurrentValidation(operation)) return null;

      if (!this.isValidationResult(outcome)) {
        throw new TypeError(
          "Validation adapters must return an object with a boolean valid property."
        );
      }

      this.finishValidation(operation, outcome.valid ? "valid" : "invalid");
      return outcome;
    } catch {
      if (!this.isCurrentValidation(operation)) return null;

      this.finishValidation(operation, "error");
      this.showAsyncValidationFailure();
      return null;
    }
  }

  private beginValidation(
    phase: A11yFormWizardValidationPhase,
    trigger: HTMLElement | null
  ): ActiveValidation {
    let resolveCancellation = (): void => undefined;
    const cancellation = new Promise<void>((resolve) => {
      resolveCancellation = resolve;
    });
    const operation: ActiveValidation = {
      id: ++this.validationRequestId,
      phase,
      controller: new AbortController(),
      trigger,
      pendingAttributes: [],
      pendingNodes: [],
      timeoutId: null,
      resolveCancellation,
      cancellation,
    };

    this.activeValidation = operation;
    if (this.usesWizardValidation()) {
      this.hideErrorSummary();
    }
    this.root.classList.add(CLASSES.isValidating);
    this.root.classList.toggle(CLASSES.isSubmitting, phase === "form");

    if (this.form) {
      this.setTransientAttribute(
        operation,
        this.form,
        ATTRIBUTES.ariaBusy,
        "true"
      );
    }

    const pendingControls = Array.from(
      this.root.querySelectorAll<HTMLElement>(SELECTORS.pendingControl)
    ).filter((control) => !control.matches(SELECTORS.reset));

    pendingControls.forEach((control) => {
      this.setTransientAttribute(
        operation,
        control,
        ATTRIBUTES.ariaDisabled,
        "true"
      );
    });

    if (trigger) {
      this.setTransientAttribute(
        operation,
        trigger,
        ATTRIBUTES.ariaBusy,
        "true"
      );

      if (trigger instanceof HTMLButtonElement) {
        const validationLabel = document.createElement("span");

        validationLabel.className = CLASSES.validationLabel;
        validationLabel.setAttribute("aria-hidden", "true");
        validationLabel.textContent = " Validating…";
        trigger.append(validationLabel);
        operation.pendingNodes.push(validationLabel);
      }
    }

    this.announce(VALIDATION_PENDING_MESSAGES[phase]);
    this.dispatch(EVENTS.validationStart, {
      phase,
      requestId: operation.id,
      currentStep: this.currentStepIndex + 1,
      trigger,
    });

    return operation;
  }

  private finishValidation(
    operation: ActiveValidation,
    status: ValidationCompletionStatus
  ): void {
    if (!this.isCurrentValidation(operation)) return;

    if (operation.timeoutId !== null) {
      window.clearTimeout(operation.timeoutId);
      operation.timeoutId = null;
    }

    this.restoreTransientAttributes(operation);
    this.root.classList.remove(CLASSES.isValidating, CLASSES.isSubmitting);
    this.activeValidation = null;
    this.clearAnnouncement();
    this.dispatch(EVENTS.validationEnd, {
      phase: operation.phase,
      requestId: operation.id,
      status,
      currentStep: this.currentStepIndex + 1,
      trigger: operation.trigger,
    });
  }

  private cancelActiveValidation(): void {
    const operation = this.activeValidation;

    if (!operation) return;

    operation.controller.abort();
    operation.resolveCancellation();
    this.finishValidation(operation, "aborted");
  }

  private isCurrentValidation(operation: ActiveValidation): boolean {
    return this.activeValidation === operation && !this.isDestroyed;
  }

  private setTransientAttribute(
    operation: ActiveValidation,
    element: HTMLElement,
    name: string,
    value: string
  ): void {
    if (
      !operation.pendingAttributes.some(
        (attribute) =>
          attribute.element === element && attribute.name === name
      )
    ) {
      operation.pendingAttributes.push({
        element,
        name,
        value: element.getAttribute(name),
      });
    }

    element.setAttribute(name, value);
  }

  private restoreTransientAttributes(operation: ActiveValidation): void {
    operation.pendingAttributes.forEach(({ element, name, value }) => {
      if (value === null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    });
    operation.pendingAttributes = [];
    operation.pendingNodes.forEach((node) => node.remove());
    operation.pendingNodes = [];
  }

  private createValidationContext(
    phase: A11yFormWizardValidationPhase,
    trigger: HTMLElement | null,
    signal: AbortSignal
  ): A11yFormWizardValidationContext {
    const step = this.getCurrentStep();

    return {
      instance: this,
      root: this.root,
      form: this.form as HTMLFormElement,
      step,
      stepIndex: this.currentStepIndex,
      data: phase === "step" ? this.getStepData(step) : this.getData(),
      signal,
      trigger,
      phase,
    };
  }

  private handleAdapterInvalidResult(
    result: Extract<A11yFormWizardValidationResult, { valid: false }>,
    phase: A11yFormWizardValidationPhase,
    trigger: HTMLElement | null
  ): void {
    const adapter = this.options.validationAdapter;
    const target =
      result.errorTarget instanceof HTMLElement &&
      this.root.contains(result.errorTarget)
        ? result.errorTarget
        : null;
    const targetStep = target?.closest<HTMLElement>(SELECTORS.step) ?? null;
    const targetStepIndex = targetStep ? this.steps.indexOf(targetStep) : -1;
    const requestedStepIndex = this.toSafeInteger(
      result.stepIndex,
      this.currentStepIndex,
      { max: this.steps.length - 1 }
    );
    const nextStepIndex =
      targetStepIndex >= 0 ? targetStepIndex : requestedStepIndex;

    if (nextStepIndex !== this.currentStepIndex) {
      this.goToStep(nextStepIndex, { focus: false, scroll: false });
    }

    this.dispatch(EVENTS.validationError, {
      owner: "adapter",
      phase,
      currentStep: this.currentStepIndex + 1,
      errorTarget: target,
    });

    const context = this.createValidationContext(
      phase,
      trigger,
      new AbortController().signal
    );

    try {
      if (adapter?.focusError) {
        adapter.focusError({ ...context, result });
      } else {
        target?.focus({ preventScroll: false });
      }
    } catch {
      this.showAsyncValidationFailure();
    }
  }

  private getValidationTimeout(
    adapter: A11yFormWizardValidationAdapter
  ): number | null {
    const timeout = adapter.timeoutMs;

    if (timeout === false) return null;

    return typeof timeout === "number" && Number.isFinite(timeout) && timeout > 0
      ? timeout
      : DEFAULT_VALIDATION_TIMEOUT;
  }

  private isValidationResult(
    value: unknown
  ): value is A11yFormWizardValidationResult {
    if (!value || typeof value !== "object" || !("valid" in value)) {
      return false;
    }

    const result = value as Partial<A11yFormWizardValidationResult>;

    return result.valid === true || result.valid === false;
  }

  private showAsyncValidationFailure(): void {
    if (!this.usesWizardValidation()) return;

    this.clearAllControlErrors();
    this.hideErrorSummary();

    if (this.errorSummary) {
      this.errorSummary.hidden = false;
      this.errorSummary.textContent = VALIDATION_FAILURE_MESSAGE;
    }

    this.announce(VALIDATION_FAILURE_MESSAGE);
  }

  private getActiveTrigger(): HTMLElement | null {
    const activeElement = document.activeElement;

    return activeElement instanceof HTMLElement && this.root.contains(activeElement)
      ? activeElement
      : null;
  }

  private getSubmitter(
    event: SubmitEvent
  ): HTMLButtonElement | HTMLInputElement | null {
    const submitter = event.submitter;

    if (
      (submitter instanceof HTMLButtonElement ||
        submitter instanceof HTMLInputElement) &&
      this.form?.contains(submitter)
    ) {
      return submitter;
    }

    return null;
  }

  previous(options: A11yFormWizardNavigationOptions = {}): boolean {
    if (this.activeValidation || this.isDestroyed) return false;
    return this.goToStep(this.currentStepIndex - 1, options);
  }

  goToStep(
    index: number,
    options: A11yFormWizardNavigationOptions = {}
  ): boolean {
    if (this.activeValidation || this.isDestroyed) return false;

    const nextIndex = this.clampStepIndex(index);

    if (nextIndex === this.currentStepIndex) return false;

    this.clearPendingAdvance();
    this.clearAllControlErrors();
    this.hideErrorSummary();

    const previousIndex = this.currentStepIndex;
    this.currentStepIndex = nextIndex;

    this.showStep(this.currentStepIndex, {
      previousIndex,
      emit: true,
      focus: options.focus ?? this.options.focusStepOnChange,
      scroll: options.scroll ?? this.options.scrollOnStepChange,
      triggeredByChoice: Boolean(options.triggeredByChoice),
    });

    return true;
  }

  private showStep(index: number, options: StepRenderOptions = {}): void {
    if (this.steps.length === 0) return;

    const currentStepNumber = index + 1;
    const percent = (currentStepNumber / this.steps.length) * 100;
    const isStackedMode = this.isStackedMode();

    this.steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === index;

      step.hidden = isStackedMode ? false : !isActive;
      step.classList.toggle(CLASSES.activeStep, isActive);
      step.classList.toggle(CLASSES.completedStep, stepIndex < index);
      step.classList.toggle(CLASSES.pendingStep, stepIndex > index);
      this.syncStepDisclosureState(step, stepIndex, index);
      this.syncStepButtons(step, stepIndex);
    });

    this.progressItems.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;

      item.classList.toggle(CLASSES.activeStep, isActive);
      item.classList.toggle(CLASSES.completedStep, itemIndex < index);
      item.classList.toggle(CLASSES.pendingStep, itemIndex > index);

      if (isActive) {
        this.setManagedStateAttribute(item, ATTRIBUTES.ariaCurrent, "step");
      } else {
        this.setManagedStateAttribute(item, ATTRIBUTES.ariaCurrent, null);
      }
    });

    if (this.currentStepText) {
      this.currentStepText.textContent = String(currentStepNumber);
    }

    if (this.progressBar) {
      this.setManagedStateAttribute(
        this.progressBar,
        "value",
        String(currentStepNumber)
      );
      this.setManagedStateAttribute(
        this.progressBar,
        "max",
        String(this.steps.length)
      );
      this.progressBar.style.setProperty("--_progress", `${percent}%`);
    }

    this.root.style.setProperty("--_progress", `${percent}%`);
    this.populateReviewStep(this.steps[index]);
    this.announce(`Step ${currentStepNumber} of ${this.steps.length}.`);

    if (options.focus) {
      this.focusStepHeading(index, { scroll: Boolean(options.scroll) });
    }

    if (options.emit) {
      this.dispatch(EVENTS.stepChange, {
        currentStep: currentStepNumber,
        previousStep:
          typeof options.previousIndex === "number"
            ? options.previousIndex + 1
            : null,
        totalSteps: this.steps.length,
        triggeredByChoice: Boolean(options.triggeredByChoice),
      });
    }
  }

  private activateStepFromTrigger(trigger: HTMLElement): boolean {
    const step = trigger.closest<HTMLElement>(SELECTORS.step);
    const targetIndex = step ? this.steps.indexOf(step) : -1;

    if (targetIndex < 0) return false;

    if (targetIndex === this.currentStepIndex) return false;

    if (targetIndex > this.currentStepIndex + 1) {
      this.announce(
        `Complete ${this.getStepLabel(
          this.currentStepIndex
        )} before opening ${this.getStepLabel(targetIndex)}.`
      );
      return false;
    }

    if (
      targetIndex > this.currentStepIndex &&
      !this.validateCurrentStep({ report: true })
    ) {
      return false;
    }

    return this.goToStep(targetIndex);
  }

  private activateEditStep(button: HTMLButtonElement): boolean {
    const targetId = this.toSafeString(
      button.dataset.a11yFormWizardEditStep,
      ""
    );
    const targetIndex = this.steps.findIndex((step) => step.id === targetId);

    if (targetIndex < 0) return false;

    if (targetIndex === this.currentStepIndex) {
      this.focusStepHeading(targetIndex, { scroll: true });
      return false;
    }

    return this.goToStep(targetIndex);
  }

  private populateReviewStep(step: HTMLElement | undefined): void {
    if (!step?.matches(SELECTORS.reviewStep)) return;

    this.managedReviewTargets.forEach((target) => {
      if (!step.contains(target.element)) return;

      const fieldName = this.toSafeString(
        target.element.dataset.a11yFormWizardReviewValue,
        ""
      );
      const values = this.getReviewValues(fieldName);

      if (values.length === 0) {
        this.restoreContentTarget(target);
        return;
      }

      target.element.textContent = values.join(", ");
    });
  }

  private getReviewValues(fieldName: string): string[] {
    if (!this.form || !fieldName) return [];

    const values: string[] = [];
    const controls = Array.from(this.form.elements).filter(
      (control): control is FormControl =>
        this.isFormControl(control) &&
        control.name === fieldName &&
        this.isReviewableControl(control)
    );

    controls.forEach((control) => {
      if (control instanceof HTMLSelectElement) {
        Array.from(control.selectedOptions).forEach((option) => {
          if (!option.value.trim()) return;

          const label = this.cleanLabelText(option.textContent);
          values.push(label || option.value);
        });
        return;
      }

      if (
        control instanceof HTMLInputElement &&
        (control.type === "radio" || control.type === "checkbox")
      ) {
        if (!control.checked) return;

        const label = Array.from(control.labels ?? [])
          .filter((item) => this.root.contains(item))
          .map((item) => this.cleanLabelText(item.textContent))
          .find(Boolean);
        values.push(label || control.value);
        return;
      }

      const value = this.cleanLabelText(control.value);
      if (value) values.push(value);
    });

    return values;
  }

  private isReviewableControl(control: FormControl): boolean {
    if (control.disabled) return false;
    if (!(control instanceof HTMLInputElement)) return true;

    return ![
      "button",
      "file",
      "hidden",
      "image",
      "password",
      "reset",
      "submit",
    ].includes(control.type);
  }

  private restoreContentTarget(target: ManagedContentTarget): void {
    target.element.replaceChildren(...target.originalChildren);
  }

  private restoreReviewTargets(): void {
    this.managedReviewTargets.forEach((target) => {
      this.restoreContentTarget(target);
    });
  }

  private restoreStatusTargets(): void {
    this.managedStatusTargets.forEach((target) => {
      this.restoreContentTarget(target);
    });
  }

  private syncStepDisclosureSetup(step: HTMLElement, index: number): void {
    const trigger = step.querySelector<HTMLElement>(SELECTORS.stepTrigger);
    const panel = step.querySelector<HTMLElement>(SELECTORS.stepPanel);

    if (!trigger || !panel) return;

    if (!panel.id) {
      this.setManagedAttribute(
        panel,
        "id",
        `${COMPONENT_NAME}-${this.instanceId}-step-${index + 1}-panel`
      );
    }

    this.setManagedAttribute(trigger, ATTRIBUTES.ariaControls, panel.id);
  }

  private syncStepDisclosureState(
    step: HTMLElement,
    stepIndex: number,
    activeIndex: number
  ): void {
    const trigger = step.querySelector<HTMLElement>(SELECTORS.stepTrigger);
    const panel = step.querySelector<HTMLElement>(SELECTORS.stepPanel);
    const status = step.querySelector<HTMLElement>(SELECTORS.stepStatus);
    const isActive = stepIndex === activeIndex;
    const isLocked = stepIndex > activeIndex + 1;
    const isDisabled = isActive || isLocked;

    if (panel) {
      panel.hidden = this.isStackedMode() && !isActive;
    }

    if (trigger) {
      this.setManagedStateAttribute(
        trigger,
        ATTRIBUTES.ariaExpanded,
        String(isActive)
      );
      this.setManagedStateAttribute(
        trigger,
        ATTRIBUTES.ariaDisabled,
        String(isDisabled)
      );
    }

    if (status) {
      status.textContent = this.getStepStatusText(stepIndex, activeIndex);
    }
  }

  private getStepStatusText(stepIndex: number, activeIndex: number): string {
    if (stepIndex < activeIndex) return STEP_STATUS_TEXT.complete;
    if (stepIndex === activeIndex) return STEP_STATUS_TEXT.current;
    if (stepIndex === activeIndex + 1) return STEP_STATUS_TEXT.next;

    return STEP_STATUS_TEXT.pending;
  }

  private getStepLabel(index: number): string {
    const step = this.steps[index];
    const fallback = `step ${index + 1}`;

    return this.toSafeString(step?.dataset.a11yFormWizardStepName, fallback);
  }

  private isStackedMode(): boolean {
    return this.options.displayMode === DISPLAY_MODES.stacked;
  }

  private focusStepHeading(
    index: number,
    options: { scroll?: boolean } = {}
  ): void {
    const step = this.steps[index];
    const heading = this.getStepHeading(step);

    if (!(heading instanceof HTMLElement)) return;

    this.setManagedAttribute(heading, "tabindex", "-1");
    heading.focus({ preventScroll: true });

    if (!options.scroll) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    heading.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  private getStepHeading(step: HTMLElement | null | undefined): HTMLElement | null {
    if (!step) return null;

    return (
      step.querySelector<HTMLElement>(SELECTORS.stepHeading) ||
      step.querySelector<HTMLElement>("legend") ||
      step.querySelector<HTMLElement>("h2, h3, h4, h5, h6")
    );
  }

  private syncStepButtons(step: HTMLElement, index: number): void {
    step.querySelectorAll<HTMLElement>(SELECTORS.previous).forEach((button) => {
      const isDisabled = index === 0;

      this.setManagedDisabledState(button, isDisabled);
    });
  }

  private validateCurrentStep(options: ValidationOptions = {}): boolean {
    const errors = this.getValidationErrorsForStep(this.currentStepIndex);

    if (errors.length === 0) {
      this.clearAllControlErrors();
      this.hideErrorSummary();
      return true;
    }

    if (options.report) {
      this.showValidationErrors(errors);
    }

    return false;
  }

  private getFirstInvalidStepResult(): InvalidStepResult | null {
    for (let index = 0; index < this.steps.length; index += 1) {
      const control = this.getFirstInvalidControlForStep(index);

      if (control) {
        return { stepIndex: index, control };
      }
    }

    return null;
  }

  private getFirstInvalidControlForStep(index: number): FormControl | null {
    return this.getValidationErrorsForStep(index)[0]?.control ?? null;
  }

  private getValidationErrorsForStep(index: number): ValidationError[] {
    const step = this.steps[index];

    if (!step) return [];

    const errors: ValidationError[] = [];
    const groupedControls = new Set<FormControl>();

    this.getControlsForStep(step).forEach((control) => {
      if (control.validity.valid || groupedControls.has(control)) return;

      const controls = this.getErrorControls(control);
      controls.forEach((groupedControl) => groupedControls.add(groupedControl));
      errors.push({
        control,
        label: this.getControlLabel(control),
        message: this.getValidationMessage(control),
      });
    });

    return errors;
  }

  private getControlsForStep(step: HTMLElement): FormControl[] {
    return Array.from(step.querySelectorAll<HTMLElement>(FORM_CONTROL_SELECTOR)).filter(
      (control): control is FormControl => this.isSubmittableControl(control)
    );
  }

  private isFormControl(control: unknown): control is FormControl {
    return (
      control instanceof HTMLInputElement ||
      control instanceof HTMLSelectElement ||
      control instanceof HTMLTextAreaElement
    );
  }

  private isSubmittableControl(control: unknown): control is FormControl {
    if (!this.isFormControl(control)) return false;
    if (control.disabled) return false;
    if (control.type === "hidden") return false;

    return true;
  }

  private showValidationError(): void {
    this.showValidationErrors(
      this.getValidationErrorsForStep(this.currentStepIndex)
    );
  }

  private showValidationErrors(
    errors: ValidationError[],
    options: ValidationErrorRenderOptions = {}
  ): void {
    if (errors.length === 0) {
      this.clearAllControlErrors();
      this.hideErrorSummary();
      return;
    }

    const shouldAnnounce = options.announce ?? true;
    const shouldDispatch = options.dispatch ?? true;
    const shouldFocus = options.focus ?? true;

    this.clearAllControlErrors();
    this.hideErrorSummary();

    const heading = this.renderErrorSummary(errors);

    if (!heading) {
      errors.forEach((error) => this.markControlError(error.control));
    }

    if (shouldDispatch) {
      const firstError = errors[0];

      this.dispatch(EVENTS.validationError, {
        currentStep: this.currentStepIndex + 1,
        control: firstError.control,
        message: firstError.message,
        errors: errors.map(({ control, label, message }) => ({
          control,
          label,
          message,
        })),
      });
    }

    const focusSummary =
      this.options.validationFocus === VALIDATION_FOCUS_MODES.summary &&
      this.errorSummary;

    if (shouldAnnounce && !focusSummary) {
      this.announce(
        heading
          ? this.getValidationCountMessage(errors.length)
          : this.getValidationAnnouncement(errors)
      );
    }

    if (!shouldFocus) return;

    if (focusSummary && heading) {
      this.setManagedStateAttribute(
        this.errorSummary,
        ATTRIBUTES.tabIndex,
        "-1"
      );
      this.setManagedStateAttribute(
        this.errorSummary,
        ATTRIBUTES.ariaLabelledBy,
        heading.id
      );
      this.errorSummary.focus({ preventScroll: false });
      return;
    }

    errors[0].control.focus({ preventScroll: false });
  }

  private renderErrorSummary(errors: ValidationError[]): HTMLElement | null {
    if (!this.errorSummary) return null;

    const heading = document.createElement(
      `h${this.getCurrentStepHeadingLevel()}`
    );
    const list = document.createElement("ul");
    const fragment = document.createDocumentFragment();

    heading.className = CLASSES.errorSummaryHeading;
    heading.id = `${COMPONENT_NAME}-${this.instanceId}-error-summary-heading`;
    heading.textContent = this.getValidationCountMessage(errors.length);
    list.className = CLASSES.errorSummaryList;

    errors.forEach((error, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const message = document.createElement("span");
      const targetId = this.ensureElementId(
        error.control,
        `error-${this.currentStepIndex + 1}-${index + 1}-control`
      );
      const messageId = `${COMPONENT_NAME}-${this.instanceId}-error-${
        this.currentStepIndex + 1
      }-${index + 1}`;

      item.className = CLASSES.errorSummaryItem;
      link.className = CLASSES.errorSummaryLink;
      link.href = `#${encodeURIComponent(targetId)}`;
      link.setAttribute(ATTRIBUTES.dataErrorTarget, targetId);
      link.setAttribute("data-a11y-form-wizard-error-link", "");
      if (error.label) {
        link.append(document.createTextNode(`${error.label}: `));
      }
      message.className = CLASSES.errorSummaryMessage;
      message.id = messageId;
      message.textContent = error.message;
      link.append(message);
      item.append(link);
      list.append(item);

      this.markControlError(error.control, messageId);
    });

    fragment.append(heading, list);
    this.errorSummary.replaceChildren(fragment);
    this.errorSummary.hidden = false;

    return heading;
  }

  private getCurrentStepHeadingLevel(): number {
    const heading = this.getStepHeading(this.getCurrentStep());
    const nativeLevel = /^H([1-6])$/.exec(heading?.tagName ?? "");

    if (nativeLevel) return Number(nativeLevel[1]);

    const ariaLevel = Number.parseInt(
      heading?.getAttribute("aria-level") ?? "",
      10
    );

    return Number.isInteger(ariaLevel) && ariaLevel >= 1 && ariaLevel <= 6
      ? ariaLevel
      : 2;
  }

  private getValidationCountMessage(count: number): string {
    return count === 1
      ? "There is 1 error in this step."
      : `There are ${count} errors in this step.`;
  }

  private getValidationAnnouncement(errors: ValidationError[]): string {
    const firstError = errors[0];
    const firstMessage = firstError.label
      ? `${firstError.label}: ${firstError.message}`
      : firstError.message;

    return `${this.getValidationCountMessage(errors.length)} ${firstMessage}`;
  }

  private focusErrorSummaryTarget(link: HTMLAnchorElement): void {
    const targetId = link.getAttribute(ATTRIBUTES.dataErrorTarget);

    if (!targetId) return;

    const target = document.getElementById(targetId);

    if (!(target instanceof HTMLElement) || !this.root.contains(target)) return;

    target.focus({ preventScroll: false });
  }

  private getValidationMessage(control: FormControl): string {
    if (control.validity.valueMissing) {
      if (control instanceof HTMLInputElement && control.type === "radio") {
        return "Please choose an option.";
      }

      if (control instanceof HTMLInputElement && control.type === "checkbox") {
        return "Please check this box to continue.";
      }

      return "Please complete this required field.";
    }

    if (control.validity.typeMismatch) return "Please enter a valid value.";
    if (control.validity.patternMismatch) {
      return "Please match the requested format.";
    }
    if (control.validity.tooShort) {
      const minLength =
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement
          ? control.minLength
          : 0;

      return `Please enter at least ${minLength} characters.`;
    }
    if (control.validationMessage) return control.validationMessage;

    return "Please review this field.";
  }

  private getControlLabel(control: FormControl): string {
    if (
      control instanceof HTMLInputElement &&
      control.type === "radio" &&
      control.validity.valueMissing
    ) {
      const groupLabel = this.getRadioGroupLabel(control);

      if (groupLabel) return groupLabel;
    }

    if (control.id) {
      const label = this.root.querySelector<HTMLLabelElement>(
        `label[for="${this.escapeSelector(control.id)}"]`
      );

      if (label) return this.cleanLabelText(label.textContent);
    }

    const wrappingLabel = control.closest<HTMLLabelElement>("label");

    if (wrappingLabel) {
      return this.cleanLabelText(wrappingLabel.textContent);
    }

    return control.name;
  }

  private getRadioGroupLabel(control: HTMLInputElement): string {
    const fieldset = control.closest("fieldset");

    if (fieldset && this.root.contains(fieldset)) {
      const legend = Array.from(fieldset.children).find(
        (child): child is HTMLLegendElement =>
          child instanceof HTMLLegendElement
      );
      const legendText = this.cleanLabelText(legend?.textContent);

      if (legendText) return legendText;

      const heading = this.getStepHeading(fieldset);
      const headingText = this.cleanLabelText(heading?.textContent);

      if (headingText) return headingText;
    }

    return this.cleanLabelText(control.name?.replaceAll("_", " "));
  }

  private cleanLabelText(text: string | null | undefined): string {
    return String(text || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  private escapeSelector(value: string): string {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(value);
    }

    return String(value).replace(/["\\]/g, "\\$&");
  }

  private markControlError(
    control: FormControl,
    descriptionId?: string
  ): void {
    this.getErrorControls(control).forEach((errorControl) => {
      this.setManagedStateAttribute(
        errorControl,
        ATTRIBUTES.ariaInvalid,
        "true"
      );
      if (descriptionId) {
        this.addErrorDescription(errorControl, descriptionId);
      }
      errorControl
        .closest(SELECTORS.errorContainer)
        ?.classList.add(CLASSES.hasError);
    });
  }

  private clearControlError(control: FormControl): void {
    this.getErrorControls(control).forEach((errorControl) => {
      this.restoreManagedAttribute(errorControl, ATTRIBUTES.ariaInvalid);
      this.removeErrorDescription(errorControl);
      errorControl
        .closest(SELECTORS.errorContainer)
        ?.classList.remove(CLASSES.hasError);
    });
  }

  private clearAllControlErrors(): void {
    Array.from(this.errorDescriptionIds.keys()).forEach((control) => {
      this.removeErrorDescription(control);
    });

    this.root.querySelectorAll<HTMLElement>(FORM_CONTROL_SELECTOR).forEach((control) => {
      if (!this.isFormControl(control)) return;

      this.restoreManagedAttribute(control, ATTRIBUTES.ariaInvalid);
    });
    this.root
      .querySelectorAll<HTMLElement>(`.${CLASSES.hasError}`)
      .forEach((element) => element.classList.remove(CLASSES.hasError));
  }

  private getErrorControls(control: FormControl): FormControl[] {
    if (!(control instanceof HTMLInputElement)) return [control];
    if (control.type !== "radio" || !control.name) return [control];

    const selector = `input[type="radio"][name="${this.escapeSelector(
      control.name
    )}"]`;
    const radios = Array.from(
      this.form?.querySelectorAll<HTMLInputElement>(selector) ?? []
    ).filter((radio) => radio instanceof HTMLInputElement);

    return radios.length > 0 ? radios : [control];
  }

  private addErrorDescription(
    control: FormControl,
    descriptionId: string
  ): void {
    const describedBy = this.getTokenSet(
      control.getAttribute(ATTRIBUTES.ariaDescribedBy)
    );

    describedBy.add(descriptionId);
    control.setAttribute(
      ATTRIBUTES.ariaDescribedBy,
      Array.from(describedBy).join(" ")
    );

    const managedIds = this.errorDescriptionIds.get(control) ?? new Set();
    managedIds.add(descriptionId);
    this.errorDescriptionIds.set(control, managedIds);
  }

  private removeErrorDescription(control: FormControl): void {
    const managedIds = this.errorDescriptionIds.get(control);

    if (!managedIds || managedIds.size === 0) return;

    const describedBy = this.getTokenSet(
      control.getAttribute(ATTRIBUTES.ariaDescribedBy)
    );

    managedIds.forEach((id) => describedBy.delete(id));
    this.errorDescriptionIds.delete(control);

    if (describedBy.size === 0) {
      control.removeAttribute(ATTRIBUTES.ariaDescribedBy);
      return;
    }

    control.setAttribute(
      ATTRIBUTES.ariaDescribedBy,
      Array.from(describedBy).join(" ")
    );
  }

  private getTokenSet(value: string | null): Set<string> {
    return new Set(String(value || "").split(/\s+/).filter(Boolean));
  }

  private hideErrorSummary(): void {
    if (!this.errorSummary) return;

    this.errorSummary.hidden = true;
    this.errorSummary.replaceChildren();
    this.restoreManagedAttribute(this.errorSummary, ATTRIBUTES.tabIndex);
    this.restoreManagedAttribute(this.errorSummary, ATTRIBUTES.ariaLabelledBy);
  }

  private restoreOriginalErrorSummary(): void {
    if (
      !this.errorSummary ||
      this.originalErrorSummaryHidden === null
    ) {
      return;
    }

    this.errorSummary.replaceChildren(...this.originalErrorSummaryChildren);
    this.errorSummary.hidden = this.originalErrorSummaryHidden;
  }

  private refreshErrorSummaryAfterCorrection(): void {
    if (!this.errorSummary || this.errorSummary.hidden) return;

    const errors = this.getValidationErrorsForStep(this.currentStepIndex);

    this.showValidationErrors(errors, {
      announce: false,
      dispatch: false,
      focus: false,
    });

    if (errors.length === 0) {
      this.clearAnnouncement();
    }
  }

  private announce(message: string): void {
    if (!this.liveRegion) return;

    const announcementId = ++this.announcementId;

    const update = (): void => {
      if (
        this.liveRegion &&
        announcementId === this.announcementId &&
        !this.isDestroyed
      ) {
        this.liveRegion.textContent = message;
      }
    };

    this.liveRegion.textContent = "";

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(update);
      return;
    }

    update();
  }

  private clearAnnouncement(): void {
    this.announcementId += 1;

    if (this.liveRegion) {
      this.liveRegion.textContent = "";
    }
  }

  private getCurrentStep(): HTMLElement | null {
    return this.steps[this.currentStepIndex] ?? null;
  }

  private clampStepIndex(index: number): number {
    if (this.steps.length === 0) return 0;

    return Math.min(Math.max(Number(index) || 0, 0), this.steps.length - 1);
  }

  private getStepData(step: HTMLElement | null): A11yFormWizardData {
    if (!step) return {};

    const result: A11yFormWizardData = {};

    this.getControlsForStep(step).forEach((control) => {
      if (!control.name) return;

      if (control instanceof HTMLInputElement) {
        if (["button", "image", "reset", "submit"].includes(control.type)) {
          return;
        }

        if (
          (control.type === "checkbox" || control.type === "radio") &&
          !control.checked
        ) {
          return;
        }

        if (control.type === "file") {
          Array.from(control.files ?? []).forEach((file) => {
            this.appendDataValue(result, control.name, file);
          });
          return;
        }
      }

      if (control instanceof HTMLSelectElement && control.multiple) {
        Array.from(control.selectedOptions).forEach((option) => {
          this.appendDataValue(result, control.name, option.value);
        });
        return;
      }

      this.appendDataValue(result, control.name, control.value);
    });

    return result;
  }

  private appendDataValue(
    result: A11yFormWizardData,
    key: string,
    value: FormDataEntryValue
  ): void {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const existingValue = result[key];
      result[key] = Array.isArray(existingValue)
        ? [...existingValue, value]
        : [existingValue, value];
      return;
    }

    result[key] = value;
  }

  getData(): A11yFormWizardData {
    if (!this.form) return {};

    const data = new FormData(this.form);
    const result: A11yFormWizardData = {};

    for (const [key, value] of data.entries()) {
      this.appendDataValue(result, key, value);
    }

    return result;
  }

  reset(): void {
    if (this.isDestroyed) return;

    this.clearPendingAdvance();
    this.cancelActiveValidation();
    this.hasSubmitted = false;
    this.submitBypass = false;
    const adapterOwnsReset =
      !this.usesWizardValidation() &&
      typeof this.options.validationAdapter?.reset === "function";

    if (!adapterOwnsReset) {
      this.form?.reset();
    }
    this.root.classList.remove(
      CLASSES.isComplete,
      CLASSES.isSubmitting,
      CLASSES.isValidating
    );

    if (this.successRegion) {
      this.clearSuccessState();
    }

    if (this.usesWizardValidation()) {
      this.clearAllControlErrors();
      this.hideErrorSummary();
    }
    this.restoreReviewTargets();
    this.currentStepIndex = this.clampStepIndex(this.options.startStep);
    this.showStep(this.currentStepIndex, {
      emit: false,
      focus: true,
      scroll: true,
    });
    const adapterResetSucceeded = this.resetValidationAdapter();
    this.dispatch(EVENTS.reset);

    if (!adapterResetSucceeded) {
      this.showAsyncValidationFailure();
    }
  }

  private resetValidationAdapter(): boolean {
    try {
      this.options.validationAdapter?.reset?.();
      return true;
    } catch {
      return false;
    }
  }

  private dispatch(
    type: LifecycleEventName,
    detail: LifecycleEventDetail = {}
  ): void {
    this.root.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        detail: {
          instance: this,
          ...detail,
        },
      })
    );
  }

  destroy(): void {
    if (this.isDestroyed) return;

    this.clearPendingAdvance();
    this.cancelActiveValidation();
    this.isDestroyed = true;
    this.submitBypass = false;
    this.clearAnnouncement();
    this.destroyValidationAdapter();

    this.root.removeEventListener("click", this.handleClick);
    this.root.removeEventListener("change", this.handleChange);
    this.root.removeEventListener("input", this.handleInput);
    this.form?.removeEventListener("submit", this.handleSubmit);
    this.form?.removeEventListener("invalid", this.handleInvalid, true);

    if (this.form && typeof this.originalNoValidate === "boolean") {
      this.form.noValidate = this.originalNoValidate;
    }

    this.steps.forEach((step) => {
      step.hidden = false;
      step.querySelector<HTMLElement>(SELECTORS.stepPanel)?.removeAttribute(
        ATTRIBUTES.hidden
      );
      step.querySelector<HTMLElement>(SELECTORS.stepTrigger)?.removeAttribute(
        ATTRIBUTES.ariaExpanded
      );
      step.querySelector<HTMLElement>(SELECTORS.stepTrigger)?.removeAttribute(
        ATTRIBUTES.ariaDisabled
      );
      step.removeAttribute(ATTRIBUTES.dataStepIndex);
      step.classList.remove(
        CLASSES.activeStep,
        CLASSES.completedStep,
        CLASSES.pendingStep
      );
    });

    this.progressItems.forEach((item) => {
      item.removeAttribute(ATTRIBUTES.ariaCurrent);
      item.classList.remove(
        CLASSES.activeStep,
        CLASSES.completedStep,
        CLASSES.pendingStep
      );
    });

    this.hasSubmitted = false;
    this.clearSuccessState();
    if (this.usesWizardValidation()) {
      this.clearAllControlErrors();
      this.hideErrorSummary();
      this.restoreOriginalErrorSummary();
    }
    this.restoreReviewTargets();
    this.restoreStatusTargets();
    this.restoreManagedControlStates();
    this.restoreManagedAttributes();
    this.restoreProgressStyle();
    this.root.classList.remove(
      CLASSES.initialized,
      CLASSES.stacked,
      CLASSES.isSubmitting,
      CLASSES.isValidating,
      CLASSES.isComplete
    );
    this.root.style.removeProperty("--_progress");
    this.root.style.removeProperty("--_step-count");
    A11yFormWizard.instances.delete(this.root);
    this.dispatch(EVENTS.destroy);
  }

  private restoreProgressStyle(): void {
    if (!this.progressBar || !this.originalProgressStyle) return;

    if (this.originalProgressStyle.value) {
      this.progressBar.style.setProperty(
        "--_progress",
        this.originalProgressStyle.value,
        this.originalProgressStyle.priority
      );
      return;
    }

    this.progressBar.style.removeProperty("--_progress");
  }

  private destroyValidationAdapter(): void {
    try {
      if (typeof this.options.validationAdapter?.destroy === "function") {
        this.options.validationAdapter.destroy();
        return;
      }

      this.options.validationAdapter?.reset?.();
    } catch {
      return;
    }
  }

  private clearPendingAdvance(): void {
    if (this.pendingAdvanceTimer === null) return;

    window.clearTimeout(this.pendingAdvanceTimer);
    this.pendingAdvanceTimer = null;
  }

  private setManagedDisabledState(
    element: HTMLElement,
    isDisabled: boolean
  ): void {
    if (!this.managedControlStates.some((state) => state.element === element)) {
      const state: ManagedControlState = {
        element,
        ariaDisabled: element.getAttribute(ATTRIBUTES.ariaDisabled),
      };

      if (this.isDisableableControl(element)) {
        state.disabled = element.disabled;
      }

      this.managedControlStates.push(state);
    }

    if (this.isDisableableControl(element)) {
      element.disabled = isDisabled;
    }

    element.setAttribute(ATTRIBUTES.ariaDisabled, String(isDisabled));
  }

  private isDisableableControl(
    element: HTMLElement
  ): element is HTMLButtonElement | HTMLInputElement {
    return (
      element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement
    );
  }

  private clearSuccessState(): void {
    if (!this.successRegion) return;

    this.successRegion.hidden = true;
    this.successRegion.textContent = "";
  }

  private restoreManagedControlStates(): void {
    this.managedControlStates.forEach(({ element, disabled, ariaDisabled }) => {
      if (this.isDisableableControl(element) && typeof disabled === "boolean") {
        element.disabled = disabled;
      }

      if (ariaDisabled === null) {
        element.removeAttribute(ATTRIBUTES.ariaDisabled);
      } else {
        element.setAttribute(ATTRIBUTES.ariaDisabled, ariaDisabled);
      }
    });
    this.managedControlStates = [];
  }

  private restoreManagedAttributes(): void {
    this.managedAttributes.forEach(({ element, name, value }) => {
      if (value === null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    });
    this.managedAttributes = [];
  }
}

export function createA11yFormWizard(
  root: HTMLElement,
  options: A11yFormWizardOptions = {}
): A11yFormWizardInstance {
  return new A11yFormWizard(root, options);
}

export function initA11yFormWizardAll(
  options: A11yFormWizardOptions = {}
): A11yFormWizardInstance[] {
  return Array.from(document.querySelectorAll<HTMLElement>(SELECTORS.root)).map(
    (root) => createA11yFormWizard(root, options)
  );
}

export {
  ATTRIBUTES,
  CLASSES,
  DEFAULT_OPTIONS,
  DISPLAY_MODES,
  EVENTS,
  SELECTORS,
  STEP_STATUS_TEXT,
  VALIDATION_FOCUS_MODES,
  VALIDATION_OWNERS,
};
