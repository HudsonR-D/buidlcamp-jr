export const toggle = (values: number[], n: number) =>
  values.includes(n) ? values.filter((x) => x !== n) : [...values, n];
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function readFile(file?: File) {
  if (!file) throw new Error("Choose a file.");
  if (file.size > 8_000_000)
    throw new Error("Choose a file smaller than 8 MB.");
  return file.text();
}
