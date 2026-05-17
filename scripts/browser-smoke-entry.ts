import { complete, getModel } from "@earendil-works/pi-ai";
import { Input, Text, TUI } from "@earendil-works/pi-tui/browser";

const model = getModel("google", "gemini-2.5-flash");
console.log(model.id, typeof complete, typeof TUI, typeof Text, typeof Input);
