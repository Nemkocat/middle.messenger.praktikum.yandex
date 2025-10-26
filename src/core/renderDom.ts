import Block from "./block";

export default function renderDOM(block: Block): void {
  const root = document.querySelector("#app");

  if (!root) {
    throw new Error("Root element #app not found");
  }

  root.innerHTML = "";
  const content = block.getContent();
  if (content) {
    root.appendChild(content);
  }
}

