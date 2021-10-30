import documentIcon from "@iconify/icons-heroicons-outline/document";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import {
  notify,
  removeNotification,
} from "@italodeandra/pijama/components/Snackbar/snackbarState";
import React, { ChangeEventHandler, useRef } from "react";
import { useSnapshot } from "valtio";
import state, { fileState } from "../../../state";
import convertStringToElements from "../../../utils/convertStringToElements";

const OpenFileButton = () => {
  const { setFile } = useSnapshot(fileState);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    inputFileRef.current?.click();
  };
  const handleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      const { text, name } = await setFile(file);
      if (text) {
        const bt = /return (?<bt>(.)*\);)/gs.exec(text)?.groups?.bt;
        if (bt) {
          state.value.elements = convertStringToElements(bt);
        }
        const notification = notify(`Imported flow from file "${name}"`);
        setTimeout(() => removeNotification(notification), 3000);
      }
    }
  };

  return (
    <Button
      startIcon={<Icon icon={documentIcon} />}
      color={"inherit"}
      onClick={handleClick}
    >
      <input
        type="file"
        style={{ display: "none" }}
        ref={inputFileRef}
        onChange={handleChange}
        accept={".ts"}
      />
      Open
    </Button>
  );
};

export default OpenFileButton;
