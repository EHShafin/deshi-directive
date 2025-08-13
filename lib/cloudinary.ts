import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
	public_id: string;
	secure_url: string;
	width: number;
	height: number;
	format: string;
	resource_type: string;
	created_at: string;
	bytes: number;
}

export interface CloudinaryDeleteResult {
	result: string;
}

export class CloudinaryService {
	static async uploadImage(
		file: string,
		options?: {
			folder?: string;
			public_id?: string;
			transformation?: any;
		}
	): Promise<CloudinaryUploadResult> {
		try {
			const result = await cloudinary.uploader.upload(file, {
				resource_type: "image",
				folder: options?.folder || "deshi_directive",
				public_id: options?.public_id,
				transformation: options?.transformation,
			});

			return {
				public_id: result.public_id,
				secure_url: result.secure_url,
				width: result.width,
				height: result.height,
				format: result.format,
				resource_type: result.resource_type,
				created_at: result.created_at,
				bytes: result.bytes,
			};
		} catch (error) {
			console.error("Cloudinary upload error:", error);
			throw new Error("Failed to upload image to Cloudinary");
		}
	}

	static async deleteImage(
		publicId: string
	): Promise<CloudinaryDeleteResult> {
		try {
			const result = await cloudinary.uploader.destroy(publicId);
			return { result: result.result };
		} catch (error) {
			console.error("Cloudinary delete error:", error);
			throw new Error("Failed to delete image from Cloudinary");
		}
	}

	static async getImage(publicId: string) {
		try {
			const result = await cloudinary.api.resource(publicId);
			return {
				public_id: result.public_id,
				secure_url: result.secure_url,
				width: result.width,
				height: result.height,
				format: result.format,
				resource_type: result.resource_type,
				created_at: result.created_at,
				bytes: result.bytes,
			};
		} catch (error) {
			console.error("Cloudinary get image error:", error);
			throw new Error("Failed to get image from Cloudinary");
		}
	}

	static async getAllImages(options?: {
		folder?: string;
		max_results?: number;
		next_cursor?: string;
	}) {
		try {
			const result = await cloudinary.api.resources({
				type: "upload",
				prefix: options?.folder || "deshi_directive",
				max_results: options?.max_results || 20,
				next_cursor: options?.next_cursor,
			});

			return {
				resources: result.resources.map((resource: any) => ({
					public_id: resource.public_id,
					secure_url: resource.secure_url,
					width: resource.width,
					height: resource.height,
					format: resource.format,
					resource_type: resource.resource_type,
					created_at: resource.created_at,
					bytes: resource.bytes,
				})),
				next_cursor: result.next_cursor,
				total_count: result.total_count,
			};
		} catch (error) {
			console.error("Cloudinary get all images error:", error);
			throw new Error("Failed to get images from Cloudinary");
		}
	}

	static generateTransformationUrl(
		publicId: string,
		transformations: any[]
	): string {
		return cloudinary.url(publicId, {
			transformation: transformations,
		});
	}
}

export default CloudinaryService;
