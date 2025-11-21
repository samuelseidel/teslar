import { NextRequest, NextResponse } from 'next/server'

const MDCR_API_KEY = process.env.MDCR_API_KEY || ''
const MDCR_API_URL = 'https://api.dataovozidlech.cz/api/vehicletechnicaldata/v2'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vin = searchParams.get('vin')

    if (!vin) {
      return NextResponse.json(
        { error: 'VIN je povinný parametr' },
        { status: 400 }
      )
    }

    if (!MDCR_API_KEY) {
      return NextResponse.json(
        { error: 'API klíč MDČ není nakonfigurován' },
        { status: 500 }
      )
    }

    // Call the MDČ Portal API
    const response = await fetch(`${MDCR_API_URL}?vin=${vin}`, {
      headers: {
        'api_key': MDCR_API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Chyba při komunikaci s API MDČ' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Log the response for debugging
    console.log('MDČ API Response:', { Status: data.Status, hasData: !!data.Data })

    // Check the status code from the API
    if (data.Status === 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vozidlo s tímto VIN nebylo nalezeno v českém registru vozidel'
        },
        { status: 404 }
      )
    }

    if (data.Status !== 1 || !data.Data) {
      return NextResponse.json(
        {
          success: false,
          error: `Nepodařilo se získat data vozidla (Status: ${data.Status})`
        },
        { status: 400 }
      )
    }

    // Return the vehicle data
    return NextResponse.json({
      success: true,
      data: {
        vin: data.Data.VIN || vin, // Use VIN from response or fallback to request VIN
        make: data.Data.TovarniZnacka,
        model: data.Data.ObchodniOznaceni,
        year: data.Data.DatumPrvniRegistrace
          ? new Date(data.Data.DatumPrvniRegistrace).getFullYear()
          : null,
        color: data.Data.VozidloKaroserieBarva,
        registrationDate: data.Data.DatumPrvniRegistraceVCr,
        power: data.Data.MotorMaxVykon,
        fuelType: data.Data.Palivo,
        category: data.Data.Kategorie,
        bodyType: data.Data.KaroserieDruh,
        // Additional data that might be useful
        variant: data.Data.Varianta,
        version: data.Data.Verze,
        rawData: data.Data, // Include all raw data for reference
      },
    })
  } catch (error) {
    console.error('Error fetching vehicle data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Interní chyba serveru při komunikaci s registrem vozidel'
      },
      { status: 500 }
    )
  }
}
