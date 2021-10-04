import socket, { setupSocketServer } from "@italodeandra/pijama/api/socket";
import * as fs from "fs";
import { createServer } from "http";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer(handle);

  setupSocketServer(server);

  const currentNodeFilePath =
    "C:\\MINIONAPP\\Bots\\GW2Minion64\\LuaMods\\Kiko_Base\\currentNode.txt";
  if (!fs.existsSync(currentNodeFilePath)) {
    fs.writeFileSync(currentNodeFilePath, "");
  }
  fs.watchFile(currentNodeFilePath, { interval: 1000 }, () => {
    const currentNode = fs.readFileSync(currentNodeFilePath, "utf8");
    socket.emit("updateCurrentNode", currentNode);
  });

  server.listen(port, () => {
    console.info(`> Ready on http://localhost:${port}`);
  });
});
