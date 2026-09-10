"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";

export const FAQS = [
  {
    question: "What is VoiceForm and how does it work?",
    answer:
      "VoiceForm lets people fill forms by listening to questions and answering by speaking. Responses are converted to text and reviewed before submission.",
  },
  {
    question: "Are audio recordings saved?",
    answer:
      "No. VoiceForm does not store audio recordings. Spoken answers are transcribed into text and only the text is saved.",
  },
  {
    question: "How can I get started with VoiceForm?",
    answer:
      "Create a form using the standard builder and share the link. Respondents can start answering immediately using voice or text.",
  },
  {
    question: "How long does it take to create a form?",
    answer:
      "Creating a form takes the same time as traditional tools. Respondents often complete forms faster by speaking.",
  },
  {
    question: "Do respondents need special setup to use voice?",
    answer: "No setup is required. A browser and a microphone are enough to use VoiceForm.",
  },
  {
    question: "Who is VoiceForm for?",
    answer:
      "VoiceForm is built for anyone collecting data — surveys, registrations, feedback, or intake forms — especially where accessibility, mobile use, or speed matter.",
  },
];

export function FaqList({ items }: { items: typeof FAQS }) {
  return (
    <Accordion.Root type="single" collapsible className="w-full">
      {items.map((faq) => (
        <Accordion.Item key={faq.question} value={faq.question} className="border-b border-line/70">
          <Accordion.Header>
            <Accordion.Trigger className="focus-ring group flex w-full items-center justify-between gap-4 rounded px-1 py-4 text-left sm:px-4">
              <span className="text-body-m leading-6 text-content-primary sm:text-body-l">
                {faq.question}
              </span>
              <ChevronDown className="size-5 shrink-0 text-content-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="px-1 pb-5 text-body-m leading-6 text-content-primary/80 sm:px-4">
              {faq.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function FaqSection() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-16 xl:px-48">
      <div className="mx-auto flex w-full max-w-[1056px] flex-col items-center gap-10 lg:gap-12">
        <SectionHeading>Frequently Asked Questions</SectionHeading>

        <Accordion.Root type="single" collapsible className="w-full">
          {FAQS.map((faq) => (
            <Accordion.Item
              key={faq.question}
              value={faq.question}
              className="border-b border-line/70"
            >
              <Accordion.Header>
                <Accordion.Trigger className="focus-ring group flex w-full items-center justify-between gap-4 rounded px-1 py-4 text-left sm:px-4">
                  <span className="text-body-m leading-6 text-content-primary sm:text-body-l">
                    {faq.question}
                  </span>
                  <ChevronDown className="size-5 shrink-0 text-content-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="px-1 pb-5 text-body-m leading-6 text-content-primary/80 sm:px-4">
                  {faq.answer}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
