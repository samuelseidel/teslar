# VIN Lookup API Troubleshooting Guide

## API Overview

**Endpoint:** `https://api.dataovozidlech.cz/api/vehicletechnicaldata/v2`
**Provider:** Czech Ministry of Transport (Ministerstvo dopravy)
**Authentication:** API Key via `api_key` header

## Common Issues and Solutions

### 1. 404 Not Found Error

**Possible Causes:**
- VIN not registered in Czech vehicle registry
- VIN format incorrect or contains invalid characters
- Vehicle not yet in the registry database

**Solution:**
- Verify VIN is exactly 17 characters
- Check VIN starts with valid Tesla WMI code (5YJ, 7SA, 7G2, LRW, XP7, SFZ)
- Confirm vehicle is registered in Czech Republic
- Try the test VIN: `5YJ3E7EA7MF905836` (known working Czech-registered Tesla)

### 2. 401 Unauthorized / 403 Forbidden

**Possible Causes:**
- API key expired or invalid
- API key not yet activated
- API key missing from environment variables

**Solution:**
- Check `.env.local` has `MDCR_API_KEY=your_key_here`
- Verify API key at https://dataovozidlech.cz/registraceApi
- Restart Next.js development server after changing `.env.local`
- Check server logs for "API klíč MDČ není nakonfigurován" error

### 3. 500 Internal Server Error

**Possible Causes:**
- MDČ API service temporarily down
- Database maintenance
- Rate limiting exceeded

**Solution:**
- Wait and retry after a few minutes
- Check https://dataovozidlech.cz for service status
- Implement exponential backoff retry logic

### 4. Status Code 3 in Response

**Meaning:** Vehicle found in registry but no technical data available

**Solution:**
- This is expected behavior for some vehicles
- Display user-friendly message
- Allow manual data entry as fallback

## Debugging Steps

### 1. Enable Debug Logging

Check server console for detailed logs:

```typescript
// Already implemented in route.ts
console.log('Calling MDČ API:', { url, hasApiKey })
console.log('MDČ API Response:', { Status, hasData, vin })
console.error('MDČ API HTTP Error:', { status, body, headers })
```

### 2. Test API Directly with cURL

```bash
curl -H "api_key: YOUR_API_KEY" \
  "https://api.dataovozidlech.cz/api/vehicletechnicaldata/v2?vin=5YJ3E7EA7MF905836"
```

Expected successful response:
```json
{
  "Status": 1,
  "Data": {
    "VIN": "5YJ3E7EA7MF905836",
    "TovarniZnacka": "TESLA",
    "ObchodniOznaceni": "MODEL 3",
    ...
  }
}
```

### 3. Verify Environment Variables

```bash
# In terminal
echo $MDCR_API_KEY

# Or in Node.js
console.log('API Key exists:', !!process.env.MDCR_API_KEY)
console.log('API Key length:', process.env.MDCR_API_KEY?.length)
```

### 4. Check Network Issues

- Verify server has internet access
- Check firewall settings
- Test if api.dataovozidlech.cz is reachable:

```bash
ping api.dataovozidlech.cz
curl -I https://api.dataovozidlech.cz
```

## API Response Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 1 | Success | Data available in `Data` field |
| 2 | Partial success | Some data missing |
| 3 | Not found | VIN not in registry or no technical data |
| Other | Error | Check API documentation |

## Known Limitations

1. **Czech Registry Only:** Only vehicles registered in Czech Republic are available
2. **Data Delay:** Newly registered vehicles may take 24-48 hours to appear
3. **Historical Data:** Some older vehicles may have incomplete data
4. **Rate Limits:** Unknown, but recommended to cache results
5. **Maintenance Windows:** Service may be unavailable during updates

## API Key Registration

1. Visit: https://dataovozidlech.cz/registraceApi
2. Fill out registration form
3. Wait for API key via email
4. Add to `.env.local`: `MDCR_API_KEY=your_key`
5. Restart development server

## Support Contacts

- **API Issues:** Contact via dataovozidlech.cz
- **Ministry of Transport:** https://md.gov.cz
- **Documentation:** https://dataovozidlech.cz/data/RSV_Verejna_API_DK_v1_0.pdf

## Example Valid VINs for Testing

```
5YJ3E7EA7MF905836  # Tesla Model 3 (2021) - Czech registered
```

**Note:** Do not use random VINs for testing. Only use VINs of vehicles you know are registered in Czech Republic.
