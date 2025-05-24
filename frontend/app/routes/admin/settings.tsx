import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"

export default function Settings() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-8 bg-gray-50">
      <Accordion type="single" collapsible className="w-full max-w-4xl text-lg">
        <AccordionItem value="item-1" className="border rounded-lg mb-4">
          <AccordionTrigger className="px-6 py-4 font-semibold text-xl">
            How does the app process the video?
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 text-base">
            The app takes a 1-hour video and splits it into 5-minute audio segments. Each segment is then processed to generate a set of multiple-choice questions (MCQs) based on the content.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg mb-4">
          <AccordionTrigger className="px-6 py-4 font-semibold text-xl">
            How are the MCQs generated?
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 text-base">
            The MCQs are automatically generated using machine learning models that analyze the audio content of each 5-minute segment, identifying key concepts and turning them into relevant questions.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border rounded-lg mb-4">
          <AccordionTrigger className="px-6 py-4 font-semibold text-xl">
            Can the MCQs be edited?
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 text-base">
            Yes, all generated MCQs can be reviewed and edited by an admin to ensure clarity, correctness, and alignment with the video content.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border rounded-lg mb-4">
          <AccordionTrigger className="px-6 py-4 font-semibold text-xl">
            How are the MCQs organized?
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 text-base">
            The MCQs are grouped based on the time segment they belong to. For example, all questions related to the first 5 minutes of the video appear under a section labeled “0–5 min”, and so on.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 font-semibold text-xl">
            Who can access the generated questions?
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 text-base">
            Only admins have access to view and edit the generated MCQs. Future versions of the app may support roles with varying access levels.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}