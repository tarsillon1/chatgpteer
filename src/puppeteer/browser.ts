import puppeteer from "puppeteer-extra";
import stealth from "puppeteer-extra-plugin-stealth";

puppeteer.use(stealth());

export const launch: typeof puppeteer.launch = (opts) => {
  return puppeteer.launch(opts);
};
