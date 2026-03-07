import type { Script } from "@/entities/script";

export interface ScriptSerializer<TDto> {
  serialize(script: Script): TDto;
  deserialize(dto: TDto): Script;
}
