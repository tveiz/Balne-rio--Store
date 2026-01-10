"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"

interface TermsAccepted {
  id: string
  user_email: string
  user_name: string
  ip_address: string
  accepted_at: string
}

export function AdminTerms() {
  const [termsAccepted, setTermsAccepted] = useState<TermsAccepted[]>([])

  const loadTerms = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("terms_accepted").select("*").order("accepted_at", { ascending: false })
    if (data) setTermsAccepted(data)
  }

  useEffect(() => {
    loadTerms()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Termos Aceitos</CardTitle>
        <CardDescription>Total: {termsAccepted.length} usuários aceitaram os termos</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {termsAccepted.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum termo aceito ainda</p>
            ) : (
              termsAccepted.map((term) => (
                <div key={term.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{term.user_name}</h3>
                      <p className="text-sm text-muted-foreground">{term.user_email}</p>
                      <p className="text-xs text-muted-foreground mt-1">IP: {term.ip_address}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(term.accepted_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
