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
import state, { selectedElementState } from "../../state";

const EditBTCode = () => {
  const { editingBT } = useSnapshot(selectedElementState);
  const { value } = useSnapshot(state);
  const [code, setCode] = useState("");

  const handleClose = () => {
    selectedElementState.editingBT = false;
  };

  const handleSave = () => {
    state.value = JSON.parse(code);
    handleClose();
  };

  useEffect(() => {
    if (editingBT) {
      setCode(JSON.stringify(value, null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingBT]);

  return (
    <Dialog open={editingBT} onClose={handleClose} fullWidth maxWidth={"xl"}>
      <DialogTitle>Behavior Tree</DialogTitle>
      <DialogContent>
        <Box sx={{ overflow: "hidden" }}>
          <CodeEditor
            defaultLanguage={"json"}
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

export default EditBTCode;
