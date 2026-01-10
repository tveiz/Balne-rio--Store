"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsModalProps {
  open: boolean
  onAccept: () => void
}

export function TermsModal({ open, onAccept }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl">Termos de Uso</DialogTitle>
          <DialogDescription>Por favor, leia e aceite os termos para continuar</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-lg">1. Aceitação dos Termos</h3>
            <p>
              Ao acessar e usar este site, você aceita e concorda em ficar vinculado aos termos e condições deste
              acordo.
            </p>

            <h3 className="font-semibold text-lg">2. Uso do Site</h3>
            <p>
              Este site é fornecido para seu uso pessoal e não comercial. Você não pode modificar, copiar, distribuir,
              transmitir, exibir, executar, reproduzir, publicar, licenciar, criar trabalhos derivados, transferir ou
              vender qualquer informação, software, produtos ou serviços obtidos deste site.
            </p>

            <h3 className="font-semibold text-lg">3. Compras e Pagamentos</h3>
            <p>
              Ao realizar uma compra em nosso site, você concorda em fornecer informações verdadeiras e precisas. Todas
              as transações estão sujeitas à verificação e aprovação.
            </p>

            <h3 className="font-semibold text-lg">4. Política de Reembolso</h3>
            <p>
              Compras aprovadas são finais. Reembolsos podem ser solicitados em casos específicos, sujeitos à análise da
              administração.
            </p>

            <h3 className="font-semibold text-lg">5. Privacidade</h3>
            <p>
              Coletamos informações pessoais para processar pedidos e melhorar nossos serviços. Suas informações são
              mantidas em sigilo e não são compartilhadas com terceiros sem seu consentimento.
            </p>

            <h3 className="font-semibold text-lg">6. Modificações</h3>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. É sua responsabilidade revisar estes
              termos periodicamente.
            </p>

            <h3 className="font-semibold text-lg">7. Contato</h3>
            <p>Se você tiver alguma dúvida sobre estes termos, entre em contato conosco através do Discord.</p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onAccept} className="w-full">
            Aceitar Termos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
