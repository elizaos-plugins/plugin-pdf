import { type IAgentRuntime, type IPdfService, Service, ServiceType } from "@elizaos/core"
import { getDocument, type PDFDocumentProxy } from "pdfjs-dist"
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { writeFile } from "fs/promises"

export enum PdfOutputType {
	SAVE_TO_DISK = "save_to_disk",
	BUFFER = "buffer",
}

interface PdfOutputOptions {
	type: PdfOutputType
	filename?: string // Required for SAVE_TO_DISK type
}

export class PdfService extends Service implements IPdfService {
	static serviceType: ServiceType = ServiceType.PDF

	constructor() {
		super()
	}

	getInstance(): IPdfService {
		return PdfService.getInstance()
	}

	async initialize(_runtime: IAgentRuntime): Promise<void> {}

	async convertPdfToText(pdfBuffer: Buffer): Promise<string> {
		// Convert Buffer to Uint8Array
		const uint8Array = new Uint8Array(pdfBuffer)

		const pdf: PDFDocumentProxy = await getDocument({ data: uint8Array }).promise
		const numPages = pdf.numPages
		const textPages: string[] = []

		for (let pageNum = 1; pageNum <= numPages; pageNum++) {
			const page = await pdf.getPage(pageNum)
			const textContent = await page.getTextContent()
			const pageText = textContent.items
				.filter(isTextItem)
				.map((item) => item.str)
				.join(" ")
			textPages.push(pageText)
		}

		return textPages.join("\n")
	}

	async convertTextToPdf(text: string, options: PdfOutputOptions = { type: PdfOutputType.BUFFER }): Promise<Buffer | void> {
		try {
			// Create a new PDF document
			const pdfDoc = await PDFDocument.create()
			let currentPage = pdfDoc.addPage()
			const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
			const fontSize = 12
			const lineHeight = fontSize * 1.2
			const margin = 50

			// Get page dimensions
			const { width, height } = currentPage.getSize()
			const maxWidth = width - 2 * margin

			const lines = text.split("\n")
			let y = height - margin

			for (const line of lines) {
				// Check if we need a new page
				if (y < margin) {
					currentPage = pdfDoc.addPage()
					y = height - margin
				}

				// Draw the text line
				currentPage.drawText(line, {
					x: margin,
					y: y,
					size: fontSize,
					font: font,
					color: rgb(0, 0, 0),
					maxWidth: maxWidth,
				})

				// Move to next line position
				y -= lineHeight
			}

			// Save the PDF
			const pdfBytes = await pdfDoc.save()
			const pdfBuffer = Buffer.from(pdfBytes)

			// Handle different output types
			switch (options.type) {
				case PdfOutputType.SAVE_TO_DISK:
					if (!options.filename) {
						throw new Error("Filename is required when output type is SAVE_TO_DISK")
					}
					await writeFile(options.filename, pdfBuffer)
					return

				case PdfOutputType.BUFFER:
				default:
					return pdfBuffer
			}
		} catch (error) {
			throw new Error(`Failed to convert text to PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
		}
	}
}

// Type guard function
function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
	return "str" in item
}
