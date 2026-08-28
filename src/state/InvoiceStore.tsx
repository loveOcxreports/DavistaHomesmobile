import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Client, Invoice, Line } from '../lib/types';
import {
  blankInvoice,
  DEFAULT_TERMS,
  FIRST_INVOICE_NO,
  grandTotal,
  nextInvoiceNo,
  nightsBetween,
  pad10,
} from '../lib/davistaLib';
import {
  loadClients,
  loadDefaultAddr,
  loadDefaultTerms,
  loadInvoices,
  saveClients,
  saveDefaultAddr,
  saveDefaultTerms,
  saveInvoices,
} from '../lib/storage';

type Ctx = {
  ready: boolean;
  f: Invoice;
  saved: Invoice[];
  clients: Client[];
  toast: string;

  updateField: <K extends keyof Invoice>(key: K, value: Invoice[K]) => void;
  updateLine: (index: number, patch: Partial<Line>) => void;
  addLine: () => void;
  removeLine: (index: number) => void;
  useDatesForLine: (index: number) => void;

  newInvoice: () => void;
  saveInvoice: () => void;
  openInvoice: (inv: Invoice) => void;
  duplicateInvoice: (inv: Invoice) => void;
  deleteInvoice: (id: string) => void;

  useClient: (c: Client) => void;
  removeClient: (c: Client) => void;

  saveTermsAsDefault: () => void;
  resetTermsToDefault: () => void;

  flash: (msg: string) => void;
  autoNights: () => number;
};

const InvoiceContext = createContext<Ctx | null>(null);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [f, setF] = useState<Invoice>(() => blankInvoice(pad10(FIRST_INVOICE_NO + 1)));
  const [saved, setSaved] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const [inv, cli, terms, addr] = await Promise.all([
        loadInvoices(),
        loadClients(),
        loadDefaultTerms(),
        loadDefaultAddr(),
      ]);
      setSaved(inv);
      setClients(cli);
      setF(
        blankInvoice(pad10(nextInvoiceNo(inv)), {
          terms: terms || undefined,
          companyAddr: addr || undefined,
        })
      );
      setReady(true);
    })();
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const updateField = useCallback(<K extends keyof Invoice>(key: K, value: Invoice[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateLine = useCallback((index: number, patch: Partial<Line>) => {
    setF((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  }, []);

  const autoNightsFor = (inv: Invoice) => nightsBetween(inv.checkIn, inv.checkOut);
  const autoNights = useCallback(() => autoNightsFor(f), [f]);

  const addLine = useCallback(() => {
    setF((prev) => ({
      ...prev,
      lines: [...prev.lines, { desc: '', unit: 1, nights: autoNightsFor(prev) || 1, price: 0 }],
    }));
  }, []);

  const removeLine = useCallback((index: number) => {
    setF((prev) => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
  }, []);

  const useDatesForLine = useCallback(
    (index: number) => {
      const n = autoNightsFor(f);
      if (!n) {
        flash('Set both dates first');
        return;
      }
      updateLine(index, { nights: n });
    },
    [f, updateLine, flash]
  );

  const newInvoice = useCallback(async () => {
    const terms = await loadDefaultTerms();
    const addr = await loadDefaultAddr();
    setF(
      blankInvoice(pad10(nextInvoiceNo(saved)), {
        terms: terms || undefined,
        companyAddr: addr || undefined,
      })
    );
  }, [saved]);

  const saveInvoice = useCallback(() => {
    setF((prevF) => {
      if (!prevF.clientName.trim()) {
        flash('Add a guest name first');
        return prevF;
      }
      const rec: Invoice = { ...prevF, total: grandTotal(prevF), savedAt: new Date().toISOString() };
      setSaved((prevSaved) => {
        const next = prevSaved.slice();
        const at = next.findIndex((s) => s.id === rec.id);
        if (at >= 0) next[at] = rec;
        else next.unshift(rec);
        saveInvoices(next);
        return next;
      });
      setClients((prevClients) => {
        const key = prevF.clientName.trim().toLowerCase();
        const next = prevClients.slice();
        const ci = next.findIndex((c) => c.name.trim().toLowerCase() === key);
        const client: Client = { name: prevF.clientName, phone: prevF.clientPhone, email: prevF.clientEmail };
        if (ci >= 0) next[ci] = client;
        else next.unshift(client);
        saveClients(next);
        return next;
      });
      saveDefaultAddr(prevF.companyAddr);
      flash('Invoice saved');
      return rec;
    });
  }, [flash]);

  const openInvoice = useCallback((inv: Invoice) => {
    setF({ ...inv });
  }, []);

  const duplicateInvoice = useCallback(
    (inv: Invoice) => {
      setF({ ...inv, id: 'inv_' + Date.now(), invoiceNo: pad10(nextInvoiceNo(saved)), savedAt: null });
    },
    [saved]
  );

  const deleteInvoice = useCallback(
    (id: string) => {
      setSaved((prev) => {
        const next = prev.filter((x) => x.id !== id);
        saveInvoices(next);
        return next;
      });
      flash('Invoice deleted');
    },
    [flash]
  );

  const useClient = useCallback((c: Client) => {
    setF((prev) => ({ ...prev, clientName: c.name, clientPhone: c.phone, clientEmail: c.email }));
  }, []);

  const removeClient = useCallback((c: Client) => {
    setClients((prev) => {
      const next = prev.filter((x) => x !== c);
      saveClients(next);
      return next;
    });
  }, []);

  const saveTermsAsDefault = useCallback(() => {
    setF((prev) => {
      saveDefaultTerms(prev.terms);
      return prev;
    });
    flash('Saved as your default terms');
  }, [flash]);

  const resetTermsToDefault = useCallback(async () => {
    const terms = await loadDefaultTerms();
    setF((prev) => ({ ...prev, terms: terms || DEFAULT_TERMS }));
  }, []);

  const value: Ctx = {
    ready,
    f,
    saved,
    clients,
    toast,
    updateField,
    updateLine,
    addLine,
    removeLine,
    useDatesForLine,
    newInvoice,
    saveInvoice,
    openInvoice,
    duplicateInvoice,
    deleteInvoice,
    useClient,
    removeClient,
    saveTermsAsDefault,
    resetTermsToDefault,
    flash,
    autoNights,
  };

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
}

export function useInvoiceStore(): Ctx {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoiceStore must be used within InvoiceProvider');
  return ctx;
}
