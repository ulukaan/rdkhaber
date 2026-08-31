"use client";

import { useState, useTransition } from "react";
import { deleteMyAccountAction, exportMyDataAction } from "@/actions/privacy";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function PrivacyDataPanel() {
  const [exportData, setExportData] = useState<object | null>(null);
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onExport = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const data = await exportMyDataAction();
      setExportData(data);
      setMessage("Verileriniz indirmeye hazır.");
    });
  };

  const onDelete = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await deleteMyAccountAction(confirm);
      if (result?.error) {
        setError(result.error);
        return;
      }
      window.location.href = "/";
    });
  };

  const downloadJson = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rdkhaber-verilerim-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Veri dışa aktarma (KVKK)</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Profil, kayıtlı haberler, yorumlar ve okuma geçmişinizi JSON olarak indirebilirsiniz.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={onExport} disabled={pending}>
            {pending ? "Hazırlanıyor..." : "Verilerimi dışa aktar"}
          </Button>
          {exportData ? (
            <Button type="button" variant="outline" onClick={downloadJson}>
              JSON indir
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-danger/30 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-danger">Hesabı pasifleştir</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Hesabınız devre dışı bırakılır; oturumunuz sonlanır. Bu işlem geri alınamaz.
        </p>
        <div className="mt-4">
          <FieldGroup label='Onay için "SIL" yazın' htmlFor="confirm-delete">
            <Input
              id="confirm-delete"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
          </FieldGroup>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 border-danger text-danger hover:bg-danger/5"
          onClick={onDelete}
          disabled={pending || confirm.trim().toUpperCase() !== "SIL"}
        >
          {pending ? "İşleniyor..." : "Hesabımı pasifleştir"}
        </Button>
      </section>

      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
    </div>
  );
}
