export interface LanguageData {
  isValid: (raw: string) => boolean;
  beautify: (raw: string) => string;
  minify: (beautified: string) => string;
  name: string;
  label: string;
  editorMode: Record<string, unknown>;
  wrapTextByDefault?: boolean;
}

export const TextLanguage: LanguageData = {
  name: 'text',
  label: "Text",
  editorMode: {
    name: 'text'
  },
  isValid: () => true,
  beautify: (v) => v,
  minify: (v) => v,
  wrapTextByDefault: true,
}

export const Languages: LanguageData[] = [
  TextLanguage,
  {
    name: "json",
    label: "JSON",
    editorMode: {
      name: "javascript",
      json: true,
      statementIndent: 2,
    },
    isValid: (value: string) => {
      try {
        JSON.parse(value);

        return true;
      } catch (e) {
        return false;
      }
    },
    beautify: (value: string) => {
      return JSON.stringify(JSON.parse(value), null, 2);
    },
    minify: (value: string) => {
      return JSON.stringify(JSON.parse(value));
    },
  },
  {
    name: "html",
    label: "HTML",
    editorMode: {
      name: "htmlmixed",
      tags: {
        style: [["type", /^text\/(x-)?scss$/, "text/x-scss"], [
          null,
          null,
          "css",
        ]],
        custom: [[null, null, "customMode"]],
      },
    },
    isValid: (value: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(value, "text/xml");
      if (doc.documentElement.querySelector("parsererror")) {
        return false;
      } else {
        return true;
      }
    },
    beautify: (value: string) => {
      // credits: https://jsfiddle.net/buksy/rxucg1gd/
      const whitespace = " ".repeat(4);
      let currentIndent = 0;
      let char = null;
      let nextChar = null;

      let result = "";
      for (let pos = 0; pos <= value.length; pos++) {
        char = value.substr(pos, 1);
        nextChar = value.substr(pos + 1, 1);

        if (char === "<" && nextChar !== "/") {
          result += "\n" + whitespace.repeat(currentIndent);
          currentIndent++;
        } else if (char === "<" && nextChar === "/") {
          if (--currentIndent < 0) {
            currentIndent = 0;
          }
          result += "\n" + whitespace.repeat(currentIndent);
        } else if (char === " " && nextChar === " ") {
          char = "";
        } else if (char === "\n") {
          if (value.substr(pos, value.substr(pos).indexOf("<")).trim() === "") {
            char = "";
          }
        }

        result += char;
      }

      return result;
    },
    minify: (value: string) => {
      return value
        .replace(/<!--\s*?[^\s?[][\s\S]*?-->/g, "")
        .replace(/>\s*</g, "><");
    },
  },
];

export function getLanguageByContent(content: string): LanguageData | undefined {
  const lang = Languages.find((lang) => lang !== TextLanguage && lang.isValid(content));
  return lang ? lang : TextLanguage
}

export function getLanguageByName(name: string): LanguageData | undefined {
  return Languages.find((lang) => lang.name === name);
}
