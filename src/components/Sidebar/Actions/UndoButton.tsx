import replyIcon from "@iconify/icons-heroicons-outline/reply";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Designer/state";

const UndoButton = () => {
  const { canUndo } = useSnapshot(state);

  const handleClick = () => {
    state.undo();
  };

  return (
    <Button
      startIcon={<Icon icon={replyIcon} />}
      color={"inherit"}
      onClick={handleClick}
      disabled={!canUndo()}
    >
      Undo
    </Button>
  );
};

export default UndoButton;
