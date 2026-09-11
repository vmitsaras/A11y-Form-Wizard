import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createA11yFormWizard,
  type A11yFormWizardInstance,
} from "../src/index";
import {
  createA11yFormValidatorBridge,
  type A11yFormValidatorBridgeOutput,
  type A11yFormValidatorBridgeValidator,
} from "../src/integrations/a11y-form-validator";

const VALIDATOR_EVENTS = {
  beforeValidate: "a11y-form-validator:before-validate",
  formInvalid: "a11y-form-validator:form-invalid",
  submitBlocked: "a11y-form-validator:submit-blocked",
  submitReady: "a11y-form-validator:submit-ready",
  reset: "a11y-form-validator:reset",
  destroy: "a11y-form-validator:destroy",
};

function renderWizard(): HTMLElement {
  document.body.innerHTML = `
    <section data-a11y-form-wizard>
      <form action="/submit" method="post">
        <progress data-a11y-form-wizard-progress max="2" value="1"></progress>
        <span data-a11y-form-wizard-current-step>1</span>
        <span data-a11y-form-wizard-total-steps>2</span>
        <div data-a11y-form-wizard-error-summary hidden></div>
        <div data-a11y-form-wizard-live></div>
        <fieldset data-a11y-form-wizard-step>
          <legend>Preference</legend>
          <h2 data-a11y-form-wizard-step-heading>Preference</h2>
          <label><input name="preference" type="radio" value="email" required /> Email</label>
          <label><input name="preference" type="radio" value="phone" required /> Phone</label>
          <button type="button" data-a11y-form-wizard-next>Continue</button>
        </fieldset>
        <fieldset data-a11y-form-wizard-step>
          <legend>Details</legend>
          <h2 data-a11y-form-wizard-step-heading>Details</h2>
          <label>Name <input name="name" required /></label>
          <label>Email <input name="email" type="email" required /></label>
          <button type="button" data-a11y-form-wizard-previous>Back</button>
          <button type="submit">Submit</button>
          <p data-a11y-form-wizard-success tabindex="-1" hidden></p>
        </fieldset>
      </form>
    </section>
  `;

  return document.querySelector<HTMLElement>("[data-a11y-form-wizard]")!;
}

class FakeValidator implements A11yFormValidatorBridgeValidator {
  readonly form: HTMLFormElement;
  readonly output: A11yFormValidatorBridgeOutput;
  readonly options;
  readonly validateField = vi.fn(this.validateFieldInternal.bind(this));
  readonly reset = vi.fn(this.resetInternal.bind(this));
  readonly destroy = vi.fn(this.destroyInternal.bind(this));
  shouldRejectStep = false;
  stepGate: Promise<void> | null = null;
  private resubmitting = false;
  private destroyed = false;
  private readonly addedNoValidate: boolean;
  private readonly onSubmit: EventListener;
  private readonly onFocusOut: EventListener;
  private summary: HTMLElement | null = null;

  constructor(form: HTMLFormElement, output: A11yFormValidatorBridgeOutput) {
    this.form = form;
    this.output = output;
    this.options = {
      validateOn: ["submit", "blur"],
      focusOnError:
        output === "validator-summary" ? ("summary" as const) : ("first-invalid" as const),
      disableNativeUI: true,
      validateHidden: true,
    };
    this.addedNoValidate = !form.noValidate;
    form.noValidate = true;
    this.onSubmit = this.handleSubmit.bind(this);
    this.onFocusOut = this.handleFocusOut.bind(this);
    form.addEventListener("submit", this.onSubmit);
    form.addEventListener("focusout", this.onFocusOut);

    if (output === "validator-summary") {
      this.summary = document.createElement("section");
      this.summary.className = "a11y-form-validator__summary";
      this.summary.tabIndex = -1;
      this.summary.hidden = true;
      form.prepend(this.summary);
    }
  }

