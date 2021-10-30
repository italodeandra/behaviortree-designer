import trashIcon from "@iconify/icons-heroicons-outline/trash";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import React from "react";
import { useSnapshot } from "valtio";
import state, { DEFAULT_ELEMENTS, fileState } from "../../../state";

const ClearButton = () => {
  const { elements } = useSnapshot(state).value;

  const handleClick = () => {
    state.value.elements = cloneDeep(DEFAULT_ELEMENTS);
    fileState.clear();
  };

  return (
    <Button
      startIcon={<Icon icon={trashIcon} />}
      color={"inherit"}
      onClick={handleClick}
      disabled={isEqual(elements, DEFAULT_ELEMENTS)}
    >
      Clear
    </Button>
  );
};

export default ClearButton;
