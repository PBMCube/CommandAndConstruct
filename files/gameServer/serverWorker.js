
// Web Worker script to run the game server in a separate thread.
import { GameServer } from "./gameServer.js";

let messagePort = null;		// for communicating with runtime
let gameServer = null;		// main GameServer class

// Construct's createWorker() API will send this worker a "construct-worker-init"
// message with the message port to directly communicate with the runtime.
self.addEventListener("message", e =>
{
	if (e.data && e.data["type"] === "construct-worker-init")
	{
		messagePort = e.data["port2"];
		messagePort.onmessage = OnMessageFromRuntime;
	}
});

// Map of message types that can be received from the client
// and the function to call to handle them.
const MESSAGE_MAP = new Map([
	["init", OnInit],
	["release", OnRelease]
]);

// Called when a message is received from the runtime.
function OnMessageFromRuntime(e)
{
	// Look up the function to call for this message type in the message map.
	const data = e.data;
	const messageType = data["type"];
	const handlerFunc = MESSAGE_MAP.get(messageType);
	
	if (handlerFunc)
	{
		// Call the message handler function with the provided data.
		handlerFunc(data);
	}
	else
	{
		// Messages should always have a handler, so log an error if it's not found.
		console.error(`[GameServer] No message handler for type '${messageType}'`);
	}
}

// Called when the runtime wants to initialise the GameServer.
function OnInit()
{
	// Initialise GameServer, passing it the function that can send a message to the runtime.
	gameServer = new GameServer(SendMessageToRuntime);
}

// Called when the runtime is ending the game.
function OnRelease()
{
	gameServer.Release();
	gameServer = null;
}

// Helper function for posting a message.
function SendMessageToRuntime(msg)
{
	messagePort.postMessage(msg);
}
