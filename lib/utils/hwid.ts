// Gera um HWID único baseado em informações do navegador
export function generateHWID(): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  let fingerprint = ""

  if (ctx) {
    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillText("HWID", 2, 2)
    fingerprint = canvas.toDataURL()
  }

  const data = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    fingerprint,
    navigator.hardwareConcurrency || 0,
    navigator.platform,
  ].join("|")

  return btoa(data).substring(0, 32)
}

// Gera informações de localização do usuário
export async function getUserLocation() {
  try {
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    return {
      ip: data.ip || "Unknown",
      city: data.city || "Unknown",
      country: data.country_name || "Unknown",
    }
  } catch (error) {
    return {
      ip: "Unknown",
      city: "Unknown",
      country: "Unknown",
    }
  }
}
