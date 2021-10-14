import Editor, { Monaco } from "@monaco-editor/react";
import { useEffect, useState, VFC } from "react";
import ShowAutocompletion from "./ShowAutocomplete";

const CodeEditor: VFC<{
  value?: string;
  onChange: (value?: string) => void;
  autocomplete?: any;
  defaultLanguage?: string;
}> = ({ value, onChange, autocomplete, defaultLanguage = "javascript" }) => {
  const [monacoRef, setMonacoRef] = useState<Monaco>();

  useEffect(() => {
    if (monacoRef) {
      return ShowAutocompletion(monacoRef, autocomplete).dispose;
    }
  }, [autocomplete, monacoRef]);

  return (
    <Editor
      height={"calc(100vh - 200px)"}
      defaultLanguage={defaultLanguage}
      value={value || ""}
      onChange={onChange}
      theme="vs-dark"
      onMount={(_, monaco) => {
        setMonacoRef(monaco);
      }}
      options={{
        tabSize: 2,
      }}
    />
  );
};

export default CodeEditor;
