"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Bell,
  MoreHorizontal,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Zap,
  Flame,
  CreditCard,
  Smartphone,
  Wallet,
  Check,
  X,
  Info,
  Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "input" | "confirm" | "payment" | "processing";

interface AppState {
  screen: Screen;
  goldSelected: boolean;
  paymentMethod: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEND_AMOUNT = 100;
const RECEIVE_AMOUNT = "152,845.08";
const RECEIVE_CURRENCY = "PHP";
const RECEIVE_CURRENCY_SYMBOL = "₱";
const EXCHANGE_RATE = "15.1899";
const TRANSFER_FEE = 8;
const VAT = 0.4;
const TOTAL = SEND_AMOUNT + TRANSFER_FEE + VAT;
const GOLD_PRICE = 10;
const GOLD_GRAMS = "0.01736";
const GOLD_RATE = "575.93";
const BENEFICIARY_NAME = "Ray Tejada";
const BENEFICIARY_BANK = "Banco de Oro";
const BENEFICIARY_ACCOUNT = "1234 4567 1234";

const PAYMENT_METHODS_WITH_GOLD = [
  {
    id: "botim_pay",
    label: "Botim Pay",
    sublabel: "Balance: AED 1,240.00",
    icon: "wallet",
  },
  {
    id: "debit_card",
    label: "Debit Card",
    sublabel: "•••• •••• •••• 4521",
    icon: "card",
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    sublabel: "Touch ID or Face ID",
    icon: "phone",
  },
];

const PAYMENT_METHODS_ALL = [
  ...PAYMENT_METHODS_WITH_GOLD,
  {
    id: "snpl",
    label: "SNPL",
    sublabel: "Split into 4 payments",
    icon: "snpl",
  },
  {
    id: "credit_card",
    label: "Credit Card",
    sublabel: "•••• •••• •••• 8823",
    icon: "credit",
  },
];

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const PhoneShell = ({
  children,
  bg = "bg-white",
}: {
  children: React.ReactNode;
  bg?: string;
}) => (
  <div
    className="relative mx-auto overflow-hidden shadow-2xl shrink-0"
    style={{
      width: 390,
      height: 844,
      borderRadius: 44,
      background: "#fff",
      border: "10px solid #111",
      boxShadow:
        "0 0 0 1px #333, 0 40px 80px rgba(0,0,0,0.5), inset 0 0 0 2px #444",
    }}
  >
    {/* notch */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-black"
      style={{ width: 120, height: 34, borderRadius: "0 0 20px 20px" }}
    />
    <div className={`w-full h-full overflow-y-auto ${bg}`}>{children}</div>
  </div>
);

const StatusBar = ({ light = false }: { light?: boolean }) => (
  <div
    className={`flex items-center justify-between px-8 pt-12 pb-2 text-xs font-semibold ${light ? "text-white" : "text-black"}`}
  >
    <span>9:41</span>
    <div className="flex items-center gap-1">
      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
        <rect x="0" y="3" width="3" height="9" rx="1" opacity="0.3" />
        <rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.6" />
        <rect x="9" y="0" width="3" height="12" rx="1" />
        <rect x="13.5" y="0" width="3" height="12" rx="1" />
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
        <path d="M8 2.4C10.8 2.4 13.3 3.6 15 5.5L16 4.4C13.9 2.1 11.1.8 8 .8S2.1 2.1 0 4.4l1 1.1C2.7 3.6 5.2 2.4 8 2.4z" />
        <path d="M8 5.6c1.8 0 3.4.8 4.5 2L13.6 6.5C12.1 4.9 10.2 4 8 4s-4.1.9-5.6 2.5l1.1 1.1C4.6 6.4 6.2 5.6 8 5.6z" />
        <circle cx="8" cy="10" r="1.5" />
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
        <rect
          x="0.5"
          y="0.5"
          width="21"
          height="11"
          rx="3.5"
          stroke="currentColor"
          strokeOpacity="0.35"
          fill="none"
        />
        <rect x="2" y="2" width="16" height="8" rx="2" />
        <path d="M23 4v4a2 2 0 000-4z" opacity="0.4" />
      </svg>
    </div>
  </div>
);

const PaymentIcon = ({ type }: { type: string }) => {
  if (type === "wallet")
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <Wallet size={20} className="text-blue-600" />
      </div>
    );
  if (type === "card" || type === "credit")
    return (
      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
        <CreditCard size={20} className="text-purple-600" />
      </div>
    );
  if (type === "phone")
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
        <Smartphone size={18} className="text-white" />
      </div>
    );
  if (type === "snpl")
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
      >
        4×
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
      <Building2 size={20} className="text-gray-500" />
    </div>
  );
};

