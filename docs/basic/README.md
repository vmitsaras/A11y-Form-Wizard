# Basic Example

This example demonstrates the packaged A11y Form Wizard build with semantic HTML, native form controls, live announcements, validation messaging, and default CSS.

It imports from `../../dist/index.js` and `../../dist/styles.css`, so build the package before opening it.

Build the package first:

```bash
npm run build:dist
```

Then serve the repository and open `examples/basic/index.html`:

```bash
npm run start
```

Try these checks:

- Tab through the form and confirm focus stays visible.
- Activate the first step radio choices with Space or Enter.
- Press Continue without choosing an option and confirm the first invalid radio receives focus.
- Submit the empty second step and confirm the summary lists and links both errors while focus moves to the name field.
- Correct one field and confirm only its error is removed from the summary.
- Complete the second step with `Ada Lovelace` and `ada@example.com`, then submit.
- Use Back and Continue again to confirm progress text and visible steps stay in sync.

The example prevents submission by default through the plugin's default `preventSubmit` option. It is a local package integration sample, not a production backend example.
