export async function POST(request: Request) {
  const { username, password } = await request.json()

  const url = "https://vh.vinhomes.vn/api/vhr/iam/v0/security/oauth-login"

  const headers = {
    "accept-encoding": "gzip",
    "accept-language": "vi",
    "app-version-name": "1.5.5",
    "content-type": "application/json; charset=UTF-8",
    "device-id": "51a9e0d3fcb8574c",
    "device-inf": "PHY110 OPPO 35",
    host: "vh.vinhomes.vn",
    "user-agent": "Dart/3.7 (dart:io)",
  }

  const payload = {
    username,
    password,
  }

  try {
    console.log("[v0] Login API - Starting request")
    console.log("[v0] URL:", url)
    console.log("[v0] Headers:", headers)
    console.log("[v0] Payload:", payload)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      redirect: "follow",
      referrerPolicy: "no-referrer",
      keepalive: false,
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[v0] Response body:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { rawResponse: responseText }
    }

    return Response.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      success: response.ok,
    })
  } catch (error) {
    console.error("[v0] Login API error:", error)
    return Response.json(
      {
        error: "Request failed",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