// ─── Screen 1: Input ──────────────────────────────────────────────────────────

function InputScreen({ onNext }: { onNext: () => void }) {
  const [amount, setAmount] = useState("100");

  return (
    <PhoneShell>
      <StatusBar />
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          International Transfer
        </h1>
        <div className="flex gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
            <Bell size={18} className="text-gray-700" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
            <MoreHorizontal size={18} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Send / Receive card */}
      <div className="mx-4 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden">
        {/* You send */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">You send</span>
            <span className="text-sm text-gray-500">
              Fee: {TRANSFER_FEE}.00 AED{" "}
              <span className="text-blue-500">ⓘ</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇦🇪</span>
              <span className="font-semibold text-gray-800">AED</span>
              <ChevronLeft size={16} className="rotate-180 text-gray-400" />
            </div>
            <input
              className="text-2xl font-bold text-right bg-transparent border-none outline-none text-gray-900 w-36"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Rate bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-b border-gray-200">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-600">
            {EXCHANGE_RATE} {RECEIVE_CURRENCY}
          </span>
          <div className="ml-auto">
            <button className="text-sm text-gray-600 border border-gray-300 rounded-full px-3 py-1 flex items-center gap-1">
              Bank transfer <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* They receive */}
        <div className="p-4">
          <span className="text-sm text-gray-500">They receive</span>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇵🇭</span>
              <span className="font-semibold text-gray-800">
                {RECEIVE_CURRENCY}
              </span>
              <ChevronLeft size={16} className="rotate-180 text-gray-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {RECEIVE_AMOUNT}
            </span>
          </div>
        </div>

        {/* Promo bar */}
        <div className="bg-gray-900 px-4 py-2 flex items-center gap-3 text-white text-xs">
          <Zap size={12} className="text-yellow-400 shrink-0" />
          <span>Instant transfer</span>
          <span className="text-gray-500">·</span>
          <Flame size={12} className="text-orange-400 shrink-0" />
          <span>Free for your first 2 transfers</span>
        </div>
      </div>

      {/* Choose beneficiary */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">
            Choose beneficiary
          </h2>
          <button className="text-sm text-blue-600 font-medium">
            View all
          </button>
        </div>
        <div className="flex gap-3">
          {/* Selected beneficiary */}
          <div className="flex-1 p-3 rounded-2xl border-2 border-blue-500 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">🇵🇭 PHP</span>
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <Building2 size={14} className="text-white" />
              </div>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {BENEFICIARY_NAME}
            </p>
            <p className="text-xs text-gray-500">{BENEFICIARY_BANK}</p>
            <p className="text-xs text-gray-500">{BENEFICIARY_ACCOUNT}</p>
          </div>
          {/* Second beneficiary */}
          <div className="flex-1 p-3 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">🇮🇳 INR</span>
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
            </div>
            <p className="font-semibold text-gray-900 text-sm">Khuammar Raj</p>
            <p className="text-xs text-gray-500">UPI</p>
            <p className="text-xs text-gray-500">khummar.raj@feder...</p>
          </div>
        </div>
      </div>

      {/* Offers */}
      <div className="px-4 mt-5">
        <h2 className="text-base font-bold text-gray-900 mb-3">Offers</h2>
        <div
          className="rounded-2xl p-4 text-white flex items-center justify-between"
          style={{ background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)" }}
        >
          <div>
            <p className="text-xs text-gray-400 mb-1">Cashback</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-semibold">
                Ends on &#123;&#123;...&#125;&#125;
              </span>
            </div>
            <p className="text-2xl font-bold">
              {RECEIVE_CURRENCY_SYMBOL}10.00
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                Send {RECEIVE_CURRENCY_SYMBOL}2500 abroad
              </span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full">
                <div className="w-0 h-1 bg-white rounded-full" />
              </div>
              <span className="text-xs text-gray-400">
                {RECEIVE_CURRENCY_SYMBOL}2500
              </span>
            </div>
          </div>
          <span className="text-4xl ml-4">🎁</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 mt-6 pb-8">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base"
          style={{ background: "#1A4FDB" }}
        >
          Send money
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          Powered by{" "}
          <span className="font-bold text-gray-600">botim</span>{" "}
          <span className="text-xs font-medium bg-gray-200 text-gray-600 px-1 rounded">
            MONEY
          </span>
        </p>
      </div>
    </PhoneShell>
  );
}

// ─── Screen 2: Confirmation ───────────────────────────────────────────────────

function ConfirmScreen({
  goldSelected,
  onToggleGold,
  onBack,
  onNext,
}: {
  goldSelected: boolean;
  onToggleGold: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [tc, setTc] = useState(true);
  const [consent, setConsent] = useState(true);

  const totalWithGold = goldSelected
    ? TOTAL + GOLD_PRICE
    : TOTAL;

  return (
    <PhoneShell bg="bg-gray-50">
      {/* Dark blue header */}
      <div
        className="pb-6"
        style={{
          background: "linear-gradient(160deg,#0d1b6b 0%,#1e3a9f 60%,#2952cc 100%)",
        }}
      >
        <StatusBar light />
        <div className="flex items-center px-5 py-2">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="ml-4">
            <h1 className="text-white font-bold text-lg leading-tight">
              {BENEFICIARY_NAME}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-white/70 text-xs">{BENEFICIARY_BANK}</span>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/50 text-xs">🇵🇭 {RECEIVE_CURRENCY}</span>
            </div>
            <p className="text-white/50 text-xs mt-0.5">{BENEFICIARY_ACCOUNT}</p>
          </div>
          <div className="ml-auto w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
        </div>

        {/* Amount summary in header */}
        <div className="mx-5 mt-4 rounded-2xl bg-white/10 border border-white/15 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs mb-1">Transfer amount</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇦🇪</span>
                <span className="text-white text-sm font-medium">AED</span>
              </div>
            </div>
            <span className="text-white font-bold text-2xl">
              {SEND_AMOUNT}.00
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1 text-white/60 text-xs">
              <X size={12} className="text-white/40" />
              <span>Rate</span>
            </div>
            <span className="text-white/80 text-sm">{EXCHANGE_RATE}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/60 text-xs">Beneficiary will receive</span>
            <span className="text-white font-semibold">
              {RECEIVE_AMOUNT} {RECEIVE_CURRENCY}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3 pb-4">
        {/* Payment details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Payment details
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Transfer amount", value: `AED ${SEND_AMOUNT}.00` },
              { label: "Transfer fee", value: `AED ${TRANSFER_FEE}.00` },
              { label: "VAT (5%)", value: `AED ${VAT.toFixed(2)}` },
              {
                label: "Total amount",
                value: `AED ${TOTAL.toFixed(2)}`,
                bold: true,
              },
            ].map(({ label, value, bold }) => (
              <div key={label} className="flex justify-between">
                <span
                  className={`text-sm ${bold ? "font-semibold text-gray-900" : "text-gray-500"}`}
                >
                  {label}
                </span>
                <span
                  className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-700"}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gold add-on */}
        <div
          className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-colors ${goldSelected ? "border-yellow-400" : "border-transparent"}`}
        >
          <button
            onClick={onToggleGold}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🥇</span>
              <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                Add gold for AED {GOLD_PRICE}{" "}
                <span className="font-normal text-gray-400">@ AED {GOLD_RATE}/gm</span>
              </span>
            </div>
            {/* Custom radio */}
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-3 shrink-0 transition-colors ${goldSelected ? "bg-yellow-400 border-yellow-400" : "border-gray-300"}`}
            >
              {goldSelected && <Check size={13} className="text-white font-bold" strokeWidth={3} />}
            </div>
          </button>

          {goldSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-yellow-100"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gold purchase</span>
                <span className="font-semibold text-gray-900">
                  + AED {GOLD_PRICE}.00
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1.5 font-bold">
                <span className="text-gray-900">New total</span>
                <span className="text-yellow-600">
                  AED {totalWithGold.toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Disclaimer — only before selection */}
          {!goldSelected && (
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
              Your information will be shared with{" "}
              <span className="font-medium text-gray-500">oGold</span> to
              facilitate this purchase.
            </p>
          )}
        </div>

        {/* Transfer details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Transfer details
            </h3>
            <button className="text-sm text-blue-600 font-medium">
              Change
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">
                Purpose of transfer/Source of funds
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                Family support/Salary
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Branch ID</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                1233456
              </p>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2.5 px-1">
          {[
            {
              id: "tc",
              checked: tc,
              toggle: () => setTc((v) => !v),
              label: (
                <>
                  By confirming you agree with our{" "}
                  <span className="text-blue-600">Terms &amp; conditions</span>
                </>
              ),
            },
            {
              id: "consent",
              checked: consent,
              toggle: () => setConsent((v) => !v),
              label: "I consent to share my transfer data with service providers outside the UAE.",
            },
          ].map(({ id, checked, toggle, label }) => (
            <button
              key={id}
              onClick={toggle}
              className="flex items-start gap-3 w-full text-left"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${checked ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
              >
                {checked && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs text-gray-600 leading-relaxed">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky pay button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 pb-8">
        <button
          onClick={onNext}
          disabled={!tc || !consent}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base disabled:opacity-50"
          style={{ background: "#1A4FDB" }}
        >
          Continue · AED {totalWithGold.toFixed(2)}
        </button>
      </div>
    </PhoneShell>
  );
}

// ─── Screen 3: Payment Method ─────────────────────────────────────────────────

function PaymentScreen({
  goldSelected,
  paymentMethod,
  onSelect,
  onBack,
  onPay,
}: {
  goldSelected: boolean;
  paymentMethod: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  const methods = goldSelected
    ? PAYMENT_METHODS_WITH_GOLD
    : PAYMENT_METHODS_ALL;

  const totalWithGold = goldSelected ? TOTAL + GOLD_PRICE : TOTAL;

  return (
    <PhoneShell bg="bg-gray-50">
      <div
        className="pb-5"
        style={{ background: "linear-gradient(160deg,#0d1b6b,#1e3a9f 60%,#2952cc)" }}
      >
        <StatusBar light />
        <div className="flex items-center px-5 py-2">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg ml-4">Pay with</h1>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3">
        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">You&apos;re paying</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xl text-gray-900">
                AED {totalWithGold.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Transfer · {goldSelected ? `Gold ${GOLD_GRAMS}g` : "No add-on"}
              </p>
            </div>
            {goldSelected && (
              <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1.5">
                <span>🥇</span>
                <span className="text-xs font-semibold text-yellow-700">
                  +{GOLD_GRAMS}g Gold
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">
            Choose payment method
          </p>
          {methods.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 ${i < methods.length - 1 ? "border-b border-gray-100" : ""} ${paymentMethod === m.id ? "bg-blue-50" : ""}`}
            >
              <PaymentIcon type={m.icon} />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.sublabel}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === m.id ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
              >
                {paymentMethod === m.id && (
                  <Check size={10} className="text-white" strokeWidth={3} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Gold restriction notice */}
        {goldSelected && (
          <div className="flex items-start gap-2.5 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <Info size={15} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 leading-relaxed">
              Gold purchases require a wallet or card payment. SNPL and Credit
              Card are unavailable when gold is added.
            </p>
          </div>
        )}
      </div>

      {/* Sticky pay */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 pb-8">
        <button
          onClick={onPay}
          disabled={!paymentMethod}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base disabled:opacity-50"
          style={{ background: "#1A4FDB" }}
        >
          {paymentMethod === "apple_pay"
            ? "Pay with Apple Pay"
            : `Pay AED ${totalWithGold.toFixed(2)}`}
        </button>
      </div>
    </PhoneShell>
  );
}

// ─── Screen 4: Processing ─────────────────────────────────────────────────────

function ProcessingScreen({
  goldSelected,
  paymentMethod,
  onRestart,
}: {
  goldSelected: boolean;
  paymentMethod: string | null;
  onRestart: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"status" | "details">("status");
  const totalWithGold = goldSelected ? TOTAL + GOLD_PRICE : TOTAL;

  const methodLabel =
    PAYMENT_METHODS_ALL.find((m) => m.id === paymentMethod)?.label ??
    "Botim Pay";

  return (
    <PhoneShell>
      <StatusBar />
      <div className="flex items-center px-5 py-2">
        <button onClick={onRestart} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Big icon */}
      <div className="flex flex-col items-center pt-2 pb-4 px-6">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center">
            <Building2 size={48} className="text-blue-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
            <Clock size={16} className="text-yellow-800" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center">
          We are processing your transfer
        </h2>
        <p className="text-sm text-gray-500 mt-1 text-center">
          {BENEFICIARY_NAME} will receive {RECEIVE_AMOUNT}{" "}
          {RECEIVE_CURRENCY}
        </p>
      </div>

      {/* Gold banner (if gold selected) */}
      {goldSelected && (
        <div className="mx-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)" }}
          >
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Gold purchased</p>
                <p className="text-white font-bold text-base">
                  {GOLD_GRAMS}g · AED {GOLD_PRICE}.00
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-yellow-400 text-xs font-medium">
                      Processing
                    </span>
                  </div>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/50 text-xs">
                    Rate AED {GOLD_RATE}/gm
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">🥇</span>
                <ChevronRight size={14} className="text-white/40" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mx-4 border-b border-gray-200 mb-4">
        {(["status", "details"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "status" && (
        <div className="px-4 space-y-0">
          {/* Created */}
          <StatusStep
            label="Created"
            time="Today · Just now"
            done
            active={false}
          >
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              We have received AED {totalWithGold.toFixed(2)}
              {goldSelected && (
                <div className="mt-1 text-xs text-yellow-600">
                  + {GOLD_GRAMS}g gold purchase (AED {GOLD_PRICE}.00)
                </div>
              )}
            </div>
          </StatusStep>

          {/* Processing */}
          <StatusStep
            label="Processing"
            time="Today · Just now"
            done={false}
            active
          >
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                Money sent to our partner bank.
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                Our partner bank is transferring {RECEIVE_AMOUNT}{" "}
                {RECEIVE_CURRENCY} to your beneficiary.
              </div>
            </div>
          </StatusStep>

          {/* Completed */}
          <StatusStep label="Completed" time="" done={false} active={false} last>
            <></>
          </StatusStep>
        </div>
      )}

      {activeTab === "details" && (
        <div className="px-4 space-y-3">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {[
              { label: "Beneficiary", value: BENEFICIARY_NAME },
              { label: "Bank", value: BENEFICIARY_BANK },
              { label: "Account", value: BENEFICIARY_ACCOUNT },
              { label: "Amount sent", value: `AED ${SEND_AMOUNT}.00` },
              { label: "Amount received", value: `${RECEIVE_AMOUNT} ${RECEIVE_CURRENCY}` },
              { label: "Exchange rate", value: `1 AED = ${EXCHANGE_RATE} ${RECEIVE_CURRENCY}` },
              { label: "Transfer fee", value: `AED ${TRANSFER_FEE}.00` },
              { label: "Payment via", value: methodLabel },
              ...(goldSelected
                ? [
                    {
                      label: "Gold purchased",
                      value: `${GOLD_GRAMS}g · AED ${GOLD_PRICE}.00`,
                    },
                  ]
                : []),
              {
                label: "Total charged",
                value: `AED ${totalWithGold.toFixed(2)}`,
                bold: true,
              },
            ].map(({ label, value, bold }) => (
              <div key={label} className="flex justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span
                  className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-700"}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-4 mt-6 pb-10 space-y-1">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <FileText size={18} className="text-gray-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              Download invoice
            </span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <HelpCircle size={18} className="text-gray-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              Help center
            </span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>
    </PhoneShell>
  );
}

// ─── Status step sub-component ────────────────────────────────────────────────

function StatusStep({
  label,
  time,
  done,
  active,
  children,
  last = false,
}: {
  label: string;
  time: string;
  done: boolean;
  active: boolean;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 z-10 ${done ? "bg-blue-600 border-blue-600" : active ? "bg-white border-blue-600" : "bg-white border-gray-300"}`}
        >
          {done && <Check size={8} className="text-white" strokeWidth={3} />}
          {active && (
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          )}
        </div>
        {!last && (
          <div
            className={`w-0.5 flex-1 min-h-6 mt-1 ${done || active ? "bg-blue-400" : "bg-gray-200"}`}
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${last ? "pb-2" : "pb-4"}`}>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-semibold ${done || active ? "text-gray-900" : "text-gray-400"}`}
          >
            {label}
          </span>
          {time && <span className="text-xs text-gray-400">{time}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const SCREENS: Screen[] = ["input", "confirm", "payment", "processing"];
const SCREEN_LABELS = ["Input", "Confirm", "Pay", "Processing"];

export default function RemittancePrototype() {
  const [state, setState] = useState<AppState>({
    screen: "input",
    goldSelected: false,
    paymentMethod: null,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToScreen = (screen: Screen) => {
    const idx = SCREENS.indexOf(screen);
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  // Track active screen from scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.min(
        Math.round(el.scrollLeft / el.clientWidth),
        SCREENS.length - 1
      );
      setState((s) => ({ ...s, screen: SCREENS[idx] }));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (screen: Screen) => scrollToScreen(screen);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg,#e8edf5 0%,#d4ddef 100%)" }}
    >
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-5 shrink-0">
        {SCREENS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => go(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                state.screen === s
                  ? "bg-blue-700 text-white shadow-md"
                  : "bg-white/60 text-gray-500 hover:bg-white"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                  state.screen === s
                    ? "bg-white text-blue-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </span>
              {SCREEN_LABELS[i]}
            </button>
            {i < SCREENS.length - 1 && (
              <ChevronRight size={12} className="text-gray-400" />
            )}
          </div>
        ))}
      </div>

      {/* Horizontal scroll strip — one phone per "page" */}
      <div
        ref={scrollRef}
        className="flex flex-1 overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Screen 1 */}
        <div
          className="shrink-0 flex items-start justify-center py-6 px-4"
          style={{ scrollSnapAlign: "start", width: "100vw" }}
        >
          <InputScreen onNext={() => go("confirm")} />
        </div>

        {/* Screen 2 */}
        <div
          className="shrink-0 flex items-start justify-center py-6 px-4"
          style={{ scrollSnapAlign: "start", width: "100vw" }}
        >
          <ConfirmScreen
            goldSelected={state.goldSelected}
            onToggleGold={() =>
              setState((s) => ({
                ...s,
                goldSelected: !s.goldSelected,
                paymentMethod: null,
              }))
            }
            onBack={() => go("input")}
            onNext={() => go("payment")}
          />
        </div>

        {/* Screen 3 */}
        <div
          className="shrink-0 flex items-start justify-center py-6 px-4"
          style={{ scrollSnapAlign: "start", width: "100vw" }}
        >
          <div className="flex flex-col items-center gap-3">
            <PaymentScreen
              goldSelected={state.goldSelected}
              paymentMethod={state.paymentMethod}
              onSelect={(id) => setState((s) => ({ ...s, paymentMethod: id }))}
              onBack={() => go("confirm")}
              onPay={() => go("processing")}
            />
            <p className="text-xs text-gray-500 text-center">
              {state.goldSelected
                ? "Gold selected — SNPL & Credit Card hidden"
                : "No gold — all 5 payment methods visible"}
            </p>
          </div>
        </div>

        {/* Screen 4 */}
        <div
          className="shrink-0 flex items-start justify-center py-6 px-4"
          style={{ scrollSnapAlign: "start", width: "100vw" }}
        >
          <ProcessingScreen
            goldSelected={state.goldSelected}
            paymentMethod={state.paymentMethod}
            onRestart={() => {
              setState({ screen: "input", goldSelected: false, paymentMethod: null });
              scrollToScreen("input");
            }}
          />
        </div>
      </div>
    </div>
  );
}
