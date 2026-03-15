import { BaseService } from "./BaseService";
import { Client } from "@/types/api/Client";
import {
  ClientImportJobStatus,
  ClientImportResponse,
} from "@/types/api/ClientImport";

class ClientService extends BaseService {
  constructor() {
    super("client");
  }

  async getAll(document?: string): Promise<Client[]> {
    return await this.get<Client[]>("", document ? { document } : undefined);
  }

  async create(client: Client): Promise<string> {
    return await this.post<Client, string>("", client);
  }

  async getById(id: string): Promise<Client> {
    return await this.get<Client>(id);
  }

  async update(id: string, client: Client): Promise<void> {
    return await this.put<Client, void>(id, client);
  }

  async importCsv(file: File): Promise<ClientImportResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this._axios.post<ClientImportResponse>(
      `${this._controller}/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async getImportStatus(jobId: string): Promise<ClientImportJobStatus> {
    return await this.get<ClientImportJobStatus>(`import/${jobId}`);
  }
}

export default new ClientService();