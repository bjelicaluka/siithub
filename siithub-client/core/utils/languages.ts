const lang: { [key: string]: string } = {
  ts: "typescript",
  js: "javascript",
  tsx: "typescript",
  jsx: "javascript",
  json: "json",
  html: "html",
  css: "css",
  py: "python",
  java: "java",
  xml: "xml",
  cs: "csharp",
  c: "c",
  cpp: "c-like",
};

export const getLang = (ex: string) => {
  return lang[ex] ?? "";
};
