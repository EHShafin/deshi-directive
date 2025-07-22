import dbConnect from "@/lib/mongodb";
import Place from "@/models/Place";

const samplePlaces = [
	{
		name: "Cox's Bazar",
		description:
			"World's longest natural sandy beach with beautiful sunsets and seafood",
		country: "Bangladesh",
		state: "Chattogram",
		city: "Cox's Bazar",
		image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
	},
	{
		name: "Sundarbans",
		description:
			"World's largest mangrove forest and home to the Royal Bengal Tiger",
		country: "Bangladesh",
		state: "Khulna",
		city: "Khulna",
		image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
	},
	{
		name: "Sylhet Tea Gardens",
		description:
			"Beautiful rolling hills covered with lush green tea plantations",
		country: "Bangladesh",
		state: "Sylhet",
		city: "Sylhet",
		image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
	},
	{
		name: "Bandarban Hills",
		description:
			"Stunning hill district with waterfalls, tribal culture, and mountain views",
		country: "Bangladesh",
		state: "Chattogram",
		city: "Bandarban",
		image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
	},
	{
		name: "Old Dhaka",
		description:
			"Historic area with Mughal architecture, street food, and cultural heritage",
		country: "Bangladesh",
		state: "Dhaka",
		city: "Dhaka",
		image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
	},
];

export default async function seedPlaces() {
	try {
		await dbConnect();

		for (const placeData of samplePlaces) {
			const existingPlace = await Place.findOne({
				name: placeData.name,
				city: placeData.city,
				state: placeData.state,
			});

			if (!existingPlace) {
				await Place.create(placeData);
				console.log(`Created place: ${placeData.name}`);
			} else {
				console.log(`Place already exists: ${placeData.name}`);
			}
		}

		console.log("Seed data insertion completed!");
		return { success: true, message: "Places seeded successfully" };
	} catch (error) {
		console.error("Error seeding places:", error);
		return { success: false, error: "Failed to seed places" };
	}
}
