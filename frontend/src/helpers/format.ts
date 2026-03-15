import accounting from "accounting";
import moment from "moment";

const intl = new Intl.NumberFormat();

export const format = {
    toDocument: (value: string | null | undefined): string => {
        const digits = (value ?? "").replace(/\D/g, "");
        if (!digits) return "";
        if (digits.length <= 11) return format.toMask(digits.slice(0, 11), "###.###.###-##");
        return format.toMask(digits.slice(0, 14), "##.###.###/####-##");
    },
    toPhone: (value: string | null | undefined): string => {
        const digits = (value ?? "").replace(/\D/g, "");
        if (!digits) return "";
        if (digits.length > 10) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 3)} ${digits.substring(3, 7)}-${digits.substring(7, 11)}`.trim();
        }
        if (digits.length > 6) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6, 10)}`.trim();
        }
        if (digits.length > 2) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2)}`.trim();
        }
        return digits;
    },
    toPostalCode: (value: string | null | undefined): string => {
        const digits = (value ?? "").replace(/\D/g, "");
        if (!digits) return "";
        return format.toMask(digits.slice(0, 8), "#####-###");
    },
    toBirthDateDisplay: (value: string | null | undefined): string => {
        if (value == null || typeof value !== "string") return "";
        const trimmed = value.trim();
        if (!trimmed) return "";
        const m = moment(trimmed, [moment.ISO_8601, "YYYY-MM-DD", "DD/MM/YYYY"], true);
        return m.isValid() ? m.format("DD/MM/YYYY") : trimmed;
    },
    /** Converte data do formulário (dd/MM/yyyy) para ISO (YYYY-MM-DD) para envio à API. */
    toBirthDateApi: (value: string | null | undefined): string | undefined => {
        if (value == null || typeof value !== "string") return undefined;
        const trimmed = value.trim().slice(0, 10);
        if (!trimmed) return undefined;
        const m = moment(trimmed, ["DD/MM/YYYY", moment.ISO_8601, "YYYY-MM-DD"], true);
        return m.isValid() ? m.format("YYYY-MM-DD") : trimmed;
    },
    toCurrency: (value: number) => accounting.formatMoney(value, 'R$ ', 2, '.', ','),
    currencyToNumber: (value: string) => {
        const cleanedCurrency = value.replace(/[R$\s]/g, '');
        const withoutThousandSeparator = cleanedCurrency.replace(/\./g, '');
        const normalizedCurrency = withoutThousandSeparator.replace(',', '.');
        const result = parseFloat(normalizedCurrency);

        if (isNaN(result)) {
            throw new Error('Formato inválido para moeda');
        }

        return result;
    },
    toCNPJ: (value: string) => value && value.length === 14 ? value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : value,
    toMask: (value: string, mask: string) => {
        let result = '';
        let inputIndex = 0;

        value = value.replace(/\D/g, '');
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === '#') {
                if (inputIndex < value.length) {
                    result += value[inputIndex];
                    inputIndex++;
                } else {
                    break;
                }
            } else {
                result += mask[i];
            }
        }

        return result;
    },
    unmask: (value: string) => value.replace(/\D/g, '')
}