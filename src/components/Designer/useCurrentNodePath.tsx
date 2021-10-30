import socket from "@italodeandra/pijama/api/socket";
import { useEffect } from "react";
import { currentNodePathState } from "../../state";

const useCurrentNodePath = () => {
  useEffect(() => {
    const handleUpdateCurrentNode = (value: string) => {
      currentNodePathState.currentNodePath = value.split(",");
    };
    socket.on("updateCurrentNode", handleUpdateCurrentNode);
    return () => {
      socket.off("updateCurrentNode", handleUpdateCurrentNode);
    };
  }, []);
};

export default useCurrentNodePath;
