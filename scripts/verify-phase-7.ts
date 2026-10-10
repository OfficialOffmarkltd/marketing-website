import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { demoBuildUpdates, demoPolicies } from "../src/data/demo/fixtures";

const origin = process.env.PHASE7_ORIGIN ?? "http://localhost:3000";
const evidenceDir =
  "/home/wilfrid_k/projects/offmark/marketing-website/agents/evidence/phase-7";

const firstBuildUpdate = demoBuildUpdates.find(
  (u) => u.publicationStatus === "published",
);
const firstPolicy = demoPolicies.find(
  (p) => p.publicationStatus === "published",
);
if (!firstBuildUpdate || !firstPolicy) {
  throw new Error("Phase 7 verification requires published demo records.");
}
const firstBuildSlug = firstBuildUpdate.slug;
const firstPolicySlug = firstPolicy.slug;

/** Flatten a route path to a filesystem-safe label */
function routeLabel(routePath: string): string {
  return routePath.replace(/^\//, "").replace(/\//g, "-") || "home";
}

const routes: string[] = [
  "/preview/home",
  "/preview/seam",
  "/preview/platform",
  "/preview/building",
  `/preview/building/${firstBuildSlug}`,
  "/preview/about",
  "/preview/contact",
  `/preview/policies/${firstPolicySlug}`,
];

const viewports = [390, 768, 1440];

type CheckResult = {
  pass: boolean;
  detail?: string;
};

type RouteViewportResult = {
  route: string;
  width: number;
  checks: Record<string, CheckResult>;
  screenshot: string;
};

(async () => {
  // Verify the dev server is reachable
  try {
    const res = await fetch(origin, { signal: AbortSignal.timeout(5000) });
    if (!res.ok && res.status !== 200) {
      throw new Error(`Server responded with ${res.status}`);
    }
  } catch {
    console.error(
      `ERROR: Dev server is not running at ${origin}.\n` +
        "Start it with: bun run dev",
    );
    process.exit(1);
  }

  fs.mkdirSync(evidenceDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const allResults: RouteViewportResult[] = [];
  let anyFailed = false;

  for (const routePath of routes) {
    for (const width of viewports) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(origin + routePath, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState("networkidle", { timeout: 60_000 });
      await page.getByRole("link", { name: "Bag, 0 items" }).waitFor();

      const label = routeLabel(routePath);
      const screenshotFilename = `${label}-${width}.png`;
      const screenshotPath = path.join(evidenceDir, screenshotFilename);

      await page.screenshot({ path: screenshotPath, fullPage: true });

      // --- checks ---
      const checks: Record<string, CheckResult> = {};

      // 1. No error overlay / no Error/404/500 heading
      const errorHeading = await page
        .locator("h1, h2, [data-nextjs-dialog-header]")
        .filter({
          hasText: /\b(Error|404|500)\b/i,
        })
        .count();
      const nextjsOverlay = await page.locator("[data-nextjs-dialog]").count();
      checks.noError = {
        pass: errorHeading === 0 && nextjsOverlay === 0,
        detail:
          errorHeading > 0
            ? "Error/404/500 heading found"
            : nextjsOverlay > 0
              ? "Next.js error overlay present"
              : undefined,
      };

      // 2. At least one <h1>
      const h1Count = await page.locator("h1").count();
      checks.hasH1 = {
        pass: h1Count >= 1,
        detail: h1Count === 0 ? "No <h1> element found" : undefined,
      };

      // 3. Body text does not contain "TODO" or "undefined"
      const bodyText = await page.locator("body").innerText();
      const hasTodo = /\bTODO\b/i.test(bodyText);
      const hasUndefined = /\bundefined\b/i.test(bodyText);
      checks.noTodoOrUndefined = {
        pass: !hasTodo && !hasUndefined,
        detail: hasTodo
          ? 'Body contains "TODO"'
          : hasUndefined
            ? 'Body contains "undefined"'
            : undefined,
      };

      // 4. <nav> element present
      const navCount = await page.locator("nav").count();
      checks.hasNav = {
        pass: navCount >= 1,
        detail: navCount === 0 ? "No <nav> element found" : undefined,
      };

      // 5. <footer> element present
      const footerCount = await page.locator("footer").count();
      checks.hasFooter = {
        pass: footerCount >= 1,
        detail: footerCount === 0 ? "No <footer> element found" : undefined,
      };

      const rowFailed = Object.values(checks).some((c) => !c.pass);
      if (rowFailed) anyFailed = true;

      const status = rowFailed ? "FAIL" : "pass";
      console.log(`[${status}] ${routePath} @ ${width}px`);
      if (rowFailed) {
        for (const [name, result] of Object.entries(checks)) {
          if (!result.pass) {
            console.log(`       ✗ ${name}: ${result.detail ?? "failed"}`);
          }
        }
      }

      allResults.push({
        route: routePath,
        width,
        checks,
        screenshot: screenshotFilename,
      });
    }
  }

  const functionalChecks: Record<string, CheckResult> = {};

  await page.goto(origin + "/contact", { waitUntil: "networkidle" });
  functionalChecks.publicContactUnavailable = {
    pass:
      (await page.getByRole("button", { name: "Send enquiry" }).isDisabled()) &&
      (await page
        .getByText(/verified contact destination has not been connected/)
        .isVisible()),
  };

  await page.goto(origin + "/seam", { waitUntil: "networkidle" });
  functionalChecks.publicWaitlistNotInvented = {
    pass:
      (await page.getByText("Availability unconfirmed").isVisible()) &&
      (await page.getByRole("button", { name: "Join waitlist" }).count()) === 0,
  };

  const fillContact = async () => {
    await page.getByLabel("Name", { exact: false }).fill("Preview Person");
    await page
      .getByLabel("Email address", { exact: false })
      .fill("preview@example.test");
    await page.getByLabel("Subject", { exact: false }).fill("Preview enquiry");
    await page
      .getByLabel("Message", { exact: false })
      .fill("This remains local.");
  };

  await page.goto(origin + "/preview/contact", { waitUntil: "networkidle" });
  await fillContact();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await page
    .getByText("Simulated enquiry complete. No message or email was sent.")
    .waitFor();
  functionalChecks.contactSuccess = { pass: true };

  await page.goto(origin + "/preview/contact?scenario=temporary_failure", {
    waitUntil: "networkidle",
  });
  await fillContact();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await page
    .getByText("The simulated service is temporarily unavailable.")
    .waitFor();
  functionalChecks.contactFailurePreservesInput = {
    pass:
      (await page.getByLabel("Subject", { exact: false }).inputValue()) ===
      "Preview enquiry",
  };

  await page.goto(origin + "/preview/contact?scenario=loading", {
    waitUntil: "networkidle",
  });
  await fillContact();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  functionalChecks.contactLoading = {
    pass:
      (await page
        .getByRole("button", { name: "Send enquiry" })
        .getAttribute("aria-busy")) === "true",
  };
  await page
    .getByText("Simulated enquiry complete. No message or email was sent.")
    .waitFor();

  await page.goto(origin + "/preview/seam", { waitUntil: "networkidle" });
  const seamForm = page.locator(".submission-form").first();
  await seamForm
    .getByLabel("Email address", { exact: false })
    .fill("preview@example.test");
  await seamForm.getByRole("checkbox").check();
  await seamForm.getByRole("button", { name: "Join waitlist" }).click();
  await seamForm
    .getByText(
      "Simulated signup complete. No subscription or email was created.",
    )
    .waitFor();
  functionalChecks.waitlistSuccess = { pass: true };

  await page.goto(origin + "/preview/platform?scenario=rate_limited", {
    waitUntil: "networkidle",
  });
  const platformForm = page.locator(".submission-form").first();
  await platformForm
    .getByLabel("Email address", { exact: false })
    .fill("preview@example.test");
  await platformForm.getByRole("checkbox").check();
  await platformForm.getByRole("button", { name: "Join waitlist" }).click();
  await platformForm
    .getByText("The simulated submission limit was reached. Try again later.")
    .waitFor();
  functionalChecks.waitlistRateLimit = { pass: true };

  await page.goto(origin + `/preview/building/${firstBuildSlug}`, {
    waitUntil: "networkidle",
  });
  functionalChecks.buildingNextWork = {
    pass:
      (await page
        .getByRole("link", { name: /Sample workflow milestone/ })
        .count()) === 1,
  };

  const failedFunctional = Object.entries(functionalChecks).filter(
    ([, result]) => !result.pass,
  );
  if (failedFunctional.length > 0) anyFailed = true;
  const unexpectedConsoleErrors = consoleErrors.filter(
    (message) => !message.includes("Download the React DevTools"),
  );
  if (pageErrors.length > 0 || unexpectedConsoleErrors.length > 0)
    anyFailed = true;

  const resultsPayload = {
    generatedAt: new Date().toISOString(),
    firstBuildSlug,
    firstPolicySlug,
    summary: {
      total: allResults.length,
      passed: allResults.filter((r) =>
        Object.values(r.checks).every((c) => c.pass),
      ).length,
      failed: allResults.filter((r) =>
        Object.values(r.checks).some((c) => !c.pass),
      ).length,
    },
    functionalChecks,
    pageErrors,
    consoleErrors,
    unexpectedConsoleErrors,
    results: allResults,
  };

  fs.writeFileSync(
    path.join(evidenceDir, "results.json"),
    JSON.stringify(resultsPayload, null, 2),
  );

  await context.close();
  await browser.close();

  if (anyFailed) {
    console.error(
      "\nPhase 7 browser checks FAILED — see results.json for details.",
    );
    process.exit(1);
  } else {
    console.log("\nPhase 7 browser checks passed.");
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
