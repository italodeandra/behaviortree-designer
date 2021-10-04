import socket from "@italodeandra/pijama/api/socket";
import { useEffect } from "react";
import { currentNodeState } from "./state";

const useCurrentNode = () => {
  useEffect(() => {
    const handleUpdateCurrentNode = (value: string) => {
      currentNodeState.currentNode = value;
    };
    socket.on("updateCurrentNode", handleUpdateCurrentNode);
    return () => {
      socket.off("updateCurrentNode", handleUpdateCurrentNode);
    };
  }, []);
};

export default useCurrentNode;
