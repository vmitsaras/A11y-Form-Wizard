import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  A11yFormWizard,
  EVENTS,
  createA11yFormWizard,
  initA11yFormWizardAll
} from "../src/index";

function renderWizard(rootAttributes = ""): HTMLElement {
  document.body.innerHTML = `
    <section class="a11y-form-wizard" data-a11y-form-wizard ${rootAttributes}>
      <form action="/submit" method="post">
        <div class="a11y-form-wizard__progress-wrap">
          <progress data-a11y-form-wizard-progress max="2" value="1"></progress>
          <span data-a11y-form-wizard-current-step>1</span>
          <span data-a11y-form-wizard-total-steps>2</span>
        </div>
        <div data-a11y-form-wizard-error-summary hidden></div>
        <div data-a11y-form-wizard-live></div>
        <fieldset data-a11y-form-wizard-step>
          <legend>Preference</legend>
          <h2 data-a11y-form-wizard-step-heading>Choose a preference</h2>
          <label class="a11y-form-wizard__choice">
            <input type="radio" name="preference" value="email" required data-a11y-form-wizard-choice-input />
            Email
          </label>
          <label class="a11y-form-wizard__choice">
            <input type="radio" name="preference" value="phone" required data-a11y-form-wizard-choice-input />
            Phone
          </label>
          <button type="button" data-a11y-form-wizard-next>Continue</button>
        </fieldset>
        <fieldset data-a11y-form-wizard-step data-a11y-form-wizard-auto-advance="false">
          <legend>Contact</legend>
          <h2 data-a11y-form-wizard-step-heading>Contact details</h2>
          <label class="a11y-form-wizard__field">
            Name
            <input name="name" required />
          </label>
          <label class="a11y-form-wizard__field">
            Email
            <input name="email" type="email" required />
          </label>
          <button type="button" data-a11y-form-wizard-previous>Back</button>
          <button type="submit">Submit</button>
          <p data-a11y-form-wizard-success tabindex="-1" hidden></p>
        </fieldset>
      </form>
    </section>
  `;

  const root = document.querySelector("[data-a11y-form-wizard]");
  if (!(root instanceof HTMLElement)) {
    throw new Error("Wizard fixture did not render.");
  }

  return root;
}

function renderReviewWizard(): HTMLElement {
  document.body.innerHTML = `
    <section class="a11y-form-wizard" data-a11y-form-wizard>
      <form action="/submit" method="post">
        <progress data-a11y-form-wizard-progress max="3" value="1"></progress>
        <span data-a11y-form-wizard-current-step>1</span>
        <span data-a11y-form-wizard-total-steps>3</span>
        <div data-a11y-form-wizard-error-summary hidden></div>
        <div data-a11y-form-wizard-live></div>

        <fieldset id="preference-step" data-a11y-form-wizard-step>
          <legend>Preference</legend>
          <h2 data-a11y-form-wizard-step-heading>Choose preferences</h2>
          <label><input type="radio" name="preference" value="email" /> Email updates</label>
          <label><input type="radio" name="preference" value="phone" /> Phone call</label>
          <label><input type="checkbox" name="topics" value="security" /> Security alerts</label>
          <label><input type="checkbox" name="topics" value="product" /> Product news</label>
          <button type="button" data-a11y-form-wizard-next>Continue</button>
        </fieldset>

        <fieldset id="contact-step" data-a11y-form-wizard-step>
          <legend>Contact</legend>
          <h2 data-a11y-form-wizard-step-heading>Contact details</h2>
          <label>Name <input name="name" /></label>
          <label>Email <input name="email" type="email" /></label>
          <label>
            Contact time
            <select name="contact_time">
              <option value="">Choose a time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </label>
          <label>Password <input name="password" type="password" /></label>
          <input name="token" type="hidden" value="private-token" />
          <button type="button" data-a11y-form-wizard-previous>Back</button>
          <button type="button" data-a11y-form-wizard-next>Continue</button>
        </fieldset>

        <fieldset
          id="review-step"
          data-a11y-form-wizard-step
          data-a11y-form-wizard-review-step
        >
          <legend>Review</legend>
          <h2 data-a11y-form-wizard-step-heading>Review your answers</h2>
          <dl>
            <dt>Preference</dt>
            <dd data-a11y-form-wizard-review-value="preference"><em>Not provided</em></dd>
            <dt>Topics</dt>
            <dd data-a11y-form-wizard-review-value="topics">None selected</dd>
            <dt>Name</dt>
            <dd data-a11y-form-wizard-review-value="name">Not provided</dd>
            <dt>Email</dt>
            <dd data-a11y-form-wizard-review-value="email"><em>Not provided</em></dd>
            <dt>Contact time</dt>
            <dd data-a11y-form-wizard-review-value="contact_time">Not selected</dd>
            <dt>Password</dt>
            <dd data-a11y-form-wizard-review-value="password">Provided, not displayed</dd>
            <dt>Token</dt>
            <dd data-a11y-form-wizard-review-value="token">Not displayed</dd>
          </dl>
          <button type="button" data-a11y-form-wizard-edit-step="preference-step">
            Edit preferences
          </button>
          <button type="button" data-a11y-form-wizard-edit-step="contact-step" hidden>
            Edit contact details
          </button>
          <button type="button" data-a11y-form-wizard-edit-step="missing-step">
            Invalid edit target
          </button>
          <button type="submit">Submit</button>
        </fieldset>
      </form>
    </section>
  `;

  const root = document.querySelector("[data-a11y-form-wizard]");
  if (!(root instanceof HTMLElement)) {
    throw new Error("Review wizard fixture did not render.");
  }

  return root;
}

