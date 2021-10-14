import arrowCircleRight from "@iconify/icons-heroicons-outline/arrow-circle-right";
import checkCircle from "@iconify/icons-heroicons-outline/check-circle";
import codeIcon from "@iconify/icons-heroicons-outline/code";
import linkIcon from "@iconify/icons-heroicons-outline/link";
import puzzleIcon from "@iconify/icons-heroicons-outline/puzzle";
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlowElement,
  isEdge,
  isNode,
  Node as FlowNode,
} from "react-flow-renderer";
import { Edge } from "react-flow-renderer/dist/types";
import { useDebounce } from "react-use";
import { v4 as uuid } from "uuid";
import { useSnapshot } from "valtio";
import NodeType from "../../types/NodeType";
import convertStringToElements from "../../utils/convertStringToElements";
import prettierFormat from "../../utils/prettierFormat";
import sortByEdge from "../../utils/sortByEdge";
import state, {
  DEFAULT_ELEMENTS,
  SelectedElementState,
  selectedElementState,
} from "../Designer/state";

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
    const elements = state.value.elements.sort(sortByEdge);
    const edges = elements.filter(isEdge);
    const nodes = elements.filter(isNode);

    const mapNode = (
      el: FlowElement
    ): {
      type: NodeType;
      children?: any[];
      run?: string;
      description: string;
      subtreeLink?: string;
      id: string;
    } => {
      if (el.id === "BEHAVIOR_TREE") {
        return {
          id: el.id,
          type: NodeType.BT,
          description: el.data.label,
          children: edges
            .filter((e) => e.source === "BEHAVIOR_TREE")
            .map(mapNode),
        };
      } else if (el?.data?.type === NodeType.Subtree) {
        return {
          id: el.id,
          type: NodeType.Subtree,
          description: el?.data.label || "",
          children: edges.filter((e) => e.source === el.id).map(mapNode),
        };
      } else {
        const node = nodes.find((n) => isEdge(el) && n.id === el.target);
        if (node && node.data?.type === NodeType.Sequence) {
          return {
            id: el.id,
            type: NodeType.Sequence,
            description: node.data.label,
            children: edges.filter((e) => e.source === node.id).map(mapNode),
          };
        } else if (node && node.data?.type === NodeType.Selector) {
          return {
            id: el.id,
            type: NodeType.Selector,
            description: node.data.label,
            children: edges.filter((e) => e.source === node.id).map(mapNode),
          };
        } else if (node && node.data?.type === NodeType.SubtreeLink) {
          return {
            id: el.id,
            type: NodeType.SubtreeLink,
            description: node.data.label || "",
            subtreeLink: node.data?.subtreeLink,
          };
        } else {
          return {
            id: el.id,
            type: NodeType.Task,
            description: node?.data?.label || "",
            run: node?.data?.code || "return false",
          };
        }
      }
    };

    const behaviorTree = mapNode(
      nodes.find((e) => e.id === "BEHAVIOR_TREE") as FlowNode
    );

    const subtrees = nodes
      .filter((node) => node.data?.type === NodeType.Subtree)
      .map((node) => mapNode(node as FlowNode));

    const toString = (obj: any, subtreesString?: string) => {
      const description = obj.description
        ? obj.description.replace(/"/g, '\\"')
        : "";

      switch (obj.type) {
        case NodeType.BT:
          return `new BehaviorTree("${description}", [${obj.children
            .map(toString)
            .join(",")}], ${subtreesString}, "${obj.id}")`;
        case NodeType.Subtree:
          return `new Subtree("${description}", [${obj.children
            .map(toString)
            .join(",")}], "${obj.id}")`;
        case NodeType.Selector:
          return `new Selector("${description}", [${obj.children
            .map(toString)
            .join(",")}], "${obj.id}")`;
        case NodeType.Sequence:
          return `new Sequence("${description}", [${obj.children
            .map(toString)
            .join(",")}], "${obj.id}")`;
        case NodeType.SubtreeLink:
          return `new SubtreeLink("${description}", "${obj.subtreeLink}", "${obj.id}")`;
        default:
          return `new Task("${description}", () => {${obj.run}}, "${obj.id}")`;
      }
    };

    const subtreesString = subtrees.length
      ? `[${subtrees.map((subtree) => toString(subtree))}]`
      : "[]";

    // const json = JSON.stringify(state.value.elements, null, 2);
    const formattedString = prettierFormat(
      `return ${toString(behaviorTree, subtreesString)}`
    );

    copy(formattedString);
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

const EditCode = () => {
  const handleClick = () => {
    selectedElementState.editingBT = true;
  };

  return (
    <Button
      startIcon={<Icon icon={codeIcon} />}
      color={"inherit"}
      onClick={handleClick}
    >
      Code
    </Button>
  );
};

const Sidebar = () => {
  const labelRef = useRef<HTMLInputElement>(null);
  const { selectedElement, setSelectedElement } = useSnapshot(
    selectedElementState
  ) as SelectedElementState;
  const {
    value: { elements },
  } = useSnapshot(state);

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
          <EditCode />
        </Stack>
      </Card>
    </Box>
  );
};

export default Sidebar;
