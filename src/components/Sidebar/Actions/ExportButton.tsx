import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import {
  notify,
  removeNotification,
} from "@italodeandra/pijama/components/Snackbar/snackbarState";
import useCopyToClipboard from "@italodeandra/pijama/hooks/useCopyToClipboard";
import React, { useEffect } from "react";
import {
  FlowElement,
  isEdge,
  isNode,
  Node as FlowNode,
} from "react-flow-renderer";
import NodeType from "../../../types/NodeType";
import prettierFormat from "../../../utils/prettierFormat";
import sortByEdge from "../../../utils/sortByEdge";
import state from "../../../state";
import saveIcon from "@iconify/icons-heroicons-outline/save";

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

export default ExportButton;
