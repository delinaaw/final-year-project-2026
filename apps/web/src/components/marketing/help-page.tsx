"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FAQS, FaqList } from "@/components/marketing/faq-section";
import { SectionHeading } from "@/components/marketing/section-heading";

export function HelpPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return FAQS;
    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <>
      <section className="px-5 pt-10 sm:px-8 lg:px-16">
        <div className="mx-auto flex w-full max-w-[1056px] flex-col gap-6">
          <h1 className="text-[30px] font-bold leading-[38px] text-content-primary sm:text-[38px] sm:leading-[46px]">
            Search
          </h1>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-content-placeholder" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your question"
              aria-label="Search help articles"
              className="focus-ring h-14 w-full rounded-xl bg-surface-page pl-12 pr-4 text-body-m text-content-primary placeholder:text-content-placeholder"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
        <div className="mx-auto flex w-full max-w-[1056px] flex-col items-center gap-10 lg:gap-12">
          <SectionHeading>Frequently Asked Questions</SectionHeading>

          {results.length > 0 ? (
            <FaqList items={results} />
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-body-l font-semibold text-content-primary">
                Nothing matches “{query}”
              </p>
              <p className="text-body-m text-content-secondary">
                Try a different word, or email voiceforms@gmail.com.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
