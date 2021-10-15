import useCopyToClipboard from "@italodeandra/pijama/hooks/useCopyToClipboard";
import cloneDeep from "lodash/cloneDeep";
import { FlowElement, isEdge, isNode } from "react-flow-renderer";
import { Edge } from "react-flow-renderer/dist/types";
import { useKey } from "react-use";
import { v4 as uuid } from "uuid";
import state, { selectedElementState } from "../Designer/state";

const useKeyboardShortcuts = () => {
  const { selectedElement } = selectedElementState;
  const { elements } = state.value;
  const [, copy] = useCopyToClipboard();
  useKey(
    ({ key, ctrlKey }) => ctrlKey && key === "c",
    (event) => {
      if (document.activeElement === document.body && selectedElement) {
        event.preventDefault();
        const elementsToCopy: FlowElement[] = [];

        const addElementAndChildren = (elementToAddChildren: FlowElement) => {
          elementsToCopy.push(elementToAddChildren);
          for (const element of elements) {
            if (
              isEdge(element) &&
              isNode(elementToAddChildren) &&
              element.source === elementToAddChildren.id
            ) {
              addElementAndChildren(element);
            }
            if (
              isNode(element) &&
              isEdge(elementToAddChildren) &&
              element.id === elementToAddChildren.target
            ) {
              addElementAndChildren(element);
            }
          }
        };
        addElementAndChildren(selectedElement);

        if (elementsToCopy.length) {
          copy(JSON.stringify(elementsToCopy));
          console.info("Copied", elementsToCopy);
        }
      }
    }
  );
  useKey(
    ({ key, ctrlKey }) => ctrlKey && key === "v",
    async (event) => {
      try {
        const value = await navigator.clipboard.readText();
        if (document.activeElement === document.body && value) {
          event.preventDefault();
          const newIds: { [key: string]: string } = {};
          const elementsToPaste = JSON.parse(value);
          for (const elementToPaste of elementsToPaste) {
            newIds[elementToPaste.id] = newIds[elementToPaste.id] || uuid();
            elementToPaste.id = newIds[elementToPaste.id];

            if (elementToPaste.source) {
              newIds[elementToPaste.source] =
                newIds[elementToPaste.source] || uuid();
              elementToPaste.source = newIds[elementToPaste.source];
            }

            if (elementToPaste.target) {
              newIds[elementToPaste.target] =
                newIds[elementToPaste.target] || uuid();
              elementToPaste.target = newIds[elementToPaste.target];
            }
            state.value.elements.push(elementToPaste);
          }
          const connection: Edge = {
            id: uuid(),
            source: selectedElement!.id,
            target: elementsToPaste[0].id,
          };
          state.value.elements.push(connection);
          console.info("Pasted", elementsToPaste);
        }
      } catch (e) {
        console.error(e);
      }
    }
  );
  useKey(
    ({ key, ctrlKey }) => ctrlKey && key === "d",
    (event) => {
      if (document.activeElement === document.body && selectedElement) {
        event.preventDefault();
        const elementsToDupe: FlowElement[] = [];

        const addElementAndChildren = (elementToAddChildren: FlowElement) => {
          elementsToDupe.push(cloneDeep(elementToAddChildren));
          for (const element of elements) {
            if (element.id !== elementToAddChildren.id) {
              if (
                isEdge(element) &&
                isNode(elementToAddChildren) &&
                element.source === elementToAddChildren.id
              ) {
                addElementAndChildren(element);
              }
              if (
                isNode(element) &&
                isEdge(elementToAddChildren) &&
                element.id === elementToAddChildren.target
              ) {
                addElementAndChildren(element);
              }
            }
          }
        };
        addElementAndChildren(selectedElement);

        if (elementsToDupe.length) {
          const newIds: { [key: string]: string } = {};
          for (const elementToDupe of elementsToDupe) {
            newIds[elementToDupe.id] = newIds[elementToDupe.id] || uuid();
            elementToDupe.id = newIds[elementToDupe.id];

            if (isEdge(elementToDupe) && elementToDupe.source) {
              newIds[elementToDupe.source] =
                newIds[elementToDupe.source] || uuid();
              elementToDupe.source = newIds[elementToDupe.source];
            }

            if (isEdge(elementToDupe) && elementToDupe.target) {
              newIds[elementToDupe.target] =
                newIds[elementToDupe.target] || uuid();
              elementToDupe.target = newIds[elementToDupe.target];
            }
            state.value.elements.push(elementToDupe);
          }
          const target = elements.find(
            (el) => isEdge(el) && el.target === selectedElement.id
          ) as Edge | undefined;
          if (target) {
            const connection: Edge = {
              id: uuid(),
              source: target.source,
              target: elementsToDupe[0].id,
            };
            state.value.elements.push(connection);
          }
          console.info("Duplicated", elementsToDupe);
        }
      }
    }
  );
};

export default useKeyboardShortcuts;
