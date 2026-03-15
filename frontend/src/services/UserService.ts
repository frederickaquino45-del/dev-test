import { BaseService } from "./BaseService";
import { User } from "@/types/api/User";
import { UserProfile } from "@/types/api/enums/UserProfile";

type ApiUserResponse = {
  id: string;
  username: string;
  profile: string;
};

function mapProfileToEnum(profile: string): UserProfile {
  const map: Record<string, UserProfile> = {
    Administrator: UserProfile.Administrator,
    Operator: UserProfile.Operator,
  };
  return map[profile] ?? UserProfile.Administrator;
}

function mapApiUserToUser(api: ApiUserResponse): User {
  return {
    id: api.id,
    username: api.username,
    profile: mapProfileToEnum(api.profile),
  };
}

class UserService extends BaseService {
  constructor() {
    super("user");
  }

  async getAll(): Promise<User[]> {
    const list = await this.get<ApiUserResponse[]>("");
    return list.map(mapApiUserToUser);
  }

  async getById(id: string): Promise<User> {
    const api = await this.get<ApiUserResponse>(id);
    return mapApiUserToUser(api);
  }

  async create(data: { username: string; password: string; profile: UserProfile }): Promise<void> {
    await this.post<typeof data, unknown>("", data);
  }

  async update(
    id: string,
    data: { id: string; username: string; profile: UserProfile }
  ): Promise<void> {
    return await this.put<typeof data, void>(id, data);
  }
}

export default new UserService();
