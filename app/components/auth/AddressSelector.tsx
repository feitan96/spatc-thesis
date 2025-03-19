import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native"
import { colors } from "../../../src/styles/styles"
import { MapPin, ChevronDown } from "lucide-react-native"

interface AddressSelectorProps {
  onAddressChange: (address: string) => void
  error?: string
}

interface Location {
  code: string
  name: string
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ onAddressChange, error }) => {
  const [regions, setRegions] = useState<Location[]>([])
  const [provinces, setProvinces] = useState<Location[]>([])
  const [cities, setCities] = useState<Location[]>([])
  const [barangays, setBarangays] = useState<Location[]>([])

  const [selectedRegion, setSelectedRegion] = useState<Location | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<Location | null>(null)
  const [selectedCity, setSelectedCity] = useState<Location | null>(null)
  const [selectedBarangay, setSelectedBarangay] = useState<Location | null>(null)
  const [streetAddress, setStreetAddress] = useState("")

  const [showRegions, setShowRegions] = useState(false)
  const [showProvinces, setShowProvinces] = useState(false)
  const [showCities, setShowCities] = useState(false)
  const [showBarangays, setShowBarangays] = useState(false)

  // Fetch regions on component mount
  useEffect(() => {
    fetchRegions()
  }, [])

  // Fetch provinces when region is selected
  useEffect(() => {
    if (selectedRegion) {
      fetchProvinces(selectedRegion.code)
    }
  }, [selectedRegion])

  // Fetch cities when province is selected
  useEffect(() => {
    if (selectedProvince) {
      fetchCities(selectedProvince.code)
    }
  }, [selectedProvince])

  // Fetch barangays when city is selected
  useEffect(() => {
    if (selectedCity) {
      fetchBarangays(selectedCity.code)
    }
  }, [selectedCity])

  // Update full address whenever any part changes
  useEffect(() => {
    const parts = []
    if (streetAddress) parts.push(streetAddress)
    if (selectedBarangay) parts.push(selectedBarangay.name)
    if (selectedCity) parts.push(selectedCity.name)
    if (selectedProvince) parts.push(selectedProvince.name)
    if (selectedRegion) parts.push(selectedRegion.name)

    onAddressChange(parts.join(", "))
  }, [streetAddress, selectedRegion, selectedProvince, selectedCity, selectedBarangay])

  const fetchRegions = async () => {
    try {
      const response = await fetch("https://psgc.gitlab.io/api/regions/")
      const data = await response.json()
      setRegions(data)
    } catch (error) {
      console.error("Error fetching regions:", error)
    }
  }

  const fetchProvinces = async (regionCode: string) => {
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`)
      const data = await response.json()
      setProvinces(data)
      setSelectedProvince(null)
      setSelectedCity(null)
      setSelectedBarangay(null)
    } catch (error) {
      console.error("Error fetching provinces:", error)
    }
  }

  const fetchCities = async (provinceCode: string) => {
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`)
      const data = await response.json()
      setCities(data)
      setSelectedCity(null)
      setSelectedBarangay(null)
    } catch (error) {
      console.error("Error fetching cities:", error)
    }
  }

  const fetchBarangays = async (cityCode: string) => {
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`)
      const data = await response.json()
      setBarangays(data)
      setSelectedBarangay(null)
    } catch (error) {
      console.error("Error fetching barangays:", error)
    }
  }

  const renderDropdown = (
    title: string,
    items: Location[],
    selected: Location | null,
    onSelect: (item: Location) => void,
    show: boolean,
    setShow: (show: boolean) => void
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{title}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setShow(!show)}>
        <Text style={styles.dropdownButtonText}>
          {selected ? selected.name : `Select ${title}`}
        </Text>
        <ChevronDown size={20} color={colors.secondary} />
      </TouchableOpacity>
      {show && (
        <ScrollView style={styles.dropdownList}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(item)
                setShow(false)
              }}
            >
              <Text style={styles.dropdownItemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      {renderDropdown("Region", regions, selectedRegion, setSelectedRegion, showRegions, setShowRegions)}
      {selectedRegion &&
        renderDropdown("Province", provinces, selectedProvince, setSelectedProvince, showProvinces, setShowProvinces)}
      {selectedProvince &&
        renderDropdown("City/Municipality", cities, selectedCity, setSelectedCity, showCities, setShowCities)}
      {selectedCity &&
        renderDropdown("Barangay", barangays, selectedBarangay, setSelectedBarangay, showBarangays, setShowBarangays)}

      <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
          <MapPin size={20} color={colors.secondary} />
        </View>
        <TextInput
          style={styles.streetInput}
          placeholder="Enter street address"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  iconContainer: {
    marginRight: 12,
  },
  streetInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.primary,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
})

export default AddressSelector 