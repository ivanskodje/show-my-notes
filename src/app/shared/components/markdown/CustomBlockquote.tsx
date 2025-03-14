import { Info, AlertTriangle, CheckCircle, XCircle, Sparkles } from "lucide-react";
import React from "react";
import { splitIntoTokens, extractMarkerInfo, renderSpacedLine } from "./markdown-utils";

type CustomBlockquoteProps = {
  children: React.ReactNode;
};

const titleMap: Record<string, { defaultTitle: string; Icon: React.FC; className: string }> = {
  info: { defaultTitle: "Info", Icon: Info, className: "info-block" },
  tip: { defaultTitle: "Tip", Icon: Sparkles, className: "tip-block" },
  warning: { defaultTitle: "Warning", Icon: AlertTriangle, className: "warning-block" },
  error: { defaultTitle: "Error", Icon: XCircle, className: "error-block" },
  success: { defaultTitle: "Success", Icon: CheckCircle, className: "success-block" },
};

const CustomBlockquote: React.FC<CustomBlockquoteProps> = ({ children }) => {
  const paragraphElement = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === "p"
  ) as React.ReactElement | undefined;

  if (!paragraphElement) {
    return <blockquote>{children}</blockquote>;
  }

  const content = paragraphElement.props.children;
  const tokens = Array.isArray(content) ? splitIntoTokens(content) : splitIntoTokens([content]);
  const { foundMarker, type, customTitle, rest } = extractMarkerInfo(tokens);

  if (!foundMarker) {
    return <blockquote>{children}</blockquote>;
  }

  const blockType = titleMap[type];
  if (!blockType) {
    return <blockquote>{children}</blockquote>;
  }

  const { defaultTitle, Icon, className } = blockType;

  return (
    <div className={className}>
      <div className="flex items-center font-bold mb-2">
        <span className="w-5 h-5 mr-2">
          <Icon aria-hidden="true" />
        </span>
        {customTitle.length ? renderSpacedLine(customTitle) : defaultTitle}
      </div>
      <div style={{ whiteSpace: "pre-wrap" }}>{renderSpacedLine(rest)}</div>
    </div>
  );
};

export default CustomBlockquote;
