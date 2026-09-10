import { SectionHeading } from "@/components/marketing/section-heading";

const TESTIMONIALS = [
  {
    quote:
      "VoiceForm is hands down one of the most intuitive form tools I've tried. The voice interaction feels natural, and our respondents complete forms without struggling to type.",
    author: "Adjei Caleb",
  },
  {
    quote:
      "VoiceForm completely changed how we think about online forms. Instead of forcing people to type on small screens, it allows them to listen to each question and respond by speaking. We've seen higher completion rates, especially from mobile users and participants who usually struggle with long forms. The fact that responses are converted to text and reviewed before submission makes the process feel both modern and reliable.",
    author: "Kwesi Antwi, Product Lead",
  },
  {
    quote:
      "Hearing the questions and answering by voice feels natural and saves time, especially on mobile.",
    author: "Ama Boateng",
  },
  {
    quote:
      "I'm always impressed by how smoothly VoiceForm works on mobile. Hearing the questions and answering by voice makes the whole process feel effortless.",
    author: "Kofi Boateng",
  },
  {
    quote:
      "Once you try filling a form by listening and speaking, it's hard to go back to typing everything.",
    author: "Nana Agyeman",
  },
  {
    quote:
      "What I appreciate most about VoiceForm is how accessible and natural it feels. Our respondents don't need instructions or training—they simply listen, speak, and review their answers. It removes many of the barriers that traditional forms create, without changing how we build forms on our end. It feels like a practical and thoughtful evolution of data collection.",
    author: "Abena Mensimah, Research Coordinator",
  },
  {
    quote:
      "VoiceForm helps us collect responses from people who usually avoid long forms. The listen-and-speak experience removes a major barrier.",
    author: "Ama Serwaa, Research Coordinator",
  },
  {
    quote:
      "VoiceForm feels like a natural evolution of online forms. It's familiar for creators, but far more comfortable for respondents.",
    author: "Efua Nyarko",
  },
  {
    quote:
      "VoiceForm makes forms easier to complete by letting people listen and speak instead of typing.",
    author: "Kofi Mensah",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-surface-page px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1312px] flex-col items-center gap-10 lg:gap-14">
        <SectionHeading>Loved by those who build and fill forms</SectionHeading>

        <div className="w-full columns-1 gap-6 sm:columns-2 lg:columns-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.author}
              className="mb-6 flex break-inside-avoid flex-col gap-6 rounded-2xl bg-white p-5 shadow-card"
            >
              <blockquote className="text-body-m leading-6 text-content-primary">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="text-body-m text-content-primary/80">
                &mdash; {item.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
