import { Edge, Node as FlowNode } from "react-flow-renderer";
import { v4 as uuid } from "uuid";
import prettierFormat from "./prettierFormat";

export default function convertStringToElements(value: string) {
  class Node {
    id: string;
    description: string;
    // noinspection JSMismatchedCollectionQueryUpdate
    children: Node[] = [];

    constructor(description: string, id: string) {
      this.description = description;
      this.id = id;
    }
  }

  class Sequence extends Node {
    constructor(description: string, children: Node[], id: string) {
      super(description, id);
      this.children = children;
    }
  }

  class Selector extends Node {
    constructor(description: string, children: Node[], id: string) {
      super(description, id);
      this.children = children;
    }
  }

  class BehaviorTree extends Selector {}

  class Task extends Node {
    runFunction: string;

    constructor(description: string, runFunction: () => boolean, id: string) {
      super(description, id);
      // noinspection RegExpRedundantEscape
      this.runFunction = prettierFormat(
        /\(\) => \{(?<runFunction>(.)*)}.?/gs.exec(runFunction.toString())
          ?.groups?.runFunction || ""
      );
    }
  }

  const flowNodes: FlowNode[] = [];
  const edges: Edge[] = [];

  const convertToElement = (node: Node): FlowNode => {
    let flowNode: FlowNode;
    if (node instanceof BehaviorTree) {
      flowNode = {
        id: node.id,
        type: "input",
        data: {
          label: node.description,
        },
        position: {
          x: 0,
          y: 0,
        },
      };
      flowNodes.push(flowNode);
    } else if (node instanceof Sequence) {
      flowNode = {
        id: node.id,
        data: {
          label: node.description,
          type: "sequence",
        },
        position: {
          x: 0,
          y: 0,
        },
      };
      flowNodes.push(flowNode);
    } else if (node instanceof Selector) {
      flowNode = {
        id: node.id,
        data: {
          label: node.description,
          type: "selector",
        },
        position: {
          x: 0,
          y: 0,
        },
      };
      flowNodes.push(flowNode);
    } else if (node instanceof Task) {
      flowNode = {
        id: node.id,
        data: {
          label: node.description,
          type: "task",
          code: node.runFunction,
        },
        position: {
          x: 0,
          y: 0,
        },
      };
      flowNodes.push(flowNode);
    } else {
      throw "Node type not found";
    }

    let i = 0;
    for (const child of node.children) {
      const childFlowNode = convertToElement(child);
      const edge = {
        id: uuid(),
        source: flowNode.id,
        target: childFlowNode.id,
        label: (++i).toString(),
      };
      edges.push(edge);
    }

    return flowNode;
  };

  convertToElement(eval(value));

  return [...flowNodes, ...edges];
}
