"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface User {
  id: string
  email: string
  name: string
  photo_url?: string
}

interface SupportAgent {
  id: string
  user_id: string
  users: User
}

export function AdminSupport() {
  const [agents, setAgents] = useState<SupportAgent[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotificationStore()

  const loadData = async () => {
    const supabase = createClient()

    // Carregar atendentes
    const { data: agentsData } = await supabase.from("support_agents").select("*, users(*)")
    if (agentsData) setAgents(agentsData as any)

    // Carregar usuários que não são atendentes
    const { data: usersData } = await supabase.from("users").select("*").neq("email", "tm9034156@gmail.com")
    if (usersData) {
      const agentUserIds = agentsData?.map((a) => a.user_id) || []
      setUsers(usersData.filter((u) => !agentUserIds.includes(u.id)))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async () => {
    if (!selectedUserId) {
      addNotification({ type: "error", message: "Selecione um usuário" })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      await supabase.from("support_agents").insert({ user_id: selectedUserId })
      addNotification({ type: "success", message: "Atendente adicionado!" })
      setSelectedUserId("")
      await loadData()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao adicionar atendente" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    try {
      await supabase.from("support_agents").delete().eq("id", deleteId)
      addNotification({ type: "success", message: "Atendente removido!" })
      await loadData()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao remover atendente" })
    }
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Atendente</CardTitle>
          <CardDescription>Selecione usuários para atender clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Atendente
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atendentes Ativos</CardTitle>
          <CardDescription>Total: {agents.length} atendentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum atendente adicionado</p>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {agent.users.photo_url ? (
                      <img
                        src={agent.users.photo_url || "/placeholder.svg"}
                        alt={agent.users.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {agent.users.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{agent.users.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.users.email}</p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(agent.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remover Atendente"
        description="Tem certeza que deseja remover este atendente?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
