import arrowCircleRight from "@iconify/icons-heroicons-outline/arrow-circle-right";
import checkCircle from "@iconify/icons-heroicons-outline/check-circle";
import questionMarkCircle from "@iconify/icons-heroicons-outline/question-mark-circle";
import replyIcon from "@iconify/icons-heroicons-outline/reply";
import saveIcon from "@iconify/icons-heroicons-outline/save";
import trashIcon from "@iconify/icons-heroicons-outline/trash";
import uploadIcon from "@iconify/icons-heroicons-outline/upload";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import {
  notify,
  removeNotification,
} from "@italodeandra/pijama/components/Snackbar/snackbarState";
import TextField from "@italodeandra/pijama/components/TextField";
import useCopyToClipboard from "@italodeandra/pijama/hooks/useCopyToClipboard";
import { Box, Card, MenuItem, Stack, Typography } from "@material-ui/core";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import React, { useEffect, useState } from "react";
import { isNode, Node } from "react-flow-renderer";
import { Edge } from "react-flow-renderer/dist/types";
import { useDebounce } from "react-use";
import { v4 as uuid } from "uuid";
import { useSnapshot } from "valtio";
import state, {
  DEFAULT_ELEMENTS,
  SelectedElementState,
  selectedElementState,
} from "../state";

const ExportButton = () => {
  const [clipboard, copy] = useCopyToClipboard();

  useEffect(() => {
    if (clipboard.value) {
      const notification = notify("Exported flow to clipboard");
      setTimeout(() => removeNotification(notification), 3000);
    }
    if (clipboard.error) {
      notify(clipboard.error.message, { variant: "error" });
    }
  }, [clipboard]);

  const handleClick = () => {
    copy(JSON.stringify(state.value.elements, null, 2));
  };

  return (
    <Button
      startIcon={<Icon icon={saveIcon} />}
      color={"inherit"}
      onClick={handleClick}
    >
      Export
    </Button>
  );
};

const ImportButton = () => {
  const handleClick = async () => {
    const value = await navigator.clipboard.readText();
    try {
      state.value.elements = JSON.parse(value);
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

const ClearButton = () => {
  const { elements } = useSnapshot(state).value;

  const handleClick = () => {
    state.value.elements = cloneDeep(DEFAULT_ELEMENTS);
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

const Sidebar = () => {
  const { selectedElement } = useSnapshot(
    selectedElementState
  ) as SelectedElementState;

  const getLabel = () =>
    selectedElement?.data?.label ||
    (selectedElement as unknown as Edge)?.label ||
    "";

  const [label, setLabel] = useState(getLabel());

  useEffect(() => {
    setLabel(getLabel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement]);

  useDebounce(
    () => {
      renameNodeConfirmation(label);
    },
    400,
    [label]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: uuid(),
      position: { x: 0, y: 0 },
      data: { label: `New ${type}`, type },
    };
    const connection: Edge = {
      id: uuid(),
      source: selectedElement!.id,
      target: newNode.id,
    };

    state.value.elements.push(newNode);
    state.value.elements.push(connection);
  };

  const renameNode = (value: string) => {
    setLabel(value);
  };

  const renameNodeConfirmation = (value: string) => {
    if (selectedElementState.selectedElement) {
      if (isNode(selectedElementState.selectedElement)) {
        selectedElementState.selectedElement.data = {
          ...selectedElementState.selectedElement!.data,
          label: value,
        };
      } else {
        (selectedElementState.selectedElement as unknown as Edge).label = value;
      }
    }
  };

  const changeNodeType = (value: string) => {
    if (selectedElementState.selectedElement) {
      if (isNode(selectedElementState.selectedElement)) {
        selectedElementState.selectedElement.data.type = value;
      }
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: 8,
        top: 8,
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      {!!selectedElement && (
        <Card sx={{ p: 2, mb: 1, width: 8 * 30, pointerEvents: "initial" }}>
          <>
            <Box>
              <Typography
                component={"div"}
                variant={"subtitle2"}
                sx={{ mb: 0.5 }}
              >
                Selected node{" "}
                <Typography
                  component={"span"}
                  color={"lightGray"}
                  variant={"inherit"}
                >
                  #{selectedElement?.id.split("-")[0]}
                </Typography>
              </Typography>
              <TextField
                value={label}
                onChange={({ target: { value } }) => renameNode(value)}
              />
              {isNode(selectedElement) &&
                selectedElement.id !== "BEHAVIOR_TREE" && (
                  <TextField
                    label={"Type"}
                    value={selectedElement?.data?.type || ""}
                    onChange={({ target: { value } }) => changeNodeType(value)}
                    select
                    sx={{ mt: 1 }}
                    size={"small"}
                  >
                    <MenuItem value={"sequence"}>Sequence</MenuItem>
                    <MenuItem value={"selector"}>Selector</MenuItem>
                    <MenuItem value={"task"}>Task</MenuItem>
                  </TextField>
                )}
            </Box>
            {selectedElement.data?.type &&
              selectedElement.data.type !== "task" && (
                <>
                  <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                    Add new children
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 0.5 }}>
                    <Button
                      color={"inherit"}
                      variant={"outlined"}
                      onClick={() => addNode("sequence")}
                      startIcon={
                        <Icon
                          icon={arrowCircleRight}
                          sx={{ float: "left" }}
                          fontSize={"small"}
                        />
                      }
                    >
                      Sequence
                    </Button>
                    <Button
                      color={"inherit"}
                      variant={"outlined"}
                      onClick={() => addNode("selector")}
                      startIcon={
                        <Icon
                          icon={questionMarkCircle}
                          sx={{ float: "left" }}
                          fontSize={"small"}
                        />
                      }
                    >
                      Selector
                    </Button>
                    <Button
                      color={"inherit"}
                      variant={"outlined"}
                      onClick={() => addNode("task")}
                      startIcon={
                        <Icon
                          icon={checkCircle}
                          sx={{ float: "left" }}
                          fontSize={"small"}
                        />
                      }
                    >
                      Task
                    </Button>
                  </Stack>
                </>
              )}
          </>
        </Card>
      )}
      <Card sx={{ p: 1, ml: "auto", width: 8 * 15, pointerEvents: "initial" }}>
        <Stack spacing={1}>
          <ExportButton />
          <ImportButton />
          <UndoButton />
          <RedoButton />
          <ClearButton />
        </Stack>
      </Card>
    </Box>
  );
};

export default Sidebar;
