import Green from "@italodeandra/pijama/styles/colors/Green";
import { Box } from "@material-ui/core";
import React, { memo } from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { useSnapshot } from "valtio";
import { currentNodePathState, selectedElementState } from "../Designer/state";
import NodeMenu from "../NodeMenu/NodeMenu";

const CustomNodeComponent = ({
  id,
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  const { selectedElement } = useSnapshot(selectedElementState);
  const { currentNodePath } = useSnapshot(currentNodePathState);

  const handleDoubleClick = () => {
    if (selectedElement?.data?.type && selectedElement.data.type === "task") {
      selectedElementState.editing = true;
    }
  };

  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      <NodeMenu>
        <Box
          onDoubleClick={handleDoubleClick}
          sx={{ color: currentNodePath.includes(id) ? Green.N500 : undefined }}
        >
          {data.label}
        </Box>
      </NodeMenu>
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default memo(CustomNodeComponent);
