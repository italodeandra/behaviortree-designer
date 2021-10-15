import arrowCircleRight from "@iconify/icons-heroicons-outline/arrow-circle-right";
import checkCircle from "@iconify/icons-heroicons-outline/check-circle";
import codeIcon from "@iconify/icons-heroicons-outline/code";
import linkIcon from "@iconify/icons-heroicons-outline/link";
import puzzleIcon from "@iconify/icons-heroicons-outline/puzzle";
import questionMarkCircle from "@iconify/icons-heroicons-outline/question-mark-circle";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import TextField from "@italodeandra/pijama/components/TextField";
import { Box, Card, MenuItem, Stack, Typography } from "@material-ui/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { isNode, Node as FlowNode } from "react-flow-renderer";
import { Edge } from "react-flow-renderer/dist/types";
import { useDebounce } from "react-use";
import { v4 as uuid } from "uuid";
import { useSnapshot } from "valtio";
import NodeType from "../../types/NodeType";
import state, {
  SelectedElementState,
  selectedElementState,
} from "../Designer/state";
import ClearButton from "./Actions/ClearButton";
import EditCodeButton from "./Actions/EditCodeButton";
import ExportButton from "./Actions/ExportButton";
import ImportButton from "./Actions/ImportButton";
import RedoButton from "./Actions/RedoButton";
import UndoButton from "./Actions/UndoButton";
import useKeyboardShortcuts from "./useKeyboardShortcuts";

const Sidebar = () => {
  const labelRef = useRef<HTMLInputElement>(null);
  const { selectedElement, setSelectedElement } = useSnapshot(
    selectedElementState
  ) as SelectedElementState;
  const {
    value: { elements },
  } = useSnapshot(state) as typeof state;

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

  const addNode = (type: NodeType) => {
    const newNode: FlowNode = {
      id: uuid(),
      position: { x: 0, y: 0 },
      data: { label: `New ${type}`, type },
    };

    state.value.elements.push(newNode);

    if (type === NodeType.Subtree) {
      const newNodeSubtreeLink: FlowNode = {
        id: uuid(),
        position: { x: 0, y: 0 },
        data: {
          label: `New ${NodeType.SubtreeLink}`,
          type: NodeType.SubtreeLink,
          subtreeLink: newNode.id,
        },
      };
      state.value.elements.push(newNodeSubtreeLink);
      const connection: Edge = {
        id: uuid(),
        source: selectedElement!.id,
        target: newNodeSubtreeLink.id,
      };
      state.value.elements.push(connection);
    } else {
      const connection: Edge = {
        id: uuid(),
        source: selectedElement!.id,
        target: newNode.id,
      };
      state.value.elements.push(connection);
    }

    setSelectedElement(newNode.id);
    labelRef.current?.focus();
    setTimeout(() => {
      labelRef.current?.select();
    });
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

  const changeNodeType = (value: NodeType) => {
    if (selectedElementState.selectedElement) {
      if (isNode(selectedElementState.selectedElement)) {
        selectedElementState.selectedElement.data.type = value;
      }
    }
  };

  const changeSubtreeLink = (value: string) => {
    if (selectedElementState.selectedElement) {
      selectedElementState.selectedElement.data.label =
        subtrees.find((s) => s.id === value)?.data.label || "";
      selectedElementState.selectedElement.data.subtreeLink = value;
    }
  };

  const handleEditCodeClick = () => {
    selectedElementState.editing = true;
  };

  const subtrees = useMemo(
    () => elements.filter((el) => el.data?.type === NodeType.Subtree),
    [elements]
  );

  useKeyboardShortcuts();

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
                ref={labelRef}
                value={label}
                onChange={({ target: { value } }) => renameNode(value)}
              />
              {isNode(selectedElement) &&
                selectedElement.id !== "BEHAVIOR_TREE" && (
                  <TextField
                    label={"Type"}
                    value={selectedElement?.data?.type || NodeType.Task}
                    onChange={({ target: { value } }) =>
                      changeNodeType(value as NodeType)
                    }
                    select
                    sx={{ mt: 1 }}
                    size={"small"}
                  >
                    <MenuItem value={NodeType.Sequence}>Sequence</MenuItem>
                    <MenuItem value={NodeType.Selector}>Selector</MenuItem>
                    <MenuItem value={NodeType.Task}>Task</MenuItem>
                    <MenuItem value={NodeType.Subtree}>Subtree</MenuItem>
                    <MenuItem value={NodeType.SubtreeLink}>
                      Link Subtree
                    </MenuItem>
                  </TextField>
                )}
              {selectedElement?.data?.type === NodeType.SubtreeLink && (
                <TextField
                  label={"Subtree Link"}
                  value={selectedElement.data.subtreeLink || ""}
                  onChange={({ target: { value } }) => changeSubtreeLink(value)}
                  select
                  sx={{ mt: 1 }}
                  size={"small"}
                >
                  {subtrees.map((subtree) => (
                    <MenuItem key={subtree.id} value={subtree.id}>
                      {subtree.data?.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>
            {selectedElement.data?.type &&
              selectedElement.data.type === NodeType.Task && (
                <Button
                  color={"inherit"}
                  onClick={handleEditCodeClick}
                  startIcon={
                    <Icon
                      icon={codeIcon}
                      sx={{ float: "left" }}
                      fontSize={"small"}
                    />
                  }
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Edit code
                </Button>
              )}
            {((selectedElement.data?.type &&
              selectedElement.data.type !== NodeType.Task) ||
              selectedElement.id === "BEHAVIOR_TREE") && (
              <>
                <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                  Add new children
                </Typography>
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  <Button
                    color={"inherit"}
                    variant={"outlined"}
                    onClick={() => addNode(NodeType.Sequence)}
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
                    onClick={() => addNode(NodeType.Selector)}
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
                    onClick={() => addNode(NodeType.Task)}
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
                  <Button
                    color={"inherit"}
                    variant={"outlined"}
                    onClick={() => addNode(NodeType.Subtree)}
                    startIcon={
                      <Icon
                        icon={puzzleIcon}
                        sx={{ float: "left" }}
                        fontSize={"small"}
                      />
                    }
                  >
                    Subtree
                  </Button>
                  <Button
                    color={"inherit"}
                    variant={"outlined"}
                    onClick={() => addNode(NodeType.SubtreeLink)}
                    startIcon={
                      <Icon
                        icon={linkIcon}
                        sx={{ float: "left" }}
                        fontSize={"small"}
                      />
                    }
                  >
                    Subtree Link
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
          <EditCodeButton />
        </Stack>
      </Card>
    </Box>
  );
};

export default Sidebar;
