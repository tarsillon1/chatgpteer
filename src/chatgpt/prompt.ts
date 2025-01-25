import type { Page } from "puppeteer";

const url = "https://chatgpt.com";

const turnTestIdPrefix = "conversation-turn-";

type PromptInput = {
  page: Page;
  prompt: string;
};

export async function prompt({ page, prompt }: PromptInput) {
  if (!page.url().startsWith(url)) {
    await page.goto(url, {
      waitUntil: "load",
    });
  }

  const lastTurn = await page.evaluate((turnTestIdPrefix) => {
    const elements = document.querySelectorAll(
      `[data-testid^="${turnTestIdPrefix}"]`
    );
    if (!elements.length) {
      return 1;
    }
    const testid = elements[elements.length - 1].getAttribute("data-testid");
    if (!testid) {
      return 1;
    }
    return parseInt(testid.substring(turnTestIdPrefix.length));
  }, turnTestIdPrefix);

  const textarea = await page.waitForSelector("textarea");
  if (!textarea) {
    throw new Error("could not find chatgpt text area on page");
  }
  await textarea.type(prompt, { delay: 1 });
  await page.keyboard.press("Enter");

  const handle = await page.waitForFunction(
    async (turnTestIdPrefix, lastTurn) => {
      const element = document.querySelector(
        `[data-testid="${turnTestIdPrefix}${lastTurn + 2}"]`
      );
      if (!element?.textContent) {
        return false;
      }

      const copy = element.querySelector("button");
      if (!copy) {
        return;
      }

      return new Promise<string>((res) => {
        navigator.clipboard.write = async (items) => {
          const item = await items[0].getType("text/plain");
          const text = await item.text();
          res(text);
        };
        copy.click();
      });
    },
    {
      timeout: 30000,
    },
    turnTestIdPrefix,
    lastTurn
  );
  const value = await handle.jsonValue();
  if (!value) {
    throw new Error("failed to get chatgpt response");
  }
  return value;
}
