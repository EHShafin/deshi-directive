"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useFileUpload, UploadedFile } from "@/hooks/use-file-upload";
import { toast } from "sonner";

interface ProfilePictureUploadProps {
	profilePicture?: string;
	name: string;
	onImageUploaded: (url: string) => void;
	disabled?: boolean;
}

export function ProfilePictureUpload({
	profilePicture,
	name,
	onImageUploaded,
	disabled = false,
}: ProfilePictureUploadProps) {
	const [error, setError] = useState("");

	const { uploadFiles, isUploading } = useFileUpload({
		folder: "profile_pictures",
		maxFiles: 1,
		acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
		maxFileSize: 2 * 1024 * 1024, // 2MB
		onUploadComplete: (files: UploadedFile[]) => {
			if (files.length > 0) {
				onImageUploaded(files[0].secure_url);
				setError("");
			}
		},
		onUploadError: (error: string) => {
			toast.error(error);
			setError("Failed to upload profile picture");
		},
	});

	const handleFileSelect = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/jpeg,image/png,image/webp";
		input.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			if (target.files && target.files.length > 0) {
				uploadFiles(Array.from(target.files));
			}
		};
		input.click();
	};

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">Profile Picture</label>
			<div className="flex items-center gap-4">
				<div className="border rounded-full overflow-hidden w-16 h-16 flex-shrink-0 bg-muted">
					<Avatar className="w-16 h-16">
						{profilePicture ? (
							<AvatarImage
								src={profilePicture}
								alt="Profile picture"
							/>
						) : (
							<AvatarFallback className="text-lg">
								{name ? name.charAt(0).toUpperCase() : "U"}
							</AvatarFallback>
						)}
					</Avatar>
				</div>
				<div className="flex-1">
					<Button
						type="button"
						variant="outline"
						className="w-full"
						disabled={isUploading || disabled}
						onClick={handleFileSelect}
					>
						<Upload className="mr-2 h-4 w-4" />
						{isUploading ? "Uploading..." : "Upload Photo"}
					</Button>
					<p className="text-xs text-muted-foreground mt-1">
						JPEG, PNG or WebP, max 2MB
					</p>
				</div>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
