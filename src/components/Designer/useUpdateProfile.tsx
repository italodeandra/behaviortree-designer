import socket from "@italodeandra/pijama/api/socket";
import { useEffect } from "react";
import convertStringToElements from "../../utils/convertStringToElements";
import state from "./state";

const useUpdateProfile = () => {
  useEffect(() => {
    const handleUpdateProfile = (value: string) => {
      const bt = /return (?<bt>(.)*)}/gs.exec(value)?.groups?.bt;
      if (bt) {
        state.value.elements = convertStringToElements(bt);
      }
    };
    socket.on("updateProfile", handleUpdateProfile);
    return () => {
      socket.off("updateProfile", handleUpdateProfile);
    };
  }, []);
};

export default useUpdateProfile;
