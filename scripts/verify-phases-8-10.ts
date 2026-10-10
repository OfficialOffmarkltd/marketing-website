import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";

const origin = process.env.PHASES_8_10_ORIGIN ?? "http://localhost:3000";
const evidence =
  "/home/wilfrid_k/projects/offmark/marketing-website/agents/evidence/phases-8-10";
const bagKey = "offmark-bag-v1";

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle", { timeout: 60_000 });
  const bag = page.locator(".bag-link");
  if ((await bag.count()) > 0) await bag.waitFor();
}

async function seedBag(page: Page) {
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ key }) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          lines: [
            {
              designId: "demo-design-one",
              variantId: "demo-variant-one-s",
              quantity: 1,
              unitAmountMinor: 4_850_000,
            },
          ],
        }),
      ),
    { key: bagKey },
  );
}

async function fillCheckout(page: Page) {
  await page
    .getByLabel("Email address", { exact: false })
    .fill("preview@example.test");
  await page
    .getByLabel("Recipient name", { exact: false })
    .fill("Preview Person");
  await page.getByLabel("Phone", { exact: false }).fill("08000000000");
  await page
    .getByLabel("Address line 1", { exact: false })
    .fill("1 Preview Street");
  await page.getByLabel("City", { exact: false }).fill("Lagos");
  await page.getByLabel("State", { exact: false }).fill("Lagos");
  await page.getByRole("checkbox").check();
}

