import Gray from "@italodeandra/pijama/styles/colors/Gray";
import Green from "@italodeandra/pijama/styles/colors/Green";
import Red from "@italodeandra/pijama/styles/colors/Red";
import { Box } from "@material-ui/core";
import React, { memo, useRef } from "react";
import { renderToString } from "react-dom/server";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { useIntersection } from "react-use";
import { useSnapshot } from "valtio";
import { searchState, selectedElementState } from "../../state";
import NodeMenu from "../NodeMenu/NodeMenu";

const CustomNodeComponent = ({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
  selected,
  type,
}: NodeProps) => {
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });
  const { selectedElement } = useSnapshot(selectedElementState);
  const { debouncedSearch: search } = useSnapshot(searchState);

  const handleDoubleClick = () => {
    if (selectedElement?.data?.type && selectedElement.data.type === "task") {
      selectedElementState.editing = true;
    }
  };

  const labelString = search && renderToString(data?.label);
  const isSearched =
    labelString && labelString.toLowerCase().includes(search.toLowerCase());

  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      <div ref={intersectionRef}>
        {!(intersection && intersection.intersectionRatio === 0) && (
          <NodeMenu>
            <Box
              onDoubleClick={handleDoubleClick}
              sx={{
                color: data.active
                  ? Green.N500
                  : isSearched
                  ? Red.N500
                  : search
                  ? Gray.N300
                  : undefined,
                fontWeight: selected ? 700 : undefined,
              }}
            >
              {data.label}
            </Box>
          </NodeMenu>
        )}
      </div>
      {type === "default" && (
        <Handle
          type="source"
          position={sourcePosition}
          isConnectable={isConnectable}
        />
      )}
    </>
  );
};

export default memo(CustomNodeComponent);
