// Debug utility to test headers without CORS restrictions
// This will help you see exactly what headers are being sent

export function debugHeaders(jwtToken: string) {
  const headers = {
    'user-agent': 'Dart/3.7 (dart:io)',
    'app-version-name': '1.5.5',
    'device-inf': 'PHY110 OPPO 35',
    'accept-language': 'vi',
    'device-id': '51a9e0d3fcb8574c',
    'host': 'vh.vinhomes.vn',
    'content-type': 'application/json; charset=UTF-8',
    'x-vinhome-token': jwtToken,
    'accept-encoding': 'gzip',
    'accept': 'application/json, text/plain, */*'
  }

  console.log('🔍 DEBUG: All headers that should be sent:')
  console.table(headers)
  
  return headers
}

// Test function to make a simple request and see headers
export async function testHeadersVisibility(jwtToken: string) {
  const url = 'https://vh.vinhomes.vn/api/vhr/utility/v0/utility/75/places?classifyId=118&fromTime=1760094000000&timeConstraintId=575&monthlyTicket=false'
  
  const headers = debugHeaders(jwtToken)
  
  console.log('🧪 Making test request to:', url)
  
  try {
    // Try with regular fetch first
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit'
    })
    
    console.log('✅ Request successful!')
    console.log('Response status:', response.status)
    console.log('Response headers:', [...response.headers.entries()])
    
    if (response.ok) {
      const data = await response.json()
      console.log('Response data:', data)
      return { success: true, data }
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
      return { success: false, error: errorText }
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error)
    
    // If CORS fails, provide instructions
    console.log(`
🔧 CORS DEBUGGING TIPS:

1. Open Browser DevTools → Network tab
2. Look for the request to: ${url}
3. Check Request Headers section
4. You should see these custom headers:
   - x-vinhome-token: ${jwtToken.substring(0, 20)}...
   - device-id: 51a9e0d3fcb8574c
   - device-inf: PHY110 OPPO 35
   - app-version-name: 1.5.5

5. If headers are missing, it's a CORS issue
6. If you see them but still get errors, it's a server-side issue
    `)
    
    return { success: false, error: String(error) }
  }
}

// Add this to your component to test headers
export function addHeaderDebugButton() {
  const button = document.createElement('button')
  button.textContent = '🔍 Test Headers'
  button.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  `
  
  button.onclick = async () => {
    const token = prompt('Enter JWT token:')
    if (token) {
      await testHeadersVisibility(token)
    }
  }
  
  document.body.appendChild(button)
}
