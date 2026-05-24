import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.env.URL || "http://localhost:3000";
const OUT = process.env.OUT || "shot.png";
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);
const FULL = process.env.FULL === "1";

const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const p = await b.newPage();
await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await p.goto(URL, { waitUntil: "networkidle0" });

// Disable smooth scrolling so programmatic scrolls are instant (accurate captures).
await p.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

// Scroll through the page so IntersectionObserver reveals fire, then return top.
await p.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const step = () => {
      y += window.innerHeight * 0.8;
      window.scrollTo(0, y);
      if (y < document.body.scrollHeight) setTimeout(step, 120);
      else resolve();
    };
    step();
  });
});
await new Promise((r) => setTimeout(r, 500));
await p.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 400));

await p.screenshot({ path: OUT, fullPage: FULL });
await b.close();
console.log("shot " + OUT);
