import arrowCircleRight from "@iconify/icons-heroicons-outline/arrow-circle-right";
import checkCircle from "@iconify/icons-heroicons-outline/check-circle";
import questionMarkCircle from "@iconify/icons-heroicons-outline/question-mark-circle";
import Icon from "@italodeandra/pijama/components/Icon";
import { Box } from "@material-ui/core";
import dagre from "dagre";
import cloneDeep from "lodash/cloneDeep";
import { MouseEvent as ReactMouseEvent, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Elements,
  isNode,
  MiniMap,
  Node,
  Position,
  ReactFlowProvider,
  removeElements,
} from "react-flow-renderer";
import { v4 as uuid } from "uuid";
import { useSnapshot } from "valtio";
import Sidebar from "./Sidebar/Sidebar";
import state, { selectedElementState, State } from "./state";

let elements: Elements = [
  {
    id: uuid(),
    type: "input", // input node
    data: { label: "Input Node" },
    position: { x: 250, y: 25 },
  },
  // default node
  {
    id: uuid(),
    // you can also pass a React component as a label
    data: { label: <div>Default Node</div> },
    position: { x: 100, y: 125 },
  },
  {
    id: uuid(),
    type: "output", // output node
    data: { label: "Output Node" },
    position: { x: 250, y: 250 },
  },
];
elements = [
  ...elements,
  // animated edge
  {
    id: uuid(),
    source: elements[0].id,
    target: elements[1].id,
    animated: true,
  },
  { id: uuid(), source: elements[1].id, target: elements[2].id },
];

const Designer = () => {
  const { elements } = useSnapshot(state).value as State;
  const { selectedElement, setSelectedElement } =
    useSnapshot(selectedElementState);
  const onElementsRemove = (elementsToRemove: Elements) => {
    state.value.elements = removeElements(elementsToRemove, elements);
    if (elementsToRemove.find((e) => e.id === selectedElement?.id)) {
      setSelectedElement(null);
    }
  };
  const onConnect = (params: Edge | Connection) => {
    state.value.elements = addEdge(params, state.value.elements);
  };
  const [direction, setDirection] = useState<"LR" | "TB">("LR");

  const layoutedElements = useMemo(() => {
    const isHorizontal = direction === "LR";
    const dagreGraph = new dagre.graphlib.Graph({});

    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    const layoutedElements = cloneDeep(elements);

    layoutedElements.forEach((el) => {
      if (isNode(el)) {
        dagreGraph.setNode(el.id, { width: 150, height: 50 });
      } else {
        dagreGraph.setEdge(el.source, el.target);
      }
    });

    dagre.layout(dagreGraph);

    return layoutedElements.map((el) => {
      if (isNode(el)) {
        const nodeWithPosition = dagreGraph.node(el.id);
        el.targetPosition = isHorizontal ? Position.Left : Position.Top;
        el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
        // we need to pass a slightly different position in order to notify react flow about the change
        el.position = {
          x: nodeWithPosition.x + Math.random() / 1000,
          y: nodeWithPosition.y,
        };
        el.type = el.data.type === "Designer" ? "output" : el.type;
        if (el.data.type === "sequence") {
          el.data.label = (
            <>
              <Icon
                icon={arrowCircleRight}
                sx={{ float: "left", mr: 0.5 }}
                fontSize={"small"}
              />
              {el.data.label}
            </>
          );
        }
        if (el.data.type === "selector") {
          el.data.label = (
            <>
              <Icon
                icon={questionMarkCircle}
                sx={{ float: "left", mr: 0.5 }}
                fontSize={"small"}
              />
              {el.data.label}
            </>
          );
        }
        if (el.data.type === "task") {
          el.data.label = (
            <>
              <Icon
                icon={checkCircle}
                sx={{ float: "left", mr: 0.5 }}
                fontSize={"small"}
              />
              {el.data.label}
            </>
          );
        }
      }

      return el;
    });
  }, [direction, elements]);

  const handleElementClick = (event: ReactMouseEvent, element: Node | Edge) => {
    setSelectedElement(element.id);
  };

  const handlePaneClick = () => {
    setSelectedElement(null);
  };

  return (
    <Box sx={{ height: "100vh", width: "100%" }}>
      <ReactFlowProvider>
        <ReactFlow
          elements={layoutedElements}
          onElementsRemove={onElementsRemove}
          onConnect={onConnect}
          deleteKeyCode={46} /* 'delete'-key */
          nodesDraggable={false}
          onElementClick={handleElementClick}
          onPaneClick={handlePaneClick}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        <Sidebar />
      </ReactFlowProvider>
    </Box>
  );
};

export default Designer;
