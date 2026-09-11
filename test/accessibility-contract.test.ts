/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import readme from "../README.md?raw";
import pluginSpec from "../PLUGIN_SPEC.md?raw";
import asyncValidationExample from "../examples/async-validation.html?raw";
import customerSupportExample from "../examples/customer-support-application.html?raw";
import docsHomeExample from "../examples/index.html?raw";
import stackedExample from "../examples/stacked-application-accordion.html?raw";
import styles from "../src/styles.css?inline";
import contrastTheme from "../src/themes/a11y-form-wizard-theme-contrast.css?inline";

describe("accessibility presentation contract", () => {
  it("exposes contrast-safe control and placeholder tokens", () => {
    expect(styles).toContain("--afw-control-border: var(--afw-muted);");
    expect(styles).toContain("--afw-placeholder: var(--afw-muted);");
    expect(styles).toMatch(
      /\.a11y-form-wizard__field-shell\s*\{[^}]*border:\s*0\.125rem solid var\(--afw-control-border\)/s
    );
    expect(styles).toMatch(
      /\.a11y-form-wizard__button--secondary\s*\{[^}]*border-color:\s*var\(--afw-control-border\)/s
    );
    expect(contrastTheme).toContain("--afw-focus: #000000;");
  });

  it("provides non-color progress state markers", () => {
    expect(styles).toMatch(
      /\.a11y-form-wizard__progress-item\.is-active\s*\{[^}]*text-decoration-line:\s*underline/s
    );
    expect(styles).toMatch(
      /\.a11y-form-wizard__progress-item\.is-complete::after\s*\{[^}]*border:\s*solid currentColor[^}]*transform:\s*rotate\(45deg\)/s
    );
  });

  it("keeps mobile action order aligned with document order", () => {
    expect(styles).not.toContain("flex-direction: column-reverse");
    expect(styles).toMatch(
      /@media \(max-width: 34rem\)[\s\S]*?\.a11y-form-wizard__actions\s*\{[^}]*flex-direction:\s*column;/
    );
  });

  it("preserves custom control selection in forced colors", () => {
    expect(styles).toContain("@media (forced-colors: active)");
    expect(styles).toMatch(
      /\.a11y-form-wizard__choice-input,[\s\S]*?background:\s*Canvas;[\s\S]*?border-color:\s*CanvasText;/
    );
    expect(styles).toMatch(
      /\.a11y-form-wizard__choice-input::before\s*\{[^}]*background:\s*Highlight;[^}]*forced-color-adjust:\s*none;/s
    );
    expect(styles).toMatch(
      /\.a11y-form-wizard__checkbox::after\s*\{[^}]*border-color:\s*Highlight;[^}]*forced-color-adjust:\s*none;/s
    );
    expect(styles).not.toMatch(
      /\.a11y-form-wizard\s*\{[^}]*forced-color-adjust:\s*none;/s
    );
  });
});

describe("source example announcement contract", () => {
  const examples = [
    ["examples/index.html", docsHomeExample],
    ["examples/customer-support-application.html", customerSupportExample],
    ["examples/stacked-application-accordion.html", stackedExample]
  ] as const;

  it.each(examples)("uses one live announcement channel in %s", (_path, markup) => {
    document.documentElement.innerHTML = markup;

    const summaries = document.querySelectorAll("[data-a11y-form-wizard-error-summary]");
    expect(summaries.length).toBeGreaterThan(0);

    for (const summary of summaries) {
      expect(summary.hasAttribute("aria-live")).toBe(false);
      expect(summary.hasAttribute("role")).toBe(false);
      expect(summary.tagName).toBe("DIV");
    }

    expect(document.querySelector("[data-a11y-form-wizard-live]")).not.toBeNull();
  });

  it.each(examples)("names every progress element in %s", (_path, markup) => {
    document.documentElement.innerHTML = markup;

    for (const progress of document.querySelectorAll("progress")) {
      expect(
        progress.hasAttribute("aria-label") ||
          progress.hasAttribute("aria-labelledby")
      ).toBe(true);
    }
  });

  it("documents a block error-summary container", () => {
    expect(pluginSpec).toContain("<div data-a11y-form-wizard-error-summary hidden></div>");
    expect(pluginSpec).not.toContain("<p data-a11y-form-wizard-error-summary hidden></p>");
  });

  it("gives copyable progress markup an accessible name", () => {
    const namedProgress =
      '<progress aria-label="Form progress" data-a11y-form-wizard-progress';

    expect(readme).toContain(namedProgress);
    expect(pluginSpec).toContain(namedProgress);
    expect(docsHomeExample).toContain(
      '&lt;progress aria-label="Form progress" data-a11y-form-wizard-progress'
    );
  });

  it("documents the exposed asynchronous pending state accurately", () => {
    expect(asyncValidationExample).toContain(
      "the control keeps its accessible name while a visible “Validating…” label is shown"
    );
    expect(asyncValidationExample).not.toContain(
      "the control reads “Validating…”"
    );
  });
});
