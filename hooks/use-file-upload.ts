"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface UploadedFile {
	public_id: string;
	secure_url: string;
	width: number;
	height: number;
	format: string;
	resource_type: string;
	created_at: string;
	bytes: number;
}

export interface UseFileUploadOptions {
	folder?: string;
	maxFiles?: number;
	acceptedFileTypes?: string[];
	maxFileSize?: number;
	onUploadStart?: () => void;
	onUploadComplete?: (files: UploadedFile[]) => void;
	onUploadError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [uploadProgress, setUploadProgress] = useState(0);

	const {
		folder = "deshi_directive",
		maxFiles = 1,
		acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
		maxFileSize = 5 * 1024 * 1024,
		onUploadStart,
		onUploadComplete,
		onUploadError,
	} = options;

	const validateFile = (file: File): boolean => {
		if (!acceptedFileTypes.includes(file.type)) {
			toast.error(`File type ${file.type} is not supported`);
			return false;
		}

		if (file.size > maxFileSize) {
			toast.error(
				`File size must be less than ${maxFileSize / (1024 * 1024)}MB`
			);
			return false;
		}

		return true;
	};

	const uploadFiles = async (
		files: FileList | File[]
	): Promise<UploadedFile[]> => {
		const fileArray = Array.from(files);

		if (fileArray.length > maxFiles) {
			toast.error(`Maximum ${maxFiles} files allowed`);
			return [];
		}

		for (const file of fileArray) {
			if (!validateFile(file)) {
				return [];
			}
		}

		setIsUploading(true);
		setUploadProgress(0);
		onUploadStart?.();

		try {
			const uploadPromises = fileArray.map(async (file, index) => {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("folder", folder);

				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error(`Failed to upload ${file.name}`);
				}

				const data = await response.json();
				setUploadProgress(((index + 1) / fileArray.length) * 100);

				return data.result;
			});

			const results = await Promise.all(uploadPromises);
			setUploadedFiles((prev) => [...prev, ...results]);
			onUploadComplete?.(results);
			toast.success(`${results.length} file(s) uploaded successfully`);

			return results;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Upload failed";
			toast.error(errorMessage);
			onUploadError?.(errorMessage);
			return [];
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const deleteFile = async (publicId: string): Promise<boolean> => {
		try {
			const response = await fetch(`/api/upload?publicId=${publicId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete file");
			}

			setUploadedFiles((prev) =>
				prev.filter((file) => file.public_id !== publicId)
			);
			toast.success("File deleted successfully");
			return true;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Delete failed";
			toast.error(errorMessage);
			return false;
		}
	};

	const clearFiles = () => {
		setUploadedFiles([]);
	};

	return {
		uploadFiles,
		deleteFile,
		clearFiles,
		isUploading,
		uploadProgress,
		uploadedFiles,
		setUploadedFiles,
	};
};