(async () => {
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await seedBag(page);
  await page.goto(`${origin}/preview/checkout?scenario=payment_confirmed`, {
    waitUntil: "domcontentloaded",
  });
  await settle(page);
  await page.getByText("₦51,000.00").first().waitFor();
  await fillCheckout(page);
  await page.getByRole("button", { name: "Pay stated total" }).click();
  await page
    .getByText("Simulated payment confirmed. No order or payment was created.")
    .first()
    .waitFor();

  await page.goto(`${origin}/preview/checkout?scenario=payment_failed`, {
    waitUntil: "networkidle",
  });
  await fillCheckout(page);
  await page.getByRole("button", { name: "Pay stated total" }).click();
  await page
    .getByText(/Simulated payment failed/)
    .first()
    .waitFor();
  assert.equal(
    await page.getByLabel("Email address", { exact: false }).inputValue(),
    "preview@example.test",
  );

  await page.goto(`${origin}/preview/checkout?scenario=delivery_unavailable`, {
    waitUntil: "networkidle",
  });
  await page
    .getByText("Delivery is unavailable for the simulated address.")
    .first()
    .waitFor();

  await page.goto(`${origin}/preview/checkout?scenario=expired_quote`, {
    waitUntil: "networkidle",
  });
  await fillCheckout(page);
  await page.getByRole("button", { name: "Pay stated total" }).click();
  await page
    .getByText(/simulated quote expired/i)
    .first()
    .waitFor();

  await page.goto(`${origin}/preview/checkout?scenario=payment_pending`, {
    waitUntil: "networkidle",
  });
  await fillCheckout(page);
  await page.getByRole("button", { name: "Pay stated total" }).click();
  await page
    .getByText(/pending verification/)
    .first()
    .waitFor();

  const emptyContext = await browser.newContext();
  const emptyPage = await emptyContext.newPage();
  await emptyPage.goto(`${origin}/preview/checkout`, {
    waitUntil: "networkidle",
  });
  await emptyPage
    .getByRole("heading", { name: "Your bag is empty." })
    .waitFor();
  await emptyContext.close();

  await page.goto(`${origin}/preview/orders/access`, {
    waitUntil: "networkidle",
  });
  await page
    .getByLabel("Order reference", { exact: false })
    .fill("DEMO-ORDER-001");
  await page
    .getByLabel("Email address", { exact: false })
    .fill("preview@example.test");
  await page.getByRole("button", { name: "Email access link" }).click();
  await page
    .getByText(/If the fictional order and email matched/)
    .first()
    .waitFor();

  await page.goto(`${origin}/preview/orders/access/verify?token=demo-token`, {
    waitUntil: "networkidle",
  });
  await page
    .getByText(/Simulated access established/)
    .first()
    .waitFor();
  assert(!page.url().includes("token="));

  await page.goto(
    `${origin}/preview/orders/access/verify?token=demo-token&scenario=access_expired`,
    { waitUntil: "networkidle" },
  );
  await page
    .getByText(/expired or invalid/)
    .first()
    .waitFor();

  await page.goto(`${origin}/orders/OM-2026-000001`, {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("heading", { name: "Secure access required." })
    .waitFor();

  await page.goto(
    `${origin}/preview/orders/DEMO-ORDER-001?scenario=order_dispatched`,
    {
      waitUntil: "networkidle",
    },
  );
  await page.getByRole("heading", { name: "Dispatched" }).waitFor();
  await page.getByRole("heading", { name: "Paid" }).waitFor();

  await page.goto(
    `${origin}/preview/orders/DEMO-ORDER-001?scenario=order_refunded`,
    {
      waitUntil: "networkidle",
    },
  );
  await page.getByRole("heading", { name: "Refunded" }).waitFor();

  await page.goto(
    `${origin}/preview/orders/DEMO-ORDER-001?scenario=payment_pending`,
    {
      waitUntil: "networkidle",
    },
  );
  await page
    .getByText(/Automatic checks stopped/)
    .first()
    .waitFor({ timeout: 10_000 });

  await page.goto(`${origin}/admin`, { waitUntil: "networkidle" });
  await page
    .getByText(/live staff authentication adapter has not been connected/)
    .first()
    .waitFor();
  await page.goto(`${origin}/preview/admin`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Staff access required." }).waitFor();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page
    .getByLabel("Staff email", { exact: false })
    .fill("wrong@example.test");
  await page.getByLabel("Password", { exact: false }).fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page
    .getByText("The fictional credentials are invalid.")
    .first()
    .waitFor();
  await page
    .getByLabel("Staff email", { exact: false })
    .fill("staff@offmark.test");
  await page.getByLabel("Password", { exact: false }).fill("preview-only");
  await page.getByRole("radio", { name: "Operations" }).check();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/preview/admin");
  await page.getByRole("heading", { name: "Operational overview" }).waitFor();
  assert.equal(await page.locator("header, footer").count(), 0);
  await page.getByRole("link", { name: "Staff users" }).click();
  await page
    .getByText(/requires the admin role/)
    .first()
    .waitFor();
  await page.getByRole("button", { name: "Refresh session" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/preview/admin/login");

  await page
    .getByLabel("Staff email", { exact: false })
    .fill("staff@offmark.test");
  await page.getByLabel("Password", { exact: false }).fill("preview-only");
  await page.getByRole("radio", { name: "Admin" }).check();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("link", { name: "Staff users" }).click();
  await page.getByRole("heading", { name: "Staff users" }).waitFor();
  const userEdit = page.getByRole("button", { name: "Edit" }).first();
  assert(await userEdit.isEnabled());
  await userEdit.click();
  await page
    .getByText(/Simulated mutation complete/)
    .first()
    .waitFor();

  const layoutResults = [];
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, route] of [
      ["checkout", "/preview/checkout?scenario=payment_confirmed"],
      ["order", "/preview/orders/DEMO-ORDER-001?scenario=order_dispatched"],
      ["admin", "/preview/admin/orders"],
    ]) {
      await page.goto(origin + route, { waitUntil: "networkidle" });
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      assert(scrollWidth <= width, `${name} overflow at ${width}px`);
      await page.screenshot({
        path: path.join(evidence, `${name}-${width}.png`),
        fullPage: true,
      });
      layoutResults.push({ name, width, scrollWidth });
    }
  }

  assert.deepEqual(pageErrors, []);
  const unexpectedConsoleErrors = consoleErrors.filter(
    (message) => !message.includes("Download the React DevTools"),
  );
  assert.deepEqual(unexpectedConsoleErrors, []);
  fs.writeFileSync(
    path.join(evidence, "results.json"),
    JSON.stringify(
      {
        checkout: {
          confirmed: true,
          failedPreservesInput: true,
          deliveryUnavailable: true,
          expiredQuote: true,
          pending: true,
          emptyBag: true,
        },
        orders: {
          neutralRequest: true,
          tokenRemoved: true,
          expiredAccess: true,
          accessRequired: true,
          dispatched: true,
          refunded: true,
          boundedPolling: true,
        },
        admin: {
          liveUnavailable: true,
          invalidCredentials: true,
          operationsForbidden: true,
          refreshAndLogout: true,
          adminUsers: true,
          separateShell: true,
        },
        layoutResults,
        pageErrors,
        consoleErrors,
        unexpectedConsoleErrors,
      },
      null,
      2,
    ),
  );
  console.log("Phases 8-10 browser checks passed.");
  await context.close();
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
