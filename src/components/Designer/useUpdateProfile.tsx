import socket from "@italodeandra/pijama/api/socket";
import { notify } from "@italodeandra/pijama/components/Snackbar/snackbarState";
import { useEffect } from "react";
import convertStringToElements from "../../utils/convertStringToElements";
import state from "./state";

const useUpdateProfile = () => {
  useEffect(() => {
    const handleUpdateProfile = (value: string) => {
      try {
        const bt = /return (?<bt>(.)*)}/gs.exec(value)?.groups?.bt;
        if (bt) {
          state.value.elements = convertStringToElements(bt);
        }
      } catch (e) {
        notify(e.message, { variant: "error" });
      }
    };
    socket.on("updateProfile", handleUpdateProfile);
    return () => {
      socket.off("updateProfile", handleUpdateProfile);
    };
  }, []);
};

export default useUpdateProfile;
