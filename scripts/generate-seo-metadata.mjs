import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryUrl = "https://github.com/vmitsaras/A11y-Form-Wizard";
const socialImageUrl = `${repositoryUrl}/raw/refs/heads/main/.github/social-preview.png`;
const socialImageAlt = "A11y Form Wizard accessible multistep form flow illustration";
const packageDescription = "Accessible reusable vanilla JavaScript multistep form wizard.";
const author = {
  "@type": "Person",
  name: "Vasileios Mitsaras",
  url: "https://github.com/vmitsaras/",
  sameAs: [
    "https://github.com/vmitsaras/",
    "https://linkedin.com/in/vasilis-mitsaras",
  ],
};

const pages = {
  "examples/index.html": {
    title: "Accessible Multistep Form Wizard | A11y Form Wizard",
    description:
      "Explore an accessible vanilla JavaScript form wizard with semantic markup, validation, live announcements, focus management, and example flows.",
  },
  "examples/basic/index.html": {
    title: "Basic Accessible Form Wizard Example | A11y Form Wizard",
    description:
      "Try a two-step semantic form that remains meaningful without JavaScript, then gains progress updates, validation, and deliberate focus movement.",
  },
  "examples/async-validation.html": {
    title: "Async Validation Demo | A11y Form Wizard",
    description:
      "Test native, synchronous, asynchronous, operational-error, and teardown validation states in an accessible multistep form wizard.",
  },
  "examples/customer-support-application.html": {
    title: "Customer Support Application Demo | A11y Form Wizard",
    description:
      "See a realistic customer support application flow built with native controls, clear progress, and accessible multistep form behavior.",
  },
  "examples/job-application.html": {
    title: "Job Application Wizard Demo | A11y Form Wizard",
    description:
      "Explore a concise service advisor application that turns semantic form markup into an accessible, progressively enhanced wizard.",
  },
  "examples/markup-flexibility.html": {
    title: "Flexible Form Markup Demo | A11y Form Wizard",
    description:
      "Compare markup patterns that work with A11y Form Wizard while preserving native controls, labels, fieldsets, and accessible interaction.",
  },
  "examples/minimal-job-form.html": {
    title: "Minimal Job Form Example | A11y Form Wizard",
    description:
      "Use a compact two-step job application example to see the plugin’s semantic HTML contract and accessible navigation in action.",
  },
  "examples/print-friendly-review.html": {
    title: "Print-Friendly Application Review | A11y Form Wizard",
    description:
      "Review a completed application with semantic, print-friendly markup and no runtime PDF generation in this accessible form example.",
  },
  "examples/review-and-edit.html": {
    title: "Review and Edit Form Example | A11y Form Wizard",
    description:
      "See explicitly mapped review values and native edit actions return focus to the relevant step in an accessible multistep form.",
  },
  "examples/stacked-application-accordion.html": {
    title: "Stacked Application Flow Demo | A11y Form Wizard",
    description:
      "Explore a stacked application flow that keeps each section visible while preserving accessible step status, controls, and navigation.",
  },
  "examples/theme-gallery.html": {
    title: "Form Wizard Themes and Skins | A11y Form Wizard",
    description:
      "Browse accessible A11y Form Wizard themes and CSS-only skins, with visible focus styles and reduced-motion-aware transitions.",
  },
};

function jsonLdFor(page) {
  const webPage = {
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    image: socialImageUrl,
    inLanguage: "en",
  };

  const software = {
    "@type": "SoftwareSourceCode",
    name: "A11y Form Wizard",
    description: packageDescription,
    codeRepository: repositoryUrl,
    programmingLanguage: ["TypeScript", "JavaScript"],
    runtimePlatform: "Browser",
    version: "1.0.0",
    license: "MIT",
    keywords: [
      "accessibility",
      "form",
      "form wizard",
      "multistep form",
      "progressive enhancement",
      "TypeScript",
      "WCAG",
    ],
    image: socialImageUrl,
    creator: author,
    targetProduct: {
      "@type": "SoftwareApplication",
      name: "Modern web browsers",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      runtimePlatform: "Browser",
    },
  };

  webPage.mainEntity = software;
  return { "@context": "https://schema.org", "@graph": [webPage, software] };
}

function metadataFor(page) {
  const jsonLd = JSON.stringify(jsonLdFor(page), null, 2);
  return `<!-- seo-meta:start -->
    <meta name="description" content="${page.description}" />
    <meta name="robots" content="index,follow" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="A11y Form Wizard" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:image" content="${socialImageUrl}" />
    <meta property="og:image:alt" content="${socialImageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${socialImageUrl}" />
    <meta name="twitter:image:alt" content="${socialImageAlt}" />
    <script type="application/ld+json">
${jsonLd}
    </script>
    <!-- seo-meta:end -->`;
}

function injectMetadata(relativePath, page) {
  const path = resolve(rootDir, relativePath);
  const html = readFileSync(path, "utf8");
  const metadata = metadataFor(page);
  const withoutExistingMetadata = html
    .replace(/\s*<!-- seo-meta:start -->[\s\S]*?<!-- seo-meta:end -->/g, "")
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/g, "");
  if (!/<title>[\s\S]*?<\/title>/.test(withoutExistingMetadata)) {
    throw new Error(`Missing title in ${relativePath}`);
  }

  const withTitle = withoutExistingMetadata.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${page.title}</title>`
  );

  writeFileSync(path, withTitle.replace("</head>", `${metadata}\n  </head>`));
}

Object.entries(pages).forEach(([path, page]) => injectMetadata(path, page));

console.log(`Updated SEO metadata in ${Object.keys(pages).length} source HTML files.`);
