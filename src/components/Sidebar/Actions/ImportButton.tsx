import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import {
  notify,
  removeNotification,
} from "@italodeandra/pijama/components/Snackbar/snackbarState";
import React from "react";
import convertStringToElements from "../../../utils/convertStringToElements";
import state from "../../../state";
import uploadIcon from "@iconify/icons-heroicons-outline/upload";

const ImportButton = () => {
  const handleClick = async () => {
    const value = await navigator.clipboard.readText();
    try {
      const bt = /return (?<bt>(.)*\);)/gs.exec(value)?.groups?.bt;
      if (bt) {
        state.value.elements = convertStringToElements(bt);
      }

      const notification = notify("Imported flow from clipboard");
      setTimeout(() => removeNotification(notification), 3000);
    } catch (e) {
      notify(e.message, { variant: "error" });
    }
  };

  return (
    <Button
      startIcon={<Icon icon={uploadIcon} />}
      color={"inherit"}
      onClick={handleClick}
    >
      Import
    </Button>
  );
};

export default ImportButton;
