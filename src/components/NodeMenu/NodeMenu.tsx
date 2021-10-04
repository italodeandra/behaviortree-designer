import { Menu, MenuItem } from "@material-ui/core";
import { bindContextMenu, bindMenu } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import { cloneElement, ReactElement, VFC } from "react";
import { removeElement, selectedElementState } from "../Designer/state";

export interface ArchiveButtonProps {
  children: ReactElement;
}

const NodeMenu: VFC<ArchiveButtonProps> = ({ children }) => {
  const popupState = usePopupState({
    popupId: "node-popup-menu",
    variant: "popover",
  });

  const handleDeleteClick = () => {
    if (selectedElementState.selectedElement) {
      removeElement(selectedElementState.selectedElement);
    }
  };

  return (
    <>
      {children
        ? cloneElement(children, {
            ...bindContextMenu(popupState),
          })
        : null}
      <Menu
        sx={{
          zIndex: 1600,
        }}
        {...bindMenu(popupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>
    </>
  );
};
export default NodeMenu;
