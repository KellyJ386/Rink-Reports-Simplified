import { useState, useEffect } from 'react'
import {
  useFacility,
  useCurrentUserProfile,
  useUpdateFacility,
  useUploadFacilityLogo,
} from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Save, Upload, MapPin, Phone, Mail, Clock, Thermometer } from 'lucide-react'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
]

export function FacilitySettingsPage() {
  const { data: currentProfile } = useCurrentUserProfile()
  const { data: facility, isLoading } = useFacility(currentProfile?.facility_id)
  const updateFacility = useUpdateFacility()
  const uploadLogo = useUploadFacilityLogo()

  const [formData, setFormData] = useState({
    facility_name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    timezone: 'America/New_York',
    temperature_unit: 'fahrenheit' as 'fahrenheit' | 'celsius',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (facility) {
      setFormData({
        facility_name: facility.facility_name || '',
        address: facility.address || '',
        city: facility.city || '',
        state: facility.state || '',
        zip: facility.zip || '',
        phone: facility.phone || '',
        email: facility.email || '',
        timezone: facility.timezone || 'America/New_York',
        temperature_unit: facility.temperature_unit || 'fahrenheit',
      })
      if (facility.logo_url) {
        setLogoPreview(facility.logo_url)
      }
    }
  }, [facility])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProfile?.facility_id) return

    await updateFacility.mutateAsync({
      id: currentProfile.facility_id,
      ...formData,
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadLogo = async () => {
    if (!logoFile || !currentProfile?.facility_id) return

    await uploadLogo.mutateAsync({
      facilityId: currentProfile.facility_id,
      file: logoFile,
    })
    setLogoFile(null)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading facility settings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Facility Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your facility's information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Facility Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <div>
                <CardTitle>Facility Information</CardTitle>
                <CardDescription>Basic facility details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Facility Name */}
              <div className="space-y-2">
                <label htmlFor="facility_name" className="text-sm font-medium">
                  Facility Name
                </label>
                <input
                  id="facility_name"
                  type="text"
                  value={formData.facility_name}
                  onChange={(e) =>
                    setFormData({ ...formData, facility_name: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2 col-span-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="zip" className="text-sm font-medium">
                  ZIP Code
                </label>
                <input
                  id="zip"
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <Button type="submit" className="w-full" disabled={updateFacility.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateFacility.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferences & Logo */}
        <div className="space-y-6">
          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Regional and display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Timezone */}
              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature Unit */}
              <div className="space-y-2">
                <label
                  htmlFor="temperature_unit"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Thermometer className="h-4 w-4" />
                  Temperature Unit
                </label>
                <select
                  id="temperature_unit"
                  value={formData.temperature_unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature_unit: e.target.value as 'fahrenheit' | 'celsius',
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                  <option value="celsius">Celsius (°C)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Facility Logo</CardTitle>
              <CardDescription>Upload your facility's logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Preview */}
              {logoPreview && (
                <div className="flex justify-center">
                  <img
                    src={logoPreview}
                    alt="Facility logo"
                    className="max-h-32 rounded-md border"
                  />
                </div>
              )}

              {/* Upload */}
              <div className="space-y-2">
                <label htmlFor="logo" className="text-sm font-medium">
                  Choose Image
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or GIF. Max 2MB. Recommended: 400x200px
                </p>
              </div>

              {logoFile && (
                <Button
                  onClick={handleUploadLogo}
                  disabled={uploadLogo.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadLogo.isPending ? 'Uploading...' : 'Upload Logo'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
