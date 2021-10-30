import codeIcon from "@iconify/icons-heroicons-outline/code";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import React from "react";
import { selectedElementState } from "../../../state";

const EditCodeButton = () => {
  const handleClick = () => {
    selectedElementState.editingBT = true;
  };

  return (
    <Button
      startIcon={<Icon icon={codeIcon} />}
      color={"inherit"}
      onClick={handleClick}
    >
      JSON
    </Button>
  );
};

export default EditCodeButton;
