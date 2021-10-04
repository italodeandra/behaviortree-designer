import { FlowElement, isEdge } from "react-flow-renderer";

export default function sortByEdge(a: FlowElement, b: FlowElement) {
  try {
    const edgeA = isEdge(a) && (a.label as string | undefined)?.toUpperCase();
    const edgeB = isEdge(b) && (b.label as string | undefined)?.toUpperCase();
    if (edgeA && (!edgeB || edgeA < edgeB)) {
      return -1;
    }
    if (edgeB && (!edgeA || edgeA > edgeB)) {
      return 1;
    }
  } catch (e) {
    return 0;
  }
  return 0;
}
