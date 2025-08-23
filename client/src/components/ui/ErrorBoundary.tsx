import * as React from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

// ----------------------------------------------------------------------

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <>
      <GlobalErrorStyles />
      <div className={errorBoundaryClasses.root}>
        <div className={errorBoundaryClasses.container}>
          {renderErrorMessage(error)}
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------

function parseStackTrace(stack?: string) {
  if (!stack) return { filePath: null, functionName: null };

  const filePathMatch = stack.match(/\/src\/[^?]+/);
  const functionNameMatch = stack.match(/at (\S+)/);

  return {
    filePath: filePathMatch ? filePathMatch[0] : null,
    functionName: functionNameMatch ? functionNameMatch[1] : null,
  };
}

function renderErrorMessage(error: any) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1 className={errorBoundaryClasses.title}>
          {error.status}: {error.statusText}
        </h1>
        <p className={errorBoundaryClasses.message}>{error.data}</p>
      </>
    );
  }

  if (error instanceof Error) {
    const { filePath, functionName } = parseStackTrace(error.stack);

    return (
      <>
        <h1 className={errorBoundaryClasses.title}>
          Unexpected Application Error!
        </h1>
        <p className={errorBoundaryClasses.message}>
          {error.name}: {error.message}
        </p>
        <pre className={errorBoundaryClasses.details}>{error.stack}</pre>
        {(filePath || functionName) && (
          <p className={errorBoundaryClasses.filePath}>
            {filePath} ({functionName})
          </p>
        )}
      </>
    );
  }

  return <h1 className={errorBoundaryClasses.title}>Unknown Error</h1>;
}

// ----------------------------------------------------------------------

const errorBoundaryClasses = {
  root: "error-boundary-root",
  container: "error-boundary-container",
  title: "error-boundary-title",
  details: "error-boundary-details",
  message: "error-boundary-message",
  filePath: "error-boundary-file-path",
};

// ----------------------------------------------------------------------
// Global styles (replacing MUI's GlobalStyles)

function GlobalErrorStyles() {
  return (
    <style>{`
      :root {
        --info-color: #2dd9da;
        --warning-color: #e2aa53;
        --error-color: #ff5555;
        --error-background: #2a1e1e;
        --details-background: #111111;
        --root-background: #2c2c2e;
        --container-background: #1c1c1e;
        --font-stack-monospace: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        --font-stack-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
          "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }

      body {
        margin: 0;
        color: white;
        background-color: var(--root-background);
      }

      .${errorBoundaryClasses.root} {
        display: flex;
        flex: 1 1 auto;
        align-items: center;
        padding: 10vh 15px 0;
        flex-direction: column;
        font-family: var(--font-stack-sans);
      }

      .${errorBoundaryClasses.container} {
        gap: 24px;
        padding: 20px;
        width: 100%;
        max-width: 960px;
        display: flex;
        border-radius: 8px;
        flex-direction: column;
        background-color: var(--container-background);
      }

      .${errorBoundaryClasses.title} {
        margin: 0;
        line-height: 1.2;
        font-size: 20px;
        font-weight: 700;
      }

      .${errorBoundaryClasses.message} {
        margin: 0;
        line-height: 1.5;
        padding: 12px 16px;
        white-space: pre-wrap;
        color: var(--error-color);
        font-size: 14px;
        font-family: var(--font-stack-monospace);
        background-color: var(--error-background);
        border-left: 2px solid var(--error-color);
        font-weight: 700;
      }

      .${errorBoundaryClasses.details} {
        margin: 0;
        padding: 16px;
        line-height: 1.5;
        overflow: auto;
        border-radius: inherit;
        color: var(--warning-color);
        background-color: var(--details-background);
        font-family: var(--font-stack-monospace);
        font-size: 13px;
      }

      .${errorBoundaryClasses.filePath} {
        margin-top: 0;
        color: var(--info-color);
        font-family: var(--font-stack-monospace);
      }
    `}</style>
  );
}
