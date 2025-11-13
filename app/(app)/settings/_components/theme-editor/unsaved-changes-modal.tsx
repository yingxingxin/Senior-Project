"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Unsaved Changes Modal
 *
 * Warns user when attempting to leave with unsaved theme changes.
 * Provides options to:
 * - Discard changes and leave
 * - Cancel and stay in editor
 * - Save changes and leave
 */

interface UnsavedChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export function UnsavedChangesModal({
  open,
  onOpenChange,
  onDiscard,
  onSave,
  isSaving = false,
}: UnsavedChangesModalProps) {
  const handleSave = async () => {
    await onSave();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved theme changes. Do you want to save them before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard} disabled={isSaving}>
            Discard Changes
          </AlertDialogCancel>
          <AlertDialogCancel disabled={isSaving}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
