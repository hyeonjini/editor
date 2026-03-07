import type { Script } from "@/entities/script";
import type { ScriptDto } from "@/shared/api/dto/script.dto";
import type { ScriptSerializer } from "@/shared/ports/script-serializer.port";

export const scriptJsonSerializer: ScriptSerializer<ScriptDto> = {
  serialize(script) {
    return {
      id: script.id,
      name: script.name,
      description: script.description,
      httpSettings: script.httpSettings,
      transactions: script.transactions.map((transaction) => ({
        id: transaction.id,
        name: transaction.name,
        description: transaction.description,
        steps: transaction.steps,
      })),
      createdAt: script.createdAt,
      updatedAt: script.updatedAt,
    };
  },
  deserialize(dto) {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      httpSettings: dto.httpSettings,
      transactions: dto.transactions.map((transaction) => ({
        id: transaction.id,
        name: transaction.name,
        description: transaction.description,
        steps: transaction.steps as Script["transactions"][number]["steps"],
      })),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },
};
