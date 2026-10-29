import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("analyzeResume", () => {
  it("posts the resume and returns a validated result", async () => {
    vi.stubEnv("VITE_RESUME_API_URL", "https://resume.example");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        ats_score: 87,
        title: "Product Designer",
        summary: "Strong experience.",
        skills: ["Figma"],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { analyzeResume } = await import("./api");
    const file = new File(["resume contents"], "resume.pdf", { type: "application/pdf" });
    const result = await analyzeResume(file);

    expect(result).toMatchObject({
      atsScore: 87,
      title: "Product Designer",
      summary: "Strong experience.",
      skills: ["Figma"],
    });
    expect(Number.isNaN(Date.parse(result.analyzedAt))).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL("https://resume.example/analyze"));
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    const requestBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(requestBody).toBeInstanceOf(FormData);
    expect((requestBody as FormData).get("resume")).toBe(file);
  });

  it("rejects when the analyzer is not configured", async () => {
    vi.stubEnv("VITE_RESUME_API_URL", "");
    const { analyzeResume } = await import("./api");

    await expect(analyzeResume(new File(["resume"], "resume.pdf")))
      .rejects.toThrow("Resume analysis is not configured.");
  });

  it("rejects a response with an invalid ATS score", async () => {
    vi.stubEnv("VITE_RESUME_API_URL", "https://resume.example");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ats_score: 101 }), { status: 200 }),
    ));
    const { analyzeResume } = await import("./api");

    await expect(analyzeResume(new File(["resume"], "resume.pdf")))
      .rejects.toThrow("The resume analysis service returned an invalid ATS score.");
  });

  it("reports unsuccessful analyzer responses", async () => {
    vi.stubEnv("VITE_RESUME_API_URL", "https://resume.example");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(
      new Response("Unavailable", { status: 503 }),
    ));
    const { analyzeResume } = await import("./api");

    await expect(analyzeResume(new File(["resume"], "resume.pdf")))
      .rejects.toThrow("Resume analysis failed (503). Please try again.");
  });
});