import { AbstractControl, FormGroup } from "@angular/forms";

// Mensagem de `required` por nome de campo. O texto genérico serve de fallback.
export interface MensagensObrigatorio {
  [campo: string]: string;
}

// Mostra o erro de um campo só depois de o utilizador tentar submeter.
//
// Sem isto, um formulário aberto de raiz nasce todo a vermelho: os campos
// estão vazios, logo inválidos, logo o template mostraria erro em todos antes
// de a pessoa escrever a primeira letra.
//
// Uso:
//   private erros = new ErrosForm(MENSAGENS_OBRIGATORIO);
//   erroDoCampo(form, nome) { return this.erros.erro(form, nome); }
export class ErrosForm {
  // Campos por onde já passou uma tentativa de submissão, por formulário
  private tentados = new Map<FormGroup, Set<string>>();

  constructor(private mensagens: MensagensObrigatorio) {}

  erro(form: FormGroup, nome: string): string | null {
    const campo = form.get(nome);
    if (!campo || !campo.errors || !this.foiTentado(form, nome)) return null;

    if (campo.errors["required"])
      return this.mensagens[nome] || "Campo obrigatório.";

    if (campo.errors["minlength"])
      return `Mínimo de ${campo.errors["minlength"].requiredLength} caracteres.`;

    if (campo.errors["pattern"])
      return "Nome não pode haver caracteres nem números.";

    return "Valor inválido.";
  }

  // Marca os campos como tentados e diz se estão todos válidos
  validar(form: FormGroup, nomes: string[]): boolean {
    const tentados = this.tentados.get(form) || new Set<string>();
    nomes.forEach((nome) => tentados.add(nome));
    this.tentados.set(form, tentados);

    const campos = nomes
      .map((nome) => form.get(nome))
      .filter((campo): campo is AbstractControl => campo !== null);

    return campos.every((campo) => campo.valid);
  }

  // Chamar ao abrir o modal: o formulário volta a estar por tentar
  limpar(form: FormGroup): void {
    this.tentados.delete(form);
  }

  private foiTentado(form: FormGroup, nome: string): boolean {
    const tentados = this.tentados.get(form);
    return !!tentados && tentados.has(nome);
  }
}
