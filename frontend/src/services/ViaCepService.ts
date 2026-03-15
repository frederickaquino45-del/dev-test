type ViaCepResponse = {
    cep?: string;
    logradouro?: string;
    complemento?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    erro?: boolean;
  };
  
  class ViaCepService {
    async getAddressByPostalCode(postalCode: string): Promise<ViaCepResponse | null> {
      const cep = postalCode.replace(/\D/g, "");
  
      if (cep.length !== 8) {
        return null;
      }
  
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json() as ViaCepResponse;
  
      if (!response.ok || data.erro) {
        return null;
      }
  
      return data;
    }
  }
  
  export default new ViaCepService();