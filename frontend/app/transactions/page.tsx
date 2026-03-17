"use client";

import { useEffect } from "react";
import { getTransactions } from "@/services/api";

export default function TransactionsPage() {
  useEffect(() => {
    getTransactions().then(console.log);
  }, []);

  return <div>Transactions page (check console)</div>;
}
