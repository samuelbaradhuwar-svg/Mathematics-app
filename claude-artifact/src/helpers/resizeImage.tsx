// Shrinks a phone photo in the browser before it is sent (phone photos are often 4-12 MB).
// Returns a JPEG of at most `maxSide` pixels on its longest side.

export interface ResizedImage {
  base64: string; // without the data: prefix
  mediaType: "image/jpeg";
  previewUrl: string; // data URL for showing the picture
  width: number;
  height: number;
  bytes: number;
}

const loadImage = (file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close?: () => void }> =>
  new Promise((resolve, reject) => {
    if (typeof createImageBitmap === "function") {
      createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions)
        .then((bmp) => resolve({ source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() }))
        .catch(() => viaImg());
    } else viaImg();
    function viaImg() {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("I couldn't open that picture. Please try another one."));
      };
      img.src = url;
    }
  });

export async function resizeImage(file: File, maxSide = 1600, quality = 0.85): Promise<ResizedImage> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a picture (a photo or a screenshot).");
  const img = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't prepare the picture.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img.source, 0, 0, width, height);
  img.close?.();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bytes = Math.floor((base64.length * 3) / 4);
  if (bytes > 4_800_000) throw new Error("That picture is too big even after shrinking. Please crop it a little and try again.");
  return { base64, mediaType: "image/jpeg", previewUrl: dataUrl, width, height, bytes };
}