  private controls(): HTMLElement[] {
    const seen = new Set<string | HTMLElement>();
    return Array.from(
      this.form.querySelectorAll<HTMLElement>("input, select, textarea")
    ).filter((control) => {
      const input = control instanceof HTMLInputElement ? control : null;
      const key =
        input && ["radio", "checkbox"].includes(input.type) && input.name
          ? `${input.type}:${input.name}`
          : control;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async validateFieldInternal(
    input: HTMLElement,
    _options?: { reason?: string }
  ): Promise<boolean> {
    if (this.stepGate) await this.stepGate;
    if (this.shouldRejectStep) throw new Error("remote unavailable");
    const controls =
      input instanceof HTMLInputElement && input.type === "radio" && input.name
        ? Array.from(
            this.form.querySelectorAll<HTMLInputElement>(
              `input[type="radio"][name="${input.name}"]`
            )
          )
        : [input];
    const valid = controls.some((control) =>
      control instanceof HTMLInputElement && control.type === "radio"
        ? control.checked
        : control instanceof HTMLInputElement ||
            control instanceof HTMLSelectElement ||
            control instanceof HTMLTextAreaElement
          ? control.checkValidity()
          : true
    );

    controls.forEach((control) => {
      if (valid) control.removeAttribute("aria-invalid");
      else control.setAttribute("aria-invalid", "true");
    });
    const errorId = `validator-error-${
      input.getAttribute("name") || input.id || "field"
    }`;
    document.getElementById(errorId)?.remove();
    if (!valid) {
      const error = document.createElement("div");
      error.id = errorId;
      error.className = "a11y-form-validator__error";
      error.setAttribute("role", "status");
      error.setAttribute("aria-live", "polite");
      error.setAttribute("aria-atomic", "true");
      error.textContent = "Review this field";
      input.insertAdjacentElement("afterend", error);
    }
    this.updateSummary();
    if (!valid) {
      this.emit("a11y-form-validator:field-invalid", { element: input });
    }
    return valid;
  }

  async validate(): Promise<boolean> {
    const results = await Promise.all(
      this.controls().map((control) => this.validateField(control))
    );
    return results.every(Boolean);
  }

  setErrors(errors: { fields?: Record<string, string | string[] | undefined>; form?: string | string[] } = {}): this {
    Object.keys(errors.fields ?? {}).forEach((name) => {
      this.form
        .querySelectorAll<HTMLElement>(`[name="${name}"]`)
        .forEach((control) => control.setAttribute("aria-invalid", "true"));
    });
    if (errors.form && this.summary) {
      this.summary.textContent = Array.isArray(errors.form)
        ? errors.form.join(" ")
        : errors.form;
      this.summary.hidden = false;
    }
    this.updateSummary();
    this.emit(VALIDATOR_EVENTS.formInvalid, { reason: "server" });
    return this;
  }

  focusOnError(): void {
    if (this.output === "validator-summary" && this.summary && !this.summary.hidden) {
      this.summary.focus();
      return;
    }
    this.form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }

  private resetInternal(): this {
    this.form.reset();
    this.form
      .querySelectorAll<HTMLElement>('[aria-invalid="true"]')
      .forEach((control) => control.removeAttribute("aria-invalid"));
    if (this.summary) {
      this.summary.hidden = true;
      this.summary.replaceChildren();
    }
    this.emit(VALIDATOR_EVENTS.reset, { reason: "reset" });
    return this;
  }

  private destroyInternal(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.form.removeEventListener("submit", this.onSubmit);
    this.form.removeEventListener("focusout", this.onFocusOut);
    this.summary?.remove();
    if (this.addedNoValidate) this.form.noValidate = false;
    this.emit(VALIDATOR_EVENTS.destroy, {});
  }

  private async handleSubmit(event: Event): Promise<void> {
    if (this.resubmitting) {
      this.resubmitting = false;
      return;
    }
    event.preventDefault();
    const submitter =
      event instanceof SubmitEvent && event.submitter instanceof HTMLElement
        ? event.submitter
        : null;
    this.emit(VALIDATOR_EVENTS.beforeValidate, { reason: "submit" });
    const valid = await this.validate();
    if (!valid) {
      this.emit(VALIDATOR_EVENTS.formInvalid, { reason: "submit" });
      this.emit(VALIDATOR_EVENTS.submitBlocked, {
        reason: "submit",
        cause: "invalid",
        submitter,
      });
      this.focusOnError();
      return;
    }
    this.emit(VALIDATOR_EVENTS.submitReady, { reason: "submit", submitter });
    this.resubmitting = true;
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      this.form.requestSubmit(submitter);
    } else {
      this.form.requestSubmit();
    }
  }

  private handleFocusOut(event: Event): void {
    if (event.target instanceof HTMLElement) {
      void this.validateField(event.target, { reason: "blur" });
    }
  }

  private updateSummary(): void {
    if (!this.summary) return;
    const invalid = this.form.querySelector<HTMLElement>('[aria-invalid="true"]');
    this.summary.replaceChildren();
    if (!invalid) {
      this.summary.hidden = true;
      return;
    }
    if (!invalid.id) invalid.id = `field-${Math.random().toString(36).slice(2)}`;
    const link = document.createElement("a");
    link.className = "a11y-form-validator__summary-link";
    link.href = `#${invalid.id}`;
    link.textContent = "Review this field";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      invalid.focus();
    });
    this.summary.append(link);
    this.summary.hidden = false;
  }

