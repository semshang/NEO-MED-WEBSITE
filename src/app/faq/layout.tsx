import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about requesting medical equipment from Neomeditech.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
