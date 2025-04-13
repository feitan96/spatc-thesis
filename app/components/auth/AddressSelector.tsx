import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { colors } from "../../../src/styles/styles";
import { MapPin } from "lucide-react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface AddressSelectorProps {
  onAddressChange: (address: string) => void;
  error?: string;
}

interface Location {
  code: string;
  name: string;
}

const Z_INDEX_REGION = 4000;
const Z_INDEX_PROVINCE = 3000;
const Z_INDEX_CITY = 2000;
const Z_INDEX_BARANGAY = 1000;

const AddressSelector: React.FC<AddressSelectorProps> = ({ onAddressChange, error }) => {
  // Region Dropdown
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionValue, setRegionValue] = useState(null);
  const [regions, setRegions] = useState<{label: string, value: string}[]>([]);
  const [regionLoading, setRegionLoading] = useState(false);

  // Province Dropdown
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [provinceValue, setProvinceValue] = useState(null);
  const [provinces, setProvinces] = useState<{label: string, value: string}[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);

  // City Dropdown
  const [cityOpen, setCityOpen] = useState(false);
  const [cityValue, setCityValue] = useState(null);
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [cityLoading, setCityLoading] = useState(false);

  // Barangay Dropdown
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [barangayValue, setBarangayValue] = useState(null);
  const [barangays, setBarangays] = useState<{label: string, value: string}[]>([]);
  const [barangayLoading, setBarangayLoading] = useState(false);

  const [streetAddress, setStreetAddress] = useState("");

  // Close other dropdowns when one opens
  useEffect(() => {
    if (regionOpen) {
      setProvinceOpen(false);
      setCityOpen(false);
      setBarangayOpen(false);
    }
  }, [regionOpen]);

  useEffect(() => {
    if (provinceOpen) {
      setRegionOpen(false);
      setCityOpen(false);
      setBarangayOpen(false);
    }
  }, [provinceOpen]);

  useEffect(() => {
    if (cityOpen) {
      setRegionOpen(false);
      setProvinceOpen(false);
      setBarangayOpen(false);
    }
  }, [cityOpen]);

  useEffect(() => {
    if (barangayOpen) {
      setRegionOpen(false);
      setProvinceOpen(false);
      setCityOpen(false);
    }
  }, [barangayOpen]);

  // Fetch regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  // Fetch provinces when region is selected
  useEffect(() => {
    if (regionValue) {
      fetchProvinces(regionValue);
      setProvinceValue(null);
      setCityValue(null);
      setBarangayValue(null);
    }
  }, [regionValue]);

  // Fetch cities when province is selected
  useEffect(() => {
    if (provinceValue) {
      fetchCities(provinceValue);
      setCityValue(null);
      setBarangayValue(null);
    }
  }, [provinceValue]);

  // Fetch barangays when city is selected
  useEffect(() => {
    if (cityValue) {
      fetchBarangays(cityValue);
      setBarangayValue(null);
    }
  }, [cityValue]);

  // Update full address whenever any part changes
  useEffect(() => {
    const parts = [];
    if (streetAddress) parts.push(streetAddress);
    if (barangayValue) parts.push(barangays.find(b => b.value === barangayValue)?.label);
    if (cityValue) parts.push(cities.find(c => c.value === cityValue)?.label);
    if (provinceValue) parts.push(provinces.find(p => p.value === provinceValue)?.label);
    if (regionValue) parts.push(regions.find(r => r.value === regionValue)?.label);

    onAddressChange(parts.filter(Boolean).join(", "));
  }, [streetAddress, regionValue, provinceValue, cityValue, barangayValue]);

  const fetchRegions = async () => {
    setRegionLoading(true);
    try {
      const response = await fetch("https://psgc.gitlab.io/api/regions/");
      const data = await response.json();
      setRegions(data.map((region: Location) => ({
        label: region.name,
        value: region.code
      })));
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setRegionLoading(false);
    }
  };

  const fetchProvinces = async (regionCode: string) => {
    setProvinceLoading(true);
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`);
      const data = await response.json();
      setProvinces(data.map((province: Location) => ({
        label: province.name,
        value: province.code
      })));
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setProvinceLoading(false);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    setCityLoading(true);
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`);
      const data = await response.json();
      setCities(data.map((city: Location) => ({
        label: city.name,
        value: city.code
      })));
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setCityLoading(false);
    }
  };

  const fetchBarangays = async (cityCode: string) => {
    setBarangayLoading(true);
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`);
      const data = await response.json();
      setBarangays(data.map((barangay: Location) => ({
        label: barangay.name,
        value: barangay.code
      })));
    } catch (error) {
      console.error("Error fetching barangays:", error);
    } finally {
      setBarangayLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Region Dropdown */}
      <DropDownPicker
        open={regionOpen}
        value={regionValue}
        items={regions}
        setOpen={setRegionOpen}
        setValue={setRegionValue}
        setItems={setRegions}
        placeholder="Select Region"
        loading={regionLoading}
        activityIndicatorColor={colors.primary}
        searchable={true}
        searchPlaceholder="Search region..."
        searchTextInputProps={{
          maxLength: 25,
          autoCorrect: false,
          autoCapitalize: "none",
        }}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        listMode="MODAL" // Changed to MODAL to avoid VirtualizedList nesting
        modalProps={{
          animationType: "slide",
        }}
        modalTitle="Select a Region"
        modalContentContainerStyle={styles.modalContent}
        zIndex={Z_INDEX_REGION}
        zIndexInverse={Z_INDEX_BARANGAY}
      />

      {/* Province Dropdown */}
      {regionValue && (
        <DropDownPicker
          open={provinceOpen}
          value={provinceValue}
          items={provinces}
          setOpen={setProvinceOpen}
          setValue={setProvinceValue}
          setItems={setProvinces}
          placeholder="Select Province"
          loading={provinceLoading}
          activityIndicatorColor={colors.primary}
          searchable={true}
          searchPlaceholder="Search province..."
          searchTextInputProps={{
            maxLength: 25,
            autoCorrect: false,
            autoCapitalize: "none",
          }}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="MODAL"
          modalProps={{
            animationType: "slide",
          }}
          modalTitle="Select a Province"
          modalContentContainerStyle={styles.modalContent}
          zIndex={Z_INDEX_PROVINCE}
          zIndexInverse={Z_INDEX_CITY}
        />
      )}

      {/* City Dropdown */}
      {provinceValue && (
        <DropDownPicker
          open={cityOpen}
          value={cityValue}
          items={cities}
          setOpen={setCityOpen}
          setValue={setCityValue}
          setItems={setCities}
          placeholder="Select City/Municipality"
          loading={cityLoading}
          activityIndicatorColor={colors.primary}
          searchable={true}
          searchPlaceholder="Search city..."
          searchTextInputProps={{
            maxLength: 25,
            autoCorrect: false,
            autoCapitalize: "none",
          }}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="MODAL"
          modalProps={{
            animationType: "slide",
          }}
          modalTitle="Select a City/Municipality"
          modalContentContainerStyle={styles.modalContent}
          zIndex={Z_INDEX_CITY}
          zIndexInverse={Z_INDEX_PROVINCE}
        />
      )}

      {/* Barangay Dropdown */}
      {cityValue && (
        <DropDownPicker
          open={barangayOpen}
          value={barangayValue}
          items={barangays}
          setOpen={setBarangayOpen}
          setValue={setBarangayValue}
          setItems={setBarangays}
          placeholder="Select Barangay"
          loading={barangayLoading}
          activityIndicatorColor={colors.primary}
          searchable={true}
          searchPlaceholder="Search barangay..."
          searchTextInputProps={{
            maxLength: 25,
            autoCorrect: false,
            autoCapitalize: "none",
          }}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="MODAL"
          modalProps={{
            animationType: "slide",
          }}
          modalTitle="Select a Barangay"
          modalContentContainerStyle={styles.modalContent}
          zIndex={Z_INDEX_BARANGAY}
          zIndexInverse={Z_INDEX_REGION}
        />
      )}

      {/* Street Address Input */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.neutral,
    height: 48,
  },
  iconContainer: {
    marginRight: 12,
  },
  streetInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    height: '100%',
  },
  dropdown: {
    backgroundColor: colors.white,
    borderColor: colors.neutral,
    borderRadius: 12,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: colors.white,
    borderColor: colors.neutral,
    marginTop: 2,
  },
  modalContent: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default AddressSelector;