import { isBrowser } from "@italodeandra/pijama/utils/isBrowser";
import cloneDeep from "lodash/cloneDeep";
import { ElementId, Elements, Node } from "react-flow-renderer";
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

export interface SelectedElementState {
  selectedElement: Node | null;

  setSelectedElement(elementId: ElementId | null): void;
}

export const selectedElementState = proxy<SelectedElementState>({
  selectedElement: null,
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
