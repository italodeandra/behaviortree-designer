import { isBrowser } from "@italodeandra/pijama/utils/isBrowser";
import cloneDeep from "lodash/cloneDeep";
import {
  Edge,
  ElementId,
  Elements,
  Node,
  removeElements,
} from "react-flow-renderer";
import { proxy, subscribe } from "valtio";
import { proxyWithHistory } from "valtio/utils";

export interface State {
  elements: Elements;
}

export const DEFAULT_ELEMENTS = [
  {
    id: "BEHAVIOR_TREE",
    type: "input",
    data: { label: "Behavior Tree" },
    position: { x: 0, y: 0 },
  },
];

const state = proxyWithHistory<State>({
  elements: cloneDeep(DEFAULT_ELEMENTS),
});

export function removeElement(elementToRemove: Node | Edge) {
  const { selectedElement, setSelectedElement } = selectedElementState;
  state.value.elements = removeElements(
    [elementToRemove],
    state.value.elements
  );
  if (elementToRemove.id === selectedElement?.id) {
    setSelectedElement(null);
  }
}

export interface SelectedElementState {
  selectedElement: Node | null;
  editing: boolean;
  editingBT: boolean;

  setSelectedElement(elementId: ElementId | null): void;
}

export const selectedElementState = proxy<SelectedElementState>({
  selectedElement: null,
  editing: false,
  editingBT: false,
  setSelectedElement(elementId) {
    selectedElementState.selectedElement = elementId
      ? (state.value.elements.find((e) => e.id === elementId) as Node)
      : null;
  },
});

if (isBrowser) {
  subscribe(state, () => {
    localStorage.setItem(
      "behaviorTreeDesigner_elements",
      JSON.stringify(state.value.elements)
    );
  });
  const behaviorTreeDesigner_elements = localStorage.getItem(
    "behaviorTreeDesigner_elements"
  );
  if (behaviorTreeDesigner_elements) {
    try {
      const backup = state.value.elements;
      state.value.elements = JSON.parse(behaviorTreeDesigner_elements);
      state.history.snapshots.splice(state.history.snapshots.length - 1, 1);
      --state.history.index;
      if (!state.value.elements[0].id) {
        state.value.elements = backup;
        state.history.snapshots.splice(state.history.snapshots.length - 1, 1);
        --state.history.index;
      }
    } catch (e) {}
  }
}

export default state;

export const currentNodeState = proxy<{
  currentNode: string | null;
}>({
  currentNode: null,
});
