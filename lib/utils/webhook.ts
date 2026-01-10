// Envia logs para os webhooks do Discord
export async function sendDiscordWebhook(webhookUrl: string, data: any) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [data],
      }),
    })
  } catch (error) {
    console.error("[v0] Error sending webhook:", error)
  }
}

// Webhook URLs
export const WEBHOOKS = {
  ACCOUNT_CREATED:
    "https://discord.com/api/webhooks/1442183267938992222/NQOdZsNy7bGIvmVfcAOCvxf3aQ8YvlFk3H7iwaLPD28FdYLdlRElz7erADaEZ0SCnTik",
  PURCHASE:
    "https://discord.com/api/webhooks/1442183701688746005/Kxgt6fYQVWK9u5vbcv9PxeVd6LP1P1xvYTkvH0-HYMlqlwel4cdhQoCmESfaJeJ_D0jm",
  GENERAL:
    "https://discord.com/api/webhooks/1442183908551823521/I6Kxw9s359LsfKIlGhrhxCKgw0of8jULK6jwdxjwispPps3_ivCJmoKvDAXNGYwxIzo-",
  TERMS:
    "https://discord.com/api/webhooks/1458983828520435765/8jHSEdRmhDwHbRJFrj7Vrb8UiXW1wzviE9utgY1XAbrY8mQLH9J7aSbnrT_1ypp6ZDbe",
}
