import replyIcon from "@iconify/icons-heroicons-outline/reply";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Designer/state";

const RedoButton = () => {
  const { canRedo } = useSnapshot(state);

  const handleClick = () => {
    state.redo();
  };

  return (
    <Button
      startIcon={<Icon icon={replyIcon} rotate={2} />}
      color={"inherit"}
      onClick={handleClick}
      disabled={!canRedo()}
    >
      Redo
    </Button>
  );
};

export default RedoButton;
