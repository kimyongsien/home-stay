import { Home, Shield, Users, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <Home className="mx-auto text-primary mb-4" size={60} />
        <h1 className="text-4xl font-bold mb-4">About HomeStay</h1>
        <p className="text-gray-600 text-lg">
          Cambodia's trusted platform for safe, affordable student housing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow">
          <Shield className="text-primary mb-3" size={32} />
          <h3 className="font-semibold text-lg mb-2">Verified Listings</h3>
          <p className="text-gray-600 text-sm">
            Every landlord is ID-verified through our Campus Ambassador program.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <MapPin className="text-primary mb-3" size={32} />
          <h3 className="font-semibold text-lg mb-2">Near Your Campus</h3>
          <p className="text-gray-600 text-sm">
            Find rooms within walking distance of RUPP, ITC, NUM, and more.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Users className="text-primary mb-3" size={32} />
          <h3 className="font-semibold text-lg mb-2">Split Rent Safely</h3>
          <p className="text-gray-600 text-sm">
            Match with verified students to share housing costs.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Home className="text-primary mb-3" size={32} />
          <h3 className="font-semibold text-lg mb-2">Transparent Pricing</h3>
          <p className="text-gray-600 text-sm">
            Clear electricity, water, and rent costs upfront — no surprises.
          </p>
        </div>
      </div>

      <div className="bg-primary text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
        <p>
          To make finding safe student housing in Cambodia simple, transparent, 
          and stress-free for every student.
        </p>
      </div>
    </div>
  );
}