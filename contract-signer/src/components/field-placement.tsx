"use client";

import { useState, useRef, useCallback } from "react";
import {
  PenLine,
  Type,
  Calendar,
  User,
  Mail,
  Building2,
  Briefcase,
  AlignLeft,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Signer = {
  id: string;
  name: string;
  email: string;
};

type PlacedField = {
  id: string;
  type: string;
  signerId: string;
  page: number;
  posX: number;
  posY: number;
  width: number;
  height: number;
};

const FIELD_TYPES = [
  { type: "SIGNATURE", label: "Signature", icon: PenLine, width: 200, height: 60 },
  { type: "INITIALS", label: "Initials", icon: Type, width: 80, height: 40 },
  { type: "DATE_SIGNED", label: "Date signed", icon: Calendar, width: 150, height: 30 },
  { type: "FULL_NAME", label: "Full name", icon: User, width: 180, height: 30 },
  { type: "EMAIL", label: "Email", icon: Mail, width: 200, height: 30 },
  { type: "COMPANY", label: "Company", icon: Building2, width: 180, height: 30 },
  { type: "TITLE", label: "Title", icon: Briefcase, width: 150, height: 30 },
  { type: "TEXT", label: "Text field", icon: AlignLeft, width: 200, height: 30 },
];

const SIGNER_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

const SIGNER_BORDER_COLORS = [
  "border-blue-400",
  "border-green-400",
  "border-purple-400",
  "border-orange-400",
  "border-pink-400",
];

const SIGNER_BG_COLORS = [
  "bg-blue-50",
  "bg-green-50",
  "bg-purple-50",
  "bg-orange-50",
  "bg-pink-50",
];

export function FieldPlacement({
  file,
  signers,
  fields,
  onFieldsChange,
}: {
  file: File | null;
  signers: Signer[];
  fields: PlacedField[];
  onFieldsChange: (fields: PlacedField[]) => void;
}) {
  const [selectedSigner, setSelectedSigner] = useState(signers[0]?.id || "");
  const [draggingType, setDraggingType] = useState<string | null>(null);
  const [movingField, setMovingField] = useState<string | null>(null);
  const [moveOffset, setMoveOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleFieldDrop = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || (!draggingType && !movingField)) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (movingField) {
        // Move existing field
        onFieldsChange(
          fields.map((f) =>
            f.id === movingField
              ? { ...f, posX: x - moveOffset.x, posY: y - moveOffset.y }
              : f
          )
        );
        setMovingField(null);
        return;
      }

      if (draggingType) {
        const fieldDef = FIELD_TYPES.find((f) => f.type === draggingType);
        if (!fieldDef) return;

        const newField: PlacedField = {
          id: crypto.randomUUID(),
          type: draggingType,
          signerId: selectedSigner,
          page: 1,
          posX: x - fieldDef.width / 2,
          posY: y - fieldDef.height / 2,
          width: fieldDef.width,
          height: fieldDef.height,
        };

        onFieldsChange([...fields, newField]);
        setDraggingType(null);
      }
    },
    [draggingType, movingField, moveOffset, selectedSigner, fields, onFieldsChange]
  );

  function removeField(id: string) {
    onFieldsChange(fields.filter((f) => f.id !== id));
  }

  function startMoveField(
    e: React.MouseEvent,
    fieldId: string,
    fieldX: number,
    fieldY: number
  ) {
    e.stopPropagation();
    const offsetX = e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0) - fieldX;
    const offsetY = e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0) - fieldY;
    setMoveOffset({ x: offsetX, y: offsetY });
    setMovingField(fieldId);
  }

  function getSignerIndex(signerId: string) {
    return signers.findIndex((s) => s.id === signerId);
  }

  function getFieldLabel(type: string) {
    return FIELD_TYPES.find((f) => f.type === type)?.label || type;
  }

  function getFieldIcon(type: string) {
    return FIELD_TYPES.find((f) => f.type === type)?.icon || AlignLeft;
  }

  return (
    <div className="flex gap-4">
      {/* Left sidebar - Field types */}
      <div className="w-56 flex-shrink-0 space-y-4">
        {/* Signer selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Assigning fields to
          </p>
          <div className="space-y-1">
            {signers.map((signer, i) => (
              <button
                key={signer.id}
                onClick={() => setSelectedSigner(signer.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  selectedSigner === signer.id
                    ? `${SIGNER_BG_COLORS[i % SIGNER_BG_COLORS.length]} ${SIGNER_BORDER_COLORS[i % SIGNER_BORDER_COLORS.length]} border`
                    : "hover:bg-slate-50"
                )}
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    SIGNER_COLORS[i % SIGNER_COLORS.length]
                  )}
                />
                <span className="truncate font-medium">{signer.name || `Signer ${i + 1}`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Field types */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Drag fields onto document
          </p>
          <div className="space-y-1">
            {FIELD_TYPES.map((field) => {
              const Icon = field.icon;
              return (
                <button
                  key={field.type}
                  onMouseDown={() => setDraggingType(field.type)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-transparent px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-primary/5 cursor-grab active:cursor-grabbing"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {field.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Fields placed
          </p>
          {signers.map((signer, i) => {
            const count = fields.filter((f) => f.signerId === signer.id).length;
            return (
              <div key={signer.id} className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", SIGNER_COLORS[i % SIGNER_COLORS.length])} />
                  <span className="truncate">{signer.name || `Signer ${i + 1}`}</span>
                </div>
                <span className="text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDF Canvas area */}
      <div className="flex-1">
        <div
          ref={canvasRef}
          onClick={handleFieldDrop}
          className={cn(
            "relative min-h-[700px] rounded-xl border-2 bg-white shadow-sm",
            draggingType || movingField
              ? "border-primary/50 cursor-crosshair"
              : "border-slate-200"
          )}
          style={{ aspectRatio: "8.5/11" }}
        >
          {/* PDF placeholder */}
          {!file ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No document uploaded</p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs">Click on the document to place fields</p>
              </div>
            </div>
          )}

          {/* Placed fields */}
          {fields.map((field) => {
            const signerIdx = getSignerIndex(field.signerId);
            const Icon = getFieldIcon(field.type);
            return (
              <div
                key={field.id}
                className={cn(
                  "absolute flex items-center gap-1 rounded border-2 px-2 py-1 text-xs font-medium shadow-sm cursor-move select-none",
                  SIGNER_BORDER_COLORS[signerIdx % SIGNER_BORDER_COLORS.length],
                  SIGNER_BG_COLORS[signerIdx % SIGNER_BG_COLORS.length]
                )}
                style={{
                  left: field.posX,
                  top: field.posY,
                  minWidth: field.width,
                  minHeight: field.height,
                }}
                onMouseDown={(e) => startMoveField(e, field.id, field.posX, field.posY)}
              >
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{getFieldLabel(field.type)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className="ml-auto flex-shrink-0 rounded p-0.5 hover:bg-red-100"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </button>
              </div>
            );
          })}

          {/* Drop indicator */}
          {(draggingType || movingField) && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                Click to place {draggingType ? getFieldLabel(draggingType) : "field"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
