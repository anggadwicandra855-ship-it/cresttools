"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  Code2,
  ArrowLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  FileCode,
  Trash2,
} from "lucide-react";

const DEFAULT_SCRIPT = `-- Contoh Script Luau Kotor
local player = game.Players.LocalPlayer
local character=player.Character or player.CharacterAdded:Wait()

function checkHealth(humanoid)
if humanoid.Health < 20 then
print("Darah tipis bree!")
end
end

checkHealth(character:WaitForChild("Humanoid"))`;

export default function LuaFormatterPage() {
  const [inputScript, setInputScript] = useState<string>(DEFAULT_SCRIPT);
  const [outputScript, setOutputScript] = useState<string>("");
  const [removeComments, setRemoveComments] = useState<boolean>(false);
  const [removeBlankLines, setRemoveBlankLines] = useState<boolean>(true);
  const [autoIndent, setAutoIndent] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [syntaxStatus, setSyntaxStatus] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const analyzeSyntax = (code: string) => {
    if (!code.trim()) {
      setSyntaxStatus(null);
      return;
    }
    // Hapus string & komentar biar gak kehitung false
    const cleanForCheck = code.replace(/--.*|\".*?\"|'.*?'|\[\[.*?\]\]/gs, "");

    const blockOpeners = (cleanForCheck.match(/\b(function|then|do|repeat)\b/g) || []).length;
    const blockClosers = (cleanForCheck.match(/\b(end|until)\b/g) || []).length;
    const openParen = (cleanForCheck.match(/\(/g) || []).length;
    const closeParen = (cleanForCheck.match(/\)/g) || []).length;
    const openBrace = (cleanForCheck.match(/\{/g) || []).length;
    const closeBrace = (cleanForCheck.match(/\}/g) || []).length;

    const errors: string[] = [];
    if (blockOpeners > blockClosers) errors.push(`Kurang ${blockOpeners - blockClosers} 'end'`);
    if (blockClosers > blockOpeners) errors.push(`Kelebihan ${blockClosers - blockOpeners} 'end'`);
    if (openParen!== closeParen) errors.push(`Kurung '(' dan ')' tidak seimbang`);
    if (openBrace!== closeBrace) errors.push(`Kurung '{' dan '}' tidak seimbang`);

    if (errors.length > 0) {
      setSyntaxStatus({ valid: false, message: `Peringatan: ${errors.join(" | ")}` });
    } else {
      setSyntaxStatus({ valid: true, message: "Struktur Luau Aman & Seimbang!" });
    }
  };

  const processScript = () => {
    analyzeSyntax(inputScript);
    let lines = inputScript.split("\n");
    let indentLevel = 0;
    const processedLines: string[] = [];

    for (let line of lines) {
      let originalTrimmed = line.trim();
      let trimmed = originalTrimmed;

      if (removeComments) {
        // Hapus komen full line & inline
        if (trimmed.startsWith("--")) continue;
        trimmed = trimmed.split("--")[0].trimEnd();
      }

      if (removeBlankLines && trimmed === "") continue;

      if (autoIndent) {
        if (/^(end|until|\}|else|elseif)\b/.test(trimmed)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indentSpaces = " ".repeat(indentLevel);
        processedLines.push(indentSpaces + trimmed);

        // Deteksi pembuka blok yang lebih akurat
        const isBlockOpener =
          /^(local\s+)?function\b/.test(trimmed) ||
          /\bthen\s*$/.test(trimmed) ||
          /\bdo\s*$/.test(trimmed) ||
          trimmed.endsWith("{") ||
          /\brepeat\s*$/.test(trimmed);

        if (isBlockOpener &&!trimmed.includes("end")) {
          indentLevel++;
        }
      } else {
        processedLines.push(trimmed);
      }
    }
    setOutputScript(processedLines.join("\n"));
  };

  // Live format biar gak perlu klik terus
  useEffect(() => {
    processScript();
  }, [inputScript, removeComments, removeBlankLines, autoIndent]);

  const handleCopy = () => {
    if (!outputScript) return;
    navigator.clipboard.writeText(outputScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawLines = inputScript? inputScript.split("\n").length : 0;
  const cleanLines = outputScript? outputScript.split("\n").length : 0;
  const savedChars = Math.max(0, inputScript.length - outputScript.length);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Katalog Tools
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg">
              <Code2 className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">Lua Cleaner & Formatter</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 rounded-md">LUAU READY v2</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Bersihkan spasi acak-acakan, atur indentasi otomatis, dan cek potensi error kode Luau kamu.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setInputScript(DEFAULT_SCRIPT)} className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button onClick={processScript} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#f97316] hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95">
              <Wand2 className="w-4 h-4" /> Format
            </button>
          </div>
        </div>

        <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" checked={autoIndent} onChange={(e) => setAutoIndent(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-[#0ea5e9]" />Auto Indentasi</label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" checked={removeBlankLines} onChange={(e) => setRemoveBlankLines(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-[#0ea5e9]" />Hapus Baris Kosong</label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" checked={removeComments} onChange={(e) => setRemoveComments(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-[#f97316]" />Hapus Komentar (--)</label>
          </div>
          <button onClick={() => { setInputScript(""); setOutputScript(""); setSyntaxStatus(null); }} className="text-xs font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Kosongkan Panel
          </button>
        </div>

        {syntaxStatus && (
          <div className={`p-4 rounded-xl mb-6 border flex items-center gap-3 text-xs font-mono ${syntaxStatus.valid? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300" : "bg-amber-950/40 border-amber-800/80 text-amber-300"}`}>
            {syntaxStatus.valid? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            <span>{syntaxStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2"><FileCode className="w-4 h-4 text-[#0ea5e9]" />Input</span>
              <span className="text-[10px] font-mono text-slate-500">{rawLines} Baris</span>
            </div>
            <textarea value={inputScript} onChange={(e) => setInputScript(e.target.value)} className="w-full h-80 bg-[#080b11] border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-[#0ea5e9] resize-none leading-relaxed" />
          </div>
          <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-[#0ea5e9] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#f97316]" />Output</span>
              <button onClick={handleCopy} disabled={!outputScript} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-[11px] font-mono disabled:opacity-50">
                {copied? <><Check className="w-3.5 h-3.5 text-green-400" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
              </button>
            </div>
            <textarea readOnly value={outputScript} className="w-full h-80 bg-[#080b11] border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400 resize-none leading-relaxed" />
          </div>
        </div>

        {outputScript && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-400 text-center">
            <div>Baris Sebelum: <strong className="text-white">{rawLines}</strong></div>
            <div>Baris Sesudah: <strong className="text-[#0ea5e9]">{cleanLines}</strong></div>
            <div>Ukuran Hemat: <strong className="text-[#f97316]">{savedChars} Karakter</strong></div>
          </div>
        )}
      </main>
    </div>
  );
}