import documentDownload from "@iconify/icons-heroicons-outline/document-download";
import Button from "@italodeandra/pijama/components/Button";
import Icon from "@italodeandra/pijama/components/Icon";
import React, { useMemo, useRef } from "react";
import { useHoverDirty } from "react-use";
import { useSnapshot } from "valtio";
import { fileState } from "../../../state";
import { convertElementsToString } from "./ExportButton";

const SaveFileButton = () => {
  const { name, text } = useSnapshot(fileState);
  const ref = useRef(null);
  const isHovering = useHoverDirty(ref);

  const url = useMemo(
    () =>
      window.URL.createObjectURL(
        new Blob(
          [text!.replace(/return (?<bt>(.)*\);)/gs, convertElementsToString())],
          { type: "text/plain" }
        )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHovering, text]
  );

  return (
    <Button
      ref={ref}
      // @ts-ignore
      component={"a"}
      href={url}
      download={name}
      startIcon={<Icon icon={documentDownload} />}
      color={"inherit"}
    >
      Save
    </Button>
  );
};

export default SaveFileButton;
