"use client";
import { ChevronDown, CreditCard, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UserAccount } from "@/lib/auth";
import { AccountBadge } from "./AccountBadge";

export function UserMenu({ account, onAccount, onPlan, onSignOut }: { account: UserAccount; onAccount: () => void; onPlan: () => void; onSignOut: () => void; }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const initials = account.fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="user-menu" ref={ref}>
    <button className="user-menu-trigger" onClick={() => setOpen(!open)}><span className="account-avatar">{initials}</span><span className="user-menu-identity"><strong>{account.fullName.split(" ")[0]}</strong><AccountBadge account={account} /></span><ChevronDown size={15} /></button>
    {open && <div className="user-menu-popover"><div><strong>{account.fullName}</strong><small>{account.email}</small></div><button onClick={onAccount}><UserRound size={16} /> Account</button><button onClick={onPlan}><CreditCard size={16} /> Plan</button><button onClick={onSignOut}><LogOut size={16} /> Sign Out</button></div>}
  </div>;
}