function renderStackedWizard(): HTMLElement {
  document.body.innerHTML = `
    <section
      class="a11y-form-wizard"
      data-a11y-form-wizard
      data-display-mode="stacked"
    >
      <form action="/submit" method="post">
        <progress data-a11y-form-wizard-progress max="3" value="1"></progress>
        <span data-a11y-form-wizard-current-step>1</span>
        <span data-a11y-form-wizard-total-steps>3</span>
        <div data-a11y-form-wizard-error-summary hidden></div>
        <div data-a11y-form-wizard-live></div>

        <fieldset data-a11y-form-wizard-step data-a11y-form-wizard-step-name="First">
          <legend>First</legend>
          <h2>
            <button type="button" data-a11y-form-wizard-step-trigger>
              First <span data-a11y-form-wizard-step-status></span>
            </button>
          </h2>
          <div data-a11y-form-wizard-step-panel>
            <h3 data-a11y-form-wizard-step-heading>First question</h3>
            <label>
              <input type="radio" name="first" value="yes" required />
              Yes
            </label>
            <button type="button" data-a11y-form-wizard-next>Continue</button>
          </div>
        </fieldset>

        <fieldset data-a11y-form-wizard-step data-a11y-form-wizard-step-name="Second">
          <legend>Second</legend>
          <h2>
            <button type="button" data-a11y-form-wizard-step-trigger>
              Second <span data-a11y-form-wizard-step-status></span>
            </button>
          </h2>
          <div data-a11y-form-wizard-step-panel>
            <h3 data-a11y-form-wizard-step-heading>Second question</h3>
            <button type="button" data-a11y-form-wizard-previous>Back</button>
            <button type="button" data-a11y-form-wizard-next>Continue</button>
          </div>
        </fieldset>

        <fieldset data-a11y-form-wizard-step data-a11y-form-wizard-step-name="Third">
          <legend>Third</legend>
          <h2>
            <button type="button" data-a11y-form-wizard-step-trigger>
              Third <span data-a11y-form-wizard-step-status></span>
            </button>
          </h2>
          <div data-a11y-form-wizard-step-panel>
            <h3 data-a11y-form-wizard-step-heading>Third question</h3>
            <button type="button" data-a11y-form-wizard-previous>Back</button>
            <button type="submit">Submit</button>
          </div>
        </fieldset>
      </form>
    </section>
  `;

  const root = document.querySelector("[data-a11y-form-wizard]");
  if (!(root instanceof HTMLElement)) {
    throw new Error("Stacked wizard fixture did not render.");
  }

  return root;
}

function getSteps(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step]")
  );
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
  vi.useRealTimers();

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  });

  Element.prototype.scrollIntoView = vi.fn();
  HTMLInputElement.prototype.reportValidity = vi.fn(function reportValidity(
    this: HTMLInputElement
  ) {
    return this.checkValidity();
  });
});

