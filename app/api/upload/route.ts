import { NextRequest, NextResponse } from "next/server";
import CloudinaryService from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const folder = formData.get("folder") as string;
		const publicId = formData.get("publicId") as string;

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 }
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

		const result = await CloudinaryService.uploadImage(base64, {
			folder: folder || "deshi_directive",
			public_id: publicId,
		});

		return NextResponse.json({ result }, { status: 200 });
	} catch (error) {
		console.error("File upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const publicId = searchParams.get("publicId");
		const folder = searchParams.get("folder");
		const maxResults = searchParams.get("maxResults");
		const nextCursor = searchParams.get("nextCursor");

		if (publicId) {
			const result = await CloudinaryService.getImage(publicId);
			return NextResponse.json({ result }, { status: 200 });
		}

		const result = await CloudinaryService.getAllImages({
			folder: folder || "deshi_directive",
			max_results: maxResults ? parseInt(maxResults) : 20,
			next_cursor: nextCursor || undefined,
		});

		return NextResponse.json({ result }, { status: 200 });
	} catch (error) {
		console.error("File retrieval error:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve files" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const publicId = searchParams.get("publicId");

		if (!publicId) {
			return NextResponse.json(
				{ error: "Public ID is required" },
				{ status: 400 }
			);
		}

		const result = await CloudinaryService.deleteImage(publicId);
		return NextResponse.json({ result }, { status: 200 });
	} catch (error) {
		console.error("File deletion error:", error);
		return NextResponse.json(
			{ error: "Failed to delete file" },
			{ status: 500 }
		);
	}
}
