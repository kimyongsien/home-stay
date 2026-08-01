import { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { getAllUniversities } from '../services/rooms';

export default function StudentSearchForm({ onSearch }) {
  const [universities, setUniversities] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    getAllUniversities().then(setUniversities);
  }, []);

  return (
    <div className="bg-white rounded-full shadow-lg p-2 flex items-center max-w-2xl mx-auto">
      <MapPin className="text-primary ml-4" size={20} />
      <select
        className="flex-1 px-4 py-3 outline-none bg-transparent"
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          onSearch(e.target.value);
        }}
      >
        <option value="">Select your University...</option>
        {universities.map((uni) => (
          <option key={uni.id} value={uni.short_code}>
            {uni.name} ({uni.short_code})
          </option>
        ))}
      </select>
      <button
        onClick={() => onSearch(selected)}
        className="bg-primary text-white p-3 rounded-full hover:bg-primary-dark"
      >
        <Search size={20} />
      </button>
    </div>
  );
}