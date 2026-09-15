// Edit these with the committee's real payment details.
export const PAYMENT_DETAILS = {
  instapayHandle: "your-instapay-handle@instapay",
  teldaHandle: "@your-telda-handle",
  instructions:
    "Send the exact total using Instapay or Telda to the handle above, then upload a screenshot of the confirmation below.",
};

export const MAX_SCREENSHOT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_SCREENSHOT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
