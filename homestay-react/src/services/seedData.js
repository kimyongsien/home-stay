import { db } from '../firebaseClient'; // Make sure this path is correct!
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const seedMockRooms = async () => {
  console.log('🏠 Starting to seed rooms...');
  
  const mockRooms = [
    {
      title: "Cozy Private Room near RUPP Gate 1",
      listing_type: "entire",
      room_type: "room",
      price_per_month: 15000, // $150 in cents
      location_summary: "200m from RUPP Gate 1",
      university_id: "rupp_001",
      university_code: "RUPP",
      landlord_id: "mock_landlord_1",
      landlord_name: "Sokha Heng",
      landlord_verified: true,
      is_available: true,
      electricity_rate: 1000,
      water_rate: 1500,
      amenities: ['wifi', 'parking', 'ac'],
      images: [
        { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", is_primary: true }
      ],
      created_at: serverTimestamp()
    },
    {
      title: "Need 1 Roommate for ITC Apartment",
      listing_type: "shared",
      room_type: "shared_room",
      price_per_month: 30000, // $300 total
      split_cost_per_person: 15000, // $150 each
      location_summary: "Street 122, exactly behind ITC",
      university_id: "itc_001",
      university_code: "ITC",
      host_id: "mock_student_1",
      host_name: "Dara Pen",
      landlord_verified: false,
      is_available: true,
      electricity_rate: 1200,
      water_rate: 2000,
      amenities: ['wifi', 'bathroom'],
      roommate_preferences: {
        noise_level: "Quiet Hours Enforced",
        guest_policy: "No Overnight Guests",
        cleaning_smoking: ["Non-Smoking"]
      },
      images: [
        { url: "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=800&q=80", is_primary: true }
      ],
      created_at: serverTimestamp()
    },
    {
      title: "Premium Studio near NUM",
      listing_type: "entire",
      room_type: "studio",
      price_per_month: 25000, // $250
      location_summary: "5 mins walk to NUM campus",
      university_id: "num_001",
      university_code: "NUM",
      landlord_id: "mock_landlord_2",
      landlord_name: "Vanna Chea",
      landlord_verified: true,
      is_available: true,
      electricity_rate: 1000,
      water_rate: 1000,
      amenities: ['wifi', 'ac', 'parking', 'bathroom'],
      images: [
        { url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80", is_primary: true }
      ],
      created_at: serverTimestamp()
    }
  ];

  try {
    for (const room of mockRooms) {
      const docRef = await addDoc(collection(db, 'rooms'), room);
      console.log(`✅ Added room: ${room.title} (ID: ${docRef.id})`);
    }
    console.log('🎉 ROOM SEEDING COMPLETE!');
    return { success: true, count: mockRooms.length };
  } catch (error) {
    console.error('❌ Room Seed failed:', error);
    return { success: false, error: error.message };
  }
};