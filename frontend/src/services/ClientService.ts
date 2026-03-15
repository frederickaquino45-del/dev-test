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

  async create<T = Client, TR = string>(data: T, signal?: AbortSignal): Promise<TR> {
    return await this.post<T, TR>("", data, signal);
  }

  async getById<T = Client>(id: string, signal?: AbortSignal): Promise<T> {
    return await this.get<T>(id, undefined, signal);
  }

  async update<T = Client, TR = void>(id: string, data: T, signal?: AbortSignal): Promise<TR> {
    return await this.put<T, TR>(id, data, signal);
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