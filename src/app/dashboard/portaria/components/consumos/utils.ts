import { TipoConsumoType } from "../../models/consumo.model";

export interface TipoConsumoMeta {
  label: string;
  icon: string;
  unidade: string;
  /** sufixo usado nas classes scss: .lc-agua, .li-agua, .td-agua, .sel-agua, etc. */
  cssKey: string;
}

export const Unidades = {
  ELETRICIDADE: "kWh",
  AGUA: "m³",
  GAS: "m³",
};

export const TIPO_META: { [key in TipoConsumoType]: TipoConsumoMeta } = {
  AGUA: { label: "Água", icon: "ti-droplet", unidade: "m³", cssKey: "agua" },
  ELETRICIDADE: {
    label: "Eletricidade",
    icon: "ti-bolt",
    unidade: "kWh",
    cssKey: "elet",
  },
  GAS: { label: "Gás", icon: "ti-flame", unidade: "m³", cssKey: "gas" },
};
