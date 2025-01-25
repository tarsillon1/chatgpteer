import type { Browser } from "puppeteer";

import { launch } from "../puppeteer/browser";
import { prompt } from "./prompt";

let browser: Browser;

beforeEach(async () => {
  browser = await launch();
});

afterEach(async () => {
  await browser.close();
});

it(
  "prompts chatgpt",
  async () => {
    const page = await browser.newPage();
    const text = await prompt({
      page,
      prompt: "Hi ChatGPT! Please respond `Hello!` to this message.",
    });
    expect(text).toEqual("Hello!");
  },
  10 * 1000
);

it(
  "process large gpt prompt",
  async () => {
    const page = await browser.newPage();
    const text = await prompt({
      page,
      prompt:
        "Hi ChatGPT! Please respond with a long text that ends with: `DONE`",
    });
    expect(text.endsWith("DONE")).toBeTruthy();
  },
  30 * 1000
);
