import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import React from "react";

type CustomBlockquoteProps = {
  children: React.ReactNode;
};

const CustomBlockquote: React.FC<CustomBlockquoteProps> = ({ children }) => {
  const paragraphElement = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === "p"
  ) as React.ReactElement | undefined;

  if (!paragraphElement) return <blockquote>{children}</blockquote>;

  const content = paragraphElement.props.children;

  const extractMarkerAndContent = (lines: string[] | React.ReactNode[]) => {
    const firstLine = typeof lines[0] === "string" ? lines[0].trim() : "";
    const remainingContent = lines.slice(1);

    const regex = /^\[!(\w+)\](?:\s+(.*))?/; // Matches [!type] Optional Custom Title
    const match = regex.exec(firstLine);

    return {
      type: match?.[1]?.toLowerCase() || null,
      customTitle: match?.[2]?.trim(),
      markerLine: firstLine,
      remainingContent,
    };
  };

  const renderBlock = (
    type: string,
    customTitle: string | undefined,
    remainingContent: React.ReactNode
  ) => {
    const titleMap: Record<string, { defaultTitle: string; Icon: React.FC; className: string }> = {
      info: { defaultTitle: "Info", Icon: Info, className: "info-block" },
      warning: { defaultTitle: "Warning", Icon: AlertTriangle, className: "warning-block" },
      error: { defaultTitle: "Error", Icon: XCircle, className: "error-block" },
      success: { defaultTitle: "Success", Icon: CheckCircle, className: "success-block" },
    };

    const blockType = titleMap[type];
    if (!blockType) return <blockquote>{children}</blockquote>;

    const { defaultTitle, Icon, className } = blockType;

    return (
      <div className={className}>
        <div className="flex items-center font-bold mb-2">
          <span className="w-5 h-5 mr-2">
            <Icon aria-hidden="true" />
          </span>
          {customTitle || defaultTitle}
        </div>
        <div>{remainingContent}</div>
      </div>
    );
  };

  if (typeof content === "string") {
    const lines = content.split("\n").map((line) => line.trim());
    const { type, customTitle, remainingContent } = extractMarkerAndContent(lines);
    return renderBlock(type || "", customTitle, remainingContent.join("\n").trim());
  } else if (Array.isArray(content)) {
    const { type, customTitle, remainingContent } = extractMarkerAndContent(content);
    return renderBlock(type || "", customTitle, remainingContent);
  }

  return <blockquote>{children}</blockquote>;
};

export default CustomBlockquote;
