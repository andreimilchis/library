"use client";

import { useState, useMemo, memo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export const PdfViewer = memo(function PdfViewer({
  file,
  width,
}: {
  file: File;
  width: number;
}) {
  const [numPages, setNumPages] = useState<number>(0);

  // Stable blob URL - only recreate when the actual file identity changes
  const fileUrl = useMemo(() => URL.createObjectURL(file), [file]);

  // Floor the width to avoid sub-pixel re-renders
  const stableWidth = Math.floor(width) || undefined;

  return (
    <Document
      file={fileUrl}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      loading={
        <div
          className="flex min-h-[700px] items-center justify-center"
          style={{ aspectRatio: "8.5/11" }}
        >
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      }
      error={
        <div
          className="flex min-h-[700px] items-center justify-center"
          style={{ aspectRatio: "8.5/11" }}
        >
          <p className="text-red-500">Failed to load PDF</p>
        </div>
      }
    >
      {Array.from(new Array(numPages), (_, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          width={stableWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </Document>
  );
});
