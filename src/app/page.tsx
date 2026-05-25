import UploadForm from "../app/components/UploadForm";

const endpoints = [
  {
    method: "POST",
    path: "/api/upload",
    title: "Generate exam questions",
    description:
      "Upload a .txt, .pdf, or .docx file and receive AI-generated multiple-choice questions from the document content.",
    accepts: [
      "file: required .txt, .pdf, or .docx file",
      "questionCount: optional number, defaults to 5",
      "description or context: optional lesson or topic context",
    ],
    returns: '{ "result": "Generated questions..." }',
  },
  {
    method: "POST",
    path: "/api/explain",
    title: "Explain an answer",
    description:
      "Send a student's answer and get a concise tutor-style explanation of why it is correct or incorrect.",
    accepts: [
      "question: required question text",
      "selectedAnswer or answer: required student answer",
      "correctAnswer: optional expected answer",
      "context: optional topic or lesson context",
    ],
    returns: '{ "explanation": "Tutor explanation..." }',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            EduHack API
          </p>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-bold">Available endpoints</h1>
            <p className="text-lg text-slate-700">
              This service turns study material into quiz questions and explains
              student answers with short AI tutor feedback.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {endpoints.map((endpoint) => (
            <article
              key={endpoint.path}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded bg-blue-700 px-2.5 py-1 text-sm font-bold text-white">
                  {endpoint.method}
                </span>
                <code className="rounded bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">
                  {endpoint.path}
                </code>
              </div>

              <h2 className="text-xl font-semibold">{endpoint.title}</h2>
              <p className="mt-2 text-slate-700">{endpoint.description}</p>

              <div className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Accepts
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {endpoint.accepts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Returns
                </h3>
                <pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-3 text-sm text-slate-100">
                  {endpoint.returns}
                </pre>
              </div>
            </article>
          ))}
        </section>

        <section>
          <div className="mb-4 max-w-3xl">
            <h2 className="text-2xl font-bold">Try the upload endpoint</h2>
          </div>
          <UploadForm />
        </section>
      </div>
    </main>
  );
}
