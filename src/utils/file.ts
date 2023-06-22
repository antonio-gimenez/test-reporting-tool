import axios from "axios";

export function humanReadeableDate(date: Date): string {
  const options = {
    minute: "numeric",
    hour: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",

    hour12: false,
  };
  return new Date(date).toLocaleDateString("en-US", options as Object);
}


export function humanFileSize(bytes: number, decimalPlaces = 2): string {
  if (!bytes) return "0 B";
  const threshold = 1024;

  if (Math.abs(bytes) < threshold) {
    return bytes + " B";
  }

  const units: string[] = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  const r = 10 ** decimalPlaces;

  do {
    bytes /= threshold;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= threshold && u < units.length - 1);

  return bytes.toFixed(decimalPlaces) + " " + units[u];
}

export function getFileSize(files: FileList | File[]): number {
  let size = 0;
  for (let i = 0; i < files.length; i++) {
    size += files[i].size;
  }
  return size;
}

export function getBase64(file: any): string | null {
  if (!file) return null;
  if (file.contentType) {
    const bytes = new Uint8Array(file.file.data);
    const binary = bytes.reduce((acc: string, byte: number) => acc + String.fromCharCode(byte), "");
    const base64Data = btoa(binary);
    return `data:${file.contentType};base64,${base64Data}`;
  }
  return null;
}

export const createFileList = (files: File[]): FileList => {
  const fileList = new DataTransfer();
  files.forEach((file: File) => fileList.items.add(file));
  return fileList.files;
};

export async function getAttachments(testId: number | string | undefined): Promise<any> {
  try {
    const response = await axios.get(process.env.REACT_APP_API_URL + `/tests/files/${testId}`);
    return response.data.data 
  } catch (error) {
    return 
  }
}

export function downloadFile(file: any): void | HTMLImageElement {
  const base64 = getBase64(file) as string;
  const type = file.contentType;
  const isImage = type.includes("image");
  const isSvg = type.includes("svg");

  if (isSvg) {
    const svg = document.createElement("img") as HTMLImageElement;
    svg.src = base64 as string;
    return svg;
  }

  if (isImage) {
    return window.open(base64, "_blank") as any;
  }

  const link = document.createElement("a");
  link.href = base64;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
