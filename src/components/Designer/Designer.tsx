import arrowCircleRight from "@iconify/icons-heroicons-outline/arrow-circle-right";
import checkCircle from "@iconify/icons-heroicons-outline/check-circle";
import questionMarkCircle from "@iconify/icons-heroicons-outline/question-mark-circle";
import Icon from "@italodeandra/pijama/components/Icon";
import { Box } from "@material-ui/core";
import dagre from "dagre";
import cloneDeep from "lodash/cloneDeep";
import { MouseEvent as ReactMouseEvent, useMemo, useState, VFC } from "react";
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
  useStoreActions,
} from "react-flow-renderer";
import { useUpdateEffect } from "react-use";
import { v4 as uuid } from "uuid";
import { useSnapshot } from "valtio";
import sortByEdge from "../../utils/sortByEdge";
import CustomNodeComponent from "../CustomNodeComponent/CustomNodeComponent";
import EditBTCode from "../EditBTCode/EditBTCode";
import EditNode from "../EditNode/EditNode";
import Sidebar from "../Sidebar/Sidebar";
import state, {
  removeElement,
  SelectedElementState,
  selectedElementState,
  State,
} from "./state";
import useCurrentNode from "./useCurrentNode";
import useUpdateProfile from "./useUpdateProfile";

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
  const { selectedElement, setSelectedElement } = useSnapshot(
    selectedElementState
  ) as SelectedElementState;
  const onElementsRemove = (elementsToRemove: Elements) => {
    elementsToRemove.forEach(removeElement);
  };
  const onConnect = (params: Edge | Connection) => {
    state.value.elements = addEdge(params, state.value.elements);
  };
  const [direction] = useState<"LR" | "TB">("LR");
  const addSelectedElements = useStoreActions(
    (actions) => actions.addSelectedElements
  );
  2;
  const resetSelectedElements = useStoreActions(
    (actions) => actions.resetSelectedElements
  );

  const layoutedElements = useMemo(() => {
    const isHorizontal = direction === "LR";
    const dagreGraph = new dagre.graphlib.Graph({});

    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    const layoutedElements = cloneDeep(elements);

    layoutedElements.sort(sortByEdge).forEach((el) => {
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

  useUpdateEffect(() => {
    if (selectedElement) {
      resetSelectedElements();
      addSelectedElements([selectedElement]);
    }
  }, [selectedElement]);

  useCurrentNode();
  useUpdateProfile();

  return (
    <Box sx={{ height: "100vh", width: "100%" }}>
      <ReactFlow
        elements={layoutedElements}
        onElementsRemove={onElementsRemove}
        onConnect={onConnect}
        deleteKeyCode={46} /* 'delete'-key */
        nodesDraggable={true}
        onElementClick={handleElementClick}
        onPaneClick={handlePaneClick}
        nodeTypes={{ default: CustomNodeComponent }}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      <Sidebar />
      {selectedElement && isNode(selectedElement) && <EditNode />}
      <EditBTCode />
    </Box>
  );
};

const withProvider = <T extends VFC>(Component: T): T => {
  return ((props: any) => (
    <ReactFlowProvider>
      <Component {...props} />
    </ReactFlowProvider>
  )) as unknown as T;
};

export default withProvider(Designer);
