"use client";

import { useState, useEffect, memo } from "react";
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

  // Read file as ArrayBuffer to avoid blob URL fetch issues with PDF.js headers
  const [fileData, setFileData] = useState<{ data: ArrayBuffer } | null>(null);
  useEffect(() => {
    let cancelled = false;
    file.arrayBuffer().then((buf) => {
      if (!cancelled) setFileData({ data: buf });
    });
    return () => { cancelled = true; };
  }, [file]);

  // Floor the width to avoid sub-pixel re-renders
  const stableWidth = Math.floor(width) || undefined;

  if (!fileData) {
    return (
      <div className="flex min-h-[700px] items-center justify-center" style={{ aspectRatio: "8.5/11" }}>
        <p className="text-muted-foreground">Loading PDF...</p>
      </div>
    );
  }

  return (
    <Document
      file={fileData}
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
