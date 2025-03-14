import React from "react";

export const MARKER_REGEX = /^\[!(\w+)\](?:\s+(.*))?$/;

export function splitIntoTokens(nodes: React.ReactNode) {
  const result: Array<string | React.ReactNode> = [];
  React.Children.forEach(nodes, (node) => {
    if (typeof node === "string") {
      const parts = node.split("\n");
      parts.forEach((part, index) => {
        result.push(part);
        if (index < parts.length - 1) result.push("\n");
      });
    } else {
      result.push(node);
    }
  });
  return result;
}

export function extractMarkerInfo(tokens: Array<string | React.ReactNode>) {
  let foundMarker = false;
  let type = "";
  const customTitle: Array<string | React.ReactNode> = [];
  let rest: Array<string | React.ReactNode> = [];
  const lineBuffer: Array<string | React.ReactNode> = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (foundMarker) {
      if (token === "\n") {
        rest = tokens.slice(i + 1);
        break;
      }
      customTitle.push(token);
    } else {
      if (typeof token === "string") {
        const match = token.match(MARKER_REGEX);
        if (match) {
          type = match[1].toLowerCase();
          if (match[2]) customTitle.push(match[2]);
          foundMarker = true;
        } else {
          lineBuffer.push(token);
          const joined = lineBuffer.join("");
          const bufferMatch = joined.match(MARKER_REGEX);
          if (bufferMatch) {
            type = bufferMatch[1].toLowerCase();
            if (bufferMatch[2]) customTitle.push(bufferMatch[2]);
            foundMarker = true;
          }
        }
      } else {
        lineBuffer.push(token);
        const joinedAsText = lineBuffer.map((x) => (typeof x === "string" ? x : "")).join("");
        const bufferMatch = joinedAsText.match(MARKER_REGEX);
        if (bufferMatch) {
          type = bufferMatch[1].toLowerCase();
          if (bufferMatch[2]) customTitle.push(lineBuffer[lineBuffer.length - 1]);
          foundMarker = true;
        }
      }
    }
  }

  return { foundMarker, type, customTitle, rest };
}

export function renderSpacedLine(items: Array<string | React.ReactNode>) {
  return items.map((item, index) => (
    <span key={index} style={{ marginRight: index === items.length - 1 ? "0" : "0.25rem" }}>
      {item}
    </span>
  ));
}
