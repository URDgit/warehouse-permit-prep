import { describe, it, expect } from "vitest";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { buildSubmittalCoverPdf, mergePdfs } from "@/app/pdf/pdfBuilders";
import { makeInput } from "./helpers";

describe("submittal package merge", () => {
  it("merges the cover with uploaded PDFs (page counts add up)", async () => {
    const { PDFDocument } = await import("pdf-lib");
    const pkg = buildReviewPackage(makeInput());
    const cover = await buildSubmittalCoverPdf(pkg);
    const coverBytes = cover.output("arraybuffer") as ArrayBuffer;
    const coverPages = (await PDFDocument.load(coverBytes)).getPageCount();

    const dummy = await PDFDocument.create();
    dummy.addPage();
    dummy.addPage();
    const dummyBytes = (await dummy.save()).buffer as ArrayBuffer;

    const merged = await mergePdfs([
      { bytes: coverBytes, label: "cover" },
      { bytes: dummyBytes, label: "calcs.pdf" },
    ]);
    const mergedDoc = await PDFDocument.load(merged);
    expect(mergedDoc.getPageCount()).toBe(coverPages + 2);
  });

  it("throws a friendly, file-named error for an unreadable file", async () => {
    const bad = new TextEncoder().encode("definitely not a pdf").buffer;
    await expect(mergePdfs([{ bytes: bad, label: "bad.pdf" }])).rejects.toThrow(/Could not read "bad\.pdf"/);
  });
});
