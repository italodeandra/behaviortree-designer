import Button from "@italodeandra/pijama/components/Button";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import CodeEditor from "../CodeEditor/CodeEditor";
import { selectedElementState } from "../../state";

const EditNode = () => {
  const { editing, selectedElement } = useSnapshot(selectedElementState);
  const [code, setCode] = useState("");

  const handleClose = () => {
    selectedElementState.editing = false;
  };

  const handleSave = () => {
    if (selectedElementState.selectedElement) {
      selectedElementState.selectedElement.data.code = code;
    }
    handleClose();
  };

  useEffect(() => {
    if (selectedElement) {
      setCode(selectedElement.data.code || "return false");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  return (
    <Dialog open={editing} onClose={handleClose} fullWidth maxWidth={"xl"}>
      <DialogTitle>{selectedElement?.data.label}</DialogTitle>
      <DialogContent>
        <Box sx={{ overflow: "hidden" }}>
          <CodeEditor
            value={code}
            onChange={(value) => setCode(value || "")}
            autocomplete={{
              isPlayerAlive() {},
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditNode;
