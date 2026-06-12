"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="invalid-preview"><AlertTriangle size={38} /><h1>Your author workspace hit a snag.</h1><p>Your browser-saved books are still safe. Retry the workspace to continue.</p><button className="primary-button" type="button" onClick={reset}><RotateCcw size={16} /> Retry workspace</button></main>;
}