  private emit(type: string, detail: Record<string, unknown>): void {
    this.form.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
  }
}

function connect(
  root: HTMLElement,
  wizard: A11yFormWizardInstance,
  validator: FakeValidator,
  output: A11yFormValidatorBridgeOutput = "validator-inline",
  validatorOwnership: "borrowed" | "transferred" = "borrowed"
) {
  return createA11yFormValidatorBridge({
    root,
    wizard,
    validator,
    ownership: { validator: validatorOwnership, output },
  });
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  Element.prototype.scrollIntoView = vi.fn();
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
});

describe("A11y Form Validator bridge", () => {
  it("keeps the semantic form and every step available without JavaScript", () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const steps = root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]");

    expect(form.noValidate).toBe(false);
    expect(Array.from(steps).every((step) => !step.hidden)).toBe(true);
    expect(form.querySelectorAll("fieldset")).toHaveLength(2);
    expect(form.querySelectorAll("legend")).toHaveLength(2);
    expect(form.querySelectorAll("label").length).toBeGreaterThan(0);
  });

  it.each(["wizard-first", "validator-first"])(
    "supports %s initialization while the validator alone owns novalidate",
    (order) => {
      const root = renderWizard();
      const form = root.querySelector<HTMLFormElement>("form")!;
      let wizard!: A11yFormWizardInstance;
      let validator!: FakeValidator;

      if (order === "wizard-first") {
        wizard = createA11yFormWizard(root, { validationOwner: "external" });
        expect(form.noValidate).toBe(false);
        validator = new FakeValidator(form, "validator-inline");
      } else {
        validator = new FakeValidator(form, "validator-inline");
        wizard = createA11yFormWizard(root, { validationOwner: "external" });
      }

      connect(root, wizard, validator);
      expect(form.noValidate).toBe(true);
      expect(root.querySelector("[data-a11y-form-wizard-error-summary]")?.childElementCount).toBe(0);
    }
  );

  it("validates only the current step when continuing", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator);
    root.querySelector<HTMLInputElement>('input[name="preference"]')!.checked = true;

    root.querySelector<HTMLButtonElement>("[data-a11y-form-wizard-next]")!.click();
    await flush();

    expect(validator.validateField).toHaveBeenCalledTimes(1);
    expect(validator.validateField.mock.calls[0]?.[0]).toMatchObject({
      name: "preference",
    });
    expect(root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]")[1]?.hidden).toBe(false);
  });

  it("keeps navigation pending until an asynchronous step rule settles", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    const gate = deferred();
    validator.stepGate = gate.promise;
    connect(root, wizard, validator);
    root.querySelector<HTMLInputElement>('input[name="preference"]')!.checked = true;

    root.querySelector<HTMLButtonElement>("[data-a11y-form-wizard-next]")!.click();
    await Promise.resolve();
    expect(root.classList.contains("is-validating")).toBe(true);
    expect(root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]")[0]?.hidden).toBe(false);

    gate.resolve();
    await flush();
    expect(root.classList.contains("is-validating")).toBe(false);
    expect(root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]")[1]?.hidden).toBe(false);
  });

  it("uses validator errors without wizard validation messages or ARIA", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator);

    root.querySelector<HTMLButtonElement>("[data-a11y-form-wizard-next]")!.click();
    await flush();

    const wizardSummary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );
    expect(wizardSummary?.hidden).toBe(true);
    expect(wizardSummary?.childElementCount).toBe(0);
    expect(root.querySelector('input[name="preference"]')?.getAttribute("aria-invalid")).toBe("true");
  });

  it("announces an operational step validation failure without wizard error markup", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    validator.shouldRejectStep = true;
    connect(root, wizard, validator);

    root.querySelector<HTMLButtonElement>("[data-a11y-form-wizard-next]")!.click();
    await flush();

    expect(root.querySelector("[data-a11y-form-wizard-live]")?.textContent).toContain(
      "could not validate"
    );
    expect(
      root.querySelector("[data-a11y-form-wizard-error-summary]")?.childElementCount
    ).toBe(0);
  });

  it("reveals the first invalid hidden step before validator focus", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator);
    root.querySelector<HTMLInputElement>('input[name="preference"]')!.checked = true;
    await wizard.nextAsync();

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await flush();

    const steps = root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]");
    expect(steps[1]?.hidden).toBe(false);
    expect(document.activeElement).toBe(root.querySelector('input[name="name"]'));
  });

  it("reveals a hidden summary target before the validator link focuses it", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const validator = new FakeValidator(form, "validator-summary");
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    connect(root, wizard, validator, "validator-summary");
    await validator.validateField(root.querySelector<HTMLInputElement>('input[name="preference"]')!);
    wizard.goToStep(1, { focus: false, scroll: false });

    form.querySelector<HTMLAnchorElement>(".a11y-form-validator__summary-link")!.click();

    expect(root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]")[0]?.hidden).toBe(false);
    expect(document.activeElement).toBe(root.querySelector('input[name="preference"]'));
  });

  it("mutes validator inline live output when summary focus owns a step error", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const validator = new FakeValidator(form, "validator-summary");
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    connect(root, wizard, validator, "validator-summary");

    root.querySelector<HTMLButtonElement>("[data-a11y-form-wizard-next]")!.click();
    await flush();

    const inlineError = form.querySelector<HTMLElement>(
      ".a11y-form-validator__error"
    );
    expect(inlineError?.hasAttribute("role")).toBe(false);
    expect(inlineError?.hasAttribute("aria-live")).toBe(false);
    expect(document.activeElement).toBe(
      form.querySelector(".a11y-form-validator__summary")
    );
  });

  it("replays one valid submit and preserves wizard submit behavior", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, {
      validationOwner: "external",
      preventSubmit: true,
    });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator);
    const submitEvent = vi.fn();
    root.addEventListener("a11y-form-wizard:submit", submitEvent);
    root.querySelector<HTMLInputElement>('input[name="preference"]')!.checked = true;
    root.querySelector<HTMLInputElement>('input[name="name"]')!.value = "Ada";
    root.querySelector<HTMLInputElement>('input[name="email"]')!.value = "ada@example.com";
    const requestSubmit = vi.spyOn(form, "requestSubmit").mockImplementation((submitter) => {
      form.dispatchEvent(
        new SubmitEvent("submit", {
          bubbles: true,
          cancelable: true,
          submitter: submitter ?? null,
        })
      );
    });

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await flush();

    expect(requestSubmit).toHaveBeenCalledOnce();
    expect(submitEvent).toHaveBeenCalledOnce();
    expect(root.querySelector<HTMLElement>("[data-a11y-form-wizard-success]")?.hidden).toBe(false);
  });

  it("coordinates reset without resetting the form twice", () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator);
    const nativeReset = vi.spyOn(form, "reset");

    wizard.reset();

    expect(validator.reset).toHaveBeenCalledOnce();
    expect(nativeReset).toHaveBeenCalledOnce();
  });

  it("keeps a borrowed validator alive when the wizard is destroyed", () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator, "validator-inline", "borrowed");

    wizard.destroy();

    expect(validator.destroy).not.toHaveBeenCalled();
  });

  it("destroys a transferred validator with the wizard", () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator, "validator-inline", "transferred");

    wizard.destroy();

    expect(validator.destroy).toHaveBeenCalledOnce();
  });

  it("restores wizard validation when the validator is destroyed first", () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator);

    validator.destroy();

    expect(form.noValidate).toBe(true);
    expect(wizard.next()).toBe(false);
    expect(root.querySelector("[data-a11y-form-wizard-error-link]")).not.toBeNull();
  });

  it("reveals server error steps and keeps blur validation active", async () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");
    connect(root, wizard, validator);
    const name = root.querySelector<HTMLInputElement>('input[name="name"]')!;

    validator.setErrors({ fields: { name: "Name was rejected" } });
    expect(root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]")[1]?.hidden).toBe(false);

    name.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    await flush();
    expect(validator.validateField).toHaveBeenCalledWith(name, { reason: "blur" });
  });

  it("returns the existing bridge for duplicate connection", () => {
    const root = renderWizard();
    const form = root.querySelector<HTMLFormElement>("form")!;
    const wizard = createA11yFormWizard(root, { validationOwner: "external" });
    const validator = new FakeValidator(form, "validator-inline");

    const first = connect(root, wizard, validator);
    const second = connect(root, wizard, validator);

    expect(second).toBe(first);
  });
});
