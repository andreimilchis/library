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

  // Read file as data URL to avoid blob URL fetch issues with PDF.js
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Floor the width to avoid sub-pixel re-renders
  const stableWidth = Math.floor(width) || undefined;

  if (!fileDataUrl) {
    return (
      <div className="flex min-h-[700px] items-center justify-center" style={{ aspectRatio: "8.5/11" }}>
        <p className="text-muted-foreground">Loading PDF...</p>
      </div>
    );
  }

  return (
    <Document
      file={fileDataUrl}
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
