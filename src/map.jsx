import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { supabase } from './supabaseClient'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const Map = () => {
  const [places, setPlaces] = useState([])
  const [filtered, setFiltered] = useState([])
  const [cuisines, setCuisines] = useState([])
  const [selectedCuisine, setSelectedCuisine] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('your_table_name').select('*')
      if (error) {
        console.error('Supabase error:', error)
        return
      }

      setPlaces(data)
      setFiltered(data)

      const cuisineList = Array.from(new Set(data.map(item => item.cuisine))).sort()
      setCuisines(['All', ...cuisineList])
    }

    fetchData()
  }, [])

  const handleFilterChange = (e) => {
    const cuisine = e.target.value
    setSelectedCuisine(cuisine)
    setFiltered(
      cuisine === 'All' ? places : places.filter(p => p.cuisine === cuisine)
    )
  }

  return (
    <div className="w-full h-screen relative">
      {/* Dropdown UI */}
      <div className="absolute z-[1000] top-4 left-4 bg-white rounded-md shadow-md p-2">
        <label htmlFor="cuisine" className="text-sm font-medium text-gray-700">Filter by Cuisine</label>
        <select
          id="cuisine"
          value={selectedCuisine}
          onChange={handleFilterChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm p-2"
        >
          {cuisines.map((cuisine, i) => (
            <option key={i} value={cuisine}>{cuisine}</option>
          ))}
        </select>
      </div>

      {/* Map */}
      <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {filtered.map((place, i) => (
          <Marker key={i} position={[place.lat, place.lng]}>
            <Popup>
              <strong>{place.name}</strong><br />
              {place.cuisine}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map