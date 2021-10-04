import { format } from "prettier";
import parserTypeScript from "prettier/parser-typescript";

export default function prettierFormat(value: string) {
  return format(value, {
    parser: "typescript",
    plugins: [parserTypeScript],
  });
}
