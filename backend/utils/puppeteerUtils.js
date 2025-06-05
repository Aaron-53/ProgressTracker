const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs").promises;
const path = require("path");

puppeteer.use(StealthPlugin());

async function getCleanBodyContent(url, options = {}) {
  const {
    cookies = null,
    timeout = 30000,
    waitUntil = "networkidle2",
    additionalTagsToRemove = [],
    headless = true,
  } = options;

  let browser = null;

  try {
    // Create browser
    browser = await puppeteer.launch({
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout,
    });

    // Create page
    const page = await browser.newPage();

    // Set cookies if provided
    if (cookies && cookies.length > 0) {
      await page.setCookie(...cookies);
    }

    // Navigate to URL
    const response = await page.goto(url, {
      waitUntil,
      timeout,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Failed to load page: ${response?.status()} ${response?.statusText()}`
      );
    }

    // Check for verification pages
    const pageTitle = await page.title();
    const isVerificationPage =
      pageTitle.includes("Verify") ||
      pageTitle.includes("verify you are human") ||
      pageTitle.includes("Captcha");

    if (isVerificationPage) {
      throw new Error("Page requires human verification");
    }

    // Extract cleaned body content
    const cleanedBodyContent = await page.evaluate((extraTags) => {
      // Default tags to remove
      const defaultTagsToRemove = [
        "script",
        "noscript",
        "style",
        "link",
        "meta",
        "path",
        "svg",
        "img",
        "iframe",
        "object",
        "embed",
        "video",
        "audio",
        "canvas",
        "map",
        "area",
      ];

      // Combine with additional tags
      const allTagsToRemove = [...defaultTagsToRemove, ...extraTags];

      // Clone body to avoid modifying original
      const bodyClone = document.body.cloneNode(true);

      // Remove unwanted tags
      allTagsToRemove.forEach((tag) => {
        bodyClone.querySelectorAll(tag).forEach((el) => el.remove());
      });

      // Remove elements with common ad/tracking classes and IDs
      const unwantedSelectors = [
        '[class*="ad"]',
        '[class*="advertisement"]',
        '[class*="banner"]',
        '[class*="popup"]',
        '[class*="modal"]',
        '[class*="overlay"]',
        '[class*="tracking"]',
        '[class*="analytics"]',
        '[class*="cookie"]',
        "#ads",
        "#advertisement",
        "#banner",
        "#popup",
        "#modal",
      ];

      // unwantedSelectors.forEach((selector) => {
      //   try {
      //     bodyClone.querySelectorAll(selector).forEach((el) => el.remove());
      //   } catch (e) {
      //     // Ignore selector errors
      //   }
      // });

      //Remove empty elements
      bodyClone.querySelectorAll("*").forEach((el) => {
        if (el.children.length === 0 && el.textContent.trim() === "") {
          el.remove();
        }
      });

      //Clean up inline styles and unwanted attributes
      bodyClone.querySelectorAll("*").forEach((el) => {
        // Remove unwanted attributes
        const attributesToRemove = [
          "style",
          "onclick",
          "onload",
          "onerror",
          "onmouseover",
          "data-track",
          "data-analytics",
          "data-ad",
        ];

        attributesToRemove.forEach((attr) => {
          if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
          }
        });
      });

      return bodyClone.innerHTML;
    }, additionalTagsToRemove);

    // Get current cookies for future requests
    const currentCookies = await page.cookies();

    // Temporarily store content in a nearby file
    let savedFilePath = null;
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const urlSlug = url.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
      const fileName = `scraped_${urlSlug}_${timestamp}.html`;
      const tempDir = path.join(__dirname, "temp_scraped_content");
      savedFilePath = path.join(tempDir, fileName);

      // Create directory if it doesn't exist
      await fs.mkdir(tempDir, { recursive: true });

      // Save the cleaned content
      await fs.writeFile(savedFilePath, cleanedBodyContent, "utf8");
      console.log(`Content saved to: ${savedFilePath}`);
    } catch (fileError) {
      console.warn(`Failed to save content to file: ${fileError.message}`);
      savedFilePath = null;
    }

    return {
      success: true,
      content: cleanedBodyContent,
      title: pageTitle,
      url: page.url(),
      cookies: currentCookies,
      timestamp: new Date().toISOString(),
      savedFile: savedFilePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url,
      timestamp: new Date().toISOString(),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { getCleanBodyContent };
