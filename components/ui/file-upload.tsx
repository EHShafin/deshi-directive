"use client";

import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
	useFileUpload,
	UseFileUploadOptions,
	UploadedFile,
} from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps extends UseFileUploadOptions {
	value?: UploadedFile[];
	onChange?: (files: UploadedFile[]) => void;
	className?: string;
	disabled?: boolean;
	placeholder?: string;
	showPreview?: boolean;
}

export function FileUpload({
	value = [],
	onChange,
	className,
	disabled = false,
	placeholder = "Drop files here or click to browse",
	showPreview = true,
	...uploadOptions
}: FileUploadProps) {
	const {
		uploadFiles,
		deleteFile,
		isUploading,
		uploadProgress,
		uploadedFiles,
		setUploadedFiles,
	} = useFileUpload({
		...uploadOptions,
		onUploadComplete: (files) => {
			const newFiles = [...value, ...files];
			setUploadedFiles(newFiles);
			onChange?.(newFiles);
			uploadOptions.onUploadComplete?.(files);
		},
	});

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (disabled || isUploading) return;
			uploadFiles(acceptedFiles);
		},
		[disabled, isUploading, uploadFiles]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		disabled: disabled || isUploading,
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".webp"],
		},
		multiple: (uploadOptions.maxFiles || 1) > 1,
	});

	const handleDelete = async (publicId: string) => {
		const success = await deleteFile(publicId);
		if (success) {
			const newFiles = value.filter(
				(file) => file.public_id !== publicId
			);
			onChange?.(newFiles);
		}
	};

	return (
		<div className={cn("space-y-4", className)}>
			<div
				{...getRootProps()}
				className={cn(
					"border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
					isDragActive
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-primary/50",
					disabled && "opacity-50 cursor-not-allowed"
				)}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center gap-2">
					<Upload className="h-8 w-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						{isUploading ? "Uploading..." : placeholder}
					</p>
					{!disabled && (
						<Button type="button" variant="outline" size="sm">
							Choose Files
						</Button>
					)}
				</div>
			</div>

			{isUploading && (
				<div className="space-y-2">
					<Progress
						value={Math.min(uploadProgress, 100)}
						max={100}
						className="w-full"
					/>
					<p className="text-sm text-muted-foreground text-center">
						{Math.min(uploadProgress, 100).toFixed(0)}% uploaded
					</p>
				</div>
			)}

			{showPreview && value.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{value.map((file) => (
						<div
							key={file.public_id}
							className="relative group border rounded-lg overflow-hidden"
						>
							<div className="aspect-square relative">
								<img
									src={file.secure_url}
									alt="Uploaded file"
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<Button
										type="button"
										size="sm"
										variant="destructive"
										onClick={() =>
											handleDelete(file.public_id)
										}
										className="h-8 w-8 p-0"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="p-2">
								<p className="text-xs text-muted-foreground truncate">
									{file.public_id.split("/").pop()}
								</p>
								<p className="text-xs text-muted-foreground">
									{(file.bytes / 1024).toFixed(1)} KB
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