describe("A11yFormWizard", () => {
  it("exports the class and creation helpers", () => {
    expect(A11yFormWizard).toBeTypeOf("function");
    expect(createA11yFormWizard).toBeTypeOf("function");
    expect(initA11yFormWizardAll).toBeTypeOf("function");
  });

  it("initializes valid markup and dispatches a bubbling init event", () => {
    const root = renderWizard();
    const initListener = vi.fn();
    root.addEventListener(EVENTS.init, initListener);

    const wizard = createA11yFormWizard(root);
    const steps = getSteps(root);

    expect(root.classList.contains("is-initialized")).toBe(true);
    expect(steps[0]?.hidden).toBe(false);
    expect(steps[1]?.hidden).toBe(true);
    expect(root.querySelector("[data-a11y-form-wizard-current-step]")?.textContent).toBe("1");
    expect(initListener).toHaveBeenCalledOnce();
    expect(initListener.mock.calls[0]?.[0]).toMatchObject({
      bubbles: true,
      detail: expect.objectContaining({ instance: wizard, currentStep: 1 })
    });
    expect(
      root.querySelector("[data-a11y-form-wizard-error-summary]")?.hasAttribute("role")
    ).toBe(false);
    expect(root.querySelector("[data-a11y-form-wizard-live]")).toMatchObject({
      role: "status"
    });
  });

  it("preserves an author-provided live-region politeness setting", () => {
    const root = renderWizard();
    const errorSummary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );

    errorSummary?.setAttribute("aria-live", "polite");
    createA11yFormWizard(root);

    expect(errorSummary?.getAttribute("aria-live")).toBe("polite");
    expect(errorSummary?.hasAttribute("role")).toBe(false);
  });

  it("returns the existing instance on duplicate initialization", () => {
    const root = renderWizard();

    const first = createA11yFormWizard(root);
    const second = createA11yFormWizard(root);

    expect(second).toBe(first);
  });

  it("announces invalid fields and keeps focus on the first invalid control", () => {
    const root = renderWizard();
    const wizard = createA11yFormWizard(root);
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"]'
    );
    const errorSummary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );

    expect(wizard.next()).toBe(false);

    expect(errorSummary?.hidden).toBe(false);
    expect(
      errorSummary?.querySelector(".a11y-form-wizard__error-summary-heading")
        ?.textContent
    ).toBe("There is 1 error in this step.");
    expect(
      errorSummary?.querySelector(".a11y-form-wizard__error-summary-heading")
        ?.tagName
    ).toBe("H2");
    expect(
      errorSummary?.querySelectorAll("[data-a11y-form-wizard-error-link]")
    ).toHaveLength(1);
    expect(errorSummary?.textContent).toContain("Please choose an option.");
    expect(firstRadio?.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(firstRadio);
    expect(HTMLInputElement.prototype.reportValidity).not.toHaveBeenCalled();
  });

  it("matches the error-summary heading to a nested step heading", () => {
    const root = renderWizard();
    const heading = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-step-heading]"
    );
    const nestedHeading = document.createElement("h3");

    nestedHeading.setAttribute("data-a11y-form-wizard-step-heading", "");
    nestedHeading.textContent = heading?.textContent ?? "Choose a preference";
    heading?.replaceWith(nestedHeading);

    const wizard = createA11yFormWizard(root);
    expect(wizard.next()).toBe(false);
    expect(
      root.querySelector(".a11y-form-wizard__error-summary-heading")?.tagName
    ).toBe("H3");
  });

  it("renders every active step error with links and preserves descriptions", () => {
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 1;
      });
    const root = renderWizard();
    const wizard = createA11yFormWizard(root);
    const form = root.querySelector<HTMLFormElement>("form");
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = root.querySelector<HTMLInputElement>('input[name="email"]');
    const nameHelp = document.createElement("span");
    const validationError = vi.fn();

    nameHelp.id = "name-help";
    nameHelp.textContent = "Use your full name.";
    form?.append(nameHelp);
    nameInput?.setAttribute("aria-describedby", nameHelp.id);
    root.addEventListener(EVENTS.validationError, validationError);
    firstRadio?.click();
    wizard.next();

    form?.dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true })
    );

    const summary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );
    const links = Array.from(
      summary?.querySelectorAll<HTMLAnchorElement>(
        "[data-a11y-form-wizard-error-link]"
      ) ?? []
    );
    const nameDescriptions = nameInput
      ?.getAttribute("aria-describedby")
      ?.split(/\s+/);
    const emailDescriptions = emailInput
      ?.getAttribute("aria-describedby")
      ?.split(/\s+/);

    expect(
      summary?.querySelector(".a11y-form-wizard__error-summary-heading")
        ?.textContent
    ).toBe("There are 2 errors in this step.");
    expect(links).toHaveLength(2);
    expect(links[0]?.textContent).toContain("Name:");
    expect(links[1]?.textContent).toContain("Email:");
    expect(document.getElementById(links[0]?.dataset.a11yFormWizardErrorTarget ?? ""))
      .toBe(nameInput);
    expect(document.getElementById(links[1]?.dataset.a11yFormWizardErrorTarget ?? ""))
      .toBe(emailInput);
    expect(nameDescriptions).toContain("name-help");
    expect(nameDescriptions).toContain(
      links[0]?.querySelector(".a11y-form-wizard__error-summary-message")?.id
    );
    expect(emailDescriptions).toContain(
      links[1]?.querySelector(".a11y-form-wizard__error-summary-message")?.id
    );
    expect(nameDescriptions).not.toContain(summary?.id);
    expect(document.activeElement).toBe(nameInput);
    expect(
      root.querySelector("[data-a11y-form-wizard-live]")?.textContent
    ).toContain("There are 2 errors in this step.");
    expect(validationError).toHaveBeenCalledOnce();
    expect(validationError.mock.calls[0]?.[0]).toMatchObject({
      detail: expect.objectContaining({
        control: nameInput,
        errors: expect.arrayContaining([
          expect.objectContaining({ control: nameInput }),
          expect.objectContaining({ control: emailInput })
        ])
      })
    });

    links[1]?.click();
    expect(document.activeElement).toBe(emailInput);
    requestAnimationFrame.mockRestore();
  });

  it("groups required radios into one error and one description", () => {
    const root = renderWizard();
    const wizard = createA11yFormWizard(root);
    const radios = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[name="preference"]')
    );

    expect(wizard.next()).toBe(false);

    const links = root.querySelectorAll(
      "[data-a11y-form-wizard-error-link]"
    );
    const descriptionIds = radios.map((radio) =>
      radio.getAttribute("aria-describedby")
    );

    expect(links).toHaveLength(1);
    expect(radios.every((radio) => radio.getAttribute("aria-invalid") === "true"))
      .toBe(true);
    expect(descriptionIds[0]).toBeTruthy();
    expect(descriptionIds[1]).toBe(descriptionIds[0]);
  });

  it("removes corrected errors from the summary without moving focus", () => {
    const root = renderWizard();
    const wizard = createA11yFormWizard(root);
    const form = root.querySelector<HTMLFormElement>("form");
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = root.querySelector<HTMLInputElement>('input[name="email"]');
    const summary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );

    firstRadio?.click();
    wizard.next();
    form?.dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true })
    );
    expect(summary?.querySelectorAll("li")).toHaveLength(2);

    if (nameInput) nameInput.value = "Ada Lovelace";
    nameInput?.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(summary?.querySelectorAll("li")).toHaveLength(1);
    expect(summary?.textContent).not.toContain("Name:");
    expect(nameInput?.hasAttribute("aria-invalid")).toBe(false);
    expect(document.activeElement).toBe(nameInput);

    if (emailInput) emailInput.value = "ada@example.com";
    emailInput?.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(summary?.hidden).toBe(true);
    expect(summary?.childElementCount).toBe(0);
    expect(emailInput?.hasAttribute("aria-invalid")).toBe(false);
  });

  it("focuses the summary only when explicitly configured", () => {
    const root = renderWizard('data-validation-focus="summary"');
    const wizard = createA11yFormWizard(root);
    const summary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );

    expect(wizard.next()).toBe(false);

    expect(document.activeElement).toBe(summary);
    expect(summary?.getAttribute("tabindex")).toBe("-1");
    expect(summary?.getAttribute("aria-labelledby")).toBe(
      summary?.querySelector("h2")?.id
    );
  });

  it("falls back to first invalid focus for an unknown validation focus value", () => {
    const root = renderWizard('data-validation-focus="unknown"');
    const wizard = createA11yFormWizard(root);
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"]'
    );

    expect(wizard.next()).toBe(false);
    expect(document.activeElement).toBe(firstRadio);
  });

  it("summarizes only the first invalid hidden step during submit", () => {
    const root = renderWizard();
    createA11yFormWizard(root);
    const form = root.querySelector<HTMLFormElement>("form");
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    form?.dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true })
    );
    expect(getSteps(root)[0]?.hidden).toBe(false);
    expect(root.querySelectorAll("[data-a11y-form-wizard-error-link]")).toHaveLength(1);

    firstRadio?.click();
    form?.dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true })
    );

    expect(getSteps(root)[0]?.hidden).toBe(true);
    expect(getSteps(root)[1]?.hidden).toBe(false);
    expect(root.querySelectorAll("[data-a11y-form-wizard-error-link]")).toHaveLength(2);
    expect(document.activeElement).toBe(
      root.querySelector<HTMLInputElement>('input[name="name"]')
    );
  });

  it("clears corrected choice errors without requiring auto-advance", () => {
    const root = renderWizard('data-auto-advance-choice="false"');
    const wizard = createA11yFormWizard(root);
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const errorSummary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );

    expect(wizard.next()).toBe(false);
    expect(errorSummary?.hidden).toBe(false);
    expect(firstRadio?.getAttribute("aria-invalid")).toBe("true");

    firstRadio?.click();

    expect(errorSummary?.hidden).toBe(true);
    expect(firstRadio?.hasAttribute("aria-invalid")).toBe(false);
    expect(getSteps(root)[0]?.hidden).toBe(false);
  });

  it("updates steps, progress, and lifecycle events when moving forward", () => {
    const root = renderWizard();
    const wizard = createA11yFormWizard(root);
    const stepChangeListener = vi.fn();
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const progress = root.querySelector<HTMLProgressElement>(
      "[data-a11y-form-wizard-progress]"
    );

    root.addEventListener(EVENTS.stepChange, stepChangeListener);
    firstRadio?.click();

    expect(wizard.next()).toBe(true);

    const steps = getSteps(root);
    expect(steps[0]?.hidden).toBe(true);
    expect(steps[1]?.hidden).toBe(false);
    expect(progress?.value).toBe(2);
    expect(root.querySelector("[data-a11y-form-wizard-current-step]")?.textContent).toBe("2");
    expect(stepChangeListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          currentStep: 2,
          previousStep: 1,
          totalSteps: 2
        })
      })
    );
  });

  it("keeps stacked trigger availability aligned with disclosure behavior", () => {
    const root = renderStackedWizard();
    const wizard = createA11yFormWizard(root);
    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "[data-a11y-form-wizard-step-trigger]"
      )
    );
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step-panel]")
    );
    const firstChoice = root.querySelector<HTMLInputElement>(
      'input[name="first"]'
    );

    expect(triggers.map((trigger) => trigger.getAttribute("aria-disabled")))
      .toEqual(["true", "false", "true"]);
    expect(triggers.map((trigger) => trigger.getAttribute("aria-expanded")))
      .toEqual(["true", "false", "false"]);
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true, true]);

    triggers[0]?.focus();
    triggers[0]?.click();
    expect(document.activeElement).toBe(triggers[0]);
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true, true]);

    firstChoice?.click();
    expect(wizard.next()).toBe(true);
    expect(triggers.map((trigger) => trigger.getAttribute("aria-disabled")))
      .toEqual(["false", "true", "false"]);
    expect(triggers.map((trigger) => trigger.getAttribute("aria-expanded")))
      .toEqual(["false", "true", "false"]);

    triggers[0]?.click();
    expect(triggers.map((trigger) => trigger.getAttribute("aria-disabled")))
      .toEqual(["true", "false", "true"]);
    expect(triggers.map((trigger) => trigger.getAttribute("aria-expanded")))
      .toEqual(["true", "false", "false"]);
  });

  it("does not auto-advance radio choices by default", () => {
    vi.useFakeTimers();
    const root = renderWizard('data-auto-advance-delay="10"');
    createA11yFormWizard(root);
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    vi.advanceTimersByTime(200);

    expect(getSteps(root)[0]?.hidden).toBe(false);
    expect(getSteps(root)[1]?.hidden).toBe(true);
  });

  it("auto-advances marked radio choices only when explicitly enabled", () => {
    vi.useFakeTimers();
    const root = renderWizard(
      'data-auto-advance-choice="true" data-auto-advance-delay="10"'
    );
    createA11yFormWizard(root);
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    vi.advanceTimersByTime(10);

    const steps = getSteps(root);
    expect(steps[0]?.hidden).toBe(true);
    expect(steps[1]?.hidden).toBe(false);
  });

  it("falls back to the default auto-advance delay for negative values", () => {
    vi.useFakeTimers();
    const root = renderWizard(
      'data-auto-advance-choice="true" data-auto-advance-delay="-1"'
    );
    createA11yFormWizard(root);
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    vi.advanceTimersByTime(1);

    expect(getSteps(root)[0]?.hidden).toBe(false);

    vi.advanceTimersByTime(139);

    expect(getSteps(root)[0]?.hidden).toBe(true);
    expect(getSteps(root)[1]?.hidden).toBe(false);
  });

  it("dispatches submit data and shows success for prevented submissions", () => {
    const root = renderWizard();
    createA11yFormWizard(root);
    const submitListener = vi.fn();
    const form = root.querySelector<HTMLFormElement>("form");
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = root.querySelector<HTMLInputElement>(
      'input[name="email"]'
    );
    const success = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-success]"
    );

    root.addEventListener(EVENTS.submit, submitListener);
    firstRadio?.click();
    if (nameInput) nameInput.value = "Ada Lovelace";
    if (emailInput) emailInput.value = "ada@example.com";

    const event = new SubmitEvent("submit", { bubbles: true, cancelable: true });
    form?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(submitListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          data: expect.objectContaining({
            preference: "email",
            name: "Ada Lovelace",
            email: "ada@example.com"
          })
        })
      })
    );
    expect(success?.hidden).toBe(false);
  });

  it("destroy clears prevented-submit success state", () => {
    const root = renderWizard();
    const wizard = createA11yFormWizard(root);
    const form = root.querySelector<HTMLFormElement>("form");
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = root.querySelector<HTMLInputElement>(
      'input[name="email"]'
    );
    const success = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-success]"
    );

    firstRadio?.click();
    if (nameInput) nameInput.value = "Ada Lovelace";
    if (emailInput) emailInput.value = "ada@example.com";
    form?.dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true })
    );

    expect(success?.hidden).toBe(false);

    wizard.destroy();

    expect(success?.hidden).toBe(true);
    expect(success?.textContent).toBe("");
    expect(root.classList.contains("is-complete")).toBe(false);
  });

  it("destroy removes listeners and reveals all steps", () => {
    const root = renderWizard();
    const wizard = createA11yFormWizard(root);
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const previousButton = root.querySelector<HTMLButtonElement>(
      "[data-a11y-form-wizard-previous]"
    );
    const secondHeading = root.querySelector<HTMLElement>(
      '[data-a11y-form-wizard-step]:nth-of-type(2) [data-a11y-form-wizard-step-heading]'
    );

    firstRadio?.click();
    wizard.next();
    expect(secondHeading?.getAttribute("tabindex")).toBe("-1");
    wizard.destroy();

    const steps = getSteps(root);
    expect(root.classList.contains("is-initialized")).toBe(false);
    expect(steps.every((step) => step.hidden === false)).toBe(true);
    expect(previousButton?.disabled).toBe(false);
    expect(previousButton?.hasAttribute("aria-disabled")).toBe(false);
    expect(secondHeading?.hasAttribute("tabindex")).toBe(false);
    expect(createA11yFormWizard(root)).not.toBe(wizard);
  });

  it("destroy restores author disclosure, status, and progress state", () => {
    const root = renderStackedWizard();
    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "[data-a11y-form-wizard-step-trigger]"
      )
    );
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step-panel]")
    );
    const statuses = Array.from(
      root.querySelectorAll<HTMLElement>("[data-a11y-form-wizard-step-status]")
    );
    const currentText = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-current-step]"
    );
    const totalText = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-total-steps]"
    );
    const progress = root.querySelector<HTMLProgressElement>(
      "[data-a11y-form-wizard-progress]"
    );

    panels[0]?.setAttribute("id", "author-first-panel");
    triggers[0]?.setAttribute("aria-controls", "author-first-panel");
    statuses[0]?.replaceChildren(document.createElement("em"));
    statuses[0]?.querySelector("em")?.append("Author status");
    currentText?.replaceChildren(document.createElement("strong"));
    currentText?.querySelector("strong")?.append("Author current");
    totalText?.replaceChildren(document.createElement("strong"));
    totalText?.querySelector("strong")?.append("Author total");
    progress?.setAttribute("max", "9");
    progress?.setAttribute("value", "4");
    progress?.style.setProperty("--_progress", "44%", "important");

    const wizard = createA11yFormWizard(root);
    expect(triggers[1]?.hasAttribute("aria-controls")).toBe(true);
    wizard.goToStep(1, { focus: false, scroll: false });
    wizard.destroy();

    expect(panels.every((panel) => panel.hidden === false)).toBe(true);
    expect(triggers[0]?.getAttribute("aria-controls")).toBe(
      "author-first-panel"
    );
    expect(triggers[1]?.hasAttribute("aria-controls")).toBe(false);
    expect(statuses[0]?.innerHTML).toBe("<em>Author status</em>");
    expect(statuses[1]?.textContent).toBe("");
    expect(statuses[2]?.textContent).toBe("");
    expect(currentText?.innerHTML).toBe("<strong>Author current</strong>");
    expect(totalText?.innerHTML).toBe("<strong>Author total</strong>");
    expect(progress?.getAttribute("max")).toBe("9");
    expect(progress?.getAttribute("value")).toBe("4");
    expect(progress?.style.getPropertyValue("--_progress")).toBe("44%");
    expect(progress?.style.getPropertyPriority("--_progress")).toBe(
      "important"
    );
  });

  it("restores author-provided validation state after errors clear and destroy", () => {
    const root = renderWizard();
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.setAttribute("aria-invalid", "spelling");
    const wizard = createA11yFormWizard(root);

    expect(wizard.next()).toBe(false);
    expect(firstRadio?.getAttribute("aria-invalid")).toBe("true");

    firstRadio?.click();
    expect(firstRadio?.getAttribute("aria-invalid")).toBe("spelling");

    wizard.destroy();
    expect(firstRadio?.getAttribute("aria-invalid")).toBe("spelling");
  });

  it("restores summary content, descriptions, and generated ids on destroy", () => {
    const root = renderWizard();
    const summary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const authorContent = document.createElement("span");

    authorContent.textContent = "Author summary placeholder";
    summary?.append(authorContent);
    firstRadio?.setAttribute("aria-describedby", "preference-help");

    const wizard = createA11yFormWizard(root);
    expect(wizard.next()).toBe(false);
    expect(summary?.contains(authorContent)).toBe(false);
    expect(firstRadio?.id).not.toBe("");
    expect(firstRadio?.getAttribute("aria-describedby")).toContain(
      "preference-help"
    );

    wizard.destroy();

    expect(summary?.hidden).toBe(true);
    expect(summary?.firstChild).toBe(authorContent);
    expect(firstRadio?.id).toBe("");
    expect(firstRadio?.getAttribute("aria-describedby")).toBe(
      "preference-help"
    );
  });

  it("populates review mappings with readable native control values", () => {
    const root = renderReviewWizard();
    const wizard = createA11yFormWizard(root);
    const emailPreference = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const securityTopic = root.querySelector<HTMLInputElement>(
      'input[name="topics"][value="security"]'
    );
    const productTopic = root.querySelector<HTMLInputElement>(
      'input[name="topics"][value="product"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const select = root.querySelector<HTMLSelectElement>(
      'select[name="contact_time"]'
    );

    emailPreference?.click();
    securityTopic?.click();
    productTopic?.click();
    if (nameInput) nameInput.value = '<img src=x onerror="alert(1)">';
    if (select) select.value = "afternoon";

    expect(wizard.goToStep(2, { focus: false, scroll: false })).toBe(true);

    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="preference"]')
        ?.textContent
    ).toBe("Email updates");
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="topics"]')
        ?.textContent
    ).toBe("Security alerts, Product news");
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="contact_time"]')
        ?.textContent
    ).toBe("Afternoon");
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="name"]')
        ?.textContent
    ).toBe('<img src=x onerror="alert(1)">');
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="name"] img')
    ).toBeNull();
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="email"] em')
        ?.textContent
    ).toBe("Not provided");
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="password"]')
        ?.textContent
    ).toBe("Provided, not displayed");
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="token"]')
        ?.textContent
    ).toBe("Not displayed");
  });

  it("uses edit buttons to focus the mapped step heading and refreshes review", () => {
    const root = renderReviewWizard();
    const wizard = createA11yFormWizard(root);
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const contactHeading = root.querySelector<HTMLElement>(
      "#contact-step [data-a11y-form-wizard-step-heading]"
    );
    const editContact = root.querySelector<HTMLButtonElement>(
      '[data-a11y-form-wizard-edit-step="contact-step"]'
    );
    const invalidEdit = root.querySelector<HTMLButtonElement>(
      '[data-a11y-form-wizard-edit-step="missing-step"]'
    );

    expect(editContact?.hidden).toBe(false);
    if (nameInput) nameInput.value = "Ada Lovelace";
    wizard.goToStep(2, { focus: false, scroll: false });
    invalidEdit?.click();
    expect(getSteps(root)[2]?.hidden).toBe(false);

    editContact?.click();
    expect(getSteps(root)[1]?.hidden).toBe(false);
    expect(document.activeElement).toBe(contactHeading);

    if (nameInput) nameInput.value = "Grace Hopper";
    wizard.goToStep(2, { focus: false, scroll: false });
    expect(
      root.querySelector('[data-a11y-form-wizard-review-value="name"]')
        ?.textContent
    ).toBe("Grace Hopper");
  });

  it("restores author review markup on reset and destroy", () => {
    const root = renderReviewWizard();
    const wizard = createA11yFormWizard(root);
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const nameReview = root.querySelector<HTMLElement>(
      '[data-a11y-form-wizard-review-value="name"]'
    );
    const preferenceReview = root.querySelector<HTMLElement>(
      '[data-a11y-form-wizard-review-value="preference"]'
    );
    const editContact = root.querySelector<HTMLButtonElement>(
      '[data-a11y-form-wizard-edit-step="contact-step"]'
    );

    if (nameInput) nameInput.value = "Ada Lovelace";
    wizard.goToStep(2, { focus: false, scroll: false });
    expect(nameReview?.textContent).toBe("Ada Lovelace");

    wizard.reset();
    expect(nameReview?.textContent).toBe("Not provided");
    expect(preferenceReview?.querySelector("em")?.textContent).toBe(
      "Not provided"
    );

    if (nameInput) nameInput.value = "Grace Hopper";
    wizard.goToStep(2, { focus: false, scroll: false });
    wizard.destroy();

    expect(nameReview?.textContent).toBe("Not provided");
    expect(preferenceReview?.querySelector("em")?.textContent).toBe(
      "Not provided"
    );
    expect(editContact?.hidden).toBe(true);
    editContact?.click();
    expect(document.activeElement).not.toBe(
      root.querySelector("#contact-step [data-a11y-form-wizard-step-heading]")
    );
  });

  it("keeps next synchronous and native when an adapter is configured", () => {
    const validateStep = vi.fn(() => ({ valid: true as const }));
    const root = renderWizard();
    const wizard = createA11yFormWizard(root, {
      validationAdapter: { validateStep }
    });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    const result = wizard.next();

    expect(result).toBe(true);
    expect(validateStep).not.toHaveBeenCalled();
    expect(getSteps(root)[1]?.hidden).toBe(false);
  });

  it("supports synchronous adapters through nextAsync with step-scoped data", async () => {
    const validateStep = vi.fn(() => ({ valid: true as const }));
    const root = renderWizard();
    const wizard = createA11yFormWizard(root, {
      validationAdapter: { validateStep }
    });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const validationStart = vi.fn();
    const validationEnd = vi.fn();

    root.addEventListener(EVENTS.validationStart, validationStart);
    root.addEventListener(EVENTS.validationEnd, validationEnd);
    firstRadio?.click();

    await expect(wizard.nextAsync()).resolves.toBe(true);
    expect(validateStep).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "step",
        stepIndex: 0,
        data: { preference: "email" },
        signal: expect.any(AbortSignal)
      })
    );
    expect(validationStart).toHaveBeenCalledOnce();
    expect(validationEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ status: "valid", phase: "step" })
      })
    );
  });

  it("shows one stable pending state and ignores repeated clicks", async () => {
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 1;
      });
    const deferred = createDeferred<{ valid: true }>();
    const validateStep = vi.fn(() => deferred.promise);
    const root = renderWizard();
    createA11yFormWizard(root, { validationAdapter: { validateStep } });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nextButton = root.querySelector<HTMLButtonElement>(
      "[data-a11y-form-wizard-next]"
    );
    const form = root.querySelector<HTMLFormElement>("form");
    const liveRegion = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-live]"
    );
    const validationStart = vi.fn();

    root.addEventListener(EVENTS.validationStart, validationStart);
    firstRadio?.click();
    nextButton?.focus();
    nextButton?.click();
    nextButton?.click();

    expect(validateStep).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(nextButton);
    expect(form?.getAttribute("aria-busy")).toBe("true");
    expect(nextButton?.getAttribute("aria-busy")).toBe("true");
    expect(nextButton?.getAttribute("aria-disabled")).toBe("true");
    expect(nextButton?.textContent).toContain("Validating");
    expect(liveRegion?.textContent).toBe("Validating this step. Please wait.");
    expect(validationStart).toHaveBeenCalledOnce();

    deferred.resolve({ valid: true });
    await flushPromises();

    expect(getSteps(root)[1]?.hidden).toBe(false);
    expect(form?.hasAttribute("aria-busy")).toBe(false);
    expect(nextButton?.hasAttribute("aria-busy")).toBe(false);
    expect(nextButton?.hasAttribute("aria-disabled")).toBe(false);
    expect(nextButton?.textContent).not.toContain("Validating");
    requestAnimationFrame.mockRestore();
  });

  it("lets the adapter own invalid output and reveals its target before focus", async () => {
    const root = renderWizard();
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = root.querySelector<HTMLInputElement>('input[name="email"]');
    const errorSummary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );
    const focusError = vi.fn(() => {
      expect(getSteps(root)[0]?.hidden).toBe(false);
      if (errorSummary) {
        errorSummary.hidden = false;
        errorSummary.textContent = "That email is already registered.";
      }
      firstRadio?.focus();
    });
    const wizard = createA11yFormWizard(root, {
      validationAdapter: {
        validateForm: () => ({
          valid: false,
          stepIndex: 0,
          errorTarget: firstRadio ?? undefined
        }),
        focusError
      }
    });

    firstRadio?.click();
    wizard.next();
    if (nameInput) nameInput.value = "Ada Lovelace";
    if (emailInput) emailInput.value = "ada@example.com";
    root.querySelector<HTMLFormElement>("form")?.dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(focusError).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(firstRadio);
    expect(errorSummary?.textContent).toBe("That email is already registered.");
  });

  it("recovers from adapter rejection without moving focus", async () => {
    const root = renderWizard();
    const wizard = createA11yFormWizard(root, {
      validationAdapter: {
        validateStep: () => Promise.reject(new Error("network unavailable"))
      }
    });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nextButton = root.querySelector<HTMLButtonElement>(
      "[data-a11y-form-wizard-next]"
    );
    const errorSummary = root.querySelector<HTMLElement>(
      "[data-a11y-form-wizard-error-summary]"
    );

    firstRadio?.click();
    nextButton?.focus();

    await expect(wizard.nextAsync()).resolves.toBe(false);
    expect(document.activeElement).toBe(nextButton);
    expect(root.classList.contains("is-validating")).toBe(false);
    expect(errorSummary?.textContent).toContain("could not validate");
  });

  it("times out unresolved validation and restores interaction", async () => {
    vi.useFakeTimers();
    const root = renderWizard();
    const wizard = createA11yFormWizard(root, {
      validationAdapter: {
        timeoutMs: 20,
        validateStep: () => new Promise(() => undefined)
      }
    });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    const validation = wizard.nextAsync();
    await vi.advanceTimersByTimeAsync(20);

    await expect(validation).resolves.toBe(false);
    expect(root.classList.contains("is-validating")).toBe(false);
    expect(getSteps(root)[0]?.hidden).toBe(false);
  });

  it("aborts and ignores stale validation after reset", async () => {
    const deferred = createDeferred<{ valid: true }>();
    const resetAdapter = vi.fn();
    let signal: AbortSignal | undefined;
    const root = renderWizard();
    const wizard = createA11yFormWizard(root, {
      validationAdapter: {
        validateStep: (context) => {
          signal = context.signal;
          return deferred.promise;
        },
        reset: resetAdapter
      }
    });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    const validation = wizard.nextAsync();
    wizard.reset();

    expect(signal?.aborted).toBe(true);
    expect(resetAdapter).toHaveBeenCalledOnce();
    deferred.resolve({ valid: true });

    await expect(validation).resolves.toBe(false);
    expect(getSteps(root)[0]?.hidden).toBe(false);
    expect(root.classList.contains("is-validating")).toBe(false);
  });

  it("aborts pending validation on destroy and prevents late DOM changes", async () => {
    const deferred = createDeferred<{ valid: true }>();
    const resetAdapter = vi.fn();
    let signal: AbortSignal | undefined;
    const root = renderWizard();
    const wizard = createA11yFormWizard(root, {
      validationAdapter: {
        validateStep: (context) => {
          signal = context.signal;
          return deferred.promise;
        },
        reset: resetAdapter
      }
    });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    const validation = wizard.nextAsync();
    wizard.destroy();
    deferred.resolve({ valid: true });

    expect(signal?.aborted).toBe(true);
    expect(resetAdapter).toHaveBeenCalledOnce();
    await expect(validation).resolves.toBe(false);
    expect(getSteps(root).every((step) => !step.hidden)).toBe(true);
    expect(root.classList.contains("is-validating")).toBe(false);
  });

  it("keeps the original adapter on duplicate initialization", async () => {
    const firstValidator = vi.fn(() => ({ valid: true as const }));
    const secondValidator = vi.fn(() => ({ valid: true as const }));
    const root = renderWizard();
    const first = createA11yFormWizard(root, {
      validationAdapter: { validateStep: firstValidator }
    });
    const second = createA11yFormWizard(root, {
      validationAdapter: { validateStep: secondValidator }
    });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    await second.nextAsync();

    expect(second).toBe(first);
    expect(firstValidator).toHaveBeenCalledOnce();
    expect(secondValidator).not.toHaveBeenCalled();
  });

  it("routes opt-in auto-advance through async validation", async () => {
    vi.useFakeTimers();
    const validateStep = vi.fn(() => Promise.resolve({ valid: true as const }));
    const root = renderWizard(
      'data-auto-advance-choice="true" data-auto-advance-delay="10"'
    );
    createA11yFormWizard(root, { validationAdapter: { validateStep } });
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );

    firstRadio?.click();
    await vi.advanceTimersByTimeAsync(10);
    await flushPromises();

    expect(validateStep).toHaveBeenCalledOnce();
    expect(getSteps(root)[1]?.hidden).toBe(false);
  });

  it("validates an async prevented submission once", async () => {
    const validateForm = vi.fn(() => Promise.resolve({ valid: true as const }));
    const root = renderWizard();
    createA11yFormWizard(root, { validationAdapter: { validateForm } });
    const submitListener = vi.fn();
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = root.querySelector<HTMLInputElement>('input[name="email"]');

    root.addEventListener(EVENTS.submit, submitListener);
    firstRadio?.click();
    if (nameInput) nameInput.value = "Ada Lovelace";
    if (emailInput) emailInput.value = "ada@example.com";
    root.querySelector<HTMLFormElement>("form")?.dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(validateForm).toHaveBeenCalledOnce();
    expect(submitListener).toHaveBeenCalledOnce();
    expect(
      root.querySelector<HTMLElement>("[data-a11y-form-wizard-success]")?.hidden
    ).toBe(false);
  });

  it("resumes native submission without running the adapter twice", async () => {
    let resumedDefaultPrevented: boolean | undefined;
    const requestSubmit = vi
      .spyOn(HTMLFormElement.prototype, "requestSubmit")
      .mockImplementation(function requestSubmitMock(
        this: HTMLFormElement,
        submitter
      ) {
        const resumedSubmitEvent = new SubmitEvent("submit", {
          bubbles: true,
          cancelable: true,
          submitter
        });
        this.dispatchEvent(resumedSubmitEvent);
        resumedDefaultPrevented = resumedSubmitEvent.defaultPrevented;
      });
    const validateForm = vi.fn(() => Promise.resolve({ valid: true as const }));
    const root = renderWizard();
    createA11yFormWizard(root, {
      preventSubmit: false,
      validationAdapter: { validateForm }
    });
    const submitListener = vi.fn();
    const firstRadio = root.querySelector<HTMLInputElement>(
      'input[name="preference"][value="email"]'
    );
    const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = root.querySelector<HTMLInputElement>('input[name="email"]');
    const submitButton = root.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );
    const form = root.querySelector<HTMLFormElement>("form");

    root.addEventListener(EVENTS.submit, submitListener);
    firstRadio?.click();
    if (nameInput) nameInput.value = "Ada Lovelace";
    if (emailInput) emailInput.value = "ada@example.com";
    form?.dispatchEvent(
      new SubmitEvent("submit", {
        bubbles: true,
        cancelable: true,
        submitter: submitButton
      })
    );
    await flushPromises();

    expect(validateForm).toHaveBeenCalledOnce();
    expect(requestSubmit).toHaveBeenCalledOnce();
    expect(requestSubmit).toHaveBeenCalledWith(submitButton);
    expect(submitListener).toHaveBeenCalledOnce();
    expect(resumedDefaultPrevented).toBe(false);
  });
});
